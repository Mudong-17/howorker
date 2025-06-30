import { Hono } from "hono";
export const organizationsRoutes = new Hono();
organizationsRoutes.get("/", (c) =>
  c.json({ message: "Organizations routes" })
);
