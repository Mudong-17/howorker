import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useTodos,
  useCreateTodo,
  useDeleteTodo,
  useUpdateTodoStatus,
} from "@/hooks/useTodos";
import type { Todo } from "@/types";
import { TodoStatus, TodoPriority } from "@/types";
import { encryptTodoData } from "@/utils/crypto";
import { TodoItem } from "@/components/TodoItem";

function TodosPage() {
  const { user } = useAuthStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    priority: TodoPriority.MEDIUM,
    dueDate: "",
    estimatedMinutes: "",
  });

  // 使用API接口获取任务数据
  const { data: todosResponse, isLoading, error } = useTodos();
  const createTodo = useCreateTodo();
  const deleteTodo = useDeleteTodo();
  const updateTodoStatus = useUpdateTodoStatus();

  console.log(todosResponse);

  // 解析返回的数据
  // 后端直接返回 PaginatedResponse 格式，axios 包装在 response.data 中
  // todosResponse.data 是 { data: Todo[], pagination: {...} }
  const todos = todosResponse?.data || [];

  // 检查每个任务的数据
  todos.forEach((todo, index) => {
    console.log(`任务 ${index + 1}:`, {
      id: todo.id,
      title: todo.title,
      status: todo.status,
      priority: todo.priority,
    });
  });

  const handleCreateTodo = async () => {
    if (!newTodo.title.trim()) return;

    try {
      // 加密任务数据
      const encryptedData = await encryptTodoData({
        title: newTodo.title,
        description: newTodo.description || undefined,
      });

      await createTodo.mutateAsync({
        ...encryptedData,
        priority: newTodo.priority,
        dueDate: newTodo.dueDate || undefined,
        estimatedMinutes: newTodo.estimatedMinutes
          ? parseInt(newTodo.estimatedMinutes)
          : undefined,
      });

      // 重置表单
      setNewTodo({
        title: "",
        description: "",
        priority: TodoPriority.MEDIUM,
        dueDate: "",
        estimatedMinutes: "",
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error("创建任务失败:", error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!confirm("确定要删除这个任务吗？")) return;

    try {
      await deleteTodo.mutateAsync(id);
    } catch (error) {
      console.error("删除任务失败:", error);
    }
  };

  const handleUpdateStatus = async (id: string, status: TodoStatus) => {
    try {
      await updateTodoStatus.mutateAsync({ id, status });
    } catch (error) {
      console.error("更新状态失败:", error);
    }
  };

  // 处理加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 处理错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">加载失败：{String(error)}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                ← 返回首页
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">任务管理</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                欢迎，{user?.name || user?.email}
              </span>
              <Link
                to="/profile"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                个人设置
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 创建任务区域 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">创建新任务</h2>
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? "收起表单" : "展开表单"}
            </Button>
          </div>

          {showCreateForm ? (
            <div className="space-y-4">
              {/* 任务标题 */}
              <div>
                <Label htmlFor="title">任务标题 *</Label>
                <Input
                  id="title"
                  placeholder="输入任务标题..."
                  value={newTodo.title}
                  onChange={(e) =>
                    setNewTodo({ ...newTodo, title: e.target.value })
                  }
                  disabled={createTodo.isPending}
                />
              </div>

              {/* 任务描述 */}
              <div>
                <Label htmlFor="description">任务描述</Label>
                <textarea
                  id="description"
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="输入任务描述..."
                  value={newTodo.description}
                  onChange={(e) =>
                    setNewTodo({ ...newTodo, description: e.target.value })
                  }
                  disabled={createTodo.isPending}
                />
              </div>

              {/* 优先级和截止日期 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="priority">优先级</Label>
                  <select
                    id="priority"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={newTodo.priority}
                    onChange={(e) =>
                      setNewTodo({
                        ...newTodo,
                        priority: e.target.value as TodoPriority,
                      })
                    }
                    disabled={createTodo.isPending}
                  >
                    <option value="LOW">低优先级</option>
                    <option value="MEDIUM">中等优先级</option>
                    <option value="HIGH">高优先级</option>
                    <option value="URGENT">紧急</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="dueDate">截止日期</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTodo.dueDate}
                    onChange={(e) =>
                      setNewTodo({ ...newTodo, dueDate: e.target.value })
                    }
                    disabled={createTodo.isPending}
                  />
                </div>

                <div>
                  <Label htmlFor="estimatedMinutes">预计时长 (分钟)</Label>
                  <Input
                    id="estimatedMinutes"
                    type="number"
                    placeholder="60"
                    value={newTodo.estimatedMinutes}
                    onChange={(e) =>
                      setNewTodo({
                        ...newTodo,
                        estimatedMinutes: e.target.value,
                      })
                    }
                    disabled={createTodo.isPending}
                  />
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-4 pt-4">
                <Button
                  onClick={handleCreateTodo}
                  disabled={!newTodo.title.trim() || createTodo.isPending}
                >
                  {createTodo.isPending ? "创建中..." : "创建任务"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewTodo({
                      title: "",
                      description: "",
                      priority: TodoPriority.MEDIUM,
                      dueDate: "",
                      estimatedMinutes: "",
                    });
                    setShowCreateForm(false);
                  }}
                  disabled={createTodo.isPending}
                >
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-4">
              <Input
                placeholder="快速输入任务标题..."
                value={newTodo.title}
                onChange={(e) =>
                  setNewTodo({ ...newTodo, title: e.target.value })
                }
                onKeyPress={(e) => {
                  if (e.key === "Enter" && newTodo.title.trim()) {
                    handleCreateTodo();
                  }
                }}
                className="flex-1"
                disabled={createTodo.isPending}
              />
              <Button
                onClick={handleCreateTodo}
                disabled={!newTodo.title.trim() || createTodo.isPending}
              >
                {createTodo.isPending ? "创建中..." : "快速创建"}
              </Button>
            </div>
          )}
        </div>

        {/* 任务列表 */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">任务列表</h2>
            <p className="text-sm text-gray-600">共 {todos.length} 个任务</p>
          </div>

          <div className="space-y-4">
            {todos.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  还没有任务
                </h3>
                <p className="text-gray-600">创建你的第一个任务开始工作吧！</p>
              </div>
            ) : (
              todos.map((todo: Todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onStatusChange={(todoId, status) => {
                    handleUpdateStatus(todoId, status);
                  }}
                  onDelete={(todoId) => {
                    handleDeleteTodo(todoId);
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/todos/")({
  component: TodosPage,
});
