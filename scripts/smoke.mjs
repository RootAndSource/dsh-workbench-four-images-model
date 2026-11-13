/**
 * 四象工作台 · 开发期冒烟测试（不随插件发布）
 *
 * 用最小 mock 加载 client.js，执行 apply，验证：
 *   - 主面板与侧栏插槽注册、子插槽声明；
 *   - fourImagesNavigation 服务与导航切换；
 *   - 核心页与插件页的 renderSlot 调用；
 *   - 侧栏图标渲染。
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
const inventory = [
  {
    name: 'dsh-skills-four-images-model',
    version: '0.1.0',
    installed: true,
    enabled: true,
    rows: [{ entryId: 'include:skills-four-images', patchId: 'skills-four-images', moduleName: 'dsh-skills-four-images-model', fiberPhase: 'active', enabled: true }],
    title: '执行技能',
    description: '可配置的执行能力',
  },
];
const remote = {
  pluginManager: {
    listBundles: async () => [],
    listPlugins: async () => [],
    inspect: async () => ({ status: 'accepted', name: 'dsh-skills-four-images-model', version: '0.1.0', kind: 'registry' }),
    installBundle: async () => ({ application: 'applied' }),
    removeBundle: async () => ({ application: 'applied' }),
    setBundleEnabled: async () => ({ application: 'applied' }),
    listVersions: async () => ({ status: 'listed', versions: [] }),
    updateBundle: async () => ({ result: { application: 'applied' } }),
  },
};

const registrations = {};
const provided = {};
const slotCalls = [];
const ctx = {
  effect(fn) { return fn(); },
  provide(name, value) { provided[name] = value; return () => { delete provided[name]; }; },
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
};

plugin.apply(ctx);

const main = registrations['main:four-images'];
const sidebar = registrations['sidebar.panellist:four-images'];
if (!main) throw new Error('main slot registration missing');
if (!sidebar) throw new Error('sidebar.panellist registration missing');

const children = main.options.children || {};
const expectedChildren = [
  'four-images.page',
  'four-images.home.card',
  'four-images.home.action',
  'four-images.settings.section',
  'four-images.toolbar.action',
];
for (const key of expectedChildren) {
  if (!children[key]) throw new Error('missing child slot declaration: ' + key);
}

const nav = provided['fourImagesNavigation'];
if (!nav || typeof nav.add !== 'function' || typeof nav.select !== 'function') throw new Error('fourImagesNavigation service missing');

const api = main.options.inject();
if (typeof api.loadInventory !== 'function') throw new Error('inject face missing loadInventory');

/* --------------------------- render helpers --------------------------- */
function render(active, stateQueue) {
  if (active) nav.select(active);
  const queue = stateQueue || [];
  let index = 0;
  React.useState = () => {
    const value = index < queue.length ? queue[index] : undefined;
    index += 1;
    return [value, () => {}];
  };
  const props = {
    ...api,
    t: (key) => key,
    useNavigation: (selector) => selector(nav.getSnapshot()),
    renderSlot: (key, owner, opts) => {
      slotCalls.push({ key, entryKey: opts && opts.entryKey });
      return { type: 'slot', key, entryKey: opts && opts.entryKey };
    },
    loadInventory: async () => inventory,
  };
  return main.component(props);
}

const defaultState = [
  { loading: false, error: null, items: inventory },
  null,
];

nav.add({ id: 'agent', label: { zh: '四象分析', en: 'Analysis' }, order: 10 });

const home = render('home', defaultState);
if (!home || home.type !== 'div') throw new Error('home render failed');
if (!slotCalls.some((call) => call.key === 'four-images.home.card')) throw new Error('home card slot not rendered');

slotCalls.length = 0;
const pluginsPage = render('plugins', defaultState);
if (!pluginsPage || pluginsPage.type !== 'div') throw new Error('plugins render failed');

slotCalls.length = 0;
const settings = render('settings', structuredClone(defaultState));
if (!settings || !slotCalls.some((call) => call.key === 'four-images.settings.section')) throw new Error('settings render failed');

slotCalls.length = 0;
const about = render('about', structuredClone(defaultState));
if (!about || about.type !== 'div') throw new Error('about render failed');

slotCalls.length = 0;
const agentPage = render('agent', structuredClone(defaultState));
if (!agentPage || !slotCalls.some((call) => call.key === 'four-images.page' && call.entryKey === 'agent')) {
  throw new Error('plugin page render failed');
}

/* service removal should fall back to home */
const removeAgent = nav.add({ id: 'agent', label: 'Agent' });
removeAgent();
nav.select('agent');
if (nav.getSnapshot().active !== 'home') throw new Error('removed active page should fall back to home');

/* sidebar icon */
const icon = sidebar.component({ size: 16, active: false });
if (!icon) throw new Error('sidebar icon render failed');

console.log('smoke-ok: shell slots, navigation service, core pages, plugin page, sidebar icon');
