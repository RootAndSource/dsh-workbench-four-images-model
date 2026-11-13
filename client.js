/**
 * 四象工作台 · Client 半（plain JS，无构建步骤） · v0.3.0
 *
 * 定位：四象插件族的"壳/容器/扩展点"，不承载任何具体插件的业务内容。
 *
 * 工作台负责：
 *   - 外壳：左侧二级导航 + 右侧内容区、主题、语言、空状态；
 *   - 通用管理：按包名族识别插件，展示插件目录与状态，复制包名并跳转 DSH 官方插件页；
 *   - 扩展点：导航服务 + 子插槽，供其他四象插件注册页面、卡片、设置与动作；
 *   - 诊断：版本、扩展点清单、安装结果。
 *
 * 不负责：四象分析说明、预设判断、模型配置、插件 README 渲染等具体内容。
 */
window.__ModuleLoader__.load({
  id: 'dsh-workbench-four-images-model',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'fourImagesWorkbench';
    const PANEL_ID = 'four-images';
    const WORKBENCH_PKG = 'dsh-workbench-four-images-model';
    const VERSION = '0.3.0';
    const CORE_PAGES = ['home', 'plugins', 'settings', 'about'];
    const REPO_URL = 'https://github.com/RootAndSource/dsh-workbench-four-images-model';

    /**
     * 四象插件目录（只用于插件页陈列：包名 + 标题 + 一句简介）。
     * 具体内容与配置仍在各插件自己的包里；这里不包含插件详细说明。
     */
    const CATALOG = [
      {
        packageName: 'dsh-preset-four-images-model',
        order: 10,
        title: { zh: '四象模型 · 分析智能体', en: 'Four-Images Analysis Agent' },
        description: {
          zh: '六维四阶段的管理问题分析与方案生成，只读、装上即用。',
          en: 'Six-dimension analysis and planning, read-only, ready once installed.',
        },
      },
      {
        packageName: 'dsh-skills-four-images-model',
        order: 20,
        title: { zh: '四象执行技能', en: 'Four-Images Execution Skills' },
        description: {
          zh: '可配置的执行能力，默认休眠；选定生效工作区后使用。',
          en: 'Configurable execution skills, dormant until a workspace is selected.',
        },
      },
    ];

    /* ------------------------------------------------------------------ */
    /* 文案                                                                */
    /* ------------------------------------------------------------------ */
    const DICT = {
      zh: {
        panel: '四象工作台',
        tagline: '四象模型插件族 · 运行容器',
        navHome: '首页',
        navPlugins: '插件',
        navSettings: '设置',
        navAbout: '关于',
        pluginPages: '插件页面',
        noPluginPages: '安装四象插件后，插件页面会出现在这里。',
        refresh: '刷新',
        loading: '正在读取插件状态…',
        loadError: '读取插件状态失败：',
        openPlugins: 'DSH 插件页',
        homeTitle: '四象模型插件的运行容器',
        homeIntro: '工作台本身只提供外壳、导航、插件管理和扩展点；具体功能由已安装的四象插件补充页面、卡片与配置。',
        homePluginContent: '插件内容',
        homePluginHint: '插件可在这里添加卡片，也可以在上方添加主操作。',
        homeStats: '运行概览',
        statInstalled: '已安装四象插件',
        statEnabled: '已启用',
        installedTitle: '已安装的四象插件',
        installedEmpty: '还没有安装四象插件。安装后会自动出现在这里，并可在左侧导航中增加自己的页面。',
        installTitle: '安装四象插件',
        installHint: '输入 npm 包名或本地绝对路径（目录 / .tgz），先预检再安装。',
        installPlaceholder: '例如 dsh-skills-four-images-model 或 D:\\downloads\\plugin.tgz',
        installButton: '预检并安装',
        installConfirm: '确认安装？',
        source: '来源',
        package: '包名',
        version: '版本',
        statusLabel: '状态',
        enabledState: '已启用',
        disabledState: '已安装 · 未启用',
        activeState: '插件行已激活',
        inactiveState: '插件行未激活',
        checkUpdates: '检查更新',
        update: '更新',
        updating: '更新中…',
        latest: '已是最新版本',
        updateAvailable: '发现新版本',
        busy: '处理中…',
        remove: '卸载',
        removeConfirm: '确认卸载？历史会话与报告不会被删除。',
        enable: '启用',
        disable: '停用',
        openPluginPage: '打开插件页',
        settingsTitle: '插件设置',
        settingsHint: '插件提供的配置会显示在这里。工作台本身不代写插件的业务配置。',
        settingsEmpty: '还没有插件提供设置。',
        aboutTitle: '关于',
        aboutVersion: '工作台版本',
        aboutPackage: '包名',
        aboutEngine: '要求 DSH',
        aboutRepo: '仓库',
        extensionTitle: '扩展点',
        extensionIntro: '其他四象插件通过以下方式向工作台补充内容：',
        extNav: '导航服务 fourImagesNavigation：注册页面入口',
        extPage: '插槽 four-images.page：注册页面内容',
        extHomeCard: '插槽 four-images.home.card：首页卡片',
        extHomeAction: '插槽 four-images.home.action：首页主操作',
        extSettings: '插槽 four-images.settings.section：设置区',
        extAbout: '插槽 four-images.about.section：关于页补充',
        extToolbar: '插槽 four-images.toolbar.action：顶栏动作',
        diagnostics: '诊断信息',
        lastOperation: '最近一次操作',
        noOperation: '暂无操作记录',
        copyDiagnostics: '复制诊断信息',
        copied: '诊断信息已复制',
        copyFailed: '复制失败：',
        familySummary: '四象插件族',
        noFamily: '暂无已安装的四象插件',
        applied: '已安装并生效',
        restartRequired: '已完成变更，需要重启 DSH 后生效',
        overridden: '已完成，但被更高优先级的配置覆盖',
        failed: '操作失败',
        cancelled: '操作已取消',
        done: '已完成',
        emptyLocal: '请先填写包名或本地路径',
        pluginPageMissing: '该插件的页面暂不可用。',
        pluginPageMissingHint: '插件可能未启用或尚未提供页面内容。',
        catalogTitle: '四象插件目录',
        catalogIntro: '这里列出四象插件族。安装、更新、卸载请在 DSH 官方插件页完成。',
        copyName: '复制插件名',
        copiedName: '已复制插件名',
        openOfficial: '打开 DSH 插件页',
        officialHint: '复制插件名后，在 DSH 官方插件页的“添加插件”里粘贴安装。',
        otherInstalled: '其他已安装的四象插件',
        statusNotInstalled: '未安装',
        starTitle: '支持这个项目',
        starText: '如果这个项目对你有帮助，欢迎在 GitHub 上点一个 Star ⭐',
        starButton: '去 GitHub 点 Star',
        copyRepo: '复制仓库地址',
        copiedRepo: '仓库地址已复制',
      },
      en: {
        panel: 'Four-Images Workbench',
        tagline: 'Four-Images plugin family · runtime container',
        navHome: 'Home',
        navPlugins: 'Plugins',
        navSettings: 'Settings',
        navAbout: 'About',
        pluginPages: 'Plugin pages',
        noPluginPages: 'Install Four-Images plugins; their pages will appear here.',
        refresh: 'Refresh',
        loading: 'Reading plugin state…',
        loadError: 'Failed to read plugin state: ',
        openPlugins: 'DSH Plugins',
        homeTitle: 'A runtime container for Four-Images plugins',
        homeIntro: 'The workbench only provides the shell, navigation, plugin management, and extension points. Installed Four-Images plugins add pages, cards, and settings.',
        homePluginContent: 'Plugin content',
        homePluginHint: 'Plugins may add cards here and primary actions above.',
        homeStats: 'Overview',
        statInstalled: 'Installed Four-Images plugins',
        statEnabled: 'Enabled',
        installedTitle: 'Installed Four-Images plugins',
        installedEmpty: 'No Four-Images plugins installed yet. They will appear here and can add their own pages to the left navigation.',
        installTitle: 'Install a Four-Images plugin',
        installHint: 'Enter an npm package name or an absolute local directory / .tgz path. It is inspected before installation.',
        installPlaceholder: 'e.g. dsh-skills-four-images-model or D:\\downloads\\plugin.tgz',
        installButton: 'Inspect & install',
        installConfirm: 'Install now?',
        source: 'Source',
        package: 'Package',
        version: 'Version',
        statusLabel: 'Status',
        enabledState: 'Enabled',
        disabledState: 'Installed · disabled',
        activeState: 'Plugin row active',
        inactiveState: 'Plugin row inactive',
        checkUpdates: 'Check updates',
        update: 'Update',
        updating: 'Updating…',
        latest: 'Up to date',
        updateAvailable: 'New version',
        busy: 'Working…',
        remove: 'Uninstall',
        removeConfirm: 'Uninstall this plugin? Sessions and reports are kept.',
        enable: 'Enable',
        disable: 'Disable',
        openPluginPage: 'Open plugin page',
        settingsTitle: 'Plugin settings',
        settingsHint: 'Configuration provided by plugins appears here. The workbench does not write plugin business settings.',
        settingsEmpty: 'No plugin provides settings yet.',
        aboutTitle: 'About',
        aboutVersion: 'Workbench version',
        aboutPackage: 'Package',
        aboutEngine: 'Requires DSH',
        aboutRepo: 'Repository',
        extensionTitle: 'Extension points',
        extensionIntro: 'Other Four-Images plugins extend the workbench through:',
        extNav: 'Navigation service fourImagesNavigation: register a page entry',
        extPage: 'Slot four-images.page: page content',
        extHomeCard: 'Slot four-images.home.card: home cards',
        extHomeAction: 'Slot four-images.home.action: home actions',
        extSettings: 'Slot four-images.settings.section: settings sections',
        extAbout: 'Slot four-images.about.section: about sections',
        extToolbar: 'Slot four-images.toolbar.action: toolbar actions',
        diagnostics: 'Diagnostics',
        lastOperation: 'Last operation',
        noOperation: 'No operation yet',
        copyDiagnostics: 'Copy diagnostics',
        copied: 'Diagnostics copied',
        copyFailed: 'Copy failed: ',
        familySummary: 'Four-Images plugin family',
        noFamily: 'No installed Four-Images plugins',
        applied: 'Installed and applied',
        restartRequired: 'Changed; restart DSH to take effect',
        overridden: 'Changed, but overridden by a higher-priority configuration',
        failed: 'Failed',
        cancelled: 'Cancelled',
        done: 'Done',
        emptyLocal: 'Enter a package name or local path first',
        pluginPageMissing: 'This plugin page is unavailable.',
        pluginPageMissingHint: 'The plugin may be disabled or may not provide page content.',
        catalogTitle: 'Four-Images plugin catalog',
        catalogIntro: 'Four-Images plugins are listed here. Install, update, or uninstall them on the official DSH Plugins page.',
        copyName: 'Copy package name',
        copiedName: 'Package name copied',
        openOfficial: 'Open DSH Plugins',
        officialHint: 'Copy the package name, then paste it into “Add plugin” on the official DSH Plugins page.',
        otherInstalled: 'Other installed Four-Images plugins',
        statusNotInstalled: 'Not installed',
        starTitle: 'Support this project',
        starText: 'If this project helps you, please give it a Star on GitHub ⭐',
        starButton: 'Star on GitHub',
        copyRepo: 'Copy repository URL',
        copiedRepo: 'Repository URL copied',
      },
    };

    /* ------------------------------------------------------------------ */
    /* 样式（宿主主题 token + 给插件复用的工具类）                          */
    /* ------------------------------------------------------------------ */
    const CSS = `
.fi-shell { height: 100%; display: flex; flex-direction: column; min-height: 0; background: var(--dsw-alias-bg-base, transparent); color: var(--dsw-alias-label-primary, #1f2328); }
.fi-header { display: flex; align-items: center; gap: 12px; padding: 14px 22px; border-bottom: .5px solid var(--dsw-alias-border-l3, rgba(0,0,0,.1)); flex: 0 0 auto; }
.fi-brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.fi-brand-mark { display: inline-flex; color: var(--dsw-alias-state-business-primary, #2563eb); }
.fi-brand-text { min-width: 0; }
.fi-brand-title { font-size: 15px; font-weight: 600; margin: 0; line-height: 1.3; }
.fi-brand-sub { font-size: 11px; color: var(--dsw-alias-label-tertiary, #6b7280); margin: 1px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fi-header-spacer { flex: 1 1 auto; }
.fi-catalog { display: flex; flex-direction: column; gap: 12px; }
.fi-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.fi-toolbar > [data-slot] { display: contents; }
.fi-body { flex: 1 1 auto; display: flex; min-height: 0; }
.fi-nav { width: 208px; flex: 0 0 208px; border-right: .5px solid var(--dsw-alias-border-l3, rgba(0,0,0,.1)); padding: 14px 10px; overflow-y: auto; box-sizing: border-box; }
.fi-nav-group { display: flex; flex-direction: column; gap: 2px; margin-bottom: 14px; }
.fi-nav-group:last-child { margin-bottom: 0; }
.fi-nav-group-title { font-size: 11px; color: var(--dsw-alias-label-tertiary, #6b7280); padding: 4px 10px 6px; letter-spacing: .3px; }
.fi-nav-item { appearance: none; border: 0; background: transparent; color: var(--dsw-alias-label-secondary, #4b5563); font-size: 13px; line-height: 20px; padding: 7px 10px; border-radius: 8px; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 8px; }
.fi-nav-item:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.1)); }
.fi-nav-item-active { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.14)); color: var(--dsw-alias-label-primary, #111); font-weight: 500; }
.fi-nav-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: .55; flex: 0 0 auto; }
.fi-nav-hint { padding: 6px 10px; font-size: 12px; line-height: 1.5; color: var(--dsw-alias-label-tertiary, #6b7280); }
.fi-content { flex: 1 1 auto; min-width: 0; overflow-y: auto; }
.fi-page { max-width: 980px; margin: 0 auto; padding: 24px 28px 56px; padding-top: calc(24px + var(--dsh-frame-top-clearance, 0px)); box-sizing: border-box; }
.fi-hero { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 20px; }
.fi-hero-mark { color: var(--dsw-alias-state-business-primary, #2563eb); flex: 0 0 auto; margin-top: 2px; }
.fi-hero-title { font-size: 20px; font-weight: 600; margin: 0 0 6px; }
.fi-hero-text { font-size: 13.5px; line-height: 1.75; color: var(--dsw-alias-label-secondary, #4b5563); margin: 0; max-width: 720px; }
.fi-section { margin-top: 22px; }
.fi-section-title { font-size: 14px; font-weight: 600; margin: 0 0 10px; }
.fi-section-hint { font-size: 12.5px; line-height: 1.6; color: var(--dsw-alias-label-tertiary, #6b7280); margin: 0 0 12px; }
.fi-grid-slot > [data-slot] { display: contents; }
.fi-grid-slot { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.fi-stack-slot > [data-slot] { display: contents; }
.fi-stack-slot { display: flex; flex-wrap: wrap; gap: 8px; }
.fi-list-slot > [data-slot] { display: contents; }
.fi-list-slot { display: flex; flex-direction: column; gap: 10px; }
.fi-card { border: .5px solid var(--dsw-alias-border-l3, rgba(0,0,0,.12)); border-radius: var(--dsw-radius-md, 12px); padding: 16px; background: var(--dsw-alias-bg-base, transparent); box-sizing: border-box; }
.fi-card-title { font-size: 14px; font-weight: 600; margin: 0 0 6px; }
.fi-card-text { font-size: 13px; line-height: 1.65; color: var(--dsw-alias-label-secondary, #4b5563); margin: 0 0 10px; }
.fi-meta { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--dsw-alias-label-tertiary, #6b7280); margin-bottom: 12px; }
.fi-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; }
.fi-actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.fi-btn { appearance: none; border: .5px solid var(--dsw-alias-border-l3, rgba(0,0,0,.15)); background: transparent; color: var(--dsw-alias-label-primary, #111); font-size: 13px; padding: 6px 12px; border-radius: 8px; cursor: pointer; }
.fi-btn:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.1)); }
.fi-btn:disabled { opacity: .5; cursor: not-allowed; }
.fi-btn-primary { background: var(--dsw-alias-state-business-primary, #2563eb); border-color: transparent; color: #fff; }
.fi-btn-primary:hover:not(:disabled) { filter: brightness(1.06); }
.fi-btn-danger { color: #b91c1c; }
.fi-input { flex: 1 1 320px; min-width: 220px; box-sizing: border-box; font-size: 13px; padding: 7px 10px; border-radius: 8px; border: .5px solid var(--dsw-alias-border-l3, rgba(0,0,0,.18)); background: var(--dsw-alias-bg-base, transparent); color: var(--dsw-alias-label-primary, #111); }
.fi-input:focus { outline: 2px solid var(--dsw-focus-ring-color, rgba(37,99,235,.5)); outline-offset: 0; }
.fi-field { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
.fi-badge { font-size: 11px; line-height: 18px; padding: 0 8px; border-radius: 999px; white-space: nowrap; border: .5px solid transparent; }
.fi-badge-ok { color: var(--dsw-alias-state-done-primary, #15803d); background: rgba(34,197,94,.12); }
.fi-badge-warn { color: #b45309; background: rgba(245,158,11,.14); }
.fi-badge-muted { color: var(--dsw-alias-label-tertiary, #6b7280); background: rgba(127,127,127,.1); }
.fi-notice { font-size: 13px; line-height: 1.55; padding: 10px 12px; border-radius: 10px; margin-bottom: 14px; border: .5px solid; }
.fi-notice-ok { color: var(--dsw-alias-state-done-primary, #15803d); border-color: rgba(34,197,94,.35); background: rgba(34,197,94,.08); }
.fi-notice-error { color: #b91c1c; border-color: rgba(239,68,68,.35); background: rgba(239,68,68,.08); }
.fi-notice-info { color: var(--dsw-alias-label-secondary, #4b5563); border-color: var(--dsw-alias-border-l3, rgba(0,0,0,.12)); background: rgba(127,127,127,.06); }
.fi-loading { display: flex; align-items: center; gap: 8px; color: var(--dsw-alias-label-tertiary, #6b7280); font-size: 13px; padding: 12px 0; }
.fi-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--dsw-alias-state-business-primary, #2563eb); animation: fi-pulse 1s infinite ease-in-out; }
@keyframes fi-pulse { 0%,100% { opacity: .3 } 50% { opacity: 1 } }
.fi-plugin-row { display: flex; align-items: flex-start; gap: 12px; padding: 14px 0; border-bottom: .5px solid var(--dsw-alias-border-l3, rgba(0,0,0,.08)); }
.fi-plugin-row:last-child { border-bottom: 0; }
.fi-plugin-main { flex: 1 1 auto; min-width: 0; }
.fi-plugin-title { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
.fi-plugin-name { font-size: 13.5px; font-weight: 600; margin: 0; }
.fi-plugin-desc { font-size: 12.5px; line-height: 1.55; color: var(--dsw-alias-label-tertiary, #6b7280); margin: 0 0 6px; }
.fi-stats { display: flex; flex-wrap: wrap; gap: 10px; margin: 16px 0 0; }
.fi-stat { border: .5px solid var(--dsw-alias-border-l3, rgba(0,0,0,.12)); border-radius: 10px; padding: 10px 14px; min-width: 120px; }
.fi-stat-value { font-size: 20px; font-weight: 600; line-height: 1.2; }
.fi-stat-label { font-size: 11.5px; color: var(--dsw-alias-label-tertiary, #6b7280); margin-top: 2px; }
.fi-table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 4px 0; }
.fi-table th, .fi-table td { text-align: left; padding: 8px 10px; border-bottom: .5px solid var(--dsw-alias-border-l3, rgba(0,0,0,.1)); vertical-align: top; }
.fi-table th { color: var(--dsw-alias-label-tertiary, #6b7280); font-weight: 500; width: 140px; }
.fi-table td { color: var(--dsw-alias-label-secondary, #4b5563); }
.fi-empty { border: .5px dashed var(--dsw-alias-border-l3, rgba(0,0,0,.2)); border-radius: var(--dsw-radius-md, 12px); padding: 22px; text-align: center; color: var(--dsw-alias-label-tertiary, #6b7280); font-size: 13px; line-height: 1.6; }
.fi-code-block { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; background: rgba(127,127,127,.08); border-radius: 8px; padding: 10px 12px; overflow: auto; max-height: 220px; }
.fi-plugin-page > [data-slot] { display: contents; }
@media (max-width: 820px) { .fi-grid-slot { grid-template-columns: 1fr; } }
@media (max-width: 760px) {
  .fi-body { flex-direction: column; }
  .fi-nav { width: 100%; flex: 0 0 auto; border-right: 0; border-bottom: .5px solid var(--dsw-alias-border-l3, rgba(0,0,0,.1)); display: flex; gap: 6px; overflow-x: auto; padding: 10px 12px; }
  .fi-nav-group { flex-direction: row; margin-bottom: 0; flex-wrap: nowrap; }
  .fi-nav-group-title, .fi-nav-hint { display: none; }
  .fi-nav-item { white-space: nowrap; }
  .fi-page { padding: 20px 16px 40px; }
}
`;

    /* ------------------------------------------------------------------ */
    /* 小工具                                                              */
    /* ------------------------------------------------------------------ */
    function asArray(value) {
      if (Array.isArray(value)) return value;
      if (value && Array.isArray(value.items)) return value.items;
      if (value && Array.isArray(value.bundles)) return value.bundles;
      if (value && Array.isArray(value.plugins)) return value.plugins;
      return [];
    }

    function errorText(error) {
      if (!error) return '未知错误';
      if (typeof error === 'string') return error;
      if (error.message) return error.message;
      if (error.error) return error.error.message || error.error.code || '调用失败';
      try { return JSON.stringify(error); } catch (ignored) { return '调用失败'; }
    }

    function changeText(result, t) {
      if (!result || typeof result !== 'object') return t('done');
      const app = result.application;
      if (app === 'applied') return t('applied');
      if (app === 'restart-required') return t('restartRequired');
      if (app === 'overridden') return t('overridden');
      if (app === 'cancelled') return t('cancelled');
      if (app === 'failed') {
        const code = result.error && (result.error.code || result.error.diagnostic);
        return t('failed') + (code ? '：' + code : '');
      }
      return t('done');
    }

    function pickLocalized(value) {
      if (typeof value === 'string') return value;
      if (!value || typeof value !== 'object') return '';
      return value.zh || value['zh-CN'] || value.en || '';
    }

    /* ------------------------------------------------------------------ */
    /* 图标                                                                */
    /* ------------------------------------------------------------------ */
    function QuadrantMark(props) {
      const size = props.size || 28;
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true,
        style: { display: 'block' },
      },
        h('circle', { cx: 12, cy: 12, r: 9.2, fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, opacity: 0.45 }),
        h('path', { d: 'M12 2.8a9.2 9.2 0 0 1 9.2 9.2H12z', fill: 'currentColor', opacity: 0.92 }),
        h('path', { d: 'M12 21.2a9.2 9.2 0 0 1-9.2-9.2H12z', fill: 'currentColor', opacity: 0.55 }),
        h('circle', { cx: 12, cy: 12, r: 2.1, fill: 'var(--dsw-alias-bg-base, #fff)' })
      );
    }

    function SidebarIcon(props) {
      const size = props && props.size ? props.size : 16;
      return h('span', { style: { display: 'inline-flex', color: 'currentColor' } }, h(QuadrantMark, { size: size }));
    }

    /* ------------------------------------------------------------------ */
    /* 导航服务（工作台提供，插件注册页面入口）                             */
    /* ------------------------------------------------------------------ */
    function createNavigationStore() {
      let entries = [];
      let active = 'home';
      let snapshot = { entries, active };
      const listeners = new Set();
      const publish = () => {
        entries = entries.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
        snapshot = { entries, active };
        for (const listener of listeners) listener();
      };
      return {
        add(input) {
          if (!input || typeof input.id !== 'string' || !input.id) return () => {};
          if (CORE_PAGES.indexOf(input.id) !== -1) return () => {};
          const entry = {
            id: input.id,
            label: input.label || input.id,
            order: typeof input.order === 'number' ? input.order : 0,
          };
          entries = entries.filter((item) => item.id !== entry.id).concat(entry);
          publish();
          return () => {
            entries = entries.filter((item) => item.id !== entry.id);
            if (active === entry.id) active = 'home';
            publish();
          };
        },
        select(id) {
          if (typeof id !== 'string') return;
          if (CORE_PAGES.indexOf(id) === -1 && !entries.some((entry) => entry.id === id)) return;
          if (id === active) return;
          active = id;
          publish();
        },
        getSnapshot() { return snapshot; },
        subscribe(listener) {
          listeners.add(listener);
          return () => { listeners.delete(listener); };
        },
      };
    }

    /* ------------------------------------------------------------------ */
    /* 工作台外壳                                                          */
    /* ------------------------------------------------------------------ */
    function WorkbenchShell(props) {
      const [inventory, setInventory] = React.useState({ loading: true, error: null, items: [] });
      const [notice, setNotice] = React.useState(null);

      const t = (key) => {
        try {
          const value = props.t ? props.t(key) : null;
          return value && value !== key ? value : (DICT.zh[key] || key);
        } catch (ignored) {
          return DICT.zh[key] || key;
        }
      };
      const resolve = (value) => {
        try {
          if (props.resolveText) {
            const text = props.resolveText(value);
            if (text) return text;
          }
        } catch (ignored) { /* fall through */ }
        return pickLocalized(value);
      };

      const navigation = props.useNavigation ? props.useNavigation((state) => state) : { entries: [], active: 'home' };
      const active = navigation.active;
      const pluginEntries = (navigation.entries || []).filter((entry) => CORE_PAGES.indexOf(entry.id) === -1);

      const load = React.useCallback(async () => {
        setInventory((previous) => ({ ...previous, loading: true, error: null }));
        try {
          const items = await props.loadInventory();
          setInventory({ loading: false, error: null, items: items || [] });
        } catch (cause) {
          setInventory((previous) => ({ ...previous, loading: false, error: errorText(cause) }));
        }
      }, []);

      React.useEffect(() => { load(); }, [load]);

      const copyText = async (text, okText) => {
        try {
          await navigator.clipboard.writeText(text);
          setNotice({ kind: 'ok', text: okText });
          return;
        } catch (ignored) { /* fall through */ }
        try {
          const area = document.createElement('textarea');
          area.value = text;
          area.style.position = 'fixed';
          area.style.opacity = '0';
          document.body.appendChild(area);
          area.select();
          const copied = document.execCommand('copy');
          area.remove();
          if (copied) {
            setNotice({ kind: 'ok', text: okText });
            return;
          }
        } catch (ignored) { /* fall through */ }
        setNotice({ kind: 'error', text: t('copyFailed') });
      };

      const badge = (item) => {
        if (!item.installed) return h('span', { className: 'fi-badge fi-badge-muted' }, t('statusNotInstalled'));
        if (!item.enabled) return h('span', { className: 'fi-badge fi-badge-warn' }, t('disabledState'));
        return h('span', { className: 'fi-badge fi-badge-ok' }, t('enabledState'));
      };

      const catalogItems = CATALOG.map((entry) => {
        const bundle = inventory.items.find((item) => item.name === entry.packageName) || null;
        return {
          packageName: entry.packageName,
          title: resolve(entry.title) || entry.packageName,
          description: resolve(entry.description) || '',
          installed: !!bundle,
          enabled: !!(bundle && bundle.enabled),
          version: bundle ? bundle.version : '',
        };
      });
      const otherInstalled = inventory.items.filter((item) => !CATALOG.some((entry) => entry.packageName === item.name));

      const navButton = (id, label) => h('button', {
        key: id,
        className: 'fi-nav-item' + (active === id ? ' fi-nav-item-active' : ''),
        onClick: () => { try { props.selectPage(id); } catch (ignored) {} },
      }, h('span', { className: 'fi-nav-dot' }), label);

      const renderNav = () => h('nav', { className: 'fi-nav' },
        h('div', { className: 'fi-nav-group' },
          navButton('home', t('navHome')),
          navButton('plugins', t('navPlugins')),
          navButton('settings', t('navSettings')),
          navButton('about', t('navAbout'))
        ),
        pluginEntries.length > 0
          ? h('div', { className: 'fi-nav-group' },
            h('div', { className: 'fi-nav-group-title' }, t('pluginPages')),
            pluginEntries.map((entry) => navButton(entry.id, resolve(entry.label) || entry.id))
          )
          : h('div', { className: 'fi-nav-hint' }, t('noPluginPages'))
      );

      const renderHome = () => h('div', { className: 'fi-page' },
        h('section', { className: 'fi-hero' },
          h('span', { className: 'fi-hero-mark' }, h(QuadrantMark, { size: 40 })),
          h('div', null,
            h('h1', { className: 'fi-hero-title' }, t('homeTitle')),
            h('p', { className: 'fi-hero-text' }, t('homeIntro'))
          )
        ),
        h('div', { className: 'fi-stack-slot' }, props.renderSlot('four-images.home.action', {})),
        h('section', { className: 'fi-section' },
          h('h2', { className: 'fi-section-title' }, t('homePluginContent')),
          h('p', { className: 'fi-section-hint' }, t('homePluginHint')),
          h('div', { className: 'fi-grid-slot' }, props.renderSlot('four-images.home.card', {}))
        ),
        h('section', { className: 'fi-section' },
          h('h2', { className: 'fi-section-title' }, t('homeStats')),
          h('div', { className: 'fi-stats' },
            h('div', { className: 'fi-stat' },
              h('div', { className: 'fi-stat-value' }, String(inventory.items.length)),
              h('div', { className: 'fi-stat-label' }, t('statInstalled'))),
            h('div', { className: 'fi-stat' },
              h('div', { className: 'fi-stat-value' }, String(inventory.items.filter((item) => item.enabled).length)),
              h('div', { className: 'fi-stat-label' }, t('statEnabled')))
          )
        )
      );

      const renderPlugins = () => h('div', { className: 'fi-page' },
        h('h1', { className: 'fi-hero-title' }, t('catalogTitle')),
        h('p', { className: 'fi-section-hint' }, t('catalogIntro')),
        inventory.loading
          ? h('div', { className: 'fi-loading' }, h('span', { className: 'fi-dot' }), t('loading'))
          : inventory.error
            ? h('div', { className: 'fi-notice fi-notice-error' }, inventory.error)
            : h('div', { className: 'fi-catalog' }, catalogItems.map((item) => h('div', { className: 'fi-card', key: item.packageName },
              h('div', { className: 'fi-plugin-title' },
                h('h3', { className: 'fi-card-title' }, item.title),
                badge(item)
              ),
              h('p', { className: 'fi-plugin-desc' }, h('code', { className: 'fi-mono' }, item.packageName)),
              h('p', { className: 'fi-card-text' }, item.description),
              h('div', { className: 'fi-actions' },
                h('button', { className: 'fi-btn', onClick: () => copyText(item.packageName, t('copiedName') + '：' + item.packageName) }, t('copyName')),
                h('button', { className: 'fi-btn', onClick: () => { try { props.openOfficialPlugins(); } catch (ignored) {} } }, t('openOfficial'))
              ),
              item.installed && item.version
                ? h('p', { className: 'fi-meta', style: { marginTop: '8px', marginBottom: 0 } }, t('version') + '：' + item.version)
                : null
            ))),
        otherInstalled.length > 0
          ? h('section', { className: 'fi-section' },
            h('h2', { className: 'fi-section-title' }, t('otherInstalled')),
            h('div', { className: 'fi-catalog' }, otherInstalled.map((item) => h('div', { className: 'fi-card', key: item.name },
              h('div', { className: 'fi-plugin-title' },
                h('h3', { className: 'fi-card-title' }, item.title || item.name),
                badge({ installed: true, enabled: item.enabled })
              ),
              h('p', { className: 'fi-plugin-desc' }, h('code', { className: 'fi-mono' }, item.name)),
              item.description ? h('p', { className: 'fi-card-text' }, item.description) : null,
              h('div', { className: 'fi-actions' },
                h('button', { className: 'fi-btn', onClick: () => copyText(item.name, t('copiedName') + '：' + item.name) }, t('copyName')),
                h('button', { className: 'fi-btn', onClick: () => { try { props.openOfficialPlugins(); } catch (ignored) {} } }, t('openOfficial'))
              )
            ))))
          : null,
        h('div', { className: 'fi-notice fi-notice-info', style: { marginTop: '16px' } },
          t('officialHint'),
          h('div', { style: { marginTop: '8px' } },
            h('button', { className: 'fi-btn', onClick: () => { try { props.openOfficialPlugins(); } catch (ignored) {} } }, t('openOfficial'))
          )
        )
      );

      const renderSettings = () => h('div', { className: 'fi-page' },
        h('h1', { className: 'fi-hero-title' }, t('settingsTitle')),
        h('p', { className: 'fi-section-hint' }, t('settingsHint')),
        h('div', { className: 'fi-list-slot' }, props.renderSlot('four-images.settings.section', {}))
      );

      const renderAbout = () => h('div', { className: 'fi-page' },
        h('h1', { className: 'fi-hero-title' }, t('aboutTitle')),
        h('table', { className: 'fi-table' },
          h('tbody', null,
            h('tr', null, h('th', null, t('aboutVersion')), h('td', null, VERSION)),
            h('tr', null, h('th', null, t('aboutPackage')), h('td', null, h('code', null, WORKBENCH_PKG))),
            h('tr', null, h('th', null, t('aboutEngine')), h('td', null, '>= 0.2.1-rc.2')),
            h('tr', null, h('th', null, t('aboutRepo')), h('td', null, h('code', null, 'RootAndSource/dsh-workbench-four-images-model')))
          )
        ),
        h('section', { className: 'fi-section' },
          h('h2', { className: 'fi-section-title' }, t('starTitle')),
          h('p', { className: 'fi-section-hint' }, t('starText')),
          h('div', { className: 'fi-actions' },
            h('a', {
              className: 'fi-btn fi-btn-primary',
              href: REPO_URL,
              target: '_blank',
              rel: 'noopener noreferrer',
              onClick: (event) => {
                try {
                  if (typeof window !== 'undefined' && window.dshDesktop && typeof window.dshDesktop.openExternal === 'function') {
                    window.dshDesktop.openExternal(REPO_URL);
                    event.preventDefault();
                  }
                } catch (ignored) { /* fall through to the anchor */ }
              },
            }, t('starButton')),
            h('button', { className: 'fi-btn', onClick: () => copyText(REPO_URL, t('copiedRepo')) }, t('copyRepo'))
          ),
          h('p', { className: 'fi-mono', style: { marginTop: '10px', color: 'var(--dsw-alias-label-tertiary, #6b7280)' } }, REPO_URL)
        )
      );

      const renderPluginPage = () => h('div', { className: 'fi-page fi-plugin-page' },
        props.renderSlot('four-images.page', {}, {
          entryKey: active,
          fallback: h('div', { className: 'fi-empty' },
            h('div', null, t('pluginPageMissing')),
            h('div', { style: { marginTop: '4px', fontSize: '12px' } }, t('pluginPageMissingHint'))
          ),
        })
      );

      const renderContent = () => {
        if (active === 'home') return renderHome();
        if (active === 'plugins') return renderPlugins();
        if (active === 'settings') return renderSettings();
        if (active === 'about') return renderAbout();
        return renderPluginPage();
      };

      return h('div', { className: 'fi-shell' },
        h('header', { className: 'fi-header' },
          h('div', { className: 'fi-brand' },
            h('span', { className: 'fi-brand-mark' }, h(QuadrantMark, { size: 26 })),
            h('div', { className: 'fi-brand-text' },
              h('h1', { className: 'fi-brand-title' }, t('panel')),
              h('p', { className: 'fi-brand-sub' }, t('tagline'))
            )
          ),
          h('div', { className: 'fi-header-spacer' }),
          h('div', { className: 'fi-toolbar' },
            props.renderSlot('four-images.toolbar.action', {}),
            h('button', { className: 'fi-btn', onClick: load, disabled: inventory.loading }, t('refresh'))
          )
        ),
        h('div', { className: 'fi-body' },
          renderNav(),
          h('main', { className: 'fi-content' },
            notice ? h('div', { className: 'fi-notice ' + (notice.kind === 'error' ? 'fi-notice-error' : 'fi-notice-ok'), style: { margin: '14px 22px 0' } }, notice.text) : null,
            renderContent()
          )
        )
      );
    }

    /* ------------------------------------------------------------------ */
    /* Client 插件                                                         */
    /* ------------------------------------------------------------------ */
    return {
      inject: ['slots', 'locale', 'remote', 'remote.pluginManager', 'layout', 'remoteAccess'],
      apply(ctx) {
        try {
          ctx.effect(() => ctx.locale.register(NS, DICT), 'four-images: dictionaries');
        } catch (ignored) {
          /* locale 不可用时退回内置文案 */
        }

        ctx.effect(() => {
          const style = document.createElement('style');
          style.dataset.plugin = WORKBENCH_PKG;
          style.dataset.pluginCss = WORKBENCH_PKG + ':workbench';
          style.textContent = CSS;
          document.head.appendChild(style);
          return () => { style.remove(); };
        }, 'four-images: styles');

        const navigation = createNavigationStore();
        try {
          ctx.provide('fourImagesNavigation', {
            add: (entry) => navigation.add(entry),
            select: (id) => navigation.select(id),
            getSnapshot: () => navigation.getSnapshot(),
            subscribe: (listener) => navigation.subscribe(listener),
          });
        } catch (ignored) {
          /* 服务名冲突时仍保留内部导航 */
        }

        const remoteValue = async (call) => {
          const result = await call();
          if (result && typeof result === 'object' && result.ok === false) {
            const err = result.error || {};
            throw new Error(err.message || err.code || 'Remote call failed');
          }
          if (result && typeof result === 'object' && result.ok === true && 'value' in result) return result.value;
          return result;
        };

        const resolveText = (value) => {
          try {
            if (ctx.locale && typeof ctx.locale.resolveText === 'function') {
              const text = ctx.locale.resolveText(value);
              if (text) return text;
            }
          } catch (ignored) { /* fall through */ }
          return pickLocalized(value);
        };

        const loadInventory = async () => {
          const bundles = asArray(await remoteValue(() => ctx.remote.pluginManager.listBundles()));
          let plugins = [];
          try {
            plugins = asArray(await remoteValue(() => ctx.remote.pluginManager.listPlugins()));
          } catch (ignored) { plugins = []; }

          return bundles
            .filter((bundle) => bundle && typeof bundle.name === 'string' && bundle.name !== WORKBENCH_PKG && bundle.name.toLowerCase().indexOf('four-images') !== -1)
            .map((bundle) => {
              const meta = bundle.meta || {};
              const rows = plugins.filter((entry) => entry && (
                entry.moduleName === bundle.name ||
                entry.patchId === bundle.name ||
                (Array.isArray(bundle.rows) && bundle.rows.some((row) => row && row.entryId && entry.entryId === row.entryId))
              ));
              return {
                name: bundle.name,
                version: bundle.version || '',
                installed: bundle.installed !== false,
                enabled: !!bundle.enabled,
                rows,
                title: resolveText(meta.title) || resolveText(bundle.description) || bundle.name,
                description: resolveText(meta.description) || '',
              };
            })
            .sort((a, b) => a.name.localeCompare(b.name));
        };

        const openOfficialPlugins = () => {
          try {
            const navigationService = ctx.get('pluginNavigation');
            if (navigationService && typeof navigationService.openList === 'function') {
              navigationService.openList();
              return;
            }
          } catch (ignored) { /* fall back */ }
          try { ctx.layout.selectPanel('plugins'); } catch (ignored) { /* panel may be registering */ }
        };

        ctx.remoteAccess.whenAccess('pluginManager/listBundles', function* () {
          yield ctx.slots.inject('main', () => ctx.slots.register({
            name: 'main',
            key: PANEL_ID,
            locale: NS,
            children: {
              'four-images.page': { kind: 'keyed', scope: 'root' },
              'four-images.home.card': { kind: 'list', scope: 'root' },
              'four-images.home.action': { kind: 'list', scope: 'root' },
              'four-images.settings.section': { kind: 'list', scope: 'root' },
              'four-images.toolbar.action': { kind: 'list', scope: 'root' },
            },
            inject: () => ({
              hooks: { navigation },
              resolveText,
              loadInventory,
              selectPage: (id) => navigation.select(id),
              openOfficialPlugins,
            }),
          }, WorkbenchShell));
          yield ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
            name: 'sidebar.panellist',
            id: PANEL_ID,
            order: 20,
            label: () => {
              try { return ctx.locale.bind(NS)('panel'); } catch (ignored) { return '四象工作台'; }
            },
            locale: NS,
          }, SidebarIcon));
        });
      },
    };
  },
});
