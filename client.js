/**
 * 四象工作台 · Client 半（plain JS，无构建步骤）
 *
 * 形态：持久化 DSH bundle 的 client 模块，通过 window.__ModuleLoader__ 注册。
 * 入口：main（key = four-images）+ sidebar.panellist（id = four-images）。
 * 数据：全部来自 DSH 官方 Remote 服务（pluginManager / agentPresets），不维护本地账本。
 *
 * v0.2.0 能力：
 *   - 目录化四象插件（内置目录数据 + 已装前缀扫描，装了就能看见）；
 *   - 插件详情（读取插件 README / meta.detail 并做安全 Markdown 渲染）；
 *   - 安装 / 卸载 / 启用停用 / 检查更新 / 更新 / 本地目录或 tgz 安装；
 *   - 概览推荐动作、系统检查、诊断信息与复制。
 */
window.__ModuleLoader__.load({
  id: 'dsh-four-images-workbench',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'fourImagesWorkbench';
    const PANEL_ID = 'four-images';
    const WORKBENCH_PKG = 'dsh-four-images-workbench';
    const AGENT_PKG = 'dsh-preset-four-images-model';
    const SKILLS_PKG = 'dsh-four-images-skills';
    const VERSION = '0.2.0';

    /**
     * 四象插件目录（v0.2 先以内置数据块形式维护，等同于 catalog.json）。
     * 说明：浏览器端无法直接读取包内相对路径的 JSON 文件，因此数据随 client bundle 下发；
     * 若未来需要运行时维护，可迁移到插件的 Config 或 Host 侧注册中心。
     */
    const CATALOG = [
      {
        name: AGENT_PKG,
        kind: 'agent',
        order: 10,
        presetId: 'four-images-model',
        entryIds: ['preset-four-images'],
        installable: true,
        source: 'npm',
        title: { zh: '四象模型 · 分析智能体', en: 'Four-Images Analysis Agent' },
        description: {
          zh: '六维四阶段的管理问题分析，装上即用；分析过程发生在会话里。',
          en: 'Six-dimension analysis, ready once installed; analysis happens in a session.',
        },
      },
      {
        name: SKILLS_PKG,
        kind: 'skills',
        order: 20,
        entryIds: ['four-images-skills'],
        installable: false,
        source: 'npm',
        title: { zh: '四象执行技能', en: 'Four-Images Execution Skills' },
        description: {
          zh: '可配置的执行能力，装上默认休眠；选定生效工作区后才参与工作。',
          en: 'Configurable execution skills, dormant until a workspace is selected.',
        },
      },
    ];

    /* ------------------------------------------------------------------ */
    /* 短文案（长正文为 v0.2 中文速览；关键标签提供 en）                     */
    /* ------------------------------------------------------------------ */
    const DICT = {
      zh: {
        panel: '四象工作台',
        tagline: '四象模型 · DSH 插件族 · 统一入口',
        tabOverview: '概览',
        tabPlugins: '插件',
        tabGuide: '使用说明',
        tabAbout: '关于',
        refresh: '刷新',
        loading: '正在读取插件状态…',
        loadError: '读取插件状态失败：',
        openPlugins: 'DSH 插件页',
        install: '安装',
        installing: '安装中…',
        uninstall: '卸载',
        enable: '启用',
        disable: '停用',
        details: '查看说明',
        checkUpdates: '检查更新',
        update: '更新',
        updating: '更新中…',
        latest: '已是最新版本',
        updateAvailable: '发现新版本',
        openSession: '开始四象分析',
        agentTitle: '分析智能体',
        skillsTitle: '执行技能',
        extensionTitle: '扩展插件',
        recommended: '推荐下一步',
        recInstall: '先安装分析智能体，之后就能在这里直接开始六维分析。',
        recStart: '分析智能体已就绪，直接开始一次六维分析。',
        recPreset: '已安装，但四象预设还没就绪：新建一个会话（或重启 DSH）后再试。',
        checks: '系统检查',
        checkBundles: '已识别 DSH bundle',
        checkPlugins: '运行中的插件行',
        checkPreset: '四象预设',
        checkAgentRows: '分析智能体的插件行',
        available: '可用',
        notReady: '未就绪',
        active: '已激活',
        inactive: '未激活',
        notInstalled: '未安装',
        installedDisabled: '已安装 · 未启用',
        enabled: '已启用',
        planned: '待发布',
        reserved: '预留',
        skillsNote: '执行技能插件尚未发布；发布后这里会显示“休眠 / 已启用”与工作区配置入口。',
        extensionNote: '未来任何四象插件按约定接入后，会自动出现在这里。',
        installHint: '安装前会先预检包名、版本与来源，确认后才开始；安装结果会区分“已生效 / 需要重启 / 失败”。',
        localTitle: '本地安装（离线 / 内网）',
        localHint: '填写绝对的目录路径或 .tgz 文件路径，先预检再安装。',
        localPlaceholder: '例如 D:\\downloads\\dsh-preset-four-images-model-1.4.10.tgz',
        localInstall: '预检并安装',
        discoveredTitle: '已安装但未登记的四象插件',
        discoveredHint: '按包名前缀 dsh-four-images-* 自动发现；可在这里查看与卸载。',
        source: '来源',
        version: '版本',
        package: '包名',
        configHint: '工作区配置请在插件的原生配置页完成（跨插件写配置风险较高，v0.2 采用官方兜底）。',
        openPluginConfig: '打开插件配置',
        detailEmpty: '该插件没有可读取的说明文档。',
        close: '关闭',
        operation: '最近一次操作',
        noOperation: '暂无操作记录',
        logPath: '安装日志',
        copyDiagnostics: '复制诊断信息',
        copied: '诊断信息已复制',
        copyFailed: '复制失败：',
        aboutNote: 'v0.2.0：目录化插件、详情、更新、本地安装、诊断。执行技能的配置面板与档案库在后续版本。',
        sourceNote: '状态直接读取 DSH 运行时，不做本地缓存；装了但未启用、需重启等情况会如实显示。',
        confirmInstall: '确认安装？',
        confirmRemove: '确认卸载？历史会话与报告不会被删除。',
        cancelled: '操作已取消',
        done: '已完成',
        applied: '已安装并生效',
        restartRequired: '已完成变更，需要重启 DSH 后生效',
        overridden: '已完成，但被更高优先级的配置覆盖',
        failed: '操作失败',
        guideTitle: '四象模型速览',
        aboutTitle: '关于与诊断',
        versionLabel: '工作台版本',
        engineLabel: '要求 DSH',
        diagnosticLabel: '诊断信息',
        retry: '重试',
        emptyLocal: '请先填写本地路径',
        updateStep: '更新',
        newVersion: '新版本',
        targetVersion: '目标版本',
      },
      en: {
        panel: 'Four-Images Workbench',
        tagline: 'Four-Images model · DSH plugin family · one entrance',
        tabOverview: 'Overview',
        tabPlugins: 'Plugins',
        tabGuide: 'Guide',
        tabAbout: 'About',
        refresh: 'Refresh',
        loading: 'Reading plugin state…',
        loadError: 'Failed to read plugin state: ',
        openPlugins: 'DSH Plugins',
        install: 'Install',
        installing: 'Installing…',
        uninstall: 'Uninstall',
        enable: 'Enable',
        disable: 'Disable',
        details: 'Details',
        checkUpdates: 'Check updates',
        update: 'Update',
        updating: 'Updating…',
        latest: 'Up to date',
        updateAvailable: 'New version',
        openSession: 'Start analysis',
        agentTitle: 'Analysis agent',
        skillsTitle: 'Execution skills',
        extensionTitle: 'Extensions',
        recommended: 'Recommended next step',
        recInstall: 'Install the analysis agent first; then you can start a six-dimension analysis here.',
        recStart: 'The analysis agent is ready. Start a six-dimension analysis.',
        recPreset: 'Installed, but the preset is not ready yet: open a new session (or restart DSH).',
        checks: 'System checks',
        checkBundles: 'Detected DSH bundles',
        checkPlugins: 'Running plugin rows',
        checkPreset: 'Four-Images preset',
        checkAgentRows: 'Analysis agent rows',
        available: 'Available',
        notReady: 'Not ready',
        active: 'Active',
        inactive: 'Inactive',
        notInstalled: 'Not installed',
        installedDisabled: 'Installed · disabled',
        enabled: 'Enabled',
        planned: 'Planned',
        reserved: 'Reserved',
        skillsNote: 'The execution-skills plugin is not published yet; workspace configuration will appear here when it is.',
        extensionNote: 'Future Four-Images plugins will appear here after they follow the integration contract.',
        installHint: 'The package, version, and source are checked before installation; results distinguish applied / restart-required / failed.',
        localTitle: 'Local install (offline / intranet)',
        localHint: 'Enter an absolute directory or .tgz path; it is inspected before installation.',
        localPlaceholder: 'e.g. D:\\downloads\\dsh-preset-four-images-model-1.4.10.tgz',
        localInstall: 'Inspect & install',
        discoveredTitle: 'Installed but unregistered Four-Images plugins',
        discoveredHint: 'Discovered by the dsh-four-images-* package prefix; inspect or remove them here.',
        source: 'Source',
        version: 'Version',
        package: 'Package',
        configHint: 'Configure the workspace on the plugin’s own configuration page (cross-plugin config writes are risky; v0.2 uses the official fallback).',
        openPluginConfig: 'Open plugin config',
        detailEmpty: 'No readable document for this plugin.',
        close: 'Close',
        operation: 'Last operation',
        noOperation: 'No operation yet',
        logPath: 'Install log',
        copyDiagnostics: 'Copy diagnostics',
        copied: 'Diagnostics copied',
        copyFailed: 'Copy failed: ',
        aboutNote: 'v0.2.0: catalog, details, updates, local install, diagnostics. Skills configuration and archive come later.',
        sourceNote: 'State is read live from the DSH runtime; no local cache.',
        confirmInstall: 'Install now?',
        confirmRemove: 'Remove this plugin? Sessions and reports are kept.',
        cancelled: 'Cancelled',
        done: 'Done',
        applied: 'Installed and applied',
        restartRequired: 'Changed; restart DSH to take effect',
        overridden: 'Changed, but overridden by a higher-priority configuration',
        failed: 'Failed',
        guideTitle: 'Four-Images at a glance',
        aboutTitle: 'About & diagnostics',
        versionLabel: 'Workbench version',
        engineLabel: 'Requires DSH',
        diagnosticLabel: 'Diagnostics',
        retry: 'Retry',
        emptyLocal: 'Enter a local path first',
        updateStep: 'Update',
        newVersion: 'New version',
        targetVersion: 'Target version',
      },
    };

    /* ------------------------------------------------------------------ */
    /* 样式（只使用宿主主题 token，带中性 fallback）                         */
    /* ------------------------------------------------------------------ */
    const CSS = `
.fi-root { height: 100%; overflow-y: auto; box-sizing: border-box; color: var(--dsw-alias-label-primary, #1f2328); background: var(--dsw-alias-bg-base, transparent); }
.fi-inner { max-width: 980px; margin: 0 auto; padding: 24px 28px 56px; padding-top: calc(24px + var(--dsh-frame-top-clearance, 0px)); }
.fi-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
.fi-title { font-size: 20px; font-weight: 600; margin: 0 0 4px; letter-spacing: .2px; }
.fi-sub { margin: 0; font-size: 13px; color: var(--dsw-alias-label-tertiary, #6b7280); }
.fi-tabs { display: flex; gap: 4px; padding: 4px; border-radius: 10px; background: var(--dsw-alias-bg-l2, rgba(127,127,127,.08)); margin-bottom: 20px; width: max-content; max-width: 100%; overflow-x: auto; }
.fi-tab { appearance: none; border: 0; background: transparent; color: var(--dsw-alias-label-secondary, #4b5563); font-size: 13px; padding: 6px 14px; border-radius: 8px; cursor: pointer; white-space: nowrap; }
.fi-tab:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.12)); }
.fi-tab-active { background: var(--dsw-alias-bg-base, #fff); color: var(--dsw-alias-label-primary, #111); font-weight: 500; box-shadow: 0 1px 2px rgba(0,0,0,.08); }
.fi-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
@media (max-width: 820px) { .fi-grid { grid-template-columns: 1fr; } }
.fi-card { border: .5px solid var(--dsw-alias-border-l3, rgba(0,0,0,.12)); border-radius: var(--dsw-radius-md, 12px); padding: 16px; background: var(--dsw-alias-bg-base, transparent); box-sizing: border-box; }
.fi-card-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.fi-card-title { font-size: 14px; font-weight: 600; margin: 0; flex: 1; }
.fi-glyph { display: inline-flex; width: 22px; height: 22px; color: var(--dsw-alias-state-business-primary, #2563eb); }
.fi-badge { font-size: 11px; line-height: 18px; padding: 0 8px; border-radius: 999px; white-space: nowrap; border: .5px solid transparent; }
.fi-badge-ok { color: var(--dsw-alias-state-done-primary, #15803d); background: rgba(34,197,94,.12); }
.fi-badge-warn { color: #b45309; background: rgba(245,158,11,.14); }
.fi-badge-muted { color: var(--dsw-alias-label-tertiary, #6b7280); background: rgba(127,127,127,.1); }
.fi-desc { font-size: 13px; line-height: 1.6; color: var(--dsw-alias-label-secondary, #4b5563); margin: 0 0 12px; }
.fi-meta { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--dsw-alias-label-tertiary, #6b7280); margin-bottom: 14px; }
.fi-meta code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; color: var(--dsw-alias-label-secondary, #4b5563); }
.fi-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.fi-btn { appearance: none; border: .5px solid var(--dsw-alias-border-l3, rgba(0,0,0,.15)); background: transparent; color: var(--dsw-alias-label-primary, #111); font-size: 13px; padding: 6px 12px; border-radius: 8px; cursor: pointer; }
.fi-btn:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.1)); }
.fi-btn:disabled { opacity: .5; cursor: not-allowed; }
.fi-btn-primary { background: var(--dsw-alias-state-business-primary, #2563eb); border-color: transparent; color: #fff; }
.fi-btn-primary:hover:not(:disabled) { filter: brightness(1.06); }
.fi-btn-danger { color: #b91c1c; }
.fi-notice { font-size: 13px; line-height: 1.55; padding: 10px 12px; border-radius: 10px; margin-bottom: 16px; border: .5px solid; }
.fi-notice-ok { color: var(--dsw-alias-state-done-primary, #15803d); border-color: rgba(34,197,94,.35); background: rgba(34,197,94,.08); }
.fi-notice-error { color: #b91c1c; border-color: rgba(239,68,68,.35); background: rgba(239,68,68,.08); }
.fi-notice-info { color: var(--dsw-alias-label-secondary, #4b5563); border-color: var(--dsw-alias-border-l3, rgba(0,0,0,.12)); background: rgba(127,127,127,.06); }
.fi-checks { margin-top: 14px; }
.fi-section-title { font-size: 14px; font-weight: 600; margin: 0 0 6px; }
.fi-check-row { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: .5px solid var(--dsw-alias-border-l3, rgba(0,0,0,.08)); font-size: 13px; }
.fi-check-row:last-child { border-bottom: 0; }
.fi-check-label { color: var(--dsw-alias-label-secondary, #4b5563); }
.fi-check-value { color: var(--dsw-alias-label-primary, #111); text-align: right; }
.fi-loading { display: flex; align-items: center; gap: 8px; color: var(--dsw-alias-label-tertiary, #6b7280); font-size: 13px; padding: 16px 0; }
.fi-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--dsw-alias-state-business-primary, #2563eb); animation: fi-pulse 1s infinite ease-in-out; }
@keyframes fi-pulse { 0%,100% { opacity: .3 } 50% { opacity: 1 } }
.fi-guide h2 { font-size: 15px; font-weight: 600; margin: 22px 0 8px; }
.fi-guide h2:first-child { margin-top: 0; }
.fi-guide p, .fi-guide li { font-size: 13.5px; line-height: 1.75; color: var(--dsw-alias-label-secondary, #4b5563); }
.fi-guide ul, .fi-guide ol { margin: 6px 0; padding-left: 20px; }
.fi-guide code, .fi-md code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; background: rgba(127,127,127,.1); padding: 1px 5px; border-radius: 4px; }
.fi-table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 8px 0 4px; }
.fi-table th, .fi-table td { text-align: left; padding: 8px 10px; border-bottom: .5px solid var(--dsw-alias-border-l3, rgba(0,0,0,.1)); vertical-align: top; }
.fi-table th { color: var(--dsw-alias-label-tertiary, #6b7280); font-weight: 500; }
.fi-table td { color: var(--dsw-alias-label-secondary, #4b5563); }
.fi-guide-block { border: .5px solid var(--dsw-alias-border-l3, rgba(0,0,0,.12)); border-radius: var(--dsw-radius-md, 12px); padding: 18px 20px; }
.fi-mt { margin-top: 16px; }
.fi-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; }
.fi-field { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
.fi-input { flex: 1 1 320px; min-width: 220px; box-sizing: border-box; font-size: 13px; padding: 7px 10px; border-radius: 8px; border: .5px solid var(--dsw-alias-border-l3, rgba(0,0,0,.18)); background: var(--dsw-alias-bg-base, transparent); color: var(--dsw-alias-label-primary, #111); }
.fi-input:focus { outline: 2px solid var(--dsw-focus-ring-color, rgba(37,99,235,.5)); outline-offset: 0; }
.fi-modal-mask { position: fixed; inset: 0; z-index: 60; background: rgba(15,23,42,.42); display: flex; align-items: center; justify-content: center; padding: 24px; }
.fi-modal { width: min(760px, 100%); max-height: min(78vh, 720px); display: flex; flex-direction: column; background: var(--dsw-alias-bg-base, #fff); color: var(--dsw-alias-label-primary, #111); border-radius: var(--dsw-radius-md, 14px); border: .5px solid var(--dsw-alias-border-l3, rgba(0,0,0,.15)); box-shadow: 0 18px 48px rgba(0,0,0,.24); overflow: hidden; }
.fi-modal-head { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: .5px solid var(--dsw-alias-border-l3, rgba(0,0,0,.1)); }
.fi-modal-title { flex: 1; font-size: 14px; font-weight: 600; margin: 0; }
.fi-modal-body { padding: 16px 20px 22px; overflow-y: auto; }
.fi-md h1, .fi-md h2, .fi-md h3, .fi-md h4 { font-size: 15px; font-weight: 600; margin: 18px 0 8px; }
.fi-md h1 { font-size: 18px; }
.fi-md h1:first-child, .fi-md h2:first-child, .fi-md h3:first-child { margin-top: 0; }
.fi-md p, .fi-md li { font-size: 13.5px; line-height: 1.75; color: var(--dsw-alias-label-secondary, #4b5563); margin: 6px 0; }
.fi-md ul, .fi-md ol { margin: 6px 0; padding-left: 22px; }
.fi-md pre { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; line-height: 1.6; background: rgba(127,127,127,.1); border-radius: 8px; padding: 12px 14px; overflow-x: auto; margin: 8px 0; }
.fi-md pre code { background: transparent; padding: 0; }
.fi-md blockquote { margin: 8px 0; padding: 4px 12px; border-left: 3px solid var(--dsw-alias-border-l3, rgba(0,0,0,.18)); color: var(--dsw-alias-label-tertiary, #6b7280); }
.fi-md hr { border: 0; border-top: .5px solid var(--dsw-alias-border-l3, rgba(0,0,0,.12)); margin: 14px 0; }
.fi-warn-text { color: #b45309; }
.fi-ok-text { color: var(--dsw-alias-state-done-primary, #15803d); }
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

    function asPresets(value) {
      if (Array.isArray(value)) return value;
      if (value && Array.isArray(value.presets)) return value.presets;
      if (value && Array.isArray(value.items)) return value.items;
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
      if (!result || typeof result !== 'object') return t('done', '已完成');
      const app = result.application;
      if (app === 'applied') return t('applied', '已安装并生效');
      if (app === 'restart-required') return t('restartRequired', '已完成变更，需要重启 DSH 后生效');
      if (app === 'overridden') return t('overridden', '已完成，但被更高优先级的配置覆盖');
      if (app === 'cancelled') return t('cancelled', '操作已取消');
      if (app === 'failed') {
        const code = result.error && (result.error.code || result.error.diagnostic);
        return t('failed', '操作失败') + (code ? '：' + code : '');
      }
      return t('done', '已完成');
    }

    function pickLocalized(value) {
      if (typeof value === 'string') return value;
      if (!value || typeof value !== 'object') return '';
      return value.zh || value['zh-CN'] || value.en || '';
    }

    function clip(text, max) {
      const value = String(text || '');
      return value.length > max ? value.slice(0, max) + '…' : value;
    }

    /* ------------------------------------------------------------------ */
    /* Markdown：安全子集渲染（无 HTML 注入）                                */
    /* ------------------------------------------------------------------ */
    function renderInline(text, keyPrefix) {
      const out = [];
      const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
      let last = 0;
      let match;
      let index = 0;
      while ((match = pattern.exec(text)) !== null) {
        if (match.index > last) out.push(text.slice(last, match.index));
        const token = match[0];
        if (token.startsWith('**')) out.push(h('strong', { key: keyPrefix + 'b' + index }, token.slice(2, -2)));
        else out.push(h('code', { key: keyPrefix + 'c' + index }, token.slice(1, -1)));
        last = match.index + token.length;
        index += 1;
      }
      if (last < text.length) out.push(text.slice(last));
      return out;
    }

    function parseTable(lines, start) {
      const header = lines[start];
      const separator = lines[start + 1];
      if (!separator || !/^\s*\|?\s*:?-{2,}/.test(separator)) return null;
      const split = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
      const head = split(header);
      const rows = [];
      let i = start + 2;
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        rows.push(split(lines[i]));
        i += 1;
      }
      return { head, rows, next: i };
    }

    function renderMarkdown(markdown) {
      const lines = String(markdown || '').split(/\r?\n/);
      const blocks = [];
      let i = 0;
      let key = 0;
      while (i < lines.length) {
        const line = lines[i];
        if (/^\s*$/.test(line)) { i += 1; continue; }
        if (/^```/.test(line)) {
          const code = [];
          i += 1;
          while (i < lines.length && !/^```/.test(lines[i])) { code.push(lines[i]); i += 1; }
          i += 1;
          blocks.push(h('pre', { key: 'pre' + key }, h('code', null, code.join('\n'))));
          key += 1;
          continue;
        }
        const heading = /^(#{1,6})\s+(.*)$/.exec(line);
        if (heading) {
          const level = Math.min(heading[1].length, 4);
          blocks.push(h('h' + level, { key: 'h' + key }, renderInline(heading[2], 'h' + key + '-')));
          key += 1;
          i += 1;
          continue;
        }
        if (/^\s*\|/.test(line)) {
          const table = parseTable(lines, i);
          if (table) {
            blocks.push(h('table', { key: 't' + key, className: 'fi-table' },
              h('thead', null, h('tr', null, table.head.map((cell, ci) => h('th', { key: 'th' + ci }, renderInline(cell, 'th' + key + ci))))),
              h('tbody', null, table.rows.map((row, ri) => h('tr', { key: 'tr' + ri }, row.map((cell, ci) => h('td', { key: 'td' + ci }, renderInline(cell, 'td' + key + ri + ci))))))
            ));
            key += 1;
            i = table.next;
            continue;
          }
        }
        if (/^\s{0,3}[-*+]\s+/.test(line)) {
          const items = [];
          while (i < lines.length && /^\s{0,3}[-*+]\s+/.test(lines[i])) {
            items.push(lines[i].replace(/^\s{0,3}[-*+]\s+/, ''));
            i += 1;
          }
          blocks.push(h('ul', { key: 'ul' + key }, items.map((item, ii) => h('li', { key: 'li' + ii }, renderInline(item, 'ul' + key + ii)))));
          key += 1;
          continue;
        }
        if (/^\s{0,3}\d+[.)]\s+/.test(line)) {
          const items = [];
          while (i < lines.length && /^\s{0,3}\d+[.)]\s+/.test(lines[i])) {
            items.push(lines[i].replace(/^\s{0,3}\d+[.)]\s+/, ''));
            i += 1;
          }
          blocks.push(h('ol', { key: 'ol' + key }, items.map((item, ii) => h('li', { key: 'li' + ii }, renderInline(item, 'ul' + key + ii)))));
          key += 1;
          continue;
        }
        if (/^\s*>\s?/.test(line)) {
          const quote = [];
          while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
            quote.push(lines[i].replace(/^\s*>\s?/, ''));
            i += 1;
          }
          blocks.push(h('blockquote', { key: 'q' + key }, renderInline(quote.join(' '), 'q' + key)));
          key += 1;
          continue;
        }
        if (/^\s*(---+|___+|\*\*\*+)\s*$/.test(line)) {
          blocks.push(h('hr', { key: 'hr' + key }));
          key += 1;
          i += 1;
          continue;
        }
        const paragraph = [line];
        i += 1;
        while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,6}\s|```|\s*\||\s{0,3}[-*+]\s|\s{0,3}\d+[.)]\s|\s*>)/.test(lines[i])) {
          paragraph.push(lines[i]);
          i += 1;
        }
        blocks.push(h('p', { key: 'p' + key }, renderInline(paragraph.join(' '), 'p' + key)));
        key += 1;
      }
      return blocks;
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

    function SkillsMark(props) {
      const size = props.size || 28;
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true, style: { display: 'block' } },
        h('rect', { x: 3, y: 5, width: 18, height: 3, rx: 1.5, fill: 'currentColor', opacity: 0.9 }),
        h('rect', { x: 3, y: 10.5, width: 13, height: 3, rx: 1.5, fill: 'currentColor', opacity: 0.65 }),
        h('rect', { x: 3, y: 16, width: 8, height: 3, rx: 1.5, fill: 'currentColor', opacity: 0.45 })
      );
    }

    function ExtensionMark(props) {
      const size = props.size || 28;
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true, style: { display: 'block' } },
        h('rect', { x: 3.5, y: 3.5, width: 17, height: 17, rx: 4, fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, opacity: 0.55, strokeDasharray: '3 2.6' }),
        h('path', { d: 'M12 8v8M8 12h8', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', opacity: 0.85 })
      );
    }

    function KindGlyph(props) {
      if (props.kind === 'skills') return h(SkillsMark, { size: props.size || 22 });
      if (props.kind === 'extension') return h(ExtensionMark, { size: props.size || 22 });
      return h(QuadrantMark, { size: props.size || 22 });
    }

    function SidebarIcon(props) {
      const size = props && props.size ? props.size : 16;
      return h('span', { style: { display: 'inline-flex', color: 'currentColor' } }, h(QuadrantMark, { size: size }));
    }

    /* ------------------------------------------------------------------ */
    /* 面板组件                                                            */
    /* ------------------------------------------------------------------ */
    function WorkbenchPanel(props) {
      const t = (key, fallback) => {
        try {
          const value = props.t ? props.t(key) : null;
          return value && value !== key ? value : (fallback || key);
        } catch (ignored) {
          return fallback || key;
        }
      };

      const [tab, setTab] = React.useState('overview');
      const [data, setData] = React.useState(null);
      const [loading, setLoading] = React.useState(true);
      const [error, setError] = React.useState(null);
      const [busy, setBusy] = React.useState('');
      const [notice, setNotice] = React.useState(null);
      const [detail, setDetail] = React.useState(null);
      const [updates, setUpdates] = React.useState({});
      const [localSpec, setLocalSpec] = React.useState('');
      const [lastOperation, setLastOperation] = React.useState(null);

      const load = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
          const next = await props.loadStatus();
          setData(next);
        } catch (cause) {
          setError(errorText(cause));
        } finally {
          setLoading(false);
        }
      }, []);

      React.useEffect(() => { load(); }, [load]);

      React.useEffect(() => {
        if (!detail) return undefined;
        const onKey = (event) => { if (event.key === 'Escape') setDetail(null); };
        window.addEventListener('keydown', onKey);
        return () => { window.removeEventListener('keydown', onKey); };
      }, [detail]);

      let canManage = true;
      try {
        if (typeof props.useRemoteAccess === 'function') canManage = props.useRemoteAccess('pluginManager/installBundle');
      } catch (ignored) { canManage = true; }

      const run = async (label, action) => {
        setBusy(label);
        setNotice(null);
        try {
          const message = await action();
          if (message) setNotice({ kind: 'ok', text: message });
          await load();
        } catch (cause) {
          setNotice({ kind: 'error', text: errorText(cause) });
        } finally {
          setBusy('');
        }
      };

      const remember = (label, result) => {
        setLastOperation({ label, at: Date.now(), result: result || null });
      };

      const items = data ? data.items : [];
      const discovered = data ? data.discovered : [];
      const presetAvailable = !!(data && data.presetAvailable);
      const requireConfirm = (text) => {
        if (typeof window === 'undefined' || typeof window.confirm !== 'function') return true;
        return window.confirm(text);
      };

      const describe = (item) => {
        const bundle = item.bundle;
        if (!bundle) return h('span', { className: 'fi-badge fi-badge-muted' }, item.planned ? t('planned', '待发布') : t('notInstalled', '未安装'));
        if (!bundle.enabled) return h('span', { className: 'fi-badge fi-badge-warn' }, t('installedDisabled', '已安装 · 未启用'));
        return h('span', { className: 'fi-badge fi-badge-ok' }, t('enabled', '已启用'));
      };

      const doInstall = async (spec) => {
        await run('install', async () => {
          const inspected = await props.inspectSpec(spec);
          if (!inspected || inspected.status === 'refused') {
            throw new Error((inspected && inspected.reason) || '安装预检未通过');
          }
          const name = inspected.name || spec;
          const version = inspected.version ? ' v' + inspected.version : '';
          const source = inspected.registry || inspected.kind || inspected.host || t('source', '来源');
          if (!requireConfirm(t('confirmInstall', '确认安装') + '\n\n' + name + version + '\n' + source)) {
            return null;
          }
          const result = await props.install(spec);
          remember(t('install', '安装') + ' ' + name, result);
          return changeText(result, t);
        });
      };

      const doRemove = async (item) => {
        if (!requireConfirm(t('confirmRemove', '确认卸载？') + '\n\n' + item.name)) return;
        await run('remove:' + item.name, async () => {
          const result = await props.remove(item.name);
          remember(t('uninstall', '卸载') + ' ' + item.name, result);
          return changeText(result, t);
        });
      };

      const doToggle = async (item) => {
        const enabled = !(item.bundle && item.bundle.enabled);
        await run('toggle:' + item.name, async () => {
          const result = await props.setEnabled(item.name, enabled);
          remember((enabled ? t('enable', '启用') : t('disable', '停用')) + ' ' + item.name, result);
          return changeText(result, t);
        });
      };

      const doCheckUpdates = async (item) => {
        await run('check:' + item.name, async () => {
          const result = await props.checkUpdates(item.name);
          if (!result || result.status === 'refused') {
            throw new Error((result && result.reason) || '无法检查更新');
          }
          const versions = (result.versions || []).map((entry) => entry.version).filter(Boolean);
          setUpdates((prev) => ({ ...prev, [item.name]: versions }));
          if (versions.length === 0) return t('latest', '已是最新版本');
          return t('updateAvailable', '发现新版本') + '：' + versions.slice(0, 3).join(', ');
        });
      };

      const doUpdate = async (item, version) => {
        if (!requireConfirm(t('update', '更新') + ' ' + item.name + ' → v' + version + ' ?')) return;
        await run('update:' + item.name, async () => {
          const result = await props.update(item.name, version);
          remember(t('updateStep', '更新') + ' ' + item.name + ' → v' + version, result && result.result ? result.result : result);
          return changeText(result && result.result ? result.result : result, t);
        });
      };

      const doShowDetail = async (item) => {
        setDetail({ title: item.title, loading: true, markdown: '' });
        try {
          const result = await props.readDetail(item.name);
          if (result && result.status === 'found') {
            setDetail({ title: item.title, loading: false, markdown: result.markdown || '' });
          } else {
            setDetail({ title: item.title, loading: false, markdown: '', empty: true });
          }
        } catch (cause) {
          setDetail({ title: item.title, loading: false, markdown: '', error: errorText(cause) });
        }
      };

      const doStartAnalysis = () => {
        try {
          props.openSession();
        } catch (cause) {
          setNotice({ kind: 'error', text: errorText(cause) });
        }
      };

      const copyDiagnostics = async () => {
        const payload = {
          workbench: VERSION,
          presetAvailable,
          items: items.map((item) => ({
            name: item.name,
            installed: !!item.bundle,
            version: item.bundle ? item.bundle.version : null,
            enabled: item.bundle ? item.bundle.enabled : null,
            rows: item.rows.map((row) => ({ patchId: row.patchId, moduleName: row.moduleName, entryId: row.entryId, fiberPhase: row.fiberPhase, enabled: row.enabled })),
          })),
          discovered: discovered.map((bundle) => bundle.name),
          lastOperation,
        };
        try {
          await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
          setNotice({ kind: 'ok', text: t('copied', '诊断信息已复制') });
        } catch (cause) {
          setNotice({ kind: 'error', text: t('copyFailed', '复制失败：') + errorText(cause) });
        }
      };

      const itemMeta = (item) => {
        const bundle = item.bundle;
        return h('div', { className: 'fi-meta' },
          h('span', null, t('package', '包名'), ' ', h('code', null, item.name)),
          h('span', null, bundle && bundle.version ? 'v' + bundle.version : (item.planned ? t('planned', '待发布') : t('notInstalled', '未安装')))
        );
      };

      const itemActions = (item, compact) => {
        const bundle = item.bundle;
        const name = item.name;
        const isBusy = !!busy;
        const canInstall = canManage && !isBusy;
        const updateVersions = updates[name] || [];
        return h('div', { className: 'fi-actions' },
          !bundle && item.installable
            ? h('button', { className: 'fi-btn fi-btn-primary', disabled: !canInstall, onClick: () => doInstall(item.spec || name) },
              busy === 'install' ? t('installing', '安装中…') : t('install', '安装'))
            : null,
          bundle && item.kind === 'agent' && presetAvailable
            ? h('button', { className: 'fi-btn fi-btn-primary', disabled: isBusy, onClick: doStartAnalysis }, t('openSession', '开始四象分析'))
            : null,
          bundle ? h('button', { className: 'fi-btn', onClick: () => doShowDetail(item) }, t('details', '查看说明')) : null,
          bundle ? h('button', { className: 'fi-btn', disabled: !canInstall, onClick: () => doToggle(item) },
            bundle.enabled ? t('disable', '停用') : t('enable', '启用')) : null,
          bundle ? h('button', { className: 'fi-btn', disabled: !canInstall, onClick: () => doCheckUpdates(item) },
            busy === 'check:' + name ? t('checkUpdates', '检查更新') + '…' : t('checkUpdates', '检查更新')) : null,
          updateVersions.length > 0
            ? h('button', { className: 'fi-btn fi-btn-primary', disabled: isBusy, onClick: () => doUpdate(item, updateVersions[0]) }, t('update', '更新') + ' → v' + updateVersions[0])
            : null,
          bundle && item.kind !== 'agent' && !compact
            ? h('button', { className: 'fi-btn', onClick: () => { try { props.openPluginsPage(); } catch (ignored) {} } }, t('openPluginConfig', '打开插件配置'))
            : null,
          bundle
            ? h('button', { className: 'fi-btn fi-btn-danger', disabled: !canInstall, onClick: () => doRemove(item) }, t('uninstall', '卸载'))
            : null
        );
      };

      const itemCard = (item, compact) => h('section', { className: 'fi-card' },
        h('div', { className: 'fi-card-head' },
          h('span', { className: 'fi-glyph' }, h(KindGlyph, { kind: item.kind, size: 22 })),
          h('h3', { className: 'fi-card-title' }, item.title),
          describe(item)
        ),
        h('p', { className: 'fi-desc' }, item.description),
        itemMeta(item),
        itemActions(item, compact),
        !item.bundle && item.kind === 'skills'
          ? h('p', { className: 'fi-meta', style: { marginTop: '12px', marginBottom: 0 } }, t('skillsNote', '执行技能插件尚未发布；发布后这里会显示状态与工作区配置入口。'))
          : null,
        item.bundle && item.kind === 'skills'
          ? h('p', { className: 'fi-meta', style: { marginTop: '12px', marginBottom: 0 } }, t('configHint', '工作区配置请在插件的原生配置页完成。'))
          : null
      );

      const recommendation = () => {
        const agent = items.find((item) => item.kind === 'agent');
        if (!agent) return null;
        if (!agent.bundle) return h('div', { className: 'fi-notice fi-notice-info' },
          h('strong', null, t('recommended', '推荐下一步') + '：'), ' ', t('recInstall', '先安装分析智能体，之后就能在这里直接开始六维分析。'),
          h('div', { style: { marginTop: '8px' } },
            h('button', { className: 'fi-btn fi-btn-primary', disabled: !!busy || !canManage, onClick: () => doInstall(agent.spec || agent.name) }, t('install', '安装')))
        );
        if (!presetAvailable) return h('div', { className: 'fi-notice fi-notice-info' },
          h('strong', null, t('recommended', '推荐下一步') + '：'), ' ', t('recPreset', '已安装，但四象预设还没就绪：新建一个会话（或重启 DSH）后再试。'));
        return h('div', { className: 'fi-notice fi-notice-info' },
          h('strong', null, t('recommended', '推荐下一步') + '：'), ' ', t('recStart', '分析智能体已就绪，直接开始一次六维分析。'),
          h('div', { style: { marginTop: '8px' } },
            h('button', { className: 'fi-btn fi-btn-primary', disabled: !!busy, onClick: doStartAnalysis }, t('openSession', '开始四象分析'))));
      };

      const checks = () => {
        const bundles = data ? data.bundles : [];
        const plugins = data ? data.plugins : [];
        const agent = items.find((item) => item.kind === 'agent');
        const rows = agent ? agent.rows : [];
        const activeRows = rows.filter((row) => row && (row.fiberPhase === 'active' || row.enabled === true));
        return h('section', { className: 'fi-card fi-checks' },
          h('h3', { className: 'fi-section-title' }, t('checks', '系统检查')),
          h('div', { className: 'fi-check-row' },
            h('span', { className: 'fi-check-label' }, t('checkBundles', '已识别 DSH bundle')),
            h('span', { className: 'fi-check-value' }, String(bundles.length))),
          h('div', { className: 'fi-check-row' },
            h('span', { className: 'fi-check-label' }, t('checkPlugins', '运行中的插件行')),
            h('span', { className: 'fi-check-value' }, String(plugins.length))),
          h('div', { className: 'fi-check-row' },
            h('span', { className: 'fi-check-label' }, t('checkAgentRows', '分析智能体的插件行')),
            h('span', { className: 'fi-check-value' }, rows.length === 0 ? t('notInstalled', '未安装') : activeRows.length + ' / ' + rows.length + ' ' + t('active', '已激活'))),
          h('div', { className: 'fi-check-row' },
            h('span', { className: 'fi-check-label' }, t('checkPreset', '四象预设')),
            h('span', { className: 'fi-check-value' }, presetAvailable ? t('available', '可用') : t('notReady', '未就绪')))
        );
      };

      const renderOverview = () => h('div', null,
        recommendation(),
        h('div', { className: 'fi-grid' },
          items.map((item) => itemCard(item, true)),
          h('section', { className: 'fi-card' },
            h('div', { className: 'fi-card-head' },
              h('span', { className: 'fi-glyph' }, h(ExtensionMark, { size: 22 })),
              h('h3', { className: 'fi-card-title' }, t('extensionTitle', '扩展插件')),
              h('span', { className: 'fi-badge fi-badge-muted' }, t('reserved', '预留'))),
            h('p', { className: 'fi-desc' }, t('extensionNote', '未来任何四象插件按约定接入后，会自动出现在这里。'))
          )
        ),
        checks(),
        h('div', { className: 'fi-notice fi-notice-info', style: { marginTop: '16px', marginBottom: 0 } }, t('sourceNote', '状态直接读取 DSH 运行时，不做本地缓存。'))
      );

      const localInstall = () => h('section', { className: 'fi-card fi-mt' },
        h('h3', { className: 'fi-section-title' }, t('localTitle', '本地安装（离线 / 内网）')),
        h('p', { className: 'fi-desc' }, t('localHint', '填写绝对的目录路径或 .tgz 文件路径，先预检再安装。')),
        h('div', { className: 'fi-field' },
          h('input', {
            className: 'fi-input',
            value: localSpec,
            placeholder: t('localPlaceholder', '例如 D:\\downloads\\package.tgz'),
            onChange: (event) => setLocalSpec(event.target.value),
          }),
          h('button', {
            className: 'fi-btn fi-btn-primary',
            disabled: !!busy || !canManage,
            onClick: () => {
              const spec = String(localSpec || '').trim();
              if (!spec) { setNotice({ kind: 'error', text: t('emptyLocal', '请先填写本地路径') }); return; }
              doInstall(spec);
            },
          }, t('localInstall', '预检并安装'))
        )
      );

      const renderPlugins = () => h('div', null,
        h('div', { className: 'fi-grid' }, items.map((item) => itemCard(item, false))),
        discovered.length > 0
          ? h('section', { className: 'fi-card fi-mt' },
            h('h3', { className: 'fi-section-title' }, t('discoveredTitle', '已安装但未登记的四象插件')),
            h('p', { className: 'fi-desc' }, t('discoveredHint', '按包名前缀自动发现；可在这里查看与卸载。')),
            discovered.map((bundle) => h('div', { className: 'fi-check-row', key: bundle.name },
              h('span', { className: 'fi-check-label' }, h('code', null, bundle.name)),
              h('span', { className: 'fi-check-value' },
                (bundle.version ? 'v' + bundle.version + ' · ' : '') + (bundle.enabled ? t('enabled', '已启用') : t('installedDisabled', '已安装 · 未启用')),
                h('button', {
                  className: 'fi-btn',
                  style: { marginLeft: '10px' },
                  onClick: () => doRemove({ name: bundle.name, title: bundle.name }),
                }, t('uninstall', '卸载'))
              )
            ))
          )
          : null,
        localInstall(),
        h('div', { className: 'fi-notice fi-notice-info', style: { marginTop: '16px', marginBottom: 0 } }, t('installHint', '安装前会先预检包名、版本与来源，确认后才开始。'))
      );

      const renderGuide = () => h('div', { className: 'fi-guide fi-guide-block' },
        h('h2', null, t('guideTitle', '四象模型速览')),
        h('p', null, '四象模型把管理问题拆成六个维度，逐维独立诊断、独立出方案，最后汇总成一份带优先级的行动清单。它不是替你拍板，而是把"这件事到底难在哪"拆清楚。'),
        h('table', { className: 'fi-table' },
          h('thead', null, h('tr', null, h('th', null, '维度'), h('th', null, '别名'), h('th', null, '回答的问题'))),
          h('tbody', null,
            h('tr', null, h('td', null, '主体'), h('td', null, '主'), h('td', null, '这件事是谁的事、牵涉哪些人？（排在最前，是全局事实源）')),
            h('tr', null, h('td', null, '环境'), h('td', null, '环'), h('td', null, '外部允许我们做什么？')),
            h('tr', null, h('td', null, '地位'), h('td', null, '位'), h('td', null, '谁有权、谁受益、谁依赖谁？')),
            h('tr', null, h('td', null, '行为'), h('td', null, '行'), h('td', null, '流程实际怎么跑、卡在哪？')),
            h('tr', null, h('td', null, '才能'), h('td', null, '才'), h('td', null, '有没有能力与资源做？')),
            h('tr', null, h('td', null, '心态'), h('td', null, '心'), h('td', null, '愿不愿意做、信不信？'))
          )
        ),
        h('p', null, h('strong', null, '纪律：'), '才能与心态是两个独立维度，任何阶段都不合并；主体维度只做确认与画像，不出方案。'),
        h('h2', null, '怎么提问'),
        h('p', null, '带上主体、时间、关键数字和牵涉的人，比"如何提升管理"有效得多。例如：'),
        h('ul', null,
          h('li', null, '"某事业部新品导入周期比行业慢一倍，责任说不清。"'),
          h('li', null, '"公司想推新的绩效方案，中层抵触、一线观望，推了两次没落地。"')
        ),
        h('h2', null, '一次分析会发生什么'),
        h('ol', { style: { paddingLeft: '20px' } },
          h('li', null, '主体与环境确认（第一主体、利益相关者、环境因子与硬约束）'),
          h('li', null, '位 / 行 / 才 / 心 四位并行诊断，各自返回结构化结论'),
          h('li', null, '四个维度分别生成方案'),
          h('li', null, '汇总：六维总览表 + 逐维详情 + 优先级行动清单 + 待验证项')
        ),
        h('h2', null, '怎么读报告'),
        h('p', null, '先看"六维总览表"建立全局，再看"逐维详情"里每一条结论的证据；最后看"优先级行动清单"和"待验证项"——后者告诉你哪些结论还缺数据，别直接当事实用。'),
        h('h2', null, '开始之前'),
        h('p', null, '点击「开始四象分析」会新建一个使用四象预设的会话。已有会话不会自动获得新预设，这是 DSH 的规则。')
      );

      const renderAbout = () => h('div', { className: 'fi-guide fi-guide-block' },
        h('h2', null, t('aboutTitle', '关于与诊断')),
        h('table', { className: 'fi-table' },
          h('tbody', null,
            h('tr', null, h('th', null, t('versionLabel', '工作台版本')), h('td', null, VERSION)),
            h('tr', null, h('th', null, t('package', '包名')), h('td', null, h('code', null, WORKBENCH_PKG))),
            h('tr', null, h('th', null, t('engineLabel', '要求 DSH')), h('td', null, '>= 0.2.1-rc.2')),
            h('tr', null, h('th', null, t('checkPreset', '四象预设')), h('td', null, presetAvailable ? t('available', '可用') : t('notReady', '未就绪')))
          )
        ),
        h('p', null, t('aboutNote', 'v0.2.0：目录化插件、详情、更新、本地安装、诊断。执行技能的配置面板与档案库在后续版本。')),
        h('h2', null, t('operation', '最近一次操作')),
        lastOperation
          ? h('div', null,
            h('p', { className: 'fi-mono' }, lastOperation.label + ' · ' + new Date(lastOperation.at).toLocaleString()),
            h('pre', { className: 'fi-mono', style: { maxHeight: '220px', overflow: 'auto', background: 'rgba(127,127,127,.08)', padding: '10px 12px', borderRadius: '8px' } }, JSON.stringify(lastOperation.result, null, 2))
          )
          : h('p', null, t('noOperation', '暂无操作记录')),
        lastOperation && lastOperation.result && lastOperation.result.packageResult && lastOperation.result.packageResult.logPath
          ? h('p', { className: 'fi-mono' }, t('logPath', '安装日志') + '：' + lastOperation.result.packageResult.logPath)
          : null,
        h('div', { className: 'fi-actions', style: { marginTop: '12px' } },
          h('button', { className: 'fi-btn', onClick: load }, t('refresh', '刷新')),
          h('button', { className: 'fi-btn', onClick: copyDiagnostics }, t('copyDiagnostics', '复制诊断信息')),
          h('button', { className: 'fi-btn', onClick: () => { try { props.openPluginsPage(); } catch (ignored) {} } }, t('openPlugins', 'DSH 插件页'))
        )
      );

      const body = () => {
        if (tab === 'plugins') return renderPlugins();
        if (tab === 'guide') return renderGuide();
        if (tab === 'about') return renderAbout();
        return renderOverview();
      };

      const modal = detail ? h('div', {
        className: 'fi-modal-mask',
        role: 'presentation',
        onMouseDown: (event) => { if (event.target === event.currentTarget) setDetail(null); },
      },
        h('div', { className: 'fi-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': detail.title || t('details', '查看说明') },
          h('div', { className: 'fi-modal-head' },
            h('h3', { className: 'fi-modal-title' }, detail.title || ''),
            h('button', { className: 'fi-btn', onClick: () => setDetail(null), 'aria-label': t('close', '关闭') }, t('close', '关闭'))
          ),
          h('div', { className: 'fi-modal-body' },
            detail.loading
              ? h('div', { className: 'fi-loading' }, h('span', { className: 'fi-dot' }), t('loading', '正在读取插件状态…'))
              : detail.error
                ? h('p', { className: 'fi-notice fi-notice-error' }, detail.error)
                : detail.empty
                  ? h('p', null, t('detailEmpty', '该插件没有可读取的说明文档。'))
                  : h('div', { className: 'fi-md' }, renderMarkdown(detail.markdown))
          )
        )
      ) : null;

      return h('div', { className: 'fi-root' },
        h('div', { className: 'fi-inner' },
          h('div', { className: 'fi-head' },
            h('div', null,
              h('h1', { className: 'fi-title' }, t('panel', '四象工作台')),
              h('p', { className: 'fi-sub' }, t('tagline', '四象模型 · DSH 插件族 · 统一入口'))
            ),
            h('div', { style: { display: 'flex', gap: '8px' } },
              h('button', { className: 'fi-btn', onClick: load, disabled: loading }, t('refresh', '刷新')),
              h('button', { className: 'fi-btn', onClick: () => { try { props.openPluginsPage(); } catch (ignored) {} } }, t('openPlugins', 'DSH 插件页'))
            )
          ),
          h('nav', { className: 'fi-tabs' },
            [['overview', t('tabOverview', '概览')], ['plugins', t('tabPlugins', '插件')], ['guide', t('tabGuide', '使用说明')], ['about', t('tabAbout', '关于')]].map(([key, label]) =>
              h('button', {
                key: key,
                className: 'fi-tab' + (tab === key ? ' fi-tab-active' : ''),
                onClick: () => setTab(key),
              }, label)
            )
          ),
          error ? h('div', { className: 'fi-notice fi-notice-error' }, t('loadError', '读取插件状态失败：') + error) : null,
          notice ? h('div', { className: 'fi-notice ' + (notice.kind === 'error' ? 'fi-notice-error' : 'fi-notice-ok') }, notice.text) : null,
          loading && !data
            ? h('div', { className: 'fi-loading' }, h('span', { className: 'fi-dot' }), t('loading', '正在读取插件状态…'))
            : body(),
          modal
        )
      );
    }

    /* ------------------------------------------------------------------ */
    /* Client 插件                                                         */
    /* ------------------------------------------------------------------ */
    return {
      inject: ['slots', 'locale', 'remote', 'remote.pluginManager', 'remote.agentPresets', 'layout', 'remoteAccess', 'uiWorkspace'],
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

        const remoteValue = async (call) => {
          const result = await call();
          if (result && typeof result === 'object' && result.ok === false) {
            const err = result.error || {};
            throw new Error(err.message || err.code || 'Remote call failed');
          }
          if (result && typeof result === 'object' && result.ok === true && 'value' in result) return result.value;
          return result;
        };

        const currentLanguage = () => {
          try {
            const snapshot = ctx.locale.getSnapshot();
            const id = snapshot && (snapshot.locale || snapshot.activeLocale || snapshot.current || snapshot.id);
            if (id && String(id).toLowerCase().indexOf('zh') === 0) return 'zh-CN';
            if (id) return 'en';
          } catch (ignored) { /* fall through */ }
          try {
            if (typeof document !== 'undefined' && /^zh/i.test(document.documentElement.lang || '')) return 'zh-CN';
          } catch (ignored) { /* fall through */ }
          try {
            if (typeof navigator !== 'undefined' && /^zh/i.test(navigator.language || '')) return 'zh-CN';
          } catch (ignored) { /* fall through */ }
          return 'en';
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

        const loadStatus = async () => {
          const bundles = asArray(await remoteValue(() => ctx.remote.pluginManager.listBundles()));
          let plugins = [];
          try {
            plugins = asArray(await remoteValue(() => ctx.remote.pluginManager.listPlugins()));
          } catch (ignored) { plugins = []; }
          let presets = [];
          try {
            presets = asPresets(await remoteValue(() => ctx.remote.agentPresets.list()));
          } catch (ignored) { presets = []; }

          const entryMatches = (item) => plugins.filter((entry) => entry && (
            entry.moduleName === item.name ||
            (item.entryIds || []).indexOf(entry.patchId) !== -1 ||
            (item.entryIds || []).indexOf(entry.moduleName) !== -1
          ));

          const items = CATALOG.map((entry) => {
            const bundle = bundles.find((candidate) => candidate && candidate.name === entry.name) || null;
            const rows = entryMatches(entry);
            const meta = bundle && bundle.meta ? bundle.meta : null;
            return {
              name: entry.name,
              kind: entry.kind,
              order: entry.order,
              presetId: entry.presetId || null,
              entryIds: entry.entryIds || [],
              installable: entry.installable !== false,
              planned: entry.installable === false,
              spec: entry.name,
              title: (meta && resolveText(meta.title)) || pickLocalized(entry.title) || entry.name,
              description: (meta && resolveText(meta.description)) || pickLocalized(entry.description) || '',
              bundle,
              rows,
            };
          });

          const known = new Set(CATALOG.map((entry) => entry.name));
          const discovered = bundles.filter((bundle) => bundle
            && /^dsh-four-images-/.test(bundle.name || '')
            && bundle.name !== WORKBENCH_PKG
            && !known.has(bundle.name));

          const preset = presets.find((item) => item && (
            item.id === 'four-images-model' ||
            item.name === 'four-images-model' ||
            item.presetId === 'four-images-model'
          )) || null;
          const agentItem = items.find((item) => item.kind === 'agent');
          const presetRowActive = !!agentItem && agentItem.rows.some((row) => row && row.patchId === 'preset-four-images' && (
            row.fiberPhase === 'active' || row.enabled === true
          ));
          const presetAvailable = !!(preset || presetRowActive);

          return { bundles, plugins, presets, items, discovered, preset, presetAvailable };
        };

        const api = {
          loadStatus,
          resolveText,
          inspectSpec: (spec) => remoteValue(() => ctx.remote.pluginManager.inspect(spec)),
          install: (spec) => remoteValue(() => ctx.remote.pluginManager.installBundle(spec, { enabled: true })),
          remove: (name) => remoteValue(() => ctx.remote.pluginManager.removeBundle(name)),
          setEnabled: (name, enabled) => remoteValue(() => ctx.remote.pluginManager.setBundleEnabled(name, enabled)),
          checkUpdates: (name) => remoteValue(() => ctx.remote.pluginManager.listVersions(name)),
          update: (name, version) => remoteValue(() => ctx.remote.pluginManager.updateBundle(name, version)),
          readDetail: (name) => remoteValue(() => ctx.remote.pluginManager.readBundleDetail(name, currentLanguage())),
          openSession: () => {
            ctx.uiWorkspace.startSession(undefined, { agentPreset: 'four-images-model' });
          },
          openPluginsPage: () => {
            try { ctx.layout.selectPanel('plugins'); } catch (ignored) { /* panel may be registering */ }
          },
        };

        ctx.remoteAccess.whenAccess('pluginManager/listBundles', function* () {
          yield ctx.slots.inject('main', () => ctx.slots.register({
            name: 'main',
            key: PANEL_ID,
            locale: NS,
            inject: () => api,
          }, WorkbenchPanel));
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
