# AI Agent Platform 开发与教学文档

一个基于 **pnpm workspace** 的全栈 AI Agent 演示项目：前端提供流式对话界面，后端用 Vercel AI SDK 编排大模型、工具调用（Tool Calling）、人工审批（Human-in-the-loop）以及长期记忆（会话摘要 + 基于 Embedding 与 pgvector 的语义记忆）。

本文档同时面向两类读者：

- **开发者**：快速理解项目结构、启动方式、各模块职责，以及如何扩展新工具 / 新接口。
- **教学者 / 学习者**：按「架构 → 数据流 → 模块精讲 → 动手练习」的顺序掌握一个生产级 AI Agent 应用的完整搭建过程。

---

## 目录

1. [项目概览](#1-项目概览)
2. [技术栈](#2-技术栈)
3. [目录结构](#3-目录结构)
4. [快速开始](#4-快速开始)
5. [环境变量](#5-环境变量)
6. [整体架构](#6-整体架构)
7. [核心数据流（请求时序）](#7-核心数据流请求时序)
8. [后端详解](#8-后端详解)
9. [记忆系统详解](#9-记忆系统详解)
10. [前端详解](#10-前端详解)
11. [数据库与迁移](#11-数据库与迁移)
12. [扩展指南](#12-扩展指南)
13. [常见问题与注意事项](#13-常见问题与注意事项)
14. [教学练习建议](#14-教学练习建议)
15. [测试](#15-测试)

---

## 1. 项目概览

这是一个「客服 / 工单助手」形态的 AI Agent 应用，核心能力：

| 能力 | 说明 |
| --- | --- |
| 流式对话 | 基于 AI SDK 的 UI Message Stream，逐字返回 |
| 工具调用 | 天气、时间、计算器、用户信息、创建工单 |
| 人工审批 | 创建工单前必须由用户点击「确认 / 拒绝」 |
| 多轮会话持久化 | 会话与消息存入 PostgreSQL |
| 会话摘要 | 对话超长后自动滚动生成摘要，注入 System Prompt |
| 语义记忆 | 用户长期记忆向量化存入 pgvector，按语义相似度召回（Embedding + 余弦检索） |
| 会话恢复 | 会话 ID 写入 URL `?c=<id>`，刷新可恢复历史 |

---

## 2. 技术栈

**Monorepo / 工程化**

- pnpm `9.15.1` workspace
- TypeScript `~6.0.2`
- 根脚本统一编排 `apps/web` 与 `apps/server`

**前端 `apps/web`**

- React `19` + Vite `8`
- Tailwind CSS `4`（`@tailwindcss/vite`）+ shadcn（`base-vega` 风格，基于 `@base-ui/react`）
- `@ai-sdk/react` 的 `useChat` 管理对话状态与流式渲染
- `react-markdown` + `remark-gfm` 渲染 Markdown
- `lucide-react` 图标

**后端 `apps/server`**

- Fastify `5`（HTTP 服务）
- Vercel AI SDK `ai@7` + `@ai-sdk/openai`（模型编排，兼容任何 OpenAI 协议的服务，如 DeepSeek）
- Drizzle ORM `0.45` + `pg`（PostgreSQL）
- PostgreSQL + **pgvector**（向量存储与余弦相似度检索）
- Embedding：任意 OpenAI 兼容服务（示例：阿里云 DashScope `text-embedding-v4`）
- Zod `4`（请求校验 + 工具入参 Schema）
- `tsx watch` 开发热重载
- Vitest 单元测试（纯逻辑，见 [第 15 节](#15-测试)）

**数据库环境**

- Docker Compose 一键启动 `postgres:18` + pgvector（见 [4.4](#44-启动数据库含-pgvector)）

**共享包 `packages/shared`**

- 仅存放跨端共享的 TS 类型（直接从源码引用，无需构建）

---

## 3. 目录结构

```
ai-agent-platform/
├── package.json                 # 根脚本（dev / build / preview / lint / test）
├── pnpm-workspace.yaml          # workspace: apps/*, packages/*
├── docker-compose.yml           # 数据库服务：postgres:18 + pgvector
├── docker/postgres/
│   ├── Dockerfile               # 基于 postgres:18 安装 pgvector
│   └── init/01-extensions.sql   # 首次初始化自动 CREATE EXTENSION vector
├── apps/
│   ├── web/                     # 前端
│   │   ├── vite.config.ts       # 端口 5173，/api 代理到 3000
│   │   ├── components.json      # shadcn 配置
│   │   └── src/
│   │       ├── App.tsx
│   │       ├── main.tsx
│   │       ├── features/chat/ChatPage.tsx      # 对话页主容器
│   │       ├── components/chat/                # 对话 UI 组件
│   │       │   ├── ChatHeader.tsx
│   │       │   ├── ChatInput.tsx
│   │       │   ├── MessageList.tsx
│   │       │   ├── MessageBubble.tsx
│   │       │   ├── MarkdownRenderer.tsx
│   │       │   ├── ToolPartRenderer.tsx        # 工具调用渲染分发
│   │       │   ├── TicketApproval.tsx          # 工单审批 UI
│   │       │   └── TypingIndicator.tsx
│   │       ├── components/ui/                  # shadcn 基础组件
│   │       ├── lib/user.ts                     # 本地用户 ID
│   │       ├── services/                       # API 封装（api/conversation）
│   │       └── types/chat.ts                   # 前端消息 & 工具类型
│   └── server/                  # 后端
│       ├── drizzle.config.ts
│       ├── drizzle/             # SQL 迁移文件
│       └── src/
│           ├── app.ts           # 应用装配：buildApp()（Fastify + CORS + 路由）
│           ├── server.ts        # 启动入口：监听端口
│           ├── routes/          # HTTP 路由插件
│           │   ├── index.ts         # 汇总注册所有路由
│           │   ├── health.ts
│           │   ├── chat.ts
│           │   └── conversations.ts
│           ├── schemas/         # 请求校验（Zod）
│           │   ├── chat.ts
│           │   └── conversation.ts
│           ├── agent/           # Agent 编排
│           │   ├── index.ts         # AgentContext 类型
│           │   ├── runtime.ts       # streamText 执行
│           │   ├── context.ts       # 组装上下文
│           │   ├── prompts.ts       # System Prompt
│           │   ├── memory.ts        # AgentMemory / UserMemory 类型
│           │   ├── memory-context.ts    # 汇总摘要 + 最近消息 + 用户记忆
│           │   ├── memory-extractor.ts  # 用 LLM 抽取用户长期记忆
│           │   └── summarizer.ts    # 会话摘要生成
│           ├── tools/           # 工具定义
│           │   ├── index.ts
│           │   ├── calculator.ts
│           │   ├── getCurrentTime.ts
│           │   ├── getWeather.ts
│           │   ├── getUserInfo.ts
│           │   └── createTicket.ts
│           ├── services/        # 业务逻辑
│           │   ├── chat.ts
│           │   ├── conversation.ts
│           │   ├── memory.ts
│           │   ├── user-memory.ts
│           │   ├── embedding.ts         # 调用 Embedding 生成向量
│           │   ├── semantic-memory.ts   # 语义召回（query → 向量 → Top-K）
│           │   └── message-mapper.ts
│           ├── repositories/    # 数据访问层
│           │   ├── conversation.repository.ts
│           │   └── memory.repository.ts # 摘要 + 用户记忆 + 向量检索
│           ├── db/              # Drizzle 连接 & Schema
│           │   ├── index.ts
│           │   └── schema.ts
│           └── config/          # 模型 & 记忆配置
│               ├── ai.ts        # chat + embedding 客户端
│               └── memory.ts
└── packages/shared/src/         # 共享类型
```

**分层约定（后端）**：`routes (HTTP) → services (业务) → repositories (SQL) → db (连接)`。Agent 编排独立在 `agent/`，工具独立在 `tools/`，请求校验独立在 `schemas/`。这种分层是本项目最重要的教学点：**路由只做参数校验与编排，业务逻辑放 service，SQL 只出现在 repository。**

`app.ts` 只负责装配（`buildApp()` 创建 Fastify、挂 CORS 与路由并返回实例），`server.ts` 负责监听端口。二者分离后，测试可直接 `buildApp().inject()`，无需真正启动端口。

---

## 4. 快速开始

### 4.1 前置条件

- Node.js 18+（推荐 20+）
- pnpm 9+
- 一个 PostgreSQL 数据库（**需启用 pgvector 扩展**；推荐直接用仓库自带的 Docker Compose）
- 一个兼容 OpenAI 协议的大模型 API（示例使用 DeepSeek）
- （可选）一个兼容 OpenAI 协议的 Embedding API（用于语义记忆；未配置则自动降级）

### 4.2 安装依赖

```bash
pnpm install
```

### 4.3 配置环境变量

复制模板并填写：

```bash
cp apps/server/.env.example apps/server/.env
```

见 [第 5 节](#5-环境变量)。

### 4.4 启动数据库（含 pgvector）

推荐用仓库自带的 Docker Compose。镜像基于 `postgres:18` 预装 pgvector，首次初始化会自动 `CREATE EXTENSION vector`：

```bash
docker compose up -d --build

# 验证 pgvector 已启用
docker compose exec postgres \
  psql -U postgres -d ai_agent \
  -c "SELECT extversion FROM pg_extension WHERE extname='vector';"
```

默认账号 `postgres / postgres`、库 `ai_agent`、端口 `5432`，可通过根目录 `.env` 的 `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` / `POSTGRES_PORT` 覆盖。

<details>
<summary>使用自备 PostgreSQL</summary>

确保已安装并启用 pgvector，然后手动创建扩展：

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

迁移文件 `0004` 也会执行 `CREATE EXTENSION IF NOT EXISTS vector`，因此有权限时无需手动创建。

</details>

### 4.5 初始化表结构

```bash
pnpm --filter @ai-agent/server db:migrate   # 执行迁移（含 CREATE EXTENSION 与向量索引）
# 或开发期直接同步 schema
pnpm --filter @ai-agent/server db:push
```

### 4.6 启动开发环境

```bash
pnpm dev          # 同时启动 web + server（并行、带日志流）
pnpm dev:web      # 只启动前端 http://localhost:5173
pnpm dev:server   # 只启动后端 http://localhost:3000
```

前端通过 Vite 代理把 `/api/*` 转发到 `http://localhost:3000`，因此浏览器只需访问 **http://localhost:5173**。

### 4.7 构建与预览

```bash
pnpm build        # 先 build web，再 build server
pnpm preview      # 同时预览两者
```

### 4.8 质量检查

```bash
pnpm lint         # 前端 ESLint
pnpm typecheck    # web (tsc -b) + server (tsc --noEmit)
pnpm test         # server 单元测试（vitest）
```

---

## 5. 环境变量

配置文件：`apps/server/.env`（模板：`apps/server/.env.example`）

**Chat 模型**

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `OPENAI_API_KEY` | 是 | 模型服务密钥 |
| `OPENAI_BASE_URL` | 是 | 模型服务地址，如 `https://api.deepseek.com` |
| `OPENAI_MODEL` | 是 | 模型名，如 `deepseek-flash` |

**Embedding（语义记忆用，可留空）**

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `EMBEDDING_API_KEY` | 否 | Embedding 服务密钥；留空则语义记忆自动降级为按 importance 检索 |
| `EMBEDDING_BASE_URL` | 否 | 如 `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `EMBEDDING_MODEL` | 否 | 如 `text-embedding-v4` |
| `EMBEDDING_DIMENSIONS` | 否 | 输出维度，**必须与 `user_memories.embedding` 列一致**，默认 `1536` |

**数据库与记忆**

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `DATABASE_URL` | 是 | PostgreSQL 连接串 |
| `MEMORY_RECENT_MESSAGES` | 否 | 保留在上下文中的最近消息条数，默认 `10` |
| `MEMORY_SUMMARY_BATCH` | 否 | 触发摘要所需最少新增消息数，默认 `10` |
| `USER_MEMORY_LIMIT` | 否 | 注入 Prompt 的用户长期记忆条数上限，默认 `20` |
| `SEMANTIC_TOP_K` | 否 | 语义召回 Top-K，默认 `5` |
| `PORT` | 否 | 后端端口，默认 `3000` |
| `HOST` | 否 | 监听地址，默认 `0.0.0.0` |

> ⚠️ **安全提示**：`.env` 含真实密钥，已被根 `.gitignore` 忽略，切勿提交；仅提交 `.env.example`。本文档不复制任何密钥内容。

模型与 Embedding 客户端都在 `apps/server/src/config/ai.ts` 创建，基于 OpenAI 兼容协议，可无缝切换 DeepSeek / 通义 / Ollama 等。**注意 Chat 与 Embedding 是两套独立配置**——若 Chat 用 DeepSeek（不提供 embedding），必须单独配置 `EMBEDDING_*`。

**DashScope `text-embedding-v4` 示例**：

```bash
EMBEDDING_API_KEY=<你的 DashScope Key>
EMBEDDING_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
EMBEDDING_MODEL=text-embedding-v4
EMBEDDING_DIMENSIONS=1536   # v4 默认 1024，这里显式指定 1536 以匹配向量列
```

---

## 6. 整体架构

```
┌─────────────────────────── 浏览器 ───────────────────────────┐
│  React 19 + useChat                                           │
│  ChatPage ──► MessageList ──► MessageBubble ──► ToolPartRenderer │
│      │              ▲                                         │
│      │ sendMessage  │ 流式 parts                              │
│      ▼              │                                         │
│  DefaultChatTransport  ── POST /api/chat (SSE 流)             │
└──────────────────────────────┬────────────────────────────────┘
                               │ Vite proxy /api
┌──────────────────────────────▼────────────────────────────────┐
│  Fastify (apps/server)                                        │
│  routes/ ──► services/ ──► repositories/ ──► Drizzle ──► PG    │
│                    │                                          │
│                    ├── agent/runtime.runAgent (streamText)    │
│                    │        ├── prompts  (System Prompt)      │
│                    │        └── tools    (5 个工具)           │
│                    ├── agent/memory-context  (装配记忆上下文) │
│                    │        ├── summarizer        会话摘要     │
│                    │        ├── embedding         生成向量     │
│                    │        └── semantic-memory   余弦召回 ──► pgvector
│                    └── memory-extractor  (LLM 抽取用户记忆)    │
└───────────────────────────────────────────────────────────────┘
```

**三端职责**

- `apps/web`：UI 与对话状态机，不关心模型细节，只处理 `UIMessage` 的 `parts`。
- `apps/server`：把「HTTP 请求 → 模型调用 → 工具执行 → 持久化 → 记忆更新」串起来。
- `packages/shared`：跨端共享的纯类型定义（如 `Conversation`）。

---

## 7. 核心数据流（请求时序）

### 7.1 首次进入页面

```
ChatPage useEffect
  ├─ URL 有 ?c=<id> ──► GET /api/conversations/:id/messages ──► setMessages(历史)
  └─ 无 ─────────────► POST /api/conversations ──► 写入 ?c=<id> (history.replaceState)
```

见 `apps/web/src/features/chat/ChatPage.tsx:77`。

### 7.2 发送一条消息（含工具调用与审批）

```
用户输入 ──► sendMessage({ text })
   │
   ▼  DefaultChatTransport.prepareSendMessagesRequest 注入 conversationId
POST /api/chat
   ├─ Zod 校验 { conversationId, messages }
   ├─ conversationExists? 否 → 404
   ├─ persistMessages(messages)                    # 先落库用户消息
   ├─ streamChat(conversationId, messages, userId)
   │     ├─ convertToModelMessages(messages)       # UIMessage → ModelMessage
   │     ├─ 取最后一条用户消息文本 currentUserMessage
   │     ├─ buildAgentContext({ conversationId, userId, currentUserMessage })
   │     │     └─ buildMemoryContext()  # 会话摘要 + 最近消息 + 语义召回用户记忆
   │     └─ runAgent() → streamText({ tools, stopWhen: stepCountIs(5) })
   │            └─ 模型决定调用工具 → 执行 → 回填结果 → 继续生成（最多 5 步）
   ├─ toUIMessageStream() 转成 UI 流并 SSE 返回
   └─ onEnd:
        ├─ persistMessages(updatedMessages)         # 落库助手消息与工具 parts
        ├─ updateConversationMemory()               # 会话摘要（异步、不阻塞响应）
        └─ updateUserMemoryFromMessages()           # 抽取用户长期记忆 + 生成向量（异步）
```

见 `apps/server/src/routes/chat.ts`。

### 7.3 工单审批闭环（Human-in-the-loop）

```
模型请求 createTicket
   └─ 因 tool 设置了 needsApproval: true
        └─ 前端 part.state = 'approval-requested'
             └─ TicketApproval 渲染「确认创建 / 拒绝」
                  └─ addToolApprovalResponse({ id, approved })
                       └─ sendAutomaticallyWhen 自动续发请求
                            └─ 后端执行（approved=true）或返回拒绝（approved=false）
```

关键点：

- 工具侧：`apps/server/src/tools/createTicket.ts:26` 的 `needsApproval: true`。
- 前端侧：`apps/web/src/features/chat/ChatPage.tsx:73` 的 `sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses`。
- 审批 UI：`apps/web/src/components/chat/TicketApproval.tsx`。

---

## 8. 后端详解

### 8.1 应用装配与路由（`app.ts` / `server.ts` / `routes/`）

`app.ts` 的 `buildApp()` 只做装配，不监听端口：

```ts
export function buildApp() {
  const app = Fastify({ logger: process.env.NODE_ENV !== 'test' })
  app.register(cors, { origin: true })
  app.register(registerRoutes)
  return app
}
```

`server.ts` 是唯一入口，调用 `buildApp().listen()`。路由按业务拆到 `routes/`，每个文件是一个 Fastify 插件，由 `routes/index.ts` 统一注册；请求体 / query 的 Zod Schema 抽到 `schemas/`。

| 方法 | 路径 | 作用 |
| --- | --- | --- |
| GET | `/api/health` | 健康检查 |
| POST | `/api/chat` | 流式对话（核心，body 必带 `userId`） |
| GET | `/api/getAllConversations?userId=` | 列出当前用户的会话 |
| POST | `/api/conversations` | 新建会话（body 必带 `userId`），默认标题「新对话」 |
| GET | `/api/conversations/:id/messages?userId=` | 加载当前用户的会话及消息 |
| GET | `/api/agent-runs/:runId` | 查询某次 Agent 运行的完整轨迹（调试用） |

所有会话接口都按 `userId` 做归属过滤：会话不属于该用户时返回 404，从而避免越权读取。用户身份采用轻量方案：前端 `lib/user.ts` 在 localStorage 生成并持久化一个 UUID，随请求发送（非鉴权，生产环境应替换为服务端签发的身份）。

要点：

- 使用 `createUIMessageStreamResponse` + `toUIMessageStream` 生成标准 UI Message Stream。
- `onEnd` 里做**二次落库**（把助手消息与工具调用 parts 写回），并触发记忆更新。
- 记忆更新是 `void ... .catch(...)` 的**即发即忘**，失败只记日志，不影响对话响应。
- 路由里用 Zod 做边界校验（`chatRequestSchema`、`createConversationSchema`）。

### 8.2 Agent 运行时（`agent/`）

| 文件 | 职责 |
| --- | --- |
| `index.ts` | `AgentContext` 类型：userId / conversationId / locale / timezone / memory |
| `context.ts` | `buildAgentContext()`：调用 `buildMemoryContext` 组装上下文 |
| `memory-context.ts` | `buildMemoryContext()`：汇总会话摘要 + 最近消息 + 语义召回的用户记忆 |
| `prompts.ts` | `buildAgentPrompt()`：把上下文拼成 System Prompt |
| `runtime.ts` | `runAgent()`：调用 `streamText`，挂载 tools 与停止条件 |
| `summarizer.ts` | `generateConversationSummary()`：合并旧摘要 + 新对话 |
| `memory-extractor.ts` | `extractUserMemories()` + `memoryExtractionSchema`：用 LLM 抽取用户记忆 |
| `memory.ts` | `AgentMemory` / `UserMemory` 类型 |

`runtime.ts` 是编排核心：

```ts
streamText({
  model: chatModel,
  system: buildAgentPrompt(context),
  messages,
  tools,
  stopWhen: stepCountIs(5)   // 最多 5 个「模型↔工具」步，防止死循环
})
```

### 8.3 工具系统（`tools/`）

所有工具用 AI SDK 的 `tool()` 定义，`inputSchema` 用 Zod 描述，`execute` 返回可序列化对象。

| 工具 | 入参 | 出参 | 特点 |
| --- | --- | --- | --- |
| `getCurrentTime` | `timezone` | `{ timezone, currentTime }` | 用 `Intl.DateTimeFormat` |
| `calculator` | `a, b, operation` | `{ result }` / `{ error }` | 除零保护 |
| `getWeather` | `city` | 天气对象 / 失败信息 | 内置北京/上海/广州模拟数据 |
| `getUserInfo` | 无 | `{ success, user }` | 返回固定用户 |
| `createTicket` | `title, description, priority` | 工单对象 | **`needsApproval: true`**，模拟 1s 延迟 |

新增工具只需：在 `tools/` 新建文件 → 在 `tools/index.ts` 注册进 `tools` 对象 → 在 `apps/web/src/types/chat.ts` 补类型 → 在 `ToolPartRenderer.tsx` 补渲染分支。

`tools/index.ts` 用 `withSafeExecution()` 统一包裹每个工具的 `execute`：内部经 `agent/tool-executor.ts` 的 `executeToolSafely()` 执行——成功返回原始结果（形状不变），失败则抛出错误交给 AI SDK 生成 `output-error`，便于集中处理与记录。

### 8.4 服务与仓储分层

- `services/chat.ts`：`streamChat()` 并行执行「消息转换」与「上下文构建」，再调 `runAgent`；并负责取最后一条用户消息文本。
- `services/conversation.ts`：会话与消息的业务封装，负责 UI 消息 ↔ 数据库行的映射调用。
- `services/user-memory.ts`：用户长期记忆的读写（`saveUserMemory` 生成向量、`extractAndSaveUserMemories` 抽取并去重、`updateUserMemoryFromMessages`）。
- `services/embedding.ts`：`generateEmbedding()` 调用 Embedding 模型；未配置或失败返回 `null`（不抛错）。
- `services/semantic-memory.ts`：`searchRelevantMemories()` 把 query 向量化后交给仓储做余弦检索；无向量时返回 `null`。
- `services/message-mapper.ts`：`databaseMessageToUIMessage` / `uiMessageToDatabase`，是持久化格式与 AI SDK 格式之间的桥梁。
- `repositories/conversation.repository.ts`：所有消息/会话 SQL（含按 `seq` 排序、分页取范围、`onConflictDoUpdate` 幂等写入）。
- `repositories/memory.repository.ts`：会话摘要的写入/读取、用户记忆的增改查，以及 `searchUserMemories` 的 pgvector 余弦检索（`embedding <=> $1::vector`）。
- `services/agent-trace.ts`：Agent 运行轨迹的入库（`startAgentRun` / `recordAgentStep` / `completeAgentRun` / `getAgentTrace`）。
- `repositories/agent-trace.repository.ts`：`agent_runs` / `agent_steps` 两张表的读写。

### 8.5 Agent 运行轨迹（Trace）

为了可观测与调试，每次对话都会把 Agent 的运行过程落库。

**数据结构**（`db/schema.ts`）

- `agent_runs`：一次运行一行。`run_id`（`run_<uuid>` 公开令牌，唯一）、`user_id`、`conversation_id`、`status`(`running`/`completed`/`failed`)、`finish_reason`、`started_at`/`finished_at`、`duration_ms`、token 统计、`error`。
- `agent_steps`：一次运行多行。`run_id`（外键指向 `agent_runs.run_id`）、`step_index`、`type`(`model`/`tool`/`finish`)、`name`（工具名）、`started_at`/`finished_at`/`duration_ms`、`input`/`output`(jsonb)、`error`。

**采集流程**（`agent/runtime.ts`）

```
runAgent()
  ├─ createRunId() + createAgentTrace()        # 整次运行的轨迹对象
  ├─ onStepEnd        → emit('model')           # 每个模型步
  ├─ onToolExecutionEnd → emit('tool', name, error?)  # 每个工具调用（含耗时）
  └─ onFinish         → emit('finish', finishReason) + finishAgentTrace() + onTrace()
```

**落库与下发**（`routes/chat.ts`）

```
execute({ writer })
  ├─ startAgentRun({ userId, conversationId })  # 先建 agent_runs 行，拿到 runId
  ├─ writer.write({ type: 'data-agentRun', data: { runId } })   # runId 下发前端
  ├─ streamChat(..., { runId, onStep, onTrace })
  │     ├─ onStep  → recordAgentStep(...) 入库 + writer.write('data-agentStep') 流式给前端
  │     └─ onTrace → logAgentTrace() 结构化日志 + completeAgentRun(status/finishReason/durationMs)
  └─ writer.merge(toUIMessageStream(...))
```

持久化为**即发即忘**（`void ... .catch()`），记录失败只记日志，不影响对话。`runId` 通过 `data-agentRun` 数据块随流下发并随消息持久化，前端据此调用 `GET /api/agent-runs/:runId`（刷新后仍可用）。

**持久化细节**

- `agent_steps` 记录工具的 `input` / `output`（jsonb）；`data-agentStep` 为 `transient`，只在实时流中传输、不写入消息，避免膨胀。
- 外键均为 `ON DELETE CASCADE`：删除会话会自动清理其 `agent_runs` / `agent_steps`。
- `(run_id, step_index)` 唯一索引防止并发重复写入同一步骤。
- 运行失败或中断时由 `onError` / `onAbort` 收尾，`status` 记为 `failed` 并保存 `error`。
- 结束时 `logAgentTrace()` 通过 Fastify 的 pino 日志输出结构化 `agent_trace` 记录。

**前端调试**：助手消息右上角的「🐞 调试」按钮可展开该次运行的完整轨迹面板（`components/agent/AgentTrace.tsx`），展示 status / finishReason / duration / steps / tokens / error 以及每个 step 的类型、名称、耗时与错误。

---

## 9. 记忆系统详解

这是本项目最有教学价值的部分：**上下文窗口有限，如何让 Agent「记住」很久以前的对话？**

### 9.1 设计思路

- 最近 `N` 条消息（默认 10）原样保留，保证短期连贯。
- 更早的消息压缩成一段**滚动摘要**，注入 System Prompt。
- 摘要采用「旧摘要 + 新增对话 → 新摘要」的增量合并方式，而不是每次重算全部。

### 9.2 配置（`config/memory.ts`）

| 配置 | 环境变量 | 默认 | 含义 |
| --- | --- | --- | --- |
| `recentMessageLimit` | `MEMORY_RECENT_MESSAGES` | 10 | 保留的最近消息数 |
| `summaryBatchSize` | `MEMORY_SUMMARY_BATCH` | 10 | 攒够多少条才触发摘要 |

### 9.3 触发与计算（`services/memory.ts:57`）

每次对话结束（`onEnd`）后：

```
total          = 当前会话消息总数
summarizedCount= 上一次摘要已覆盖的消息数（无摘要则 0）
boundary       = total - recentMessageLimit          # 摘要上界（保护最近消息）

if (boundary - summarizedCount < summaryBatchSize) return   # 还没攒够，跳过
rows = getMessagesRange(offset=summarizedCount, limit=boundary - summarizedCount)
transcript = rows.map(renderMessage).join('\n')      # 只保留文本部分
summary = generateConversationSummary({ previousSummary, transcript })
createConversationSummary(conversationId, summary, summarizedCount=boundary)
```

### 9.4 读取与注入（`agent/memory-context.ts` → `agent/context.ts` → `agent/prompts.ts`）

```
buildMemoryContext() = { summary: 最新摘要, recentMessages: 最近 N 条, userMemories: 语义召回 }
        ↓
buildAgentContext() = { userId, conversationId, locale, timezone, memory }
        ↓
buildAgentPrompt() 把 memory.summary / userMemories 写进 System Prompt
```

### 9.5 摘要 Prompt 约束（`agent/summarizer.ts`）

要求摘要保留：用户身份/偏好/约束、正在做的事、已完成的事、未完成的问题、对后续有价值的上下文；要求简洁中文、不记闲聊、不编造、冲突以新对话为准。

### 9.6 用户长期记忆（跨会话）

会话摘要只作用于单个会话；用户长期记忆则跨会话复用，存在 `user_memories` 表。

写入链路（每次回复结束后异步执行）：

```
onEnd ──► updateUserMemoryFromMessages(userId, updatedMessages)
              └─ 取最近 4 条消息渲染 transcript
                   └─ extractUserMemories()  generateObject + memoryExtractionSchema
                        └─ shouldRemember=false 或空数组 → 跳过
                             └─ 逐条：generateEmbedding(content) → 去重后插入（含向量）
```

抽取约束见 `agent/memory-extractor.ts`：只抽稳定的身份/偏好/项目/约束，不抽一次性闲聊，不重复已有记忆，类型限定 `preference | profile | project | habit | other`，`importance` 取 1-5。

读取链路见 [9.7](#97-语义记忆embedding--pgvector)：优先语义召回，不可用时降级为按 importance 取。Prompt 中明确要求「仅在相关时使用、不主动说『我记得你之前说过』」。

### 9.7 语义记忆（Embedding + pgvector）

前面 9.6 是「全量注入」用户记忆，条目一多就会超出上下文且噪声大。语义记忆的做法是：**把记忆向量化存入 pgvector，回答前先用当前问题做相似度检索，只注入最相关的 Top-K 条。**

**数据模型**：`user_memories.embedding vector(1536)`，并建 HNSW 余弦索引（见 [11.1](#111-schemadbschemats)）。

**写入**（`services/user-memory.ts`）：

```
saveUserMemory({ userId, content, ... })
   └─ generateEmbedding(content)        # services/embedding.ts → AI SDK embed()
        └─ createUserMemory({ ..., embedding })   # 存入 vector 列
```

**检索**（`services/semantic-memory.ts` → `repositories/memory.repository.ts`）：

```
searchRelevantMemories(userId, query, topK)
   ├─ generateEmbedding(query)          # query 向量化
   └─ searchUserMemories(userId, vector, topK)
          SELECT ..., 1 - (embedding <=> $1::vector) AS similarity
          WHERE user_id = $1 AND embedding IS NOT NULL
          ORDER BY embedding <=> $1::vector
          LIMIT topK
```

**装配**（`agent/memory-context.ts`）：

```
buildMemoryContext(conversationId, userId, currentUserMessage)
   ├─ 会话摘要（summary）
   ├─ 最近 N 条消息（recentMessages）
   └─ searchRelevantMemories(userId, currentUserMessage, SEMANTIC_TOP_K)
         └─ 若返回 null（未配置 embedding / 调用失败 / 空 query）
              └─ 降级：getUserMemories(userId, USER_MEMORY_LIMIT)   # 按 importance
```

**关键设计点**：

- **失败降级**：`generateEmbedding` 捕获异常返回 `null`，因此 Embedding 不可用时对话照常，只是退化为按重要性取记忆。
- **维度必须一致**：`EMBEDDING_DIMENSIONS` 要和 `vector(N)` 列一致（默认 1536）。若换用默认 1024 维的模型，需改列维度并重新生成迁移。
- **两套配置独立**：Chat 与 Embedding 是两套 `*_API_KEY/BASE_URL/MODEL`，互不影响（Chat 用 DeepSeek 时，Embedding 需另配）。
- **HNSW 索引**：加速余弦近邻检索，适合增量写入；小数据量下顺序扫描也可用。

---

## 10. 前端详解

### 10.1 状态与传输（`ChatPage.tsx`）

- `conversationIdRef`：会话 ID 用 `ref` 保存，避免闭包过期，同时被 `transport` 读取。
- `transport`：自定义 `prepareSendMessagesRequest`，把 `conversationId` 合并进请求体（因为 AI SDK 默认不发送它）。
- `useChat<ChatUIMessage>`：返回 `messages / sendMessage / status / error / addToolApprovalResponse`。
- `initializedRef`：防止 React StrictMode 下 effect 重复初始化会话。

### 10.2 渲染链路

```
MessageList          遍历消息，渲染气泡 + 「思考中」指示
 └ MessageBubble     按 role 决定左右布局；遍历 message.parts
    ├ text           user 用纯文本，assistant 用 MarkdownRenderer
    └ 其它 part      ToolPartRenderer 按 part.type 分发
```

`MessageBubble.tsx:37` 的核心逻辑：`part.type === 'text'` 走文本，否则交给工具渲染器。

### 10.3 工具渲染（`ToolPartRenderer.tsx`）

按 `part.type`（如 `tool-getWeather`）分发到不同的 `ToolShell`；状态机包括：

- `input-streaming`：正在生成参数
- `output-available`：渲染结果
- `output-error`：渲染错误
- `approval-requested` / `output-denied`：交给 `TicketApproval`

### 10.4 类型系统（`types/chat.ts`）

`ChatUITools` 用 AI SDK 的泛型把每个工具的名称、入参、出参类型化，`ChatUIMessage = UIMessage<never, UIDataTypes, ChatUITools>`，从而在 `ToolPartRenderer` 中获得类型安全的 `part.output`。**前后端工具类型目前是手动同步的，改工具时务必两边一起改。**

### 10.5 API 封装（`services/` 与 `lib/`）

- `services/api.ts`：极简 `get/post` 泛型封装。
- `services/conversation.ts`：`createConversation(userId)` / `getConversation(id, userId)`。
- `lib/user.ts`：`getUserId()` 在 localStorage 生成并持久化用户 ID。
- `types/chat.ts`：复用 `@ai-agent/shared` 的 `Conversation` 类型，避免重复定义。

---

## 11. 数据库与迁移

### 11.1 Schema（`db/schema.ts`）

**`conversations`**

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `id` | text PK | 应用生成 UUID |
| `user_id` | text | 归属用户，默认 `demo-user`，有索引 |
| `title` | text | 标题 |
| `created_at` / `updated_at` | timestamp | 默认 `now()` |

**`messages`**

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `id` | text PK | UI 消息 ID |
| `seq` | bigserial | 全局自增，用于稳定排序/分页 |
| `conversation_id` | text FK | 级联删除 |
| `role` | text | user / assistant / system |
| `content` | text 可空 | 纯文本聚合（便于摘要） |
| `parts` | jsonb | AI SDK 的完整 parts（含工具调用） |
| `created_at` | timestamp | 创建时间 |

**`conversation_summaries`**

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `id` | uuid PK | 默认 `gen_random_uuid()` |
| `conversation_id` | text FK | 级联删除 |
| `summary` | text | 摘要正文 |
| `summarized_count` | integer | 该摘要覆盖到的消息数 |
| `created_at` / `updated_at` | timestamp | 时间戳 |

**`user_memories`**（用户长期记忆，跨会话）

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `id` | uuid PK | 默认 `gen_random_uuid()` |
| `user_id` | text | 归属用户（有索引） |
| `content` | text | 记忆内容 |
| `type` | text | `preference / profile / project / habit / other`，默认 `preference` |
| `importance` | integer | 重要度 1-5，默认 1 |
| `embedding` | vector(1536) | 内容向量，可空；有 **HNSW 余弦索引** |
| `created_at` / `updated_at` | timestamp | 时间戳 |

> `embedding` 使用自定义 `customType` 定义（`db/schema.ts`），`toDriver` 把 `number[]` 序列化为 `[..]`，`fromDriver` 还原为数组。

**`agent_runs`**（Agent 运行轨迹头）

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `id` | uuid PK | 内部主键 |
| `run_id` | text 唯一 | 公开令牌 `run_<uuid>` |
| `user_id` | text | 归属用户 |
| `conversation_id` | text FK | 指向 `conversations.id` |
| `status` | text | `running` / `completed` / `failed`，默认 `running` |
| `finish_reason` | text | AI SDK 的 finishReason，如 `stop` / `tool-calls` |
| `started_at` / `finished_at` | timestamp | 起止时间 |
| `duration_ms` | integer | 总耗时 |
| `input_tokens` / `output_tokens` / `total_tokens` | integer | token 统计 |
| `error` | text | 失败信息 |

**`agent_steps`**（Agent 运行轨迹明细）

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `id` | uuid PK | 内部主键 |
| `run_id` | text FK | 指向 `agent_runs.run_id` |
| `step_index` | integer | 步骤序号（从 0 开始） |
| `type` | text | `model` / `tool` / `finish` |
| `name` | text | 工具名（tool 步骤） |
| `started_at` / `finished_at` / `duration_ms` | timestamp / integer | 该步耗时 |
| `input` / `output` | jsonb | 工具入参 / 出参 |
| `error` | text | 该步错误信息 |

### 11.2 为什么同时存 `content` 和 `parts`？

- `parts` 是「真相」，用于完整恢复工具调用 UI。
- `content` 是「纯文本投影」，让摘要逻辑无需解析 JSON。

### 11.3 迁移命令

```bash
pnpm --filter @ai-agent/server db:generate   # 依据 schema 生成 SQL 到 drizzle/
pnpm --filter @ai-agent/server db:migrate    # 执行迁移
pnpm --filter @ai-agent/server db:push       # 开发期直接同步（不生成文件）
```

迁移文件位于 `apps/server/drizzle/`：

| 文件 | 内容 |
| --- | --- |
| `0000_outstanding_master_chief.sql` | 建 `conversations` / `messages` |
| `0001_stale_selene.sql` | `messages` 增加 `seq`/`parts`，建 `conversation_summaries` |
| `0002_certain_big_bertha.sql` | 建 `user_memories` |
| `0003_stale_amazoness.sql` | `conversations` 增加 `user_id` + 索引 |
| `0004_jittery_malcolm_colcord.sql` | `CREATE EXTENSION vector` + `user_memories.embedding vector(1536)` |
| `0005_dizzy_wraith.sql` | `user_memories` 的 `user_id` 索引 + `embedding` HNSW 余弦索引 |
| `0006_rich_jack_power.sql` | 建 `agent_runs` / `agent_steps`（Agent 运行轨迹） |
| `0007_minor_toad_men.sql` | 轨迹外键改为 `ON DELETE CASCADE` + `(run_id, step_index)` 唯一索引 |

---

## 12. 扩展指南

### 12.1 新增一个工具（示例：汇率查询）

1. 新建 `apps/server/src/tools/getExchangeRate.ts`，用 `tool({ description, inputSchema, execute })` 定义。
2. 在 `apps/server/src/tools/index.ts` 引入并加入 `tools` 对象。
3. 在 `apps/web/src/types/chat.ts` 的 `ChatUITools` 增加对应 `input/output`。
4. 在 `apps/web/src/components/chat/ToolPartRenderer.tsx` 增加 `part.type === 'tool-getExchangeRate'` 分支。
5. （可选）若涉及真实业务副作用，加 `needsApproval: true` 并复用审批 UI 模式。

### 12.2 新增一个 API

按分层：在 `repositories/` 加 SQL → 在 `services/` 加业务方法 → 在 `schemas/` 加 Zod Schema → 在 `routes/` 新增（或复用）路由插件，并在 `routes/index.ts` 注册。

### 12.3 调整记忆策略

只改 `.env`，无需改代码：

- 会话摘要：`MEMORY_RECENT_MESSAGES`、`MEMORY_SUMMARY_BATCH`
- 用户长期记忆：`USER_MEMORY_LIMIT`（降级时的条数）、`SEMANTIC_TOP_K`（语义召回条数）

### 12.4 更换模型服务

改 `.env` 的 `OPENAI_BASE_URL` 与 `OPENAI_MODEL` 即可；`config/ai.ts` 使用 OpenAI 兼容协议。

### 12.5 更换 / 新增 Embedding 提供方

Embedding 与 Chat 独立配置，只要服务兼容 OpenAI 的 `/embeddings`：

1. 在 `.env` 设置 `EMBEDDING_API_KEY` / `EMBEDDING_BASE_URL` / `EMBEDDING_MODEL`。
2. 让模型输出维度与 `user_memories.embedding` 列一致：
   - 若模型支持指定维度（如 DashScope `text-embedding-v4`），设 `EMBEDDING_DIMENSIONS=1536`（代码会通过 `providerOptions.openai.dimensions` 传入）。
   - 若模型维度固定且不是 1536，改 `db/schema.ts` 的 `vector(N)` → 生成新迁移 → 重建向量索引。
3. 未配置时语义记忆自动降级，不影响对话。

> 若更换模型导致维度变化，历史向量与新向量不可混用，需要清空或回填 `user_memories.embedding`。

---

## 13. 常见问题与注意事项

**Q：刷新页面会新建会话吗？**
不会。会话 ID 存在 URL `?c=<id>`，刷新时先尝试加载历史；加载失败才新建。

**Q：为什么创建工单不会立即执行？**
`createTicket` 设置了 `needsApproval: true`，必须等前端 `addToolApprovalResponse` 后才会执行，这是 Human-in-the-loop 的示例。

**Q：记忆摘要什么时候生成？**
每次回复结束且「未摘要消息数 ≥ `MEMORY_SUMMARY_BATCH`」时，在后台异步生成，不影响本次响应。

**Q：工具调用会无限循环吗？**
不会。`stopWhen: stepCountIs(5)` 限制最多 5 步。

**Q：没有配置 Embedding 会怎样？**
不影响使用。`generateEmbedding` 返回 `null`，语义检索降级为按 `importance` 取用户记忆（见 [9.7](#97-语义记忆embedding--pgvector)）。

**Q：语义记忆报维度不匹配 / 插入失败？**
`EMBEDDING_DIMENSIONS` 必须等于 `user_memories.embedding` 的维度（默认 1536）。DashScope `text-embedding-v4` 默认 1024，需要显式设 `EMBEDDING_DIMENSIONS=1536`（代码会透传给服务端）。

**已知注意点 / 可改进项**

- `apps/server/.env` 含真实密钥，已被根 `.gitignore` 忽略，切勿提交；仅提交 `.env.example`。
- 用户身份是**轻量本地 ID**（localStorage + 请求参数），不是鉴权：任何人都能伪造 `userId`。生产环境需替换为服务端签发的会话 / JWT。
- 前端暂无会话列表 / 历史侧边栏 UI，`GET /api/getAllConversations` 已就绪但未被界面使用。
- 前后端工具类型需手动保持一致（见 10.4），可考虑把工具 Schema 收敛到 `packages/shared` 统一维护。
- `createTicket` 与 `getWeather`、`getUserInfo` 均为演示实现：工单只返回模拟号（返回体带 `demo: true`），天气为内置数据，用户信息写死。
- 用户长期记忆按「最近 4 条消息」逐轮抽取；**去重仍是内容精确匹配**（`findUserMemoryByContent`），未做语义去重。
- 历史记忆（引入 embedding 之前写入的行）`embedding` 为 NULL，不会被语义检索命中；需要时写回填脚本重新生成向量。
- 向量维度固定为 1536（`vector(1536)`），更换非 1536 维的 embedding 模型需改列并重建索引。

---

## 14. 教学练习建议

按难度递进，建议配合真实代码阅读：

1. **入门**：给 `calculator` 增加幂运算 / 取模，并更新前端类型与渲染。
2. **进阶**：新增「查询订单」工具，返回模拟数据，并让模型在多轮对话中引用结果。
3. **审批**：为「退款」工具实现与 `createTicket` 相同的审批流程，理解 `needsApproval` 与 `addToolApprovalResponse`。
4. **持久化**：为会话增加重命名接口，并在 `ChatHeader` 展示标题。
5. **记忆**：把 `MEMORY_SUMMARY_BATCH` 调到 2，观察摘要表记录如何滚动增长，理解 `summarized_count` 与 `boundary` 的关系。
6. **架构**：把工具 Schema 抽到 `packages/shared`，实现前后端类型单一来源。

---

## 15. 测试

### 15.1 框架与命令

测试使用 **Vitest**，目前只覆盖 `apps/server` 的纯逻辑（不需要数据库、也不需要调用大模型）。

```bash
pnpm test                                  # 根目录：跑 server 全部测试
pnpm --filter @ai-agent/server test        # 等价写法
pnpm --filter @ai-agent/server test:watch  # 监听模式
```

`vitest run` 会自动发现 `apps/server/src/**/*.test.ts`。测试文件与源码**同目录**（就近维护），并在 `tsconfig.build.json` 中被排除，因此不会被编译进 `dist`。

### 15.2 现有测试

| 文件 | 覆盖对象 | 关键用例 |
| --- | --- | --- |
| `src/tools/calculator.test.ts` | `calculate()` 纯函数 | 加/减/乘/除、除零返回 `{ error }` |
| `src/services/message-mapper.test.ts` | 数据库行 ↔ UI 消息互转 | 有 `parts` 用 `parts`、无则回退 `content`、无文本 `content=null` |
| `src/services/memory.test.ts` | `computeSummaryBoundary()` | 未攒够返回 `null`、攒够返回边界值、扣除已摘要数 |
| `src/agent/memory-extractor.test.ts` | `memoryExtractionSchema` | 合法/空结果通过；非法 `type`、越界 `importance` 拒绝 |
| `src/app.test.ts` | `buildApp()` 路由 | 用 `app.inject()` 打 `/api/health`；缺 `userId` 的 `/api/chat` 返回 400 |

前四个针对**纯函数**，无需 mock 数据库或模型；`app.test.ts` 借助 `buildApp()` 与 Fastify 的 `inject()`，在不起端口、不连数据库的情况下测路由与校验，运行快（约 0.8s）。

### 15.3 为什么这样设计

- 把易错的业务规则（除零、摘要触发边界、格式互转、结构化输出约束）从副作用中抽成纯函数，才能低成本测试。
- 例如 `computeSummaryBoundary()` 原本内联在 `updateConversationMemory()` 里，重构后即可独立测试。
- 路由层已可用 `app.inject()` 覆盖（见 `app.test.ts`）；涉及真实 DB 的仓储与前端组件目前**未覆盖**，属于后续可补充的方向（可用 mock 仓储或集成测试）。

### 15.4 新增一个测试

与源码同目录新建 `xxx.test.ts`：

```ts
import { describe, expect, it } from 'vitest'

import { yourFunction } from './your-module.js'

describe('yourFunction', () => {
    it('describes expected behavior', () => {
        expect(yourFunction(1, 2)).toBe(3)
    })
})
```

注意：server 使用 NodeNext，导入本地模块时**带 `.js` 后缀**（Vitest 会自动解析到 `.ts`）。

### 15.5 质量检查三件套

```bash
pnpm lint         # 前端 ESLint
pnpm typecheck    # web (tsc -b) + server (tsc --noEmit)
pnpm test         # server vitest
```

建议在提交前依次执行（或接入 CI）。

---

## 附：核心文件速查

| 关注点 | 文件 |
| --- | --- |
| 应用装配 | `apps/server/src/app.ts` |
| 启动入口 | `apps/server/src/server.ts` |
| 路由插件 | `apps/server/src/routes/` |
| 请求校验 | `apps/server/src/schemas/` |
| Agent 执行 | `apps/server/src/agent/runtime.ts` |
| System Prompt | `apps/server/src/agent/prompts.ts` |
| 工具注册 | `apps/server/src/tools/index.ts` |
| 审批工具示例 | `apps/server/src/tools/createTicket.ts` |
| 会话摘要逻辑 | `apps/server/src/services/memory.ts` |
| 用户长期记忆 | `apps/server/src/services/user-memory.ts` |
| Embedding 生成 | `apps/server/src/services/embedding.ts` |
| 语义召回 | `apps/server/src/services/semantic-memory.ts` |
| 记忆装配（含降级） | `apps/server/src/agent/memory-context.ts` |
| 记忆抽取 Schema | `apps/server/src/agent/memory-extractor.ts` |
| 向量检索 SQL | `apps/server/src/repositories/memory.repository.ts` |
| Agent 轨迹采集 | `apps/server/src/agent/runtime.ts` |
| Agent 轨迹入库 | `apps/server/src/services/agent-trace.ts`、`apps/server/src/repositories/agent-trace.repository.ts` |
| Agent 轨迹查询接口 | `apps/server/src/routes/agent-runs.ts` |
| 工具安全执行 | `apps/server/src/agent/tool-executor.ts` |
| 前端调试轨迹面板 | `apps/web/src/components/agent/AgentTrace.tsx` |
| 模型 / Embedding 配置 | `apps/server/src/config/ai.ts` |
| 数据访问 | `apps/server/src/repositories/conversation.repository.ts` |
| 表结构 | `apps/server/src/db/schema.ts` |
| 数据库环境 | `docker-compose.yml`、`docker/postgres/` |
| 前端对话主容器 | `apps/web/src/features/chat/ChatPage.tsx` |
| 前端用户 ID | `apps/web/src/lib/user.ts` |
| 工具 UI 分发 | `apps/web/src/components/chat/ToolPartRenderer.tsx` |
| 前端工具类型 | `apps/web/src/types/chat.ts` |
