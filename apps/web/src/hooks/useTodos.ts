import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { todoApi } from "@/api/todos";
import type {
  TodoQueryParams,
  CreateTodoRequest,
  UpdateTodoRequest,
} from "@/api/todos";
import type { TodoStatus } from "@/types";

// 查询键常量
export const TODOS_QUERY_KEYS = {
  all: ["todos"] as const,
  lists: () => [...TODOS_QUERY_KEYS.all, "list"] as const,
  list: (params?: TodoQueryParams) =>
    [...TODOS_QUERY_KEYS.lists(), params] as const,
  details: () => [...TODOS_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...TODOS_QUERY_KEYS.details(), id] as const,
  subtasks: (parentId: string) =>
    [...TODOS_QUERY_KEYS.all, "subtasks", parentId] as const,
};

// 获取任务列表Hook
export const useTodos = (params?: TodoQueryParams) => {
  return useQuery({
    queryKey: TODOS_QUERY_KEYS.list(params),
    queryFn: () => todoApi.getTodos(params),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
};

// 获取任务详情Hook
export const useTodo = (id: string) => {
  return useQuery({
    queryKey: TODOS_QUERY_KEYS.detail(id),
    queryFn: () => todoApi.getTodoById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// 获取子任务Hook
export const useSubtasks = (parentId: string) => {
  return useQuery({
    queryKey: TODOS_QUERY_KEYS.subtasks(parentId),
    queryFn: () => todoApi.getSubtasks(parentId),
    enabled: !!parentId,
    staleTime: 5 * 60 * 1000,
  });
};

// 创建任务Hook
export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTodoRequest) => todoApi.createTodo(data),
    onSuccess: () => {
      // 刷新任务列表
      queryClient.invalidateQueries({
        queryKey: TODOS_QUERY_KEYS.lists(),
      });
    },
  });
};

// 更新任务Hook
export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoRequest }) =>
      todoApi.updateTodo(id, data),
    onSuccess: (_, { id }) => {
      // 刷新任务详情和列表
      queryClient.invalidateQueries({
        queryKey: TODOS_QUERY_KEYS.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: TODOS_QUERY_KEYS.lists(),
      });
    },
  });
};

// 删除任务Hook
export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => todoApi.deleteTodo(id),
    onSuccess: () => {
      // 刷新任务列表
      queryClient.invalidateQueries({
        queryKey: TODOS_QUERY_KEYS.lists(),
      });
    },
  });
};

// 更新任务状态Hook
export const useUpdateTodoStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TodoStatus }) =>
      todoApi.updateTodoStatus(id, status),
    onSuccess: (_, { id }) => {
      // 刷新任务详情和列表
      queryClient.invalidateQueries({
        queryKey: TODOS_QUERY_KEYS.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: TODOS_QUERY_KEYS.lists(),
      });
    },
  });
};

// 批量更新状态Hook
export const useBatchUpdateTodoStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: TodoStatus }) =>
      todoApi.batchUpdateStatus(ids, status),
    onSuccess: () => {
      // 刷新任务列表
      queryClient.invalidateQueries({
        queryKey: TODOS_QUERY_KEYS.lists(),
      });
    },
  });
};

// 批量删除任务Hook
export const useBatchDeleteTodos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => todoApi.batchDelete(ids),
    onSuccess: () => {
      // 刷新任务列表
      queryClient.invalidateQueries({
        queryKey: TODOS_QUERY_KEYS.lists(),
      });
    },
  });
};

// 复制任务Hook
export const useDuplicateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => todoApi.duplicateTodo(id),
    onSuccess: () => {
      // 刷新任务列表
      queryClient.invalidateQueries({
        queryKey: TODOS_QUERY_KEYS.lists(),
      });
    },
  });
};
