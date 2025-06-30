import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/user";
import type { UpdateUserRequest } from "@/api/user";

// 查询键常量
export const USER_QUERY_KEYS = {
  all: ["user"] as const,
  me: () => [...USER_QUERY_KEYS.all, "me"] as const,
  stats: () => [...USER_QUERY_KEYS.all, "stats"] as const,
};

// 获取当前用户信息Hook
export const useMe = () => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.me(),
    queryFn: () => userApi.getMe(),
    staleTime: 5 * 60 * 1000, // 5分钟
    retry: 1, // 失败后只重试1次
  });
};

// 获取用户统计Hook
export const useUserStats = () => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.stats(),
    queryFn: () => userApi.getUserStats(),
    staleTime: 2 * 60 * 1000, // 2分钟
  });
};

// 更新用户信息Hook
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => userApi.updateProfile(data),
    onSuccess: () => {
      // 刷新用户信息
      queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEYS.me(),
      });
    },
  });
};

// 删除账户Hook
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userApi.deleteAccount(),
    onSuccess: () => {
      // 清除所有缓存
      queryClient.clear();
      // 清除本地存储
      localStorage.removeItem("accessToken");
    },
  });
};

// 上传头像Hook
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => userApi.uploadAvatar(file),
    onSuccess: () => {
      // 刷新用户信息
      queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEYS.me(),
      });
    },
  });
};
