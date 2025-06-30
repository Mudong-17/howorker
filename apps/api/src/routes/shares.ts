import { Hono } from "hono";

export const sharesRoutes = new Hono();

sharesRoutes.get("/", (c) => {
  return c.json({ message: "Shares routes - work in progress" });
});
