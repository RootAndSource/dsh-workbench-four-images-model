# 四象插件 ↔ 四象工作台 接入契约（v0.3）

> 工作台是"壳/容器/扩展点"，具体内容由各四象插件实现。
> 配套：`DESIGN.md`（产品族设计）、`README.md`（工作台安装与能力）。

---

## 0. 一句话

**工作台提供外壳、导航、通用插件管理和扩展点；插件提供自己的页面、卡片、配置与业务逻辑。**
工作台不包含任何具体插件的说明、预设、方法论文案或业务状态。

---

## 1. 三条原则

1. **内容归插件**：四象分析、执行技能、案例库等内容都放在各自插件包里；
2. **插件可独立**：没有工作台时，插件照常工作；工作台只是可选的容器；
3. **通过槽与服务适配**：插件用 DSH 官方 `ctx.slots` 注册 UI，用工作台提供的 `fourImagesNavigation` 服务注册导航入口；双方不互相 import 代码。

---

## 2. 插件包形态

一个带 UI 的四象插件建议是一个 bundle 包：

```
my-four-images-plugin/
├─ package.json          # dsh.bundle.patch + dsh.client
├─ cordis.patch.yml      # 插入 Host 插件行
├─ index.js              # Host 半（可以空实现）
├─ client.js             # Client 半（plain JS，window.__ModuleLoader__）
├─ locale/{en,zh}.json   # meta.title / meta.description
└─ icon.svg              # 可选
```

- 包名建议含 `four-images`（工作台按包名族做通用插件管理）；推荐 `dsh-four-images-*`；
- 工作台自己的包名是 `dsh-workbench-four-images-model`；
- 插件必须能被 DSH 独立安装、启用、停用、卸载；不要求工作台存在。

`package.json` 关键字段：

```json
{
  "name": "dsh-four-images-skills",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./index.js",
    "./client": "./client.js",
    "./locale/*.json": "./locale/*.json",
    "./icon": "./icon.svg"
  },
  "files": ["index.js", "client.js", "cordis.patch.yml", "locale/*.json", "icon.svg"],
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": { "platform": "web", "immediately": true }
  }
}
```

---

## 3. 工作台提供什么

### 3.1 导航服务 `fourImagesNavigation`

工作台的 Client 半提供一个 Cordis 服务，插件用它给自己的页面注册导航入口：

```js
const navigation = ctx.get('fourImagesNavigation')
const dispose = navigation.add({
  id: 'skills',                         // 页面 key；插件页面注册时使用同一个 key
  label: { zh: '执行技能', en: 'Skills' }, // 字符串或 LocalizedText
  order: 20,                            // 数字，小的在前
})
```

- `add()` 返回 disposer，必须放进 `ctx.effect` 或插件卸载时调用；
- `id` 不能占用工作台保留页面：`home` / `plugins` / `settings` / `about`；
- 同一 id 重复注册会替换旧项；
- 插件卸载时会自动从导航中移除；如果它正是当前页，工作台回退到首页；
- `select(id)` 可让插件从卡片/动作跳转到某个页面；
- 服务可能不存在（工作台未安装/未启用），插件必须用可选注入：

```js
ctx.inject(['fourImagesNavigation'], (scope) => {
  ctx.effect(() => scope.fourImagesNavigation.add({
    id: 'skills',
    label: { zh: '执行技能', en: 'Skills' },
    order: 20,
  }), 'skills: workbench navigation')
})
```

### 3.2 子插槽

工作台在它注册主面板时声明了以下子插槽；插件用 `ctx.slots.inject` + `ctx.slots.register` 注册。

| 插槽 | 类型 | scope | 用途 |
|---|---|---|---|
| `four-images.page` | keyed（key = 导航 id） | root | 插件的整页内容 |
| `four-images.home.card` | list | root | 首页卡片 |
| `four-images.home.action` | list | root | 首页主操作 |
| `four-images.settings.section` | list | root | 设置页的插件配置区 |
| `four-images.about.section` | list | root | 关于/诊断页的插件补充 |
| `four-images.toolbar.action` | list | root | 顶栏全局动作 |

插件页面和导航的 key 必须一致；页面可以缺省（工作台会显示"页面暂不可用"）。

### 3.3 样式工具类

工作台的样式是全局的；插件可以直接复用以下类，保证与工作台一致：

| 类名 | 用途 |
|---|---|
| `fi-page` | 页面容器（内边距、最大宽度） |
| `fi-section` / `fi-section-title` / `fi-section-hint` | 内容分节 |
| `fi-card` / `fi-card-title` / `fi-card-text` | 卡片 |
| `fi-btn` / `fi-btn-primary` / `fi-btn-danger` | 按钮 |
| `fi-input` | 输入框 |
| `fi-badge` / `fi-badge-ok` / `fi-badge-warn` / `fi-badge-muted` | 状态标签 |
| `fi-actions` / `fi-meta` / `fi-mono` | 操作行、元信息、等宽文本 |
| `fi-table` | 简单表格 |
| `fi-empty` | 空状态 |

