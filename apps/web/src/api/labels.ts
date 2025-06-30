import { api } from "./client";
import type { TodoLabel, ApiResponse } from "@/types";

// 标签创建请求类型
export interface CreateLabelRequest {
  name: string;
  color?: string;
  description?: string;
}

// 标签更新请求类型
export interface UpdateLabelRequest {
  name?: string;
  color?: string;
  description?: string;
}

// 标签查询参数
export interface LabelQueryParams {
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}

// 标签使用统计
export interface LabelStats {
  id: string;
  name: string;
  color: string;
  todoCount: number;
  completedCount: number;
  pendingCount: number;
  createdAt: string;
}

// 标签 API 接口
export const labelApi = {
  // 获取标签列表
  getLabels: async (params?: LabelQueryParams) => {
    const response = await api.get<ApiResponse<TodoLabel[]>>("/labels", {
      params,
    });
    return response.data;
  },

  // 根据ID获取标签详情
  getLabelById: async (id: string) => {
    const response = await api.get<ApiResponse<TodoLabel>>(`/labels/${id}`);
    return response.data;
  },

  // 创建新标签
  createLabel: async (data: CreateLabelRequest) => {
    const response = await api.post<ApiResponse<TodoLabel>>("/labels", data);
    return response.data;
  },

  // 更新标签
  updateLabel: async (id: string, data: UpdateLabelRequest) => {
    const response = await api.put<ApiResponse<TodoLabel>>(
      `/labels/${id}`,
      data
    );
    return response.data;
  },

  // 删除标签
  deleteLabel: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/labels/${id}`);
    return response.data;
  },

  // 获取标签使用统计
  getLabelStats: async () => {
    const response = await api.get<ApiResponse<LabelStats[]>>("/labels/stats");
    return response.data;
  },

  // 批量删除标签
  batchDelete: async (ids: string[]) => {
    const response = await api.delete<ApiResponse<void>>("/labels/batch", {
      data: { ids },
    });
    return response.data;
  },
};

export default labelApi;
