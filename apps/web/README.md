# 🎨 HoWorker Web - 前端应用

基于 **React** + **Vite** + **TypeScript** + **TanStack Router** 构建的现代化前端应用，为HoWorker任务管理系统提供优雅的用户界面。

## 🌟 特性

### 🎨 现代化界面
- **Tailwind CSS**: 原子化CSS，快速构建美观界面
- **响应式设计**: 完美适配桌面、平板、移动设备
- **暗色主题**: 支持明暗主题切换
- **优雅动画**: 流畅的页面转场和交互动效

### 🔐 安全优先
- **端对端加密**: 所有敏感数据在客户端加密
- **本地密钥管理**: 加密密钥仅存储在用户设备
- **SRP客户端**: 安全远程密码协议，密码不传输
- **零知识架构**: 服务器无法访问用户明文数据

### ⚡ 高性能体验
- **Vite构建**: 极速开发体验和优化的生产构建
- **代码分割**: 路由级别的懒加载
- **状态管理**: Zustand轻量级状态管理
- **缓存策略**: TanStack Query智能数据缓存

### 🧩 模块化架构
- **类型安全路由**: TanStack Router完整类型推导
- **组件化设计**: 可复用的UI组件库
- **Hook抽象**: 自定义Hooks封装业务逻辑
- **API客户端**: 统一的API调用接口

## 🏗️ 技术栈

| 分类 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **核心框架** | React | ^18.3.1 | UI框架 |
| **构建工具** | Vite | ^6.0.1 | 开发构建工具 |
| **类型检查** | TypeScript | ^5.6.2 | 静态类型检查 |
| **路由管理** | TanStack Router | ^1.83.1 | 类型安全路由 |
| **状态管理** | Zustand | ^5.0.2 | 轻量级状态管理 |
| **数据获取** | TanStack Query | ^5.62.2 | 服务端状态管理 |
| **样式方案** | Tailwind CSS | ^3.4.17 | 原子化CSS |
| **表单处理** | React Hook Form | ^7.54.2 | 表单状态管理 |
| **数据验证** | Zod | ^3.24.1 | 运行时类型验证 |
| **UI组件** | Radix UI | ^1.1.2 | 无障碍UI组件 |
| **样式变体** | CVA | ^1.0.0 | 组件样式管理 |
| **图标库** | Lucide React | ^0.468.0 | 现代图标库 |
| **加密库** | SRP Client | ^0.4.3 | SRP客户端实现 |

## 📁 项目结构

```
apps/web/
├── src/
│   ├── components/            # UI组件库
│   │   ├── ui/               # 基础UI组件
│   │   │   ├── button.tsx    # 按钮组件
│   │   │   ├── input.tsx     # 输入框组件
│   │   │   └── label.tsx     # 标签组件
│   │   └── TodoItem.tsx      # 任务项组件
│   ├── routes/               # 页面路由
│   │   ├── __root.tsx        # 根路由布局
│   │   ├── index.tsx         # 首页
│   │   ├── auth/             # 认证页面
│   │   │   ├── login.tsx     # 登录页面
│   │   │   └── register.tsx  # 注册页面
│   │   ├── todos/            # 任务管理页面
│   │   │   ├── index.tsx     # 任务列表
│   │   │   └── $todoId.tsx   # 任务详情
│   │   ├── labels.tsx        # 标签管理
│   │   └── profile.tsx       # 用户资料
│   ├── hooks/                # 自定义Hooks
│   │   ├── useAuth.ts        # 认证状态管理
│   │   ├── useTodos.ts       # 任务数据管理
│   │   ├── useLabels.ts      # 标签数据管理
│   │   └── useUser.ts        # 用户数据管理
│   ├── stores/               # 状态管理
│   │   └── auth.ts           # 认证状态存储
│   ├── api/                  # API客户端
│   │   ├── client.ts         # HTTP客户端配置
│   │   ├── auth.ts           # 认证API
│   │   ├── todos.ts          # 任务API
│   │   ├── labels.ts         # 标签API
│   │   └── user.ts           # 用户API
│   ├── utils/                # 工具函数
│   │   ├── crypto.ts         # 加密工具
│   │   └── srp.ts            # SRP工具
│   ├── types/                # 类型定义
│   │   └── index.ts          # 通用类型
│   ├── lib/                  # 共享库
│   │   └── utils.ts          # 通用工具函数
│   ├── App.tsx               # 应用根组件
│   ├── main.tsx              # 应用入口
│   └── index.css             # 全局样式
├── public/                   # 静态资源
├── index.html                # HTML模板
├── vite.config.ts           # Vite配置
├── tailwind.config.js       # Tailwind配置
├── tsconfig.json            # TypeScript配置
├── package.json             # 项目依赖
└── README.md               # 本文档
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- Bun 1.0+

### 1. 安装依赖
```bash
cd apps/web
bun install
```

### 2. 配置环境
```bash
# 复制环境变量文件
cp .env.example .env.local

