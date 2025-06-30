import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";

export const labelsRoutes = new Hono();

// GET /labels - 获取用户所有标签
labelsRoutes.get("/", async (c) => {
  try {
    const labels = [
      {
        id: "label_1",
        encryptedName: "encrypted_work_label",
        nameNonce: "work_nonce",
        encryptedDetails: '{"color": "#ff6b6b"}',
        detailsNonce: "work_details_nonce",
        encryptionKeyId: "key_work",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        todoCount: 15,
      },
    ];

    return c.json({ data: labels, total: labels.length });
  } catch (error) {
    throw new HTTPException(500, { message: "Failed to fetch labels" });
  }
});

// POST /labels - 创建新标签
labelsRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json();

    const newLabel = {
      id: "label_" + Date.now(),
      encryptedName: body.encryptedName,
      nameNonce: body.nameNonce,
      encryptionKeyId: body.encryptionKeyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      todoCount: 0,
    };

    return c.json(newLabel, 201);
  } catch (error) {
    throw new HTTPException(500, { message: "Failed to create label" });
  }
});

// GET /labels/:id - 获取单个标签详情
labelsRoutes.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const label = {
      id,
      encryptedName: "encrypted_label_" + id,
      nameNonce: "nonce_" + id,
      encryptionKeyId: "key_" + id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      todoCount: 5,
    };

    return c.json(label);
  } catch (error) {
    throw new HTTPException(500, { message: "Failed to fetch label" });
  }
});

// PUT /labels/:id - 更新标签
labelsRoutes.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const updatedLabel = {
      id,
      encryptedName: body.encryptedName,
      nameNonce: body.nameNonce,
      encryptionKeyId: body.encryptionKeyId,
      updatedAt: new Date().toISOString(),
    };

    return c.json(updatedLabel);
  } catch (error) {
    throw new HTTPException(500, { message: "Failed to update label" });
  }
});

// DELETE /labels/:id - 删除标签
labelsRoutes.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    return c.json({ message: "Label deleted successfully", id });
  } catch (error) {
    throw new HTTPException(500, { message: "Failed to delete label" });
  }
});

// GET /labels/:id/todos - 获取使用特定标签的任务
labelsRoutes.get("/:id/todos", async (c) => {
  try {
    const labelId = c.req.param("id");
    const status = c.req.query("status");
    const priority = c.req.query("priority");

    // 模拟获取带有此标签的任务
    let todos = [
      {
        id: "todo_1",
        encryptedTitle: "encrypted_todo_1",
        titleNonce: "nonce_1",
        status: "PENDING",
        priority: "HIGH",
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "todo_2",
        encryptedTitle: "encrypted_todo_2",
        titleNonce: "nonce_2",
        status: "COMPLETED",
        priority: "MEDIUM",
        dueDate: null,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString(),
        completedAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ];

    // 应用过滤器
    if (status) {
      todos = todos.filter((todo) => todo.status === status);
    }

    if (priority) {
      todos = todos.filter((todo) => todo.priority === priority);
    }

    return c.json({
      labelId,
      filters: { status, priority },
      data: todos,
    });
  } catch (error) {
    throw new HTTPException(500, { message: "Failed to fetch todos" });
  }
});
