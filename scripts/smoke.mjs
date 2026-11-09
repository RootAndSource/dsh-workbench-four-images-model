/**
 * 四象工作台 · 开发期冒烟测试（不随插件发布）
 *
 * 目的：在没有浏览器的情况下，用最小 mock 加载 client.js，执行 apply 与各页签渲染，
 * 尽早发现语法之外的结构性错误（未定义变量、错误的调用形状等）。
 *
 * 运行：node scripts/smoke.mjs
 */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const code = fs.readFileSync(path.join(root, 'client.js'), 'utf8');

let entry;
const sandbox = {
  window: { __ModuleLoader__: { load(value) { entry = value; } } },
  document: {
    createElement() { return { dataset: {}, textContent: '', remove() {} }; },
    head: { appendChild() {} },
    documentElement: { lang: 'zh-CN' },
  },
  navigator: { language: 'zh-CN', clipboard: { writeText: async () => {} } },
  console,
  setTimeout,
  clearTimeout,
  Date,
  JSON,
  Set,
  Map,
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

if (!entry || typeof entry.factory !== 'function') throw new Error('ModuleLoader entry missing');

const React = {
  createElement(type, props, ...children) {
    return { type, props: props || {}, children: children.flat() };
  },
  useState(initial) { return [initial, () => {}]; },
  useEffect() {},
  useCallback(fn) { return fn; },
};

const plugin = entry.factory((name) => {
  if (name === 'react') return React;
  throw new Error('unexpected require: ' + name);
});
if (typeof plugin.apply !== 'function') throw new Error('plugin.apply missing');

/* ------------------------------ mock Host ------------------------------ */
const state = {
  bundles: [
    {
      name: 'dsh-preset-four-images-model',
      version: '1.4.10',
      enabled: true,
      installed: true,
      updatable: true,
      meta: {
        title: { zh: '四象模型 · DSH 智能体', en: 'Four-Images Agent' },
        description: { zh: '六维管理分析', en: 'Six-dimension analysis' },
      },
      rows: [{ rowId: 'preset-four-images', moduleName: '@deepseek-ai/dsh-agent-preset', entryId: 'include:preset-four-images' }],
    },
    {
      name: 'dsh-four-images-demo-extension',
      version: '0.1.0',
      enabled: true,
      installed: true,
    },
  ],
  plugins: [
    { entryId: 'include:preset-four-images', patchId: 'preset-four-images', moduleName: '@deepseek-ai/dsh-agent-preset', enabled: true, fiberPhase: 'active' },
  ],
  presets: [{ id: 'four-images-model', isDefault: false, name: '四象模型 · DSH 智能体' }],
};

const registrations = {};
const remote = {
  pluginManager: {
    listBundles: async () => state.bundles,
    listPlugins: async () => state.plugins,
    inspect: async () => ({ status: 'accepted', name: 'dsh-preset-four-images-model', version: '1.4.10', kind: 'registry' }),
    installBundle: async () => ({ application: 'applied', stage: 'install' }),
    removeBundle: async () => ({ application: 'applied', stage: 'remove' }),
    setBundleEnabled: async () => ({ application: 'applied', stage: 'enable' }),
    listVersions: async () => ({ status: 'listed', versions: [{ version: '1.4.11' }] }),
    updateBundle: async () => ({ from: '1.4.10', to: '1.4.11', step: 'install', result: { application: 'applied' } }),
    readBundleDetail: async () => ({
      status: 'found',
      origin: 'readme',
      markdown: [
        '# 四象模型 · DSH 智能体',
        '',
        '六维四阶段的管理问题分析与方案生成。',
        '',
        '## 能力',
        '',
        '- 主体 / 环境 / 地位 / 行为 / 才能 / 心态',
        '- 诊断与方案两段式',
        '',
        '| 维度 | 别名 |',
        '| --- | --- |',
        '| 主体 | 主 |',
        '',
        '```',
        'const x = 1',
        '```',
      ].join('\n'),
    }),
  },
  agentPresets: { list: async () => ({ presets: state.presets }) },
};

const ctx = {
  effect(fn) { return fn(); },
  locale: {
    register: () => () => {},
    bind: () => (key) => key,
    getSnapshot: () => ({ locale: 'zh-CN' }),
    resolveText: (value) => (typeof value === 'string' ? value : (value && value.zh) || ''),
  },
  slots: {
    inject(name, callback) { return callback(); },
    register(options, component) {
      registrations[options.name + ':' + (options.key || options.id)] = { options, component };
      return () => {};
    },
  },
  remoteAccess: {
    whenAccess(action, callback) {
      const iterator = callback();
      let step = iterator.next();
      while (!step.done) step = iterator.next();
      return () => {};
    },
  },
  remote,
  layout: { selectPanel() {} },
  uiWorkspace: { startSession() {} },
};

plugin.apply(ctx);

const main = registrations['main:four-images'];
const sidebar = registrations['sidebar.panellist:four-images'];
if (!main) throw new Error('main slot registration missing');
if (!sidebar) throw new Error('sidebar.panellist registration missing');

const api = main.options.inject();
const data = await api.loadStatus();
if (data.items.length < 2) throw new Error('catalog items missing');
if (!data.items.find((item) => item.kind === 'agent' && item.bundle).bundle) throw new Error('agent detection failed');
if (data.discovered.length !== 1) throw new Error('prefix discovery failed, got ' + data.discovered.length);
if (!data.presetAvailable) throw new Error('preset detection failed');

/* --------------------------- render every tab --------------------------- */
function render(tab, detail) {
  const queue = [
    tab,            // tab
    data,           // data
    false,          // loading
    null,           // error
    '',             // busy
    null,           // notice
    detail || null, // detail
    {},             // updates
    '',             // localSpec
    null,           // lastOperation
  ];
  React.useState = () => [queue.length ? queue.shift() : undefined, () => {}];
  const props = {
    ...api,
    t: (key) => key,
    useRemoteAccess: () => true,
    loadStatus: async () => data,
  };
  return main.component(props);
}

for (const tab of ['overview', 'plugins', 'guide', 'about']) {
  const tree = render(tab);
  if (!tree || tree.type !== 'div') throw new Error('render failed for tab ' + tab);
}

render('overview', {
  title: '详情',
  loading: false,
  markdown: '# 标题\n\n正文 **加粗** 与 `代码`。\n\n- 一\n- 二\n\n| 维度 | 别名 |\n| --- | --- |\n| 主体 | 主 |\n\n```\ncode\n```',
});
render('overview', { title: '详情', loading: false, markdown: '', empty: true });
render('overview', { title: '详情', loading: false, markdown: '', error: '读取失败' });

/* --------------------------- sidebar icon props ------------------------- */
const icon = sidebar.component({ size: 16, active: false });
if (!icon) throw new Error('sidebar icon render failed');

console.log('smoke-ok: slots, catalog, discovery, preset, tabs, markdown modal, sidebar icon');