# 编辑环境变量
# VITE_API_URL=http://localhost:8787
# VITE_APP_NAME=HoWorker
```

### 3. 启动开发服务器
```bash
bun run dev
```

应用将在 `http://localhost:5173` 启动

### 4. 构建生产版本
```bash
bun run build
```

### 5. 预览生产构建
```bash
bun run preview
```

## 🎯 核心功能

### 🔐 认证系统

#### SRP注册流程
```typescript
// 1. 生成SRP注册数据
const registrationData = generateSRPRegistration(email, password);

// 2. 发送注册请求
const response = await srpRegister({
  email,
  salt: registrationData.salt,
  verifier: registrationData.verifier
});

// 3. 保存用户信息
if (response.success) {
  setUser(response.user);
  navigate('/todos');
}
```

#### SRP登录流程
```typescript
// 1. 初始化登录
const initResponse = await srpLogin(email, password);

// 2. 验证登录
const verifyResponse = await srpVerifyLogin({
  email,
  clientProof: initResponse.clientProof
});

// 3. 保存认证状态
if (verifyResponse.success) {
  setUser(verifyResponse.user);
  localStorage.setItem('token', verifyResponse.token);
}
```

### 📋 任务管理

#### 端对端加密任务
```typescript
// 创建加密任务
const createEncryptedTodo = async (todoData: CreateTodoData) => {
  // 1. 获取用户加密密钥
  const userKey = getUserEncryptionKey();
  
  // 2. 加密敏感字段
  const encryptedTitle = await encryptData(todoData.title, userKey);
  const encryptedDetails = await encryptData(
    JSON.stringify({
      description: todoData.description,
      notes: todoData.notes
    }),
    userKey
  );
  
  // 3. 构建加密请求
  const encryptedTodo = {
    encryptedTitle: encryptedTitle.encrypted,
    titleNonce: encryptedTitle.nonce,
    encryptedDetails: encryptedDetails.encrypted,
    detailsNonce: encryptedDetails.nonce,
    priority: todoData.priority,
    dueDate: todoData.dueDate,
    encryptionKeyId: userKey.id
  };
  
  // 4. 发送到服务器
  return await createTodo(encryptedTodo);
};
```

#### 任务解密显示
```typescript
// 自动解密任务组件
const TodoItem: React.FC<{ todo: EncryptedTodo }> = ({ todo }) => {
  const { data: decryptedTodo, isLoading } = useQuery({
    queryKey: ['todo', todo.id, 'decrypted'],
    queryFn: async () => {
      const userKey = getUserEncryptionKey();
      
      // 解密标题
      const title = await decryptData(
        todo.encryptedTitle,
        todo.titleNonce,
        userKey
      );
      
      // 解密详情
      const detailsJson = await decryptData(
        todo.encryptedDetails,
        todo.detailsNonce,
        userKey
      );
      const details = JSON.parse(detailsJson);
      
      return {
        ...todo,
        title,
        description: details.description,
        notes: details.notes
      };
    },
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });
  
  if (isLoading) return <TodoSkeleton />;
  
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold">{decryptedTodo?.title}</h3>
      <p className="text-gray-600">{decryptedTodo?.description}</p>
    </div>
  );
};
```

### 🎨 UI组件系统

#### 按钮组件变体
```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-gray-300 bg-white hover:bg-gray-50",
        ghost: "hover:bg-gray-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

#### 表单验证
```typescript
const todoSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(100, "标题过长"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.string().datetime().optional(),
  estimatedMinutes: z.number().positive().optional(),
});

const CreateTodoForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof todoSchema>>({
    resolver: zodResolver(todoSchema),
  });
  
  const onSubmit = (data: z.infer<typeof todoSchema>) => {
    createEncryptedTodo(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* 表单字段 */}
    </form>
  );
};
```

### 🔄 状态管理

#### 认证状态
```typescript
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  
  login: (user: User, token: string) => {
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('encryptionKey');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  updateUser: (updates: Partial<User>) => {
    const user = get().user;
    if (user) {
      set({ user: { ...user, ...updates } });
    }
  },
}));
```

#### 数据查询
```typescript
export const useTodos = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['todos', user?.id],
    queryFn: fetchTodos,
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1分钟缓存
  });
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createEncryptedTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};
```

## 🎨 样式系统

### Tailwind CSS配置
```javascript
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
```

### CSS变量主题
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 84% 4.9%;
  --border: 217.2 32.6% 17.5%;
}
```

## 🧪 测试

### 单元测试
```bash
# 运行测试
bun test

# 测试覆盖率
bun test --coverage

# 监听模式
bun test --watch
```

### 组件测试
```typescript
import { render, screen } from '@testing-library/react';
import { TodoItem } from '../TodoItem';

test('renders todo item with decrypted title', async () => {
  const mockTodo = {
    id: '1',
    encryptedTitle: 'encrypted_title',
    titleNonce: 'nonce',
    // ...
  };
  
  render(<TodoItem todo={mockTodo} />);
  
  // 等待解密完成
  await screen.findByText('解密后的标题');
});
```

### E2E测试
```typescript
import { test, expect } from '@playwright/test';

test('user can create and view todo', async ({ page }) => {
  await page.goto('/login');
  
  // 登录
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // 创建任务
  await page.click('text=新建任务');
  await page.fill('[name="title"]', '测试任务');
  await page.click('button[type="submit"]');
  
  // 验证任务显示
  await expect(page.locator('text=测试任务')).toBeVisible();
});
```

## 🌐 部署

### 构建优化
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['@tanstack/react-router'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
});
```

### 静态部署
```bash
# 构建
bun run build

# 部署到Vercel
vercel --prod

# 部署到Netlify
netlify deploy --prod --dir=dist

# 部署到Cloudflare Pages
wrangler pages publish dist
```

### 环境变量
```bash
# 生产环境变量
VITE_API_URL=https://your-api.workers.dev
VITE_APP_NAME=HoWorker
VITE_VERSION=1.0.0
```

## 🔧 开发工具

### VSCode配置
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ],
  "settings": {
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    }
  }
}
```

### 代码规范
```bash
# 代码检查
bun run lint

# 代码格式化
bun run format

# 类型检查
bun run type-check
```

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支: `git checkout -b feature/ui-enhancement`
3. 提交更改: `git commit -m 'Add beautiful animations'`
4. 推送分支: `git push origin feature/ui-enhancement`
5. 创建Pull Request

### 开发规范
- 使用TypeScript严格模式
- 遵循React最佳实践
- 组件必须有PropTypes或TypeScript类型
- 编写单元测试
- 更新Storybook文档

## 🔍 故障排除

### 常见问题

#### 1. 加密密钥丢失
```typescript
// 检查本地存储
const key = localStorage.getItem('encryptionKey');
if (!key) {
  // 引导用户重新设置密钥
  navigate('/setup-encryption');
}
```

#### 2. 路由类型错误
```bash
# 重新生成路由类型
bun run build:routes
```

#### 3. 样式不生效
```bash
# 清除Tailwind缓存
rm -rf .tailwind-cache
bun run dev
```

#### 4. API请求失败
```typescript
// 检查API客户端配置
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Auth Token:', getAuthToken());
```

---

**🎨 设计提示**: 
- 保持界面简洁现代
- 注重无障碍性
- 优化移动端体验
- 提供清晰的用户反馈

**⚡ 性能提示**:
- 使用React.lazy懒加载
- 合理使用useMemo和useCallback
- 优化图片和静态资源
- 监控包体积大小

享受现代前端开发！✨
