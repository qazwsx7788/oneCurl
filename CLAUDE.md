# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

oneCurl 是一个基于 Tauri v2 的 Windows 桌面 HTTP 客户端，支持通过 curl 命令或表单方式发起 HTTP/WebSocket 请求。

## 常用命令

```bash
# 开发模式（同时启动前端 + Rust 后端）
cargo tauri dev

# 仅前端开发（Vite dev server，端口 1420）
npm run dev

# 构建桌面应用
cargo tauri build

# 前端构建检查（TypeScript 编译 + Vite 打包）
npm run build

# 运行 Rust 测试
cargo test

# 运行单个 Rust 测试
cargo test test_name
```

## 架构

### 后端 (Rust/Tauri)

- `src-tauri/src/main.rs` — 入口，调用 `onecurl_lib::run()`
- `src-tauri/src/lib.rs` — Tauri 应用初始化、AppState 注册、命令路由
- `src-tauri/src/commands.rs` — 所有 `#[tauri::command]` IPC 处理函数
- `src-tauri/src/models.rs` — 数据模型（HttpRequest, HttpResponse, Project, Requirement 等）
- `src-tauri/src/curl_parser.rs` — curl 命令解析器，支持 ANSI-C quoting
- `src-tauri/src/http_client.rs` — 基于 reqwest 的 HTTP 执行器，维护两个 client（SSL 验证/不验证）
- `src-tauri/src/storage.rs` — SQLite 存储层（rusqlite），Mutex<Connection> 包装
- `src-tauri/src/websocket.rs` — WebSocket 客户端（tokio-tungstenite）

### 前端 (React/TypeScript/Tailwind)

- `src/services/tauri.ts` — Tauri IPC 桥接层，所有 `invoke` 调用集中在此
- `src/stores/` — Zustand 状态管理（requestStore, historyStore, favoritesStore, tabStore, uiStore, projectStore, environmentStore）
- `src/types/` — TypeScript 类型定义，与 Rust models 对应
- `src/components/` — UI 组件（Layout, Sidebar, RequestInput, ResponseDisplay, Tabs）

### 数据流

1. 前端通过 `invoke()` 调用 Rust 命令
2. `commands.rs` 中的函数接收 `State<'_, Arc<AppState>>` 访问 http_client、storage、websocket
3. storage 使用 `Mutex<Connection>` 保证线程安全
4. 数据库自动创建在 `~/oneCurl/onecurl.db`

### 主题系统

使用 CSS 变量 + Tailwind 自定义颜色（`oc-base`, `oc-surface`, `oc-accent` 等），通过 `darkMode: 'class'` 切换。

### 数据库 Schema

SQLite 表：`requests`, `history`, `favorites`, `environments`, `projects`, `requirements`, `config`, `logs`。projects 和 requirements 形成层级结构用于组织请求。
