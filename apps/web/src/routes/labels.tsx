import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useLabels,
  useCreateLabel,
  useDeleteLabel,
  useLabelStats,
} from "@/hooks/useLabels";
import type { TodoLabel } from "@/types";

function LabelsPage() {
  const { user } = useAuthStore();
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3B82F6");

  // 使用API接口获取标签数据
  const { data: labelsResponse, isLoading, error } = useLabels();
  const { data: labelStatsResponse } = useLabelStats();
  const createLabel = useCreateLabel();
  const deleteLabel = useDeleteLabel();

  // 解析返回的数据
  const labels = labelsResponse?.data || [];
  const labelStats = labelStatsResponse?.data || [];

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;

    try {
      await createLabel.mutateAsync({
        name: newLabelName,
        color: newLabelColor,
      });
      setNewLabelName("");
      setNewLabelColor("#3B82F6");
    } catch (error) {
      console.error("创建标签失败:", error);
    }
  };

  const handleDeleteLabel = async (id: string) => {
    if (!confirm("确定要删除这个标签吗？")) return;

    try {
      await deleteLabel.mutateAsync(id);
    } catch (error) {
      console.error("删除标签失败:", error);
    }
  };

  // 获取标签的使用统计
  const getLabelStats = (labelId: string) => {
    return labelStats.find((stat) => stat.id === labelId);
  };

  const predefinedColors = [
    "#3B82F6", // blue
    "#EF4444", // red
    "#F59E0B", // yellow
    "#10B981", // green
    "#8B5CF6", // purple
    "#F97316", // orange
    "#06B6D4", // cyan
    "#EC4899", // pink
  ];

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
          <p className="text-red-600">加载失败：{error.message}</p>
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
              <h1 className="text-2xl font-bold text-gray-900">标签管理</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                欢迎，{user?.name || user?.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 创建标签区域 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">创建新标签</h2>
          <div className="flex flex-col space-y-4">
            <div className="flex space-x-4">
              <Input
                placeholder="输入标签名称..."
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreateLabel()}
                className="flex-1"
              />
              <Button
                onClick={handleCreateLabel}
                disabled={!newLabelName.trim() || createLabel.isPending}
              >
                {createLabel.isPending ? "创建中..." : "创建标签"}
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">颜色:</span>
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full border-2 ${
                    newLabelColor === color
                      ? "border-gray-400"
                      : "border-gray-200"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewLabelColor(color)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 标签列表 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">标签列表</h2>
            <p className="text-sm text-gray-600 mt-1">
              共 {labels.length} 个标签
            </p>
          </div>

          <div className="divide-y">
            {labels.map((label: TodoLabel) => {
              const stats = getLabelStats(label.id);
              return (
                <div
                  key={label.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: "#3B82F6" }}
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {/* 显示加密的标签名称，实际使用时需要解密 */}
                          标签 #{label.id.slice(-6)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {stats
                            ? `${stats.todoCount} 个任务使用此标签`
                            : "0 个任务使用此标签"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        编辑
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteLabel(label.id)}
                        disabled={deleteLabel.isPending}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {labels.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">
                暂无标签，创建第一个标签开始分类吧！
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/labels")({
  component: LabelsPage,
});
