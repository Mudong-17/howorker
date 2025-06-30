function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Todo App</h1>
          <p className="text-gray-600">
            基于React + Vite + Tailwind CSS + TanStack Router的任务管理应用
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">功能特性</h2>
          <ul className="space-y-2 text-gray-600">
            <li>• SRP安全认证</li>
            <li>• 端对端加密</li>
            <li>• 任务管理</li>
            <li>• 标签分类</li>
            <li>• 团队协作</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
