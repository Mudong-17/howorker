# 🤝 贡献指南

感谢您对 HoWorker 项目的关注！我们欢迎各种形式的贡献，包括但不限于：

- 🐛 错误报告
- ✨ 功能建议
- 📖 文档改进
- 💻 代码贡献
- 🎨 UI/UX 改进
- 🧪 测试用例

## 📋 开始之前

在开始贡献之前，请：

1. ⭐ Star 本项目
2. 🍴 Fork 项目到您的GitHub账户
3. 📚 阅读本贡献指南
4. 🔍 查看已有的 [Issues](https://github.com/Mudong-17/howorker/issues) 和 [Pull Requests](https://github.com/Mudong-17/howorker/pulls)

## 🚀 开发环境设置

### 环境要求
- Node.js 18+
- Bun 1.0+
- Git

### 安装步骤

1. **克隆您的 Fork**
```bash
git clone https://github.com/your-username/howorker.git
cd howorker
```

2. **安装依赖**
```bash
bun install
```

3. **配置环境变量**
```bash
# API 配置
cd apps/api
cp wrangler.example.jsonc wrangler.jsonc
cp env.example .env

# 编辑配置文件，填入您的 Cloudflare 配置
```

4. **启动开发服务器**
```bash
# 启动 API (端口 8787)
cd apps/api
bun run dev

# 启动 Web (端口 5173)
cd apps/web
bun run dev
```

## 🔄 工作流程

### 1. 创建分支
```bash
# 从 main 分支创建新的功能分支
git checkout -b feature/your-feature-name

# 或者修复bug
git checkout -b fix/your-fix-name
```

### 2. 开发规范

#### 代码风格
- 使用 TypeScript 严格模式
- 遵循项目的 ESLint 配置
- 使用 Prettier 格式化代码
- 遵循语义化命名

#### 提交消息格式
我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**类型 (type):**
- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档更新
- `style`: 代码格式修改
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**示例:**
```bash
feat(api): 添加任务批量操作接口
fix(web): 修复登录状态持久化问题
docs: 更新API文档
style(web): 统一按钮组件样式
```

### 3. 测试

在提交之前，请确保：

```bash
# 运行代码检查
bun run lint

# 运行类型检查
bun run type-check

# 运行测试
bun run test

# 构建项目
bun run build
```

### 4. 提交代码

```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

### 5. 创建 Pull Request

1. 在 GitHub 上创建 Pull Request
2. 填写详细的 PR 描述
3. 链接相关的 Issues
4. 等待代码审查

## 📝 Pull Request 指南

### PR 标题
使用与提交消息相同的格式：
```
feat(scope): add new feature
fix(scope): resolve issue with...
```

### PR 描述模板
```markdown
## 📋 变更类型
- [ ] 🐛 Bug 修复
- [ ] ✨ 新功能
- [ ] 💥 破坏性变更
- [ ] 📖 文档更新
- [ ] 🎨 样式改进
- [ ] ♻️ 代码重构
- [ ] ⚡ 性能优化
- [ ] 🧪 测试

## 📄 变更描述
<!-- 简要描述您的变更 -->

## 🔗 相关 Issue
<!-- 关闭: #123 -->

## 🧪 测试
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动测试通过

## 📷 截图（如适用）
<!-- 添加截图来展示变更 -->

## ✅ 检查清单
- [ ] 代码遵循项目规范
- [ ] 自测通过
- [ ] 文档已更新
- [ ] 变更日志已更新（如需要）
```

## 🐛 错误报告

使用 [GitHub Issues](https://github.com/Mudong-17/howorker/issues) 报告错误：

### 错误报告模板
```markdown
## 🐛 错误描述
<!-- 清晰简洁地描述错误 -->

## 🔄 重现步骤
1. 前往 '...'
2. 点击 '...'
3. 滚动到 '...'
4. 看到错误

## 🎯 期望行为
<!-- 描述您期望发生的情况 -->

## 📷 截图
<!-- 如果适用，添加截图来帮助解释问题 -->

## 🖥️ 环境信息
- OS: [例如 iOS]
- 浏览器: [例如 chrome, safari]
- 版本: [例如 22]

## 📝 附加信息
<!-- 添加任何其他相关信息 -->
```

## ✨ 功能建议

### 功能建议模板
```markdown
## 🚀 功能建议
<!-- 简要描述建议的功能 -->

## 🎯 解决的问题
<!-- 这个功能解决了什么问题？ -->

## 💡 解决方案
<!-- 描述您想要的解决方案 -->

## 🔄 替代方案
<!-- 描述您考虑过的替代解决方案 -->

## 📝 附加信息
<!-- 添加任何其他相关信息或截图 -->
```

## 🎨 UI/UX 贡献

如果您想贡献设计：

1. 创建设计稿或原型
2. 在 Issue 中分享您的设计
3. 讨论实现方案
4. 提交相应的代码

## 📖 文档贡献

文档同样重要！您可以：

- 修复错别字和语法错误
- 改进现有文档的清晰度
- 添加缺失的文档
- 翻译文档
- 添加代码示例

## 🔐 安全问题

如果您发现安全漏洞，请**不要**在公开的 Issue 中报告。请通过邮件联系维护者：

📧 Email: [您的邮箱]

## 🏷️ 标签系统

我们使用以下标签来分类 Issues 和 PR：

### 类型
- `bug` - 错误报告
- `enhancement` - 功能增强
- `documentation` - 文档相关
- `question` - 问题咨询

### 优先级
- `priority: high` - 高优先级
- `priority: medium` - 中优先级
- `priority: low` - 低优先级

### 状态
- `status: needs-review` - 需要审查
- `status: in-progress` - 进行中
- `status: blocked` - 被阻塞

### 难度
- `good first issue` - 适合新手
- `help wanted` - 需要帮助

## 🎉 贡献者认可

所有贡献者都会在 README 中得到认可。我们使用 [All Contributors](https://github.com/all-contributors/all-contributors) 来管理贡献者列表。

## 📞 联系方式

如有任何问题，请通过以下方式联系：

- 🐛 [创建 Issue](https://github.com/Mudong-17/howorker/issues/new)
- 💬 [GitHub Discussions](https://github.com/Mudong-17/howorker/discussions)
- 📧 Email: [您的邮箱]

## 📄 许可证

通过贡献，您同意您的贡献将在 [MIT License](LICENSE) 下获得许可。

---

感谢您的贡献！🎉 让我们一起构建更好的 HoWorker！ 