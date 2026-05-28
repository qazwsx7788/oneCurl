# oneCurl

<div align="center">

一个现代化的 Windows 桌面 HTTP 客户端，基于 [Tauri v2](https://tauri.app/) 构建

支持 curl 命令解析、HTTP/WebSocket 请求、项目管理、收藏夹等功能

![Platform](https://img.shields.io/badge/platform-Windows-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Tauri](https://img.shields.io/badge/Tauri-2.0-FFC131?logo=tauri)

</div>

---

## 特性

### 核心功能

- **Curl 命令解析** — 直接粘贴 curl 命令，自动解析为可编辑的 HTTP 请求
- **请求编辑器** — 可视化编辑 Method、URL、Headers、Body、Auth、Proxy 等
- **响应查看** — 查看状态码、响应头、响应体、响应时间和大小
- **WebSocket 支持** — 实时双向通信测试

### 组织管理

- **项目/需求管理** — 按项目和需求组织请求，支持树形结构展示
- **收藏夹** — 保存常用请求，**自动保存响应结果**
- **历史记录** — 自动记录所有请求历史
- **环境变量** — 管理不同环境的配置变量

### 界面特性

- **现代化设计** — Carbon Console 设计系统，深色/浅色主题
- **多标签页** — 同时处理多个请求
- **响应式布局** — 自适应窗口大小

## 快速开始

### 环境要求

- Windows 11 或更高版本
- Node.js 18+
- Rust 1.70+ (如需从源码构建)

### 安装

下载最新的安装包：

```
src-tauri/target/release/bundle/nsis/oneCurl_0.1.0_x64-setup.exe
```

或直接运行独立版本：

```
src-tauri/target/release/onecurl.exe
```

### 从源码构建

```bash
# 克隆仓库
git clone https://github.com/yourusername/oneCurl.git
cd oneCurl

# 安装依赖
npm install

# 开发模式运行
npm run tauri dev

# 构建生产版本
npm run tauri build
```

## 使用指南

### 1. 使用 Curl 命令

粘贴 curl 命令到输入框：

```bash
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token123" \
  -d '{"name":"张三","email":"zhangsan@example.com"}'
```

点击 **解析** 按钮，请求参数将自动填充到表单中。

### 2. 发起请求

- 点击 **执行** 按钮发起请求
- 按 `Ctrl + Enter` 快捷键快速执行
- 响应结果实时显示在下方区域

### 3. 收藏请求

点击 **收藏** 按钮保存当前请求：

- 保存请求配置（URL、Headers、Body 等）
- **自动保存当前响应结果**（状态码、响应头、响应体等）
- 可以关联到指定的项目和需求

### 4. 项目管理

- 创建项目对相关请求进行分组
- 在项目下创建需求进一步细分
- 通过树形视图快速浏览和访问收藏

### 5. 环境变量

为不同环境（开发、测试、生产）配置变量值，支持：

- 字符串、数字、布尔值
- 敏感信息（Secret 类型，加密存储）

## 技术栈

### 后端

- **Tauri v2** — 轻量级桌面应用框架
- **Rust** — 系统编程语言
- **reqwest** — HTTP 客户端
- **tokio-tungstenite** — WebSocket 客户端
- **rusqlite** — SQLite 数据库

### 前端

- **React 18** — UI 框架
- **TypeScript** — 类型安全
- **Tailwind CSS** — 样式框架
- **Zustand** — 状态管理
- **Vite** — 构建工具

## 数据存储

应用使用 SQLite 数据存储，数据库位置：

```
~/oneCurl/onecurl.db
```

数据表结构：

- `requests` — 请求配置
- `history` — 历史记录
- `favorites` — 收藏夹（包含响应数据）
- `environments` — 环境变量
- `projects` — 项目
- `requirements` — 需求
- `config` — 应用配置

## 项目结构

```
oneCurl/
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   ├── services/           # Tauri API 调用
│   ├── stores/             # Zustand 状态管理
│   └── types/              # TypeScript 类型定义
├── src-tauri/              # 后端源码
│   ├── src/
│   │   ├── commands.rs     # Tauri 命令
│   │   ├── models.rs       # 数据模型
│   │   ├── storage.rs      # 数据库操作
│   │   ├── http_client.rs  # HTTP 客户端
│   │   └── curl_parser.rs  # Curl 解析器
│   └── icons/              # 应用图标
└── dist/                   # 构建输出
```

## 最新更新

### v0.1.0 (2025-05-28)

- **收藏增强** — 收藏时自动保存响应结果
- **新图标** — 现代化的 curl 风格图标设计
- **项目组织** — 新增项目和需求层级管理
- **主题系统** — 支持深色/浅色主题切换

## 常见问题

### Q: 收藏的请求可以包含响应结果吗？

A: 是的！当你点击收藏按钮时，如果当前标签已执行过请求，响应结果会自动保存到收藏中。下次打开该收藏时，可以看到上次的响应数据。

### Q: 如何在不同项目间移动请求？

A: 选择项目和需求后执行/收藏请求，会自动关联到当前选中的项目和需求。

### Q: 支持哪些 HTTP 方法？

A: 支持所有标准方法：GET、POST、PUT、DELETE、PATCH、HEAD、OPTIONS 等。

## 开源协议

本项目采用 [MIT](LICENSE) 协议开源。

## 致谢

- [Tauri](https://tauri.app/) — 优秀的跨平台桌面应用框架
- [Carbon Design System](https://carbondesignsystem.com/) — 设计灵感来源
