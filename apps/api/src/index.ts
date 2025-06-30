import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { HTTPException } from "hono/http-exception";

// 导入路由模块
import { authRoutes } from "./routes/auth";
import { todosRoutes } from "./routes/todos";
import { labelsRoutes } from "./routes/labels";
import { commentsRoutes } from "./routes/comments";
import { remindersRoutes } from "./routes/reminders";
import { templatesRoutes } from "./routes/templates";
import { sharesRoutes } from "./routes/shares";
import { statsRoutes } from "./routes/stats";
import { organizationsRoutes } from "./routes/organizations";
import { showRoutes } from "hono/dev";

// 类型定义
export type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  DB: any; // D1Database
  STATS_KV: any;
  CONFIG_KV: any;
  RATE_LIMIT_KV: any;
  SHARE_LINKS_KV: any;
};

export type Variables = {
  userId?: string;
  userEmail?: string;
};

// 创建 Hono 应用
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// 全局中间件
app
  .use("*", logger())
  .use("*", prettyJSON())
  .use(
    "*",
    cors({
      origin: ["http://localhost:3000", "https://yourapp.com"],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowHeaders: ["Content-Type", "Authorization"],
      maxAge: 86400,
    })
  );

// 健康检查
app.get("/", (c) => {
  return c.json({
    message: "Todo API Server",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    status: "healthy",
  });
});

// API 路由注册 - 使用链式结构
app
  // 认证相关路由
  .route("/auth", authRoutes)

  // 核心 Todo 功能路由
  .route("/todos", todosRoutes)
  .route("/labels", labelsRoutes)
  .route("/comments", commentsRoutes)
  .route("/reminders", remindersRoutes)
  .route("/templates", templatesRoutes)
  .route("/shares", sharesRoutes)

  // 统计和分析
  .route("/stats", statsRoutes)

  // 组织/团队功能
  .route("/organizations", organizationsRoutes);

// 404 处理
app.notFound((c) => {
  return c.json(
    {
      error: "Not Found",
      message: "The requested resource was not found",
      path: c.req.path,
    },
    404
  );
});

// 全局错误处理
app.onError((err, c) => {
  console.error(`Error: ${err.message}`, err);

  if (err instanceof HTTPException) {
    return c.json(
      {
        error: err.message,
        status: err.status,
      },
      err.status
    );
  }

  return c.json(
    {
      error: "Internal Server Error",
      message: "Something went wrong on our end",
    },
    500
  );
});

showRoutes(app);

export default app;
