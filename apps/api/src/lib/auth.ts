import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { sign, verify } from "hono/jwt";
import type { Bindings, Variables } from "../index";

// JWT 认证中间件
export async function authMiddleware(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next
) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Authorization header required" });
  }

  const token = authHeader.slice(7); // 移除 "Bearer " 前缀

  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    c.set("userId", payload.userId as string);
    c.set("userEmail", payload.email as string);
    await next();
  } catch (error) {
    throw new HTTPException(401, { message: "Invalid or expired token" });
  }
}

// 生成 JWT Token
export async function generateToken(
  userId: string,
  email: string,
  secret: string
): Promise<string> {
  const payload = {
    userId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7天过期
  };

  return await sign(payload, secret);
}

// 可选认证中间件（允许匿名访问）
export async function optionalAuthMiddleware(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next
) {
  const authHeader = c.req.header("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const payload = await verify(token, c.env.JWT_SECRET);
      c.set("userId", payload.userId as string);
      c.set("userEmail", payload.email as string);
    } catch (error) {
      // 忽略错误，继续处理
    }
  }

  await next();
}

// 获取当前用户ID
export function getCurrentUserId(
  c: Context<{ Bindings: Bindings; Variables: Variables }>
): string {
  const userId = c.get("userId");
  if (!userId) {
    throw new HTTPException(401, { message: "Authentication required" });
  }
  return userId;
}
