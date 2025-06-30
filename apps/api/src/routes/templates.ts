import { Hono } from "hono";
export const templatesRoutes = new Hono();
templatesRoutes.get("/", (c) => c.json({ message: "Templates routes" }));
