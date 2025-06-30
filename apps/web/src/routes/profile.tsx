import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
import { useLogout } from "@/hooks/useAuth";
import {
  useMe,
  useUpdateProfile,
  useUserStats,
  useDeleteAccount,
} from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ProfilePage() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const logout = useLogout();

  // 使用API hooks
  const { data: userResponse, isLoading } = useMe();
  const { data: statsResponse } = useUserStats();
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();

  const user = userResponse?.data;
  const stats = statsResponse?.data;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
  });

  // 更新formData当用户数据加载完成时
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("保存用户信息失败:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      navigate({ to: "/" });
    } catch (error) {
      console.error("登出失败:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("确定要删除账户吗？此操作不可恢复。")) {
      try {
        await deleteAccount.mutateAsync();
        clearAuth();
        navigate({ to: "/" });
      } catch (error) {
        console.error("删除账户失败:", error);
      }
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
              <h1 className="text-2xl font-bold text-gray-900">个人设置</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* 个人信息卡片 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">个人信息</h2>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "取消编辑" : "编辑信息"}
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">姓名</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="请输入姓名"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{user?.name || "未设置"}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">邮箱</Label>
                <p className="mt-1 text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-500 mt-1">邮箱地址无法修改</p>
              </div>

              <div>
                <Label>注册时间</Label>
                <p className="mt-1 text-gray-900">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "未知"}
                </p>
              </div>

              {isEditing && (
                <div className="flex space-x-4 pt-4">
                  <Button onClick={handleSaveProfile}>保存更改</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    取消
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* 统计信息卡片 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">使用统计</h2>
            {stats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalTodos}
                  </div>
                  <div className="text-sm text-gray-600">总任务数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.completedTodos}
                  </div>
                  <div className="text-sm text-gray-600">已完成</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.pendingTodos}
                  </div>
                  <div className="text-sm text-gray-600">待处理</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(stats.completionRate * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">完成率</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">统计数据加载中...</p>
              </div>
            )}
          </div>

          {/* 账户操作卡片 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">账户操作</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <h3 className="font-medium">退出登录</h3>
                  <p className="text-sm text-gray-600">从当前设备退出登录</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  disabled={logout.isPending}
                >
                  {logout.isPending ? "退出中..." : "退出登录"}
                </Button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-medium text-red-600">删除账户</h3>
                  <p className="text-sm text-gray-600">
                    永久删除账户和所有数据
                  </p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  删除账户
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});
