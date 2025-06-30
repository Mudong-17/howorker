import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { labelApi } from "@/api/labels";
import type {
  LabelQueryParams,
  CreateLabelRequest,
  UpdateLabelRequest,
} from "@/api/labels";

// 查询键常量
export const LABELS_QUERY_KEYS = {
  all: ["labels"] as const,
  lists: () => [...LABELS_QUERY_KEYS.all, "list"] as const,
  list: (params?: LabelQueryParams) =>
    [...LABELS_QUERY_KEYS.lists(), params] as const,
  details: () => [...LABELS_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...LABELS_QUERY_KEYS.details(), id] as const,
  stats: () => [...LABELS_QUERY_KEYS.all, "stats"] as const,
};

// 获取标签列表Hook
export const useLabels = (params?: LabelQueryParams) => {
  return useQuery({
    queryKey: LABELS_QUERY_KEYS.list(params),
    queryFn: () => labelApi.getLabels(params),
    staleTime: 10 * 60 * 1000, // 10分钟
  });
};

// 获取标签详情Hook
export const useLabel = (id: string) => {
  return useQuery({
    queryKey: LABELS_QUERY_KEYS.detail(id),
    queryFn: () => labelApi.getLabelById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

// 获取标签统计Hook
export const useLabelStats = () => {
  return useQuery({
    queryKey: LABELS_QUERY_KEYS.stats(),
    queryFn: () => labelApi.getLabelStats(),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
};

// 创建标签Hook
export const useCreateLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLabelRequest) => labelApi.createLabel(data),
    onSuccess: () => {
      // 刷新标签列表和统计
      queryClient.invalidateQueries({
        queryKey: LABELS_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: LABELS_QUERY_KEYS.stats(),
      });
    },
  });
};

// 更新标签Hook
export const useUpdateLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLabelRequest }) =>
      labelApi.updateLabel(id, data),
    onSuccess: (_, { id }) => {
      // 刷新标签详情、列表和统计
      queryClient.invalidateQueries({
        queryKey: LABELS_QUERY_KEYS.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: LABELS_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: LABELS_QUERY_KEYS.stats(),
      });
    },
  });
};

// 删除标签Hook
export const useDeleteLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => labelApi.deleteLabel(id),
    onSuccess: () => {
      // 刷新标签列表和统计
      queryClient.invalidateQueries({
        queryKey: LABELS_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: LABELS_QUERY_KEYS.stats(),
      });
    },
  });
};

// 批量删除标签Hook
export const useBatchDeleteLabels = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => labelApi.batchDelete(ids),
    onSuccess: () => {
      // 刷新标签列表和统计
      queryClient.invalidateQueries({
        queryKey: LABELS_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: LABELS_QUERY_KEYS.stats(),
      });
    },
  });
};
