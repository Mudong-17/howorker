import { Hono } from "hono";

export const commentsRoutes = new Hono();

commentsRoutes.get("/", (c) => {
  return c.json({ message: "Comments routes - work in progress" });
});
