import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTodo, useUpdateTodo } from "@/hooks/useTodos";
import type { Todo, TodoStatus, TodoPriority } from "@/types";

function TodoDetailPage() {
  const { todoId } = useParams({ from: "/todos/$todoId" });
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  // 使用真实API获取任务数据
  const { data: todoResponse, isLoading, error } = useTodo(todoId);
  const updateTodo = useUpdateTodo();

  // 如果没有数据，使用默认值避免错误
  // todoResponse 是 axios response，todoResponse.data 是后端返回的 Todo 对象
  const displayTodo: Todo = todoResponse || {
    id: todoId,
    encryptedTitle: "",
    titleNonce: "",
    status: "PENDING" as TodoStatus,
    priority: "MEDIUM" as TodoPriority,
    encryptionKeyId: "",
    userId: "",
    createdAt: "",
    updatedAt: "",
    title: "加载中...",
    description: "",
  };

  const [formData, setFormData] = useState({
    title: displayTodo.title,
    description: displayTodo.description || "",
    status: displayTodo.status,
    priority: displayTodo.priority,
    dueDate: displayTodo.dueDate || "",
  });

  const handleSave = async () => {
    try {
      await updateTodo.mutateAsync({
        id: todoId,
        data: {
          title: formData.title,
          description: formData.description,
          status: formData.status as TodoStatus,
          priority: formData.priority as TodoPriority,
          dueDate: formData.dueDate || undefined,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("保存失败:", error);
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

  const getStatusColor = (status: Todo["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-gray-100 text-gray-700";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority: Todo["priority"]) => {
    switch (priority) {
      case "LOW":
        return "bg-gray-100 text-gray-600";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";
      case "HIGH":
        return "bg-orange-100 text-orange-700";
      case "URGENT":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/todos"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                ← 返回任务列表
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">任务详情</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                欢迎，{user?.name || user?.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    displayTodo.status
                  )}`}
                >
                  {displayTodo.status === "PENDING" && "待处理"}
                  {displayTodo.status === "IN_PROGRESS" && "进行中"}
                  {displayTodo.status === "COMPLETED" && "已完成"}
                  {displayTodo.status === "CANCELLED" && "已取消"}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                    displayTodo.priority
                  )}`}
                >
                  {displayTodo.priority === "LOW" && "低优先级"}
                  {displayTodo.priority === "MEDIUM" && "中等优先级"}
                  {displayTodo.priority === "HIGH" && "高优先级"}
                  {displayTodo.priority === "URGENT" && "紧急"}
                </span>
              </div>
            </div>
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "取消编辑" : "编辑任务"}
            </Button>
          </div>

          <div className="space-y-6">
            {/* 任务标题 */}
            <div>
              <Label htmlFor="title">任务标题</Label>
              {isEditing ? (
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="请输入任务标题"
                />
              ) : (
                <h2 className="text-xl font-semibold text-gray-900 mt-1">
                  {displayTodo.title}
                </h2>
              )}
            </div>

            {/* 任务描述 */}
            <div>
              <Label htmlFor="description">任务描述</Label>
              {isEditing ? (
                <textarea
                  id="description"
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="请输入任务描述"
                />
              ) : (
                <p className="text-gray-700 mt-1">
                  {displayTodo.description || "暂无描述"}
                </p>
              )}
            </div>

            {/* 状态和优先级 */}
            {isEditing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">状态</Label>
                  <select
                    id="status"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as TodoStatus,
                      })
                    }
                  >
                    <option value="PENDING">待处理</option>
                    <option value="IN_PROGRESS">进行中</option>
                    <option value="COMPLETED">已完成</option>
                    <option value="CANCELLED">已取消</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="priority">优先级</Label>
                  <select
                    id="priority"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as TodoPriority,
                      })
                    }
                  >
                    <option value="LOW">低优先级</option>
                    <option value="MEDIUM">中等优先级</option>
                    <option value="HIGH">高优先级</option>
                    <option value="URGENT">紧急</option>
                  </select>
                </div>
              </div>
            )}

            {/* 截止日期 */}
            <div>
              <Label htmlFor="dueDate">截止日期</Label>
              {isEditing ? (
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              ) : (
                <p className="text-gray-700 mt-1">
                  {displayTodo.dueDate
                    ? new Date(displayTodo.dueDate).toLocaleDateString()
                    : "未设置"}
                </p>
              )}
            </div>

            {/* 时间信息 */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">创建时间：</span>
                  {new Date(displayTodo.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">更新时间：</span>
                  {new Date(displayTodo.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            {isEditing && (
              <div className="flex space-x-4 pt-4">
                <Button onClick={handleSave}>保存更改</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  取消
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/todos/$todoId")({
  component: TodoDetailPage,
});
