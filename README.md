# 四象工作台（dsh-four-images-workbench）

四象模型系列插件的统一入口：在 DSH 侧栏多一个"四象工作台"页面，用来了解、安装、查看状态、管理并进入四象分析。

## 它做什么

- **概览**：四象插件状态、下一步推荐、系统检查；
- **插件**：安装 / 卸载 / 启用停用 / 检查更新 / 更新 / 本地目录或 tgz 安装 / 查看插件说明；
- **使用说明**：四象模型是什么、怎么提问、怎么读报告；
- **关于**：版本、最近一次操作与日志路径、诊断信息（可复制）、打开 DSH 原生插件页。

## 安装

方式 A（推荐，npm 包名）：

```
plugin_manager({ action: "install_bundle", target: "dsh-four-images-workbench" })
```

方式 B（本地目录 / tgz，绝对路径）：

```
plugin_manager({ action: "install_bundle", target: "<本目录的绝对路径>" })
```

装完后侧栏出现四象图标（四象限圆形）；点击进入工作台。若界面没有立即出现，刷新一次页面。

## 当前实现（v0.2.0）

**已实现并实机验证（安装结果 `applied`、两个客户端插槽 active、开发期冒烟测试通过）：**

- 侧栏入口 + 顶层主面板（`main` key=`four-images` + `sidebar.panellist` id=`four-images`）；
- 四个页签：概览 / 插件 / 使用说明 / 关于；
- **目录化四象插件**：内置目录数据（等效 `catalog.json`）+ 已装 `dsh-four-images-*` 前缀自动发现，装了就能看见；
- **真实状态**：`pluginManager.listBundles/listPlugins` + `agentPresets.list`（并用插件行状态兜底判断预设是否就绪）；
- **插件管理**：安装（先 `inspect` 预检、确认后安装）、卸载、启用/停用、检查更新、更新；
- **本地安装**：输入绝对目录或 `.tgz` 路径，预检后安装（离线 / 内网场景）；
- **插件详情**：用 `readBundleDetail` 读取插件自带的 README/详情文档，做安全 Markdown 渲染（标题/列表/代码块/表格/引用）；
- **开始四象分析**：`uiWorkspace.startSession` 带 `agentPreset: 'four-images-model'`；
- **诊断**：最近一次操作结果、安装日志路径、状态快照一键复制；
- zh/en 元数据、图标、跟随宿主的主题 token、模态框 Esc 关闭。

**尚未实现（依赖后续插件或排期）：**

- 执行技能插件的真实状态与工作区配置面板（等待 `dsh-four-images-skills` 发布；当前是"待发布"占位卡片）；
- 模型分工配置编辑（当前只读 + 打开 DSH 原生插件页）；
- 档案库、最近会话列表、扩展位注册中心 / 子插槽。

## 开发期校验

```
node scripts/smoke.mjs
```

用最小 mock 加载 `client.js`，执行 `apply`、目录映射、预设判断，并渲染四个页签与详情模态框。

## 四象插件如何接入

见 [`INTEGRATION.md`](./INTEGRATION.md)：三类插件（分析智能体 / 执行技能 / 扩展插件）分别要不要改、改哪一边、契约字段是什么。

## 文档

- [DESIGN.md](./DESIGN.md)：完整产品族设计
- [INTEGRATION.md](./INTEGRATION.md)：插件 ↔ 工作台接入契约
