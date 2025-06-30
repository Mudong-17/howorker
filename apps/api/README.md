# 🔧 HoWorker API - 后端服务

基于 **Cloudflare Workers** + **Hono** + **Prisma** + **D1** 构建的现代化无服务器API，为HoWorker任务管理系统提供强大的后端支持。

## 🌟 特性

### 🚀 无服务器架构
- **Cloudflare Workers**: 全球边缘计算，毫秒级响应
- **零冷启动**: 无需预热，即时响应
- **自动扩容**: 按需扩展，无需运维
- **全球部署**: 250+数据中心，就近访问

### 🔐 安全认证
- **SRP认证**: 安全远程密码协议，密码不传输
- **JWT Token**: 无状态会话管理
- **端对端加密**: 敏感数据客户端加密
- **权限控制**: 细粒度访问控制

### 🗄️ 数据管理
- **Cloudflare D1**: SQLite兼容的无服务器数据库
- **Prisma ORM**: 类型安全的数据库访问
- **KV缓存**: 高性能键值存储
- **混合加密**: 灵活的数据加密策略

### ⚡ 高性能
- **链式路由**: Hono的高效路由系统
- **中间件**: 模块化请求处理
- **缓存策略**: KV存储统计数据缓存
- **压缩传输**: 自动响应压缩

## 🏗️ 技术栈

| 组件 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 运行时 | Cloudflare Workers | Latest | 边缘计算平台 |
| 框架 | Hono | ^4.0.0 | Web框架 |
| 数据库 | Cloudflare D1 | Latest | SQLite兼容数据库 |
| ORM | Prisma | ^6.0.0 | 数据库访问层 |
| 缓存 | Cloudflare KV | Latest | 键值存储 |
| 认证 | secure-remote-password | ^0.4.3 | SRP认证 |
| 开发工具 | Wrangler | ^3.0.0 | 开发部署工具 |

## 📁 项目结构

```
apps/api/
├── src/
│   ├── index.ts              # 应用入口，路由配置
│   ├── lib/
│   │   ├── auth.ts           # JWT认证中间件
│   │   └── db.ts             # 数据库连接配置
│   └── routes/               # API路由模块
│       ├── auth.ts           # 认证相关路由
│       ├── todos.ts          # 任务管理路由
│       ├── labels.ts         # 标签管理路由
│       ├── comments.ts       # 评论管理路由
│       ├── shares.ts         # 分享管理路由
│       ├── reminders.ts      # 提醒管理路由
│       ├── templates.ts      # 模板管理路由
│       ├── organizations.ts  # 组织管理路由
│       └── stats.ts          # 统计分析路由
├── prisma/
│   ├── schema.prisma         # 数据库模式定义
│   ├── migrations/           # 数据库迁移文件
│   └── dev.db               # 本地开发数据库
├── scripts/
│   └── apply-to-d1.js       # D1数据库同步脚本
├── wrangler.example.jsonc   # Wrangler配置模板
├── wrangler.jsonc           # Wrangler配置 (git忽略)
├── env.example              # 环境变量模板
├── package.json             # 项目依赖
└── README.md               # 本文档
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- Bun 1.0+
- Cloudflare账户

### 1. 安装依赖
```bash
cd apps/api
bun install
```

### 2. 配置环境
```bash
# 复制配置文件
cp wrangler.example.jsonc wrangler.jsonc
cp env.example .env

# 编辑wrangler.jsonc，填入您的配置：
# - database_id: D1数据库ID
# - kv_namespace_id: KV命名空间ID
# - JWT_SECRET: JWT密钥
```

### 3. 创建Cloudflare资源
```bash
# 创建D1数据库
bunx wrangler d1 create howorker

# 创建KV命名空间
bunx wrangler kv:namespace create "CONFIG_KV"

# 将返回的ID更新到wrangler.jsonc中
```

### 4. 初始化数据库
```bash
# 生成Prisma客户端
bunx prisma generate

# 推送数据库模式到D1
bunx prisma db push
```

### 5. 启动开发服务器
```bash
bun run dev
```

API将在 `http://localhost:8787` 启动

## 🔧 开发指南

### 数据库操作

#### 本地开发
```bash
# 查看数据库
bunx prisma studio

# 重置数据库
bunx prisma db push --force-reset

# 生成新迁移
bunx prisma migrate dev --name init
```

#### 生产部署
```bash
# 同步到D1数据库
bun run db:migrate

# 查看D1数据库
bunx wrangler d1 execute howorker --command "SELECT * FROM User;"
```

### API路由设计

#### 认证路由 (`/auth`)
```typescript
POST   /auth/register        # SRP用户注册
POST   /auth/login/init      # SRP登录初始化
POST   /auth/login/verify    # SRP登录验证
GET    /auth/me              # 获取用户信息
PUT    /auth/profile         # 更新用户资料
POST   /auth/logout          # 登出
DELETE /auth/account         # 删除账户
```

#### 任务路由 (`/todos`)
```typescript
GET    /todos                # 获取任务列表
POST   /todos                # 创建新任务
GET    /todos/:id            # 获取任务详情
PUT    /todos/:id            # 更新任务
DELETE /todos/:id            # 删除任务
PUT    /todos/:id/status     # 更新任务状态
GET    /todos/:id/children   # 获取子任务
POST   /todos/batch         # 批量操作
```

#### 标签路由 (`/labels`)
```typescript
GET    /labels               # 获取标签列表
POST   /labels               # 创建新标签
PUT    /labels/:id           # 更新标签
DELETE /labels/:id           # 删除标签
GET    /labels/:id/todos     # 获取标签下的任务
```