插件也可以完全用自己的样式，但只能使用宿主主题 token（`--dsw-alias-*`），并限定在自己的前缀类内。

---

## 4. 插件侧注册示例

```js
// client.js（plain JS，window.__ModuleLoader__ 形式）
window.__ModuleLoader__.load({
  id: 'dsh-four-images-skills',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    function SkillsPage(props) {
      return h('div', { className: 'fi-page' },
        h('h1', { className: 'fi-card-title' }, '执行技能'),
        h('div', { className: 'fi-card' }, '插件自己的页面内容与配置…'))
    }

    function SkillsCard(props) {
      return h('div', { className: 'fi-card' },
        h('h3', { className: 'fi-card-title' }, '执行技能'),
        h('p', { className: 'fi-card-text' }, '休眠 / 已启用状态由插件自己展示。'))
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.inject(['fourImagesNavigation'], (scope) => {
          ctx.effect(() => scope.fourImagesNavigation.add({
            id: 'skills',
            label: { zh: '执行技能', en: 'Skills' },
            order: 20,
          }), 'skills: navigation')
        })

        ctx.slots.inject('four-images.page', () => ctx.slots.register({
          name: 'four-images.page',
          key: 'skills',
          locale: 'fourImagesSkills',
          inject: () => ({ /* 插件自己的数据/回调 */ }),
        }, SkillsPage))

        ctx.slots.inject('four-images.home.card', () => ctx.slots.register({
          name: 'four-images.home.card',
          id: 'skills-card',
          locale: 'fourImagesSkills',
        }, SkillsCard))
      },
    }
  },
})
```

- `ctx.slots.inject` 在插槽不存在时不会执行；工作台卸载后注册自动撤掉；
- 页面/卡片组件拿不到工作台内部状态，只能拿 DSH 标准 props 和插件自己的 `inject`；
- 组件内不要写 `document.body`、不要 iframe、不要 require Harness Client 包。

---

## 5. 页面、卡片与配置的职责

| 内容 | 归属 |
|---|---|
| 工作台导航、外壳、通用插件管理 | 工作台 |
| 四象分析说明、分析入口、预设逻辑 | agent 插件 |
| skills 工作区选择、技能列表、生效状态 | skills 插件 |
| 案例库、报告导出、行业模板 | 对应扩展插件 |
| 插件自己的配置 schema 与持久化 | 插件自己（可用 `plugins.row.config` 提供原生配置页，或在自己的页面里用 `configForms`） |

工作台**不写**插件的业务配置，也不读取插件的业务状态（预设、技能、案例）；它只按包名和 DSH 插件清单做通用管理。

---

## 6. 独立运行保证

- 没有工作台：`ctx.inject(['fourImagesNavigation'], …)` 不执行，插槽注册不生效，插件自身功能不受影响；
- 工作台卸载：所有导航项/页面/卡片自动移除；
- 插件停用/卸载：工作台导航与页面自动消失，当前页回退首页。

---

## 7. 通用插件管理（工作台提供）

- 识别规则：bundle 名包含 `four-images`（大小写不敏感）且不是工作台自身；
- 展示：名称、描述、版本、启用状态、插件行状态；
- 操作：启用/停用、检查更新、更新、卸载、打开 DSH 插件页；
- 安装：输入 npm 包名或本地绝对路径（目录 / `.tgz`），先预检再安装；
- 不内置"推荐安装目录"，也不保存插件业务内容。

---

## 8. 版本与兼容

- 当前工作台：`0.3.x`；本契约随工作台 0.x 演进，插槽名与导航服务名在 0.x 内尽量稳定；
- 保留页面 id：`home` / `plugins` / `settings` / `about`，插件不要占用；
- 插件页面 id 建议用简短英文（`agent`、`skills`、`cases`）；
- 若未来引入身份卡/注册中心，会保持向后兼容。

---

## 9. FAQ

**Q：为什么分析说明不放在工作台？**
A：它属于 agent 插件的内容与版本；放在插件里，插件升级时说明同步升级，工作台也不用为每个插件改文案。

**Q：插件一定要有 client 半吗？**
A：不一定。纯 Host 能力的插件可以没有 UI；需要出现在工作台里时再加 client 半。

**Q：插件能直接改工作台样式吗？**
A：不能也不应该。用工作台工具类或主题 token；全局样式会污染其他插件。

**Q：工作台没装时插件还能用吗？**
A：能。导航/插槽注入是可选扩展，不改变插件自身功能。
