import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";
import { authMiddleware, getCurrentUserId } from "../lib/auth";
import {
  createPrismaClient,
  normalizePagination,
  createPaginatedResponse,
  buildDateFilters,
} from "../lib/db";
import type { Bindings, Variables } from "../index";

export const todosRoutes = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

// 应用认证中间件到所有 Todo 路由
todosRoutes.use("*", authMiddleware);

// GET /todos - 获取任务列表
todosRoutes
  .get("/", async (c) => {
    const userId = getCurrentUserId(c);
    const db = createPrismaClient(c.env);

    try {
      // 解析查询参数
      const query = c.req.query();
      const { page, limit, skip } = normalizePagination({
        page: parseInt(query.page || "1"),
        limit: parseInt(query.limit || "20"),
      });

      // 构建过滤条件
      const where: any = { userId };

      if (query.status) {
        where.status = query.status;
      }

      if (query.priority) {
        where.priority = query.priority;
      }

      if (query.parentId) {
        where.parentId = query.parentId === "null" ? null : query.parentId;
      }

      if (query.dueDate) {
        const dueDate = new Date(query.dueDate);
        where.dueDate = {
          gte: new Date(dueDate.setHours(0, 0, 0, 0)),
          lt: new Date(dueDate.setHours(23, 59, 59, 999)),
        };
      }

      // 添加日期过滤器
      Object.assign(where, buildDateFilters(query));

      // 排序选项
      const orderBy: any = [];
      if (query.sortBy) {
        const sortOrder = query.sortOrder === "desc" ? "desc" : "asc";
        orderBy.push({ [query.sortBy]: sortOrder });
      } else {
        // 默认排序：优先级降序，创建时间降序
        orderBy.push({ priority: "desc" }, { createdAt: "desc" });
      }

      // 并行查询数据和总数
      const [todos, total] = await Promise.all([
        db.todo.findMany({
          where,
          include: {
            labels: {
              select: {
                id: true,
                encryptedName: true,
                nameNonce: true,
                encryptionKeyId: true,
              },
            },
            subtasks: {
              select: {
                id: true,
                encryptedTitle: true,
                titleNonce: true,
                status: true,
                priority: true,
              },
            },
            _count: {
              select: {
                comments: true,
                subtasks: true,
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),

        db.todo.count({ where }),
      ]);

      // 直接返回加密数据，由前端负责解密
      return c.json(createPaginatedResponse(todos, total, page, limit));
    } catch (error) {
      console.error("Error fetching todos:", error);
      throw new HTTPException(500, { message: "Failed to fetch todos" });
    } finally {
      await db.$disconnect();
    }
  })

  // POST /todos - 创建新任务
  .post(
    "/",
    validator("json", (value, c) => {
      // 检查加密数据字段
      if (
        !value.encryptedTitle ||
        !value.titleNonce ||
        !value.encryptionKeyId
      ) {
        return c.json(
          {
            error:
              "Required encrypted fields: encryptedTitle, titleNonce, encryptionKeyId",
          },
          400
        );
      }
      return value;
    }),
    async (c) => {
      const userId = getCurrentUserId(c);
      const body = await c.req.json();
      const db = createPrismaClient(c.env);

      try {
        const todo = await db.todo.create({
          data: {
            userId,
            encryptedTitle: body.encryptedTitle,
            titleNonce: body.titleNonce,
            encryptedDetails: body.encryptedDetails || null,
            detailsNonce: body.detailsNonce || null,
            encryptionKeyId: body.encryptionKeyId,
            status: body.status || "PENDING",
            priority: body.priority || "MEDIUM",
            dueDate: body.dueDate ? new Date(body.dueDate) : null,
            estimatedMinutes: body.estimatedMinutes,
            parentId: body.parentId || null,
            // 连接标签
            labels: body.labelIds
              ? {
                  connect: body.labelIds.map((id: string) => ({ id })),
                }
              : undefined,
          },
          include: {
            labels: {
              select: {
                id: true,
                encryptedName: true,
                nameNonce: true,
                encryptionKeyId: true,
              },
            },
            subtasks: true,
            _count: {
              select: {
                comments: true,
                subtasks: true,
              },
            },
          },
        });

        return c.json(todo, 201);
      } catch (error) {
        console.error("Error creating todo:", error);
        throw new HTTPException(500, { message: "Failed to create todo" });
      } finally {
        await db.$disconnect();
      }
    }
  )

  // GET /todos/:id - 获取单个任务详情
  .get("/:id", async (c) => {
    const userId = getCurrentUserId(c);
    const todoId = c.req.param("id");
    const db = createPrismaClient(c.env);

    try {
      const todo = await db.todo.findFirst({
        where: {
          id: todoId,
          userId,
        },
        include: {
          labels: {
            select: {
              id: true,
              encryptedName: true,
              nameNonce: true,
              encryptionKeyId: true,
              encryptedDetails: true,
              detailsNonce: true,
            },
          },
          comments: {
            where: {
              isDeleted: false,
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
          subtasks: {
            orderBy: {
              createdAt: "asc",
            },
            include: {
              _count: {
                select: {
                  subtasks: true,
                  comments: true,
                },
              },
            },
          },
          parent: {
            select: {
              id: true,
              encryptedTitle: true,
              titleNonce: true,
              status: true,
            },
          },
          reminders: {
            where: {
              status: {
                in: ["PENDING", "SNOOZED"],
              },
            },
            orderBy: {
              reminderDateTime: "asc",
            },
          },
        },
      });

      if (!todo) {
        throw new HTTPException(404, { message: "Todo not found" });
      }

      // 直接返回加密数据，由前端负责解密
      return c.json(todo);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      console.error("Error fetching todo:", error);
      throw new HTTPException(500, { message: "Failed to fetch todo" });
    } finally {
      await db.$disconnect();
    }
  })

  // PUT /todos/:id - 更新任务
  .put(
    "/:id",
    validator("json", (value, c) => {
      return value;
    }),
    async (c) => {
      const userId = getCurrentUserId(c);
      const todoId = c.req.param("id");
      const body = await c.req.json();
      const db = createPrismaClient(c.env);

      try {
        // 先检查任务是否存在且属于当前用户
        const existingTodo = await db.todo.findFirst({
          where: { id: todoId, userId },
        });

        if (!existingTodo) {
          throw new HTTPException(404, { message: "Todo not found" });
        }

        // 构建更新数据
        const updateData: any = {};

        if (body.encryptedTitle !== undefined)
          updateData.encryptedTitle = body.encryptedTitle;
        if (body.titleNonce !== undefined)
          updateData.titleNonce = body.titleNonce;
        if (body.encryptedDetails !== undefined)
          updateData.encryptedDetails = body.encryptedDetails;
        if (body.detailsNonce !== undefined)
          updateData.detailsNonce = body.detailsNonce;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.priority !== undefined) updateData.priority = body.priority;
        if (body.dueDate !== undefined)
          updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
        if (body.estimatedMinutes !== undefined)
          updateData.estimatedMinutes = body.estimatedMinutes;
        if (body.actualMinutes !== undefined)
          updateData.actualMinutes = body.actualMinutes;

        // 如果状态改为完成，设置完成时间
        if (
          body.status === "COMPLETED" &&
          existingTodo.status !== "COMPLETED"
        ) {
          updateData.completedAt = new Date();
        } else if (
          body.status !== "COMPLETED" &&
          existingTodo.status === "COMPLETED"
        ) {
          updateData.completedAt = null;
        }

        // 处理标签关联
        if (body.labelIds !== undefined) {
          updateData.labels = {
            set: body.labelIds.map((id: string) => ({ id })),
          };
        }

        const todo = await db.todo.update({
          where: { id: todoId },
          data: updateData,
          include: {
            labels: {
              select: {
                id: true,
                encryptedName: true,
                nameNonce: true,
                encryptionKeyId: true,
              },
            },
            subtasks: true,
            _count: {
              select: {
                comments: true,
                subtasks: true,
              },
            },
          },
        });

        return c.json(todo);
      } catch (error) {
        if (error instanceof HTTPException) throw error;
        console.error("Error updating todo:", error);
        throw new HTTPException(500, { message: "Failed to update todo" });
      } finally {
        await db.$disconnect();
      }
    }
  )

  // DELETE /todos/:id - 删除任务
  .delete("/:id", async (c) => {
    const userId = getCurrentUserId(c);
    const todoId = c.req.param("id");
    const db = createPrismaClient(c.env);

    try {
      // 检查任务是否存在且属于当前用户
      const todo = await db.todo.findFirst({
        where: { id: todoId, userId },
        include: {
          subtasks: true,
        },
      });

      if (!todo) {
        throw new HTTPException(404, { message: "Todo not found" });
      }

      // 删除任务（Prisma 会自动处理关联删除）
      await db.todo.delete({
        where: { id: todoId },
      });

      return c.json({
        message: "Todo deleted successfully",
        deletedSubtasks: todo.subtasks.length,
      });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      console.error("Error deleting todo:", error);
      throw new HTTPException(500, { message: "Failed to delete todo" });
    } finally {
      await db.$disconnect();
    }
  })

  // PATCH /todos/:id/status - 快速更新任务状态
  .patch(
    "/:id/status",
    validator("json", (value, c) => {
      if (
        !value.status ||
        !["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(
          value.status
        )
      ) {
        return c.json({ error: "Valid status is required" }, 400);
      }
      return value;
    }),
    async (c) => {
      const userId = getCurrentUserId(c);
      const todoId = c.req.param("id");
      const { status } = await c.req.json();
      const db = createPrismaClient(c.env);

      try {
        const updateData: any = { status };

        // 如果状态改为完成，设置完成时间
        if (status === "COMPLETED") {
          updateData.completedAt = new Date();
        } else {
          updateData.completedAt = null;
        }

        const todo = await db.todo.update({
          where: {
            id: todoId,
            userId,
          },
          data: updateData,
          select: {
            id: true,
            status: true,
            completedAt: true,
            updatedAt: true,
          },
        });

        return c.json(todo);
      } catch (error) {
        console.error("Error updating todo status:", error);
        throw new HTTPException(500, {
          message: "Failed to update todo status",
        });
      } finally {
        await db.$disconnect();
      }
    }
  )

  // GET /todos/:id/subtasks - 获取子任务列表
  .get("/:id/subtasks", async (c) => {
    const userId = getCurrentUserId(c);
    const parentId = c.req.param("id");
    const db = createPrismaClient(c.env);

    try {
      // 先检查父任务是否存在且属于当前用户
      const parentTodo = await db.todo.findFirst({
        where: { id: parentId, userId },
      });

      if (!parentTodo) {
        throw new HTTPException(404, { message: "Parent todo not found" });
      }

      const subtasks = await db.todo.findMany({
        where: {
          parentId,
          userId,
        },
        include: {
          labels: {
            select: {
              id: true,
              encryptedName: true,
              nameNonce: true,
              encryptionKeyId: true,
            },
          },
          _count: {
            select: {
              comments: true,
              subtasks: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return c.json(subtasks);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      console.error("Error fetching subtasks:", error);
      throw new HTTPException(500, { message: "Failed to fetch subtasks" });
    } finally {
      await db.$disconnect();
    }
  })

  // POST /todos/batch - 批量操作
  .post(
    "/batch",
    validator("json", (value, c) => {
      if (!value.action || !value.todoIds || !Array.isArray(value.todoIds)) {
        return c.json(
          { error: "Required fields: action, todoIds (array)" },
          400
        );
      }
      if (
        !["delete", "complete", "archive", "assignLabels"].includes(
          value.action
        )
      ) {
        return c.json({ error: "Invalid action" }, 400);
      }
      return value;
    }),
    async (c) => {
      const userId = getCurrentUserId(c);
      const { action, todoIds, data } = await c.req.json();
      const db = createPrismaClient(c.env);

      try {
        let results: any[] = [];

        switch (action) {
          case "delete":
            const deleteResult = await db.todo.deleteMany({
              where: {
                id: { in: todoIds },
                userId,
              },
            });
            results = [{ action: "delete", count: deleteResult.count }];
            break;

          case "complete":
            const completeResult = await db.todo.updateMany({
              where: {
                id: { in: todoIds },
                userId,
              },
              data: {
                status: "COMPLETED",
                completedAt: new Date(),
              },
            });
            results = [{ action: "complete", count: completeResult.count }];
            break;

          case "assignLabels":
            if (!data?.labelIds || !Array.isArray(data.labelIds)) {
              throw new HTTPException(400, {
                message: "labelIds array is required for assignLabels action",
              });
            }

            // 批量分配标签
            for (const todoId of todoIds) {
              await db.todo.update({
                where: { id: todoId, userId },
                data: {
                  labels: {
                    connect: data.labelIds.map((labelId: string) => ({
                      id: labelId,
                    })),
                  },
                },
              });
            }
            results = [{ action: "assignLabels", count: todoIds.length }];
            break;
        }

        return c.json({
          action,
          totalRequested: todoIds.length,
          results,
        });
      } catch (error) {
        if (error instanceof HTTPException) throw error;
        console.error("Error performing batch operation:", error);
        throw new HTTPException(500, {
          message: "Failed to perform batch operation",
        });
      } finally {
        await db.$disconnect();
      }
    }
  );
