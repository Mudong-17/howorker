import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

export const statsRoutes = new Hono();
statsRoutes.get("/", (c) => c.json({ message: "Stats routes" }));

// 缓存键前缀
