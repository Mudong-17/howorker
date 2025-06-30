import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { decryptTodoData } from "@/utils/crypto";
import type { Todo, TodoStatus } from "@/types";
import { TodoStatus as Status } from "@/types";

interface TodoItemProps {
  todo: Todo;
  onStatusChange: (todoId: string, status: TodoStatus) => void;
  onDelete: (todoId: string) => void;
}

const STATUS_COLORS = {
  PENDING: "bg-gray-100 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const PRIORITY_COLORS = {
  LOW: "border-l-gray-400",
  MEDIUM: "border-l-yellow-400",
  HIGH: "border-l-orange-400",
  URGENT: "border-l-red-400",
};

const STATUS_LABELS = {
  PENDING: "待处理",
  IN_PROGRESS: "进行中",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

const PRIORITY_LABELS = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
  URGENT: "紧急",
};

export function TodoItem({ todo, onStatusChange, onDelete }: TodoItemProps) {
  const [decryptedData, setDecryptedData] = useState<{
    title: string;
    description?: string;
  } | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(true);
  const [decryptError, setDecryptError] = useState<string | null>(null);

  useEffect(() => {
    const decryptData = async () => {
      try {
        setIsDecrypting(true);
        const decrypted = await decryptTodoData({
          encryptedTitle: todo.encryptedTitle,
          titleNonce: todo.titleNonce,
          encryptedDetails: todo.encryptedDetails || undefined,
          detailsNonce: todo.detailsNonce || undefined,
        });
        setDecryptedData(decrypted);
        setDecryptError(null);
      } catch (error) {
        console.error("解密任务数据失败:", error);
        setDecryptError("无法解密任务数据");
        setDecryptedData({
          title: "[加密数据]",
          description: undefined,
        });
      } finally {
        setIsDecrypting(false);
      }
    };

    decryptData();
  }, [
    todo.encryptedTitle,
    todo.titleNonce,
    todo.encryptedDetails,
    todo.detailsNonce,
  ]);

  if (isDecrypting) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-l-4 border-l-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN");
  };

  const isOverdue =
    todo.dueDate &&
    new Date(todo.dueDate) < new Date() &&
    todo.status !== Status.COMPLETED;

  return (
    <div
      className={`bg-white p-4 rounded-lg shadow-sm border border-l-4 ${
        PRIORITY_COLORS[todo.priority]
      } ${isOverdue ? "border-red-200 bg-red-50" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* 任务标题和状态 */}
          <div className="flex items-center gap-2 mb-2">
            <Link
              to="/todos/$todoId"
              params={{ todoId: todo.id }}
              className="text-lg font-medium text-gray-900 hover:text-blue-600 hover:underline"
            >
              {decryptedData?.title || "[解密失败]"}
            </Link>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                STATUS_COLORS[todo.status]
              }`}
            >
              {STATUS_LABELS[todo.status]}
            </span>
            <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
              {PRIORITY_LABELS[todo.priority]}优先级
            </span>
          </div>

          {/* 错误提示 */}
          {decryptError && (
            <div className="text-sm text-red-600 mb-2 p-2 bg-red-50 rounded">
              ⚠️ {decryptError}
            </div>
          )}

          {/* 任务描述 */}
          {decryptedData?.description && (
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
              {decryptedData.description}
            </p>
          )}

          {/* 任务信息 */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {todo.dueDate && (
              <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                📅 {formatDate(todo.dueDate)}
                {isOverdue && " (已逾期)"}
              </span>
            )}
            {todo.estimatedMinutes && (
              <span>⏱️ 预计 {todo.estimatedMinutes} 分钟</span>
            )}
            {(todo._count?.subtasks || 0) > 0 && (
              <span>📋 {todo._count!.subtasks} 个子任务</span>
            )}
            {(todo._count?.comments || 0) > 0 && (
              <span>💬 {todo._count!.comments} 条评论</span>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2 ml-4">
          {todo.status !== Status.COMPLETED && (
            <Button
              size="sm"
              onClick={() => onStatusChange(todo.id, Status.COMPLETED)}
              className="text-xs"
            >
              完成
            </Button>
          )}
          {todo.status === Status.PENDING && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(todo.id, Status.IN_PROGRESS)}
              className="text-xs"
            >
              开始
            </Button>
          )}
          {todo.status === Status.COMPLETED && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(todo.id, Status.PENDING)}
              className="text-xs"
            >
              重新打开
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(todo.id)}
            className="text-xs"
          >
            删除
          </Button>
        </div>
      </div>
    </div>
  );
}
