# 🚀 HoWorker - 端对端加密任务管理系统

[![GitHub license](https://img.shields.io/github/license/your-username/howorker)](https://github.com/your-username/howorker/blob/main/LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

一个基于现代技术栈构建的**端对端加密任务管理系统**，确保您的任务数据完全私密和安全。

## ✨ 特性

### 🔐 隐私与安全
- **端对端加密**：所有敏感数据在客户端加密，服务器无法读取
- **AES-GCM 256位加密**：采用现代加密标准
- **SRP认证**：安全远程密码协议，密码不会传输到服务器
- **本地密钥管理**：加密密钥仅存储在用户设备上

### 📋 任务管理
- **完整任务字段**：标题、描述、优先级、截止日期、预计时长
- **任务状态管理**：待处理、进行中、已完成、已取消
- **优先级设置**：低、中、高、紧急四个级别
- **智能提醒**：逾期任务自动标记

### 🎨 用户体验
- **现代化界面**：基于Tailwind CSS的精美设计
- **响应式布局**：完美适配桌面和移动设备
- **实时反馈**：操作状态即时显示
- **优雅降级**：解密失败时的友好错误处理

### ⚡ 技术架构
- **Monorepo架构**：使用Turbo管理多包项目
- **边缘计算**：基于Cloudflare Workers的全球分布
- **现代前端**：React + TypeScript + TanStack Router
- **类型安全**：完整的TypeScript类型定义

## 🏗️ 技术栈

### 后端 (API)
- **运行时**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **框架**: [Hono](https://hono.dev/) - 轻量级Web框架
- **数据库**: [Cloudflare D1](https://developers.cloudflare.com/d1/) - SQLite兼容
- **ORM**: [Prisma](https://prisma.io/) - 类型安全数据库访问
- **缓存**: [Cloudflare KV](https://developers.cloudflare.com/kv/) - 键值存储
- **认证**: JWT + SRP (Secure Remote Password)

### 前端 (Web)
- **框架**: [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **构建工具**: [Vite](https://vitejs.dev/)
- **路由**: [TanStack Router](https://tanstack.com/router) - 类型安全路由
- **状态管理**: [Zustand](https://github.com/pmndrs/zustand) + [TanStack Query](https://tanstack.com/query)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **加密**: Web Crypto API

### 开发工具
- **包管理**: [Bun](https://bun.sh/) - 极速JavaScript运行时
- **Monorepo**: [Turbo](https://turbo.build/) - 高性能构建系统
- **代码规范**: ESLint + Prettier
- **类型检查**: TypeScript

## 🚀 快速开始

### 环境要求
- Node.js 18+
- Bun 1.0+
- Cloudflare账户 (可选)

### 1. 克隆项目
```bash
git clone https://github.com/your-username/howorker.git
cd howorker
```

### 2. 安装依赖
```bash
bun install
```

### 3. 配置环境

#### API配置
```bash
cd apps/api

# 复制配置文件
cp wrangler.example.jsonc wrangler.jsonc
cp env.example .env

# 编辑配置文件，填入您的密钥
```

#### 数据库初始化
```bash
# 初始化数据库
bunx prisma generate
bunx prisma db push
```

### 4. 启动开发服务器

#### 启动API服务器 (端口 8787)
```bash
cd apps/api
bun run dev
```

#### 启动前端服务器 (端口 5173)
```bash
cd apps/web
bun run dev
```

### 5. 访问应用
- 前端: http://localhost:5173
- API: http://localhost:8787

## 📁 项目结构

```
howorker/
├── apps/
│   ├── api/                 # 后端API (Cloudflare Workers + Hono)
│   │   ├── src/
│   │   │   ├── routes/      # API路由
│   │   │   ├── lib/         # 工具库
│   │   │   └── index.ts     # 入口文件
│   │   ├── prisma/          # 数据库模式
│   │   └── wrangler.jsonc   # Cloudflare配置
│   └── web/                 # 前端应用 (React + Vite)
│       ├── src/
│       │   ├── components/  # React组件
│       │   ├── routes/      # 页面路由
│       │   ├── utils/       # 工具函数
│       │   └── types/       # 类型定义
│       └── vite.config.ts   # Vite配置
├── packages/               # 共享包 (预留)
└── turbo.json             # Turbo配置
```

## 🔐 加密原理

### 数据加密流程
1. **密钥生成**: 用户首次使用时生成AES-GCM 256位密钥
2. **本地存储**: 密钥仅存储在用户浏览器的localStorage中
3. **数据加密**: 敏感数据(标题、描述)在客户端加密
4. **服务器存储**: 服务器只存储加密后的Base64数据
5. **数据解密**: 获取数据时在客户端解密显示

### 加密字段设计
```typescript
// 混合加密策略
{
  encryptedTitle: "加密的任务标题",
  titleNonce: "标题专用nonce",
  encryptedDetails: "加密的JSON详情", 
  detailsNonce: "详情专用nonce",
  encryptionKeyId: "密钥标识符"
}
```

## 🌐 部署

### Cloudflare Workers部署
```bash
cd apps/api

# 配置wrangler.jsonc中的数据库ID和KV命名空间
# 部署到Cloudflare Workers
bun run deploy
```

### 前端部署
```bash
cd apps/web
bun run build

# 部署到您喜欢的静态托管服务
# 如 Vercel, Netlify, Cloudflare Pages 等
```

## 🛠️ 开发指南

### API接口
- `POST /auth/register` - 用户注册 (SRP)
- `POST /auth/login/init` - 登录初始化
- `POST /auth/login/verify` - 登录验证
- `GET /todos` - 获取任务列表
- `POST /todos` - 创建新任务 (加密)
- `PUT /todos/:id` - 更新任务
- `DELETE /todos/:id` - 删除任务

### 前端组件
- `TodoItem` - 任务项组件 (自动解密)
- `crypto.ts` - 加密工具函数
- `useAuth` - 认证状态管理

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork本项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 📄 许可证

本项目采用 MIT 许可证。详情请见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [Cloudflare](https://cloudflare.com/) - 提供强大的边缘计算平台
- [Hono](https://hono.dev/) - 优秀的Web框架
- [Prisma](https://prisma.io/) - 现代化的ORM
- [React](https://reactjs.org/) - 强大的前端框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架

## 📮 联系

如有问题或建议，欢迎：
- 提交 [Issue](https://github.com/your-username/howorker/issues)
- 发送邮件至: your-email@example.com

---

**⚠️ 重要提醒**: 这是一个演示项目，在生产环境使用前请确保：
- 更改所有默认密钥和配置
- 定期备份加密密钥
- 遵循最佳安全实践

享受安全的任务管理体验！🎉 