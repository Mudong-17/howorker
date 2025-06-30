import { Hono } from "hono";
export const remindersRoutes = new Hono();
remindersRoutes.get("/", (c) => c.json({ message: "Reminders routes" }));
