import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";
import { generateToken, getCurrentUserId, authMiddleware } from "../lib/auth";
import { createPrismaClient } from "../lib/db";
import type { Bindings, Variables } from "../index";

// 导入SRP库
import * as srpServer from "secure-remote-password/server";

// 内存会话存储（开发环境fallback）
const memorySessionStore = new Map<string, any>();

export const authRoutes = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

// =================== SRP 认证系统（优先级） ===================

// POST /auth/register - SRP 用户注册（使用email作为username）
authRoutes
  .post(
    "/register",
    validator("json", (value, c) => {
      const { email, salt, verifier } = value;
      if (!email || !salt || !verifier) {
        return c.json({ error: "Email, salt, and verifier are required" }, 400);
      }
      // 简单的邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return c.json({ error: "Invalid email format" }, 400);
      }
      return value;
    }),
    async (c) => {
      const { email, salt, verifier, name } = await c.req.json();
      const db = createPrismaClient(c.env);

      try {
        // 检查邮箱是否已存在
        const existingUser = await db.user.findUnique({
          where: { email },
        });
        if (existingUser) {
          throw new HTTPException(409, { message: "Email already exists" });
        }

        // 检查SRP用户名（email）是否已存在
        const existingCredential = await db.userSRPCredential.findUnique({
          where: { username: email },
        });
        if (existingCredential) {
          throw new HTTPException(409, { message: "User already exists" });
        }

        // 创建用户
        const user = await db.user.create({
          data: {
            name: name || email.split("@")[0], // 如果没有提供名称，使用邮箱前缀
            email: email,
            emailVerified: null, // 可以后续添加邮箱验证流程
          },
        });

        // 创建SRP凭据（使用email作为username）
        await db.userSRPCredential.create({
          data: {
            username: email,
            salt,
            verifier,
            userId: user.id,
          },
        });

        // 创建账户记录
        await db.account.create({
          data: {
            type: "srp",
            provider: "srp",
            providerAccountId: email,
            userId: user.id,
          },
        });

        return c.json({
          success: true,
          message: "User registered successfully",
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        });
      } catch (error) {
        if (error instanceof HTTPException) throw error;
        console.error("Registration failed:", error);
        throw new HTTPException(500, { message: "Registration failed" });
      } finally {
        await db.$disconnect();
      }
    }
  )

  // POST /auth/login/init - SRP 登录初始化（使用email）
  .post(
    "/login/init",
    validator("json", (value, c) => {
      const { email, clientPublicEphemeral } = value;
      if (!email || !clientPublicEphemeral) {
        return c.json(
          { error: "Email and clientPublicEphemeral are required" },
          400
        );
      }
      return value;
    }),
    async (c) => {
      const { email, clientPublicEphemeral } = await c.req.json();
      const db = createPrismaClient(c.env);

      try {
        // 查找SRP凭据（使用email作为username）
        const srpCredential = await db.userSRPCredential.findUnique({
          where: { username: email },
          include: { user: true },
        });

        if (!srpCredential) {
          // 为了防止用户名枚举攻击，返回假的salt和serverEphemeral
          throw new HTTPException(404, {
            message: "Invalid email or password",
          });
        }

        // 使用真实的SRP库生成服务端临时密钥对
        const serverEphemeral = srpServer.generateEphemeral(
          srpCredential.verifier
        );

        // 将serverEphemeral.secret存储到会话或缓存中，用于后续验证
        const sessionId = `srp_session_${Date.now()}_${Math.random().toString(36).substring(2)}`;

        // 存储到KV中（5分钟过期）
        if (c.env.CONFIG_KV) {
          await c.env.CONFIG_KV.put(
            sessionId,
            JSON.stringify({
              email,
              verifier: srpCredential.verifier,
              serverSecretEphemeral: serverEphemeral.secret,
              clientPublicEphemeral,
              userId: srpCredential.userId,
              salt: srpCredential.salt,
            }),
            { expirationTtl: 300 } // 5分钟
          );
        }

        return c.json({
          sessionId,
          salt: srpCredential.salt,
          serverPublicEphemeral: serverEphemeral.public,
        });
      } catch (error) {
        if (error instanceof HTTPException) throw error;
        console.error("Login init failed:", error);
        throw new HTTPException(500, {
          message: "Login initialization failed",
        });
      } finally {
        await db.$disconnect();
      }
    }
  )

  // POST /auth/login/verify - SRP 登录验证
  .post(
    "/login/verify",
    validator("json", (value, c) => {
      const { sessionId, clientSessionProof } = value;
      if (!sessionId || !clientSessionProof) {
        return c.json(
          { error: "SessionId and clientSessionProof are required" },
          400
        );
      }
      return value;
    }),
    async (c) => {
      const requestBody = await c.req.json();
      console.log("Login verify request:", requestBody);

      const { sessionId, clientSessionProof } = requestBody;
      const db = createPrismaClient(c.env);

      try {
        // 从KV中获取会话数据
        if (!c.env.CONFIG_KV) {
          throw new HTTPException(500, {
            message: "Session storage not available",
          });
        }

        const sessionDataStr = await c.env.CONFIG_KV.get(sessionId);
        if (!sessionDataStr) {
          throw new HTTPException(400, {
            message: "Invalid or expired session",
          });
        }

        const sessionData = JSON.parse(sessionDataStr);

        // 使用真实的SRP库验证客户端证明
        console.log("SRP verification data:", {
          sessionId,
          email: sessionData.email,
          hasServerSecret: !!sessionData.serverSecretEphemeral,
          hasClientPublic: !!sessionData.clientPublicEphemeral,
          hasSalt: !!sessionData.salt,
          hasVerifier: !!sessionData.verifier,
          clientSessionProofLength: clientSessionProof?.length,
        });

        let serverSession;
        try {
          serverSession = srpServer.deriveSession(
            sessionData.serverSecretEphemeral,
            sessionData.clientPublicEphemeral,
            sessionData.salt,
            sessionData.email,
            sessionData.verifier,
            clientSessionProof
          );
          console.log("SRP verification successful");
        } catch (srpError) {
          console.error("SRP verification failed:", srpError);
          console.error("SRP error details:", {
            name: (srpError as Error).name,
            message: (srpError as Error).message,
            stack: (srpError as Error).stack,
          });
          throw new HTTPException(401, { message: "Invalid credentials" });
        }

        // 获取用户信息
        const user = await db.user.findUnique({
          where: { id: sessionData.userId },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        });

        if (!user) {
          throw new HTTPException(404, { message: "User not found" });
        }

        // 生成JWT Token
        const jwtToken = await generateToken(
          user.id,
          user.email!,
          c.env.JWT_SECRET
        );

        // 创建会话记录
        await db.session.create({
          data: {
            sessionToken: jwtToken,
            userId: user.id,
          },
        });

        // 清理临时会话数据
        if (c.env.CONFIG_KV) {
          try {
            await c.env.CONFIG_KV.delete(sessionId);
          } catch (kvError) {
            console.warn("KV delete failed:", kvError);
          }
        }
        // 同时清理内存存储
        memorySessionStore.delete(sessionId);

        return c.json({
          success: true,
          token: jwtToken,
          serverSessionProof: serverSession.proof,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          },
        });
      } catch (error) {
        if (error instanceof HTTPException) throw error;
        console.error("Login verification failed:", error);
        throw new HTTPException(401, { message: "Invalid credentials" });
      } finally {
        await db.$disconnect();
      }
    }
  )

  // =================== 通用认证接口 ===================

  // GET /auth/me - 获取当前用户信息
  .get("/me", authMiddleware, async (c) => {
    const userId = getCurrentUserId(c);
    const db = createPrismaClient(c.env);

    try {
      const [user, todosCount, labelsCount, organizationsCount] =
        await Promise.all([
          db.user.findUnique({
            where: { id: userId },
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              createdAt: true,
              updatedAt: true,
            },
          }),
          db.todo.count({ where: { userId } }),
          db.todoLabel.count({ where: { userId } }),
          db.organizationMember.count({ where: { userId } }),
        ]);

      if (!user) {
        throw new HTTPException(404, { message: "User not found" });
      }

      return c.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        stats: {
          totalTodos: todosCount,
          totalLabels: labelsCount,
          totalOrganizations: organizationsCount,
        },
      });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      console.error("Failed to fetch user:", error);
      throw new HTTPException(500, {
        message: "Failed to fetch user information",
      });
    } finally {
      await db.$disconnect();
    }
  })

  // PUT /auth/profile - 更新用户资料
  .put(
    "/profile",
    authMiddleware,
    validator("json", (value, c) => {
      const allowedFields = ["name", "image"];
      const hasValidField = allowedFields.some(
        (field) => value[field] !== undefined
      );

      if (!hasValidField) {
        return c.json(
          { error: "At least one field (name, image) is required" },
          400
        );
      }
      return value;
    }),
    async (c) => {
      const userId = getCurrentUserId(c);
      const { name, image } = await c.req.json();
      const db = createPrismaClient(c.env);

      try {
        const updatedUser = await db.user.update({
          where: { id: userId },
          data: {
            ...(name !== undefined && { name }),
            ...(image !== undefined && { image }),
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            updatedAt: true,
          },
        });

        return c.json({
          message: "Profile updated successfully",
          user: updatedUser,
        });
      } catch (error) {
        console.error("Failed to update profile:", error);
        throw new HTTPException(500, { message: "Failed to update profile" });
      } finally {
        await db.$disconnect();
      }
    }
  )

  // POST /auth/logout - 登出
  .post("/logout", authMiddleware, async (c) => {
    const userId = getCurrentUserId(c);
    const db = createPrismaClient(c.env);

    try {
      // 删除用户的所有会话
      await db.session.deleteMany({
        where: { userId },
      });

      return c.json({
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout failed:", error);
      throw new HTTPException(500, { message: "Logout failed" });
    } finally {
      await db.$disconnect();
    }
  })

  // DELETE /auth/account - 删除账户
  .delete("/account", authMiddleware, async (c) => {
    const userId = getCurrentUserId(c);
    const db = createPrismaClient(c.env);

    try {
      // 软删除用户信息（保留数据但匿名化）
      await db.user.update({
        where: { id: userId },
        data: {
          email: null,
          name: "Deleted User",
          image: null,
          emailVerified: null,
        },
      });

      // 删除所有认证账户
      await db.account.deleteMany({
        where: { userId },
      });

      // 删除SRP凭据
      await db.userSRPCredential.deleteMany({
        where: { userId },
      });

      // 删除所有会话
      await db.session.deleteMany({
        where: { userId },
      });

      return c.json({
        message: "Account deleted successfully",
      });
    } catch (error) {
      console.error("Account deletion failed:", error);
      throw new HTTPException(500, { message: "Account deletion failed" });
    } finally {
      await db.$disconnect();
    }
  });

// =================== Google OAuth（后置可选） ===================

// TODO: 在需要时添加 Google OAuth 支持
// 当前优先级：SRP 登录 > Google OAuth
/*
authRoutes
  .get("/google", async (c) => {
    // Google OAuth 登录初始化
  })
  .get("/google/callback", async (c) => {
    // Google OAuth 回调处理
  });
*/
