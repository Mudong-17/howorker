import { api } from "./client";
import type { User, TodoStats, ApiResponse } from "@/types";

// 用户更新请求类型
export interface UpdateUserRequest {
  name?: string;
  image?: string;
}

// 用户详细信息（包含统计）
export interface UserWithStats extends User {
  stats: TodoStats;
}

// 用户 API 接口
export const userApi = {
  // 获取当前用户信息
  getMe: async () => {
    const response = await api.get<ApiResponse<UserWithStats>>("/auth/me");
    return response.data;
  },

  // 更新用户信息
  updateProfile: async (data: UpdateUserRequest) => {
    const response = await api.put<ApiResponse<User>>("/auth/profile", data);
    return response.data;
  },

  // 获取用户统计数据
  getUserStats: async () => {
    const response = await api.get<ApiResponse<TodoStats>>("/stats/user");
    return response.data;
  },

  // 删除账户
  deleteAccount: async () => {
    const response = await api.delete<ApiResponse<void>>("/auth/account");
    return response.data;
  },

  // 上传头像
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await api.post<ApiResponse<{ imageUrl: string }>>(
      "/auth/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};

export default userApi;
