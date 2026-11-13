# 四象工作台（dsh-workbench-four-images-model）

四象模型插件的**运行容器**：提供外壳、导航、通用插件管理和扩展点，具体内容由各四象插件补充。

> 2026-11-09：仓库与 npm 包由 `dsh-four-images-model` / `dsh-four-images-workbench` 更名为 `dsh-workbench-four-images-model`。

## 它是什么

工作台本身**不包含**四象分析说明、预设、技能配置或任何具体插件的业务内容。它只负责：

- **外壳**：左侧二级导航 + 右侧内容区，主题/语言/空状态；
- **通用插件管理**：识别已安装的四象插件，安装 / 更新 / 启停 / 卸载；
- **扩展点**：让其他四象插件注册自己的导航页、首页卡片、设置区与顶栏动作；
- **诊断**：版本、扩展点清单、最近一次安装结果。

具体功能示例：

| 插件 | 在工作台里补充的内容 |
|---|---|
| 分析智能体（agent 插件） | "四象分析"页面（六维说明、使用方式、开始分析） |
| 执行技能（skills 插件） | "执行技能"页面（工作区选择、技能列表、生效状态） |
| 未来扩展插件 | 自己的页面、卡片、设置或诊断区 |

## 安装

方式 A（npm 包名）：

```
plugin_manager({ action: "install_bundle", target: "dsh-workbench-four-images-model" })
```

方式 B（本地目录 / tgz，绝对路径）：

```
plugin_manager({ action: "install_bundle", target: "<本目录的绝对路径>" })
```

装完后 DSH 侧栏出现四象图标；刷新一次页面即可看到新的工作台。

## 当前版本（v0.3.0）

**已实现：**

- 左侧二级导航 + 右侧内容区的壳层；
- 核心页：首页 / 插件 / 设置 / 关于；
- 通用插件管理：按 `four-images` 包名族识别、安装（npm / 本地路径，预检 + 确认）、启用/停用、检查更新、更新、卸载；
- 扩展点：`fourImagesNavigation` 导航服务 + 7 个子插槽（page / home.card / home.action / settings.section / about.section / toolbar.action）；
- 插件页面按导航 id 动态挂载；插件卸载时导航与页面自动移除；
- zh/en 文案、宿主主题 token、空状态与响应式布局。

**尚未包含（由插件或后续版本完成）：**

- 具体插件内容：agent 插件的页面/卡片、skills 插件的配置页；
- 工作台自身没有业务设置（设置页用于承载插件配置）；
- 档案库、插件目录/应用商店。

## 开发与验证

```
node scripts/smoke.mjs
```

冒烟测试用 mock 渲染壳层、核心页、导航服务与插件页面挂载。

## 插件接入

见 [INTEGRATION.md](./INTEGRATION.md)：导航服务、插槽清单、注册示例、样式工具类、独立运行保证。

## 文档

- [DESIGN.md](./DESIGN.md)：产品族设计（壳 + 插件内容）
- [INTEGRATION.md](./INTEGRATION.md)：插件 ↔ 工作台接入契约
