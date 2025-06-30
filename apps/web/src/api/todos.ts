import { api } from "./client";
import type {
  Todo,
  TodoStatus,
  TodoPriority,
  ApiResponse,
  PaginatedResponse,
} from "@/types";

// Todo 创建请求类型
export interface CreateTodoRequest {
  // 加密字段
  encryptedTitle: string;
  titleNonce: string;
  encryptedDetails?: string;
  detailsNonce?: string;
  encryptionKeyId: string;
  // 其他字段
  priority?: TodoPriority;
  dueDate?: string;
  parentId?: string;
  estimatedMinutes?: number;
}

// Todo 更新请求类型
export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  dueDate?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
}

// Todo 查询参数
export interface TodoQueryParams {
  page?: number;
  limit?: number;
  status?: TodoStatus;
  priority?: TodoPriority;
  search?: string;
  parentId?: string;
  dueDate?: string;
  sort?: string;
  order?: "asc" | "desc";
}

// Todo API 接口
export const todoApi = {
  // 获取任务列表
  getTodos: async (params?: TodoQueryParams) => {
    const response = await api.get<PaginatedResponse<Todo>>("/todos", {
      params,
    });
    return response.data;
  },

  // 根据ID获取任务详情
  getTodoById: async (id: string) => {
    const response = await api.get<Todo>(`/todos/${id}`);
    return response.data;
  },

  // 创建新任务
  createTodo: async (data: CreateTodoRequest) => {
    const response = await api.post<ApiResponse<Todo>>("/todos", data);
    return response.data;
  },

  // 更新任务
  updateTodo: async (id: string, data: UpdateTodoRequest) => {
    const response = await api.put<ApiResponse<Todo>>(`/todos/${id}`, data);
    return response.data;
  },

  // 删除任务
  deleteTodo: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/todos/${id}`);
    return response.data;
  },

  // 更新任务状态
  updateTodoStatus: async (id: string, status: TodoStatus) => {
    const response = await api.patch<ApiResponse<Todo>>(`/todos/${id}/status`, {
      status,
    });
    return response.data;
  },

  // 批量更新任务状态
  batchUpdateStatus: async (ids: string[], status: TodoStatus) => {
    const response = await api.patch<ApiResponse<Todo[]>>(
      "/todos/batch/status",
      { ids, status }
    );
    return response.data;
  },

  // 批量删除任务
  batchDelete: async (ids: string[]) => {
    const response = await api.delete<ApiResponse<void>>("/todos/batch", {
      data: { ids },
    });
    return response.data;
  },

  // 获取子任务
  getSubtasks: async (parentId: string) => {
    const response = await api.get<ApiResponse<Todo[]>>(
      `/todos/${parentId}/subtasks`
    );
    return response.data;
  },

  // 复制任务
  duplicateTodo: async (id: string) => {
    const response = await api.post<ApiResponse<Todo>>(
      `/todos/${id}/duplicate`
    );
    return response.data;
  },
};

export default todoApi;