#### 统计路由 (`/stats`)
```typescript
GET    /stats/dashboard      # 仪表板统计
GET    /stats/productivity   # 生产力分析
GET    /stats/trends         # 趋势分析
```

### 加密数据处理

#### 混合加密策略
```typescript
// 高频查询字段：独立加密
{
  encryptedTitle: string,    // 加密标题
  titleNonce: string,        // 标题nonce
}

// 低频详情字段：JSON加密
{
  encryptedDetails: string,  // 加密的JSON字符串
  detailsNonce: string,      // 详情nonce
}

// JSON结构示例
const details = {
  description: "任务描述",
  notes: "备注信息",
  metadata: { /* 其他字段 */ }
}
```

#### 加密工具函数
```typescript
// 加密数据
const { encrypted, nonce } = await encryptData(plaintext, userKey);

// 解密数据
const plaintext = await decryptData(encrypted, nonce, userKey);
```

### 中间件系统

#### 认证中间件
```typescript
import { authMiddleware } from './lib/auth';

app.use('/todos/*', authMiddleware);
```

#### CORS中间件
```typescript
import { cors } from 'hono/cors';

app.use('*', cors({
  origin: ['http://localhost:5173', 'https://yourdomain.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
```

### KV缓存使用

#### 缓存统计数据
```typescript
// 设置缓存 (5分钟TTL)
await env.CONFIG_KV.put(`stats:${userId}`, JSON.stringify(stats), {
  expirationTtl: 300
});

// 获取缓存
const cached = await env.CONFIG_KV.get(`stats:${userId}`);
if (cached) {
  return JSON.parse(cached);
}
```

#### 缓存策略
- **统计数据**: 5分钟TTL
- **配置信息**: 1小时TTL
- **分享链接**: 30天TTL
- **API限流**: 1分钟滑动窗口

## 🌐 部署

### 开发环境部署
```bash
bun run dev
```

### 生产环境部署
```bash
# 构建并部署到Cloudflare Workers
bun run deploy

# 查看部署状态
bunx wrangler deployments list
```

### 环境变量配置
```bash
# 设置生产环境变量
bunx wrangler secret put JWT_SECRET
bunx wrangler secret put ENCRYPTION_KEY
```

## 🔍 监控与调试

### 日志查看
```bash
# 实时日志
bunx wrangler tail

# 部署日志
bunx wrangler deployments view [deployment-id]
```

### 性能监控
- **响应时间**: 通过Cloudflare Analytics查看
- **错误率**: Workers日志监控
- **资源使用**: CPU时间和内存使用统计

### 调试技巧
```typescript
// 开发环境日志
console.log('Debug info:', { userId, todoId });

// 生产环境使用structured logging
console.log(JSON.stringify({
  level: 'info',
  message: 'Todo created',
  userId,
  todoId,
  timestamp: new Date().toISOString()
}));
```

## 🧪 测试

### API测试
```bash
# 运行测试
bun test

# 覆盖率测试
bun test --coverage
```

### 手动测试
```bash
# 健康检查
curl http://localhost:8787/health

# 用户注册
curl -X POST http://localhost:8787/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","salt":"...","verifier":"..."}'

# 获取任务列表
curl http://localhost:8787/todos \
  -H "Authorization: Bearer your-jwt-token"
```

## 🔧 故障排除

### 常见问题

#### 1. Prisma生成失败
```bash
# 解决方案：删除生成文件重新生成
rm -rf src/generated
bunx prisma generate
```

#### 2. D1数据库连接失败
```bash
# 检查wrangler.jsonc配置
# 确保database_id正确
bunx wrangler d1 list
```

#### 3. KV操作失败
```bash
# 检查KV命名空间
bunx wrangler kv:namespace list

# 测试KV操作
bunx wrangler kv:key put --binding CONFIG_KV "test" "value"
```

#### 4. JWT认证失败
- 检查JWT_SECRET环境变量
- 确认token格式正确
- 验证token过期时间

### 性能优化

#### 1. 数据库查询优化
```typescript
// 使用索引查询
const todos = await prisma.todo.findMany({
  where: { userId, status: 'PENDING' },
  orderBy: { createdAt: 'desc' },
  take: 20
});

// 避免N+1查询
const todosWithLabels = await prisma.todo.findMany({
  include: { labels: true }
});
```

#### 2. 缓存策略优化
```typescript
// 缓存热点数据
const cacheKey = `user:${userId}:stats`;
let stats = await env.CONFIG_KV.get(cacheKey);

if (!stats) {
  stats = await calculateUserStats(userId);
  await env.CONFIG_KV.put(cacheKey, JSON.stringify(stats), {
    expirationTtl: 300 // 5分钟
  });
}
```

## 📈 API文档

完整的API文档可以通过以下方式查看：

1. **开发环境**: 访问 `http://localhost:8787/docs`
2. **生产环境**: 访问 `https://your-worker.your-subdomain.workers.dev/docs`
3. **OpenAPI规范**: 查看 `docs/openapi.yaml`

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支: `git checkout -b feature/api-enhancement`
3. 提交更改: `git commit -m 'Add new API feature'`
4. 推送分支: `git push origin feature/api-enhancement`
5. 创建Pull Request

### 代码规范
- 使用TypeScript严格模式
- 遵循ESLint规则
- 编写单元测试
- 更新API文档

---

**🔐 安全提醒**: 
- 永远不要在代码中硬编码密钥
- 定期轮换JWT密钥
- 监控异常访问模式
- 保持依赖包更新

**⚡ 性能提示**:
- 合理使用缓存
- 优化数据库查询
- 压缩响应数据
- 监控Workers执行时间

享受无服务器开发的乐趣！🚀
