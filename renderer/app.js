// app.js — HTMLPad 主控制器
const { ipcRenderer } = require('electron');
const path = require('path');

// 加载子模块
const scripts = ['editor.js', 'themes.js', 'preview.js', 'exporters/pdf.js', 'exporters/png.js', 'exporters/html.js'];
let scriptsReady = Promise.all(scripts.map(src => new Promise((resolve, reject) => {
  const s = document.createElement('script');
  s.src = src;
  s.onload = resolve;
  s.onerror = () => reject(new Error('Failed to load ' + src));
  document.head.appendChild(s);
})));

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>欢迎使用 HTMLPad</title>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 680px; margin: 60px auto; padding: 0 24px; color: #1D1D1F; line-height: 1.6; }
    h1 { font-size: 32px; letter-spacing: -0.02em; }
    .pill { display: inline-block; background: #007AFF; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; margin-right: 8px; }
    code { background: #F5F5F7; padding: 2px 6px; border-radius: 4px; font-family: "SF Mono", monospace; }
  </style>
</head>
<body>
  <h1>👋 Hello, HTMLPad</h1>
  <p><span class="pill">编辑</span><span class="pill">预览</span><span class="pill">导出</span></p>
  <p>左侧编辑 HTML,右侧实时预览。试试在工具栏切换 <strong>视图模式</strong>、<strong>设备</strong> 和 <strong>阅读主题</strong>。</p>
  <p>快捷键:<code>⌘T</code> 新标签 · <code>⌘1/2/3</code> 切视图 · <code>⌘⇧1/2/3</code> 切设备 · <code>⌥⇧F</code> 格式化。</p>
</body>
</html>`;

const state = {
  tabs: [],
  activeTabId: null,
  viewMode: 'split',
  deviceMode: 'desktop',
  themeId: 'native',
  isDark: false,
  language: 'zh',
  editorInstance: null,
  monaco: null,
  get activeTab() { return this.tabs.find(t => t.id === this.activeTabId); }
};

let nextTabId = 1;
const PREVIEW_DEBOUNCE_MS = 300;
let previewTimer = null;

function uid() { return `tab-${nextTabId++}`; }

function newBlankTab(opts = {}) {
  return {
    id: uid(),
    filePath: opts.filePath || null,
    name: opts.filePath ? path.basename(opts.filePath) : 'Untitled',
    content: opts.content ?? DEFAULT_HTML,
    savedContent: opts.content ?? null,
    dirty: false
  };
}

function renderTabs() {
  const list = document.getElementById('tabList');
  list.innerHTML = '';
  state.tabs.forEach(tab => {
    const el = document.createElement('div');
    el.className = 'tab' + (tab.id === state.activeTabId ? ' active' : '') + (tab.dirty ? ' dirty' : '');
    el.dataset.id = tab.id;
    el.innerHTML = `
      <span class="tab-name">${escapeHtml(tab.name)}</span>
      <span class="tab-dirty"></span>
      <button class="tab-close" title="关闭">×</button>
    `;
    el.addEventListener('click', e => {
      if (e.target.classList.contains('tab-close')) {
        closeTab(tab.id);
      } else {
        activateTab(tab.id);
      }
    });
    list.appendChild(el);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function activateTab(id) {
  if (state.activeTabId === id) return;
  state.activeTabId = id;
  const tab = state.activeTab;
  if (!tab) return;

  if (state.editorInstance) {
    state.editorInstance.setValue(tab.content);
  }
  renderTabs();
  updatePreview();
  updateStatusBar();
}

function newTab(opts) {
  const tab = newBlankTab(opts);
  state.tabs.push(tab);
  state.activeTabId = tab.id;
  if (state.editorInstance) state.editorInstance.setValue(tab.content);
  renderTabs();
  updatePreview();
  updateStatusBar();
}

function closeTab(id) {
  const tab = state.tabs.find(t => t.id === id);
  if (!tab) return;
  if (tab.dirty) {
    const ok = confirm(`「${tab.name}」尚未保存,确定关闭吗?`);
    if (!ok) return;
  }
  const idx = state.tabs.findIndex(t => t.id === id);
  state.tabs.splice(idx, 1);
  if (state.activeTabId === id) {
    const next = state.tabs[idx] || state.tabs[idx - 1];
    if (next) {
      state.activeTabId = next.id;
      if (state.editorInstance) state.editorInstance.setValue(next.content);
    } else {
      // 没有 tab 了,新建一个空的
      newTab();
      return;
    }
  }
  renderTabs();
  updatePreview();
  updateStatusBar();
}

function setViewMode(mode) {
  state.viewMode = mode;
  document.getElementById('workspace').dataset.view = mode;
  document.querySelectorAll('#viewModeGroup .seg-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.view === mode);
  });
  if (state.editorInstance) {
    setTimeout(() => state.editorInstance.layout(), 50);
  }
}

function setDeviceMode(mode) {
  state.deviceMode = mode;
  document.getElementById('deviceFrame').dataset.device = mode;
  document.querySelectorAll('#deviceModeGroup .seg-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.device === mode);
  });
}

function setTheme(themeId) {
  state.themeId = themeId;
  document.getElementById('themeSelect').value = themeId;
  updatePreview();
}

function toggleDark() {
  state.isDark = !state.isDark;
  document.documentElement.dataset.theme = state.isDark ? 'dark' : 'light';
  if (state.editorInstance) {
    window.HTMLPadEditor.setEditorTheme(state.editorInstance, state.isDark);
  }
}

function getCurrentThemeCSS() {
  const theme = window.HTMLPadThemes.find(t => t.id === state.themeId);
  return theme?.css || '';
}

function updatePreview() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(() => {
    const tab = state.activeTab;
    if (!tab) return;
    const iframe = document.getElementById('previewFrame');
    window.HTMLPadPreview.setTheme(iframe, tab.content || '', getCurrentThemeCSS());
  }, PREVIEW_DEBOUNCE_MS);
}

function updateStatusBar() {
  const tab = state.activeTab;
  document.getElementById('filePath').textContent = tab ? (tab.filePath || tab.name) : '无文档';
  const text = tab?.content || '';
  const lines = text.split('\n').length;
  document.getElementById('docStats').textContent = `${lines} 行 · ${text.length} 字符`;
  const dot = document.getElementById('statusDot');
  dot.className = 'status-dot' + (tab?.dirty ? ' dirty' : '');
  document.getElementById('statusText').textContent = tab?.dirty ? '未保存' : '已保存';
}

function onEditorChange(value) {
  const tab = state.activeTab;
  if (!tab) return;
  tab.content = value;
  tab.dirty = tab.savedContent !== null ? value !== tab.savedContent : value !== DEFAULT_HTML;
  renderTabs();
  updatePreview();
  updateStatusBar();
}

// ============== File ops ==============

async function saveCurrent() {
  const tab = state.activeTab;
  if (!tab) return;
  if (!tab.filePath) return saveCurrentAs();
  const res = await ipcRenderer.invoke('save-file', { filePath: tab.filePath, content: tab.content });
  if (res.success) {
    tab.savedContent = tab.content;
    tab.dirty = false;
    renderTabs();
    updateStatusBar();
    toast('已保存');
  } else {
    toast('保存失败:' + res.error);
  }
}

async function saveCurrentAs() {
  const tab = state.activeTab;
  if (!tab) return;
  const res = await ipcRenderer.invoke('save-file-as', {
    defaultPath: tab.name || 'untitled.html',
    content: tab.content
  });
  if (res.success) {
    tab.filePath = res.filePath;
    tab.name = path.basename(res.filePath);
    tab.savedContent = tab.content;
    tab.dirty = false;
    renderTabs();
    updateStatusBar();
    toast('已另存为');
  } else if (!res.canceled) {
    toast('保存失败:' + res.error);
  }
}

async function openFileDialog() {
  const res = await ipcRenderer.invoke('open-file-dialog');
  if (res.success) {
    res.files.forEach(f => {
      newTab({ filePath: f.path, content: f.content });
    });
  }
}

async function formatHTML() {
  const tab = state.activeTab;
  if (!tab || !state.editorInstance) return;
  try {
    const prettier = require('prettier/standalone');
    const pluginHtml = require('prettier/plugins/html');
    const formatted = await prettier.format(tab.content, {
      parser: 'html',
      plugins: [pluginHtml],
      printWidth: 100,
      tabWidth: 2,
      htmlWhitespaceSensitivity: 'css'
    });
    state.editorInstance.setValue(formatted);
    toast('已格式化');
  } catch (e) {
    console.error(e);
    toast('格式化失败:' + e.message);
  }
}

async function copyHTML() {
  const tab = state.activeTab;
  if (!tab) return;
  await navigator.clipboard.writeText(tab.content);
  toast('已复制 HTML 源码');
}

async function copyRendered() {
  const iframe = document.getElementById('previewFrame');
  const text = window.HTMLPadPreview.getRenderedText(iframe);
  await navigator.clipboard.writeText(text);
  toast('已复制渲染后文本');
}

// ============== Toast ==============
let toastTimer = null;
function toast(msg) {
  let el = document.querySelector('.toast');
  if (el) el.remove();
  el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 1900);
}

// ============== Init ==============

async function init() {
  await scriptsReady;

  // 主题下拉
  const sel = document.getElementById('themeSelect');
  window.HTMLPadThemes.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.name;
    sel.appendChild(opt);
  });
  sel.value = state.themeId;
  sel.addEventListener('change', e => setTheme(e.target.value));

  // 视图组
  document.querySelectorAll('#viewModeGroup .seg-btn').forEach(b => {
    b.addEventListener('click', () => setViewMode(b.dataset.view));
  });
  document.querySelectorAll('#deviceModeGroup .seg-btn').forEach(b => {
    b.addEventListener('click', () => setDeviceMode(b.dataset.device));
  });

  // 工具栏按钮
  document.getElementById('newTabBtn').addEventListener('click', () => newTab());
  document.getElementById('openBtn').addEventListener('click', () => openFileDialog());
  document.getElementById('saveBtn').addEventListener('click', () => saveCurrent());
  document.getElementById('formatBtn').addEventListener('click', () => formatHTML());
  document.getElementById('copyHtmlBtn').addEventListener('click', () => copyHTML());
  document.getElementById('tabAddBtn').addEventListener('click', () => newTab());

  // 导出菜单
  const exportBtn = document.getElementById('exportBtn');
  const exportMenu = document.getElementById('exportMenu');
  exportBtn.addEventListener('click', e => {
    e.stopPropagation();
    exportMenu.hidden = !exportMenu.hidden;
  });
  document.addEventListener('click', () => { exportMenu.hidden = true; });
  exportMenu.addEventListener('click', e => e.stopPropagation());
  exportMenu.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', async () => {
      exportMenu.hidden = true;
      const action = btn.dataset.action;
      try {
        if (action === 'pdf') {
          const r = await window.HTMLPadExportPDF(state, ipcRenderer);
          if (r.success) toast('已导出 PDF');
        } else if (action === 'png') {
          const r = await window.HTMLPadExportPNG(state, ipcRenderer);
          if (r.success) toast('已导出 PNG');
        } else if (action === 'html') {
          const r = await window.HTMLPadExportHTML(state, ipcRenderer, getCurrentThemeCSS());
          if (r.success) toast('已导出 HTML');
        }
      } catch (e) {
        toast('导出失败:' + e.message);
      }
    });
  });

  // 关于
  document.getElementById('aboutClose').addEventListener('click', () => {
    document.getElementById('aboutModal').hidden = true;
  });

  // ============== IPC 监听 ==============
  ipcRenderer.on('tab-new', () => newTab());
  ipcRenderer.on('tab-close', () => state.activeTabId && closeTab(state.activeTabId));
  ipcRenderer.on('file-open-request', () => openFileDialog());
  ipcRenderer.on('file-save', () => saveCurrent());
  ipcRenderer.on('file-save-as', () => saveCurrentAs());
  ipcRenderer.on('file-opened', (_e, { path: p, content }) => {
    // 复用空 Untitled 或者新建 tab
    const empty = state.tabs.find(t => !t.filePath && !t.dirty && t.content === DEFAULT_HTML);
    if (empty && state.tabs.length === 1) {
      empty.filePath = p;
      empty.name = path.basename(p);
      empty.content = content;
      empty.savedContent = content;
      empty.dirty = false;
      state.activeTabId = empty.id;
      if (state.editorInstance) state.editorInstance.setValue(content);
      renderTabs();
      updatePreview();
      updateStatusBar();
    } else {
      newTab({ filePath: p, content });
    }
  });
  ipcRenderer.on('view-mode', (_e, m) => setViewMode(m));
  ipcRenderer.on('device-mode', (_e, m) => setDeviceMode(m));
  ipcRenderer.on('toggle-dark', () => toggleDark());
  ipcRenderer.on('format-html', () => formatHTML());
  ipcRenderer.on('copy-html', () => copyHTML());
  ipcRenderer.on('copy-rendered', () => copyRendered());
  ipcRenderer.on('export-pdf', async () => {
    try { const r = await window.HTMLPadExportPDF(state, ipcRenderer); if (r.success) toast('已导出 PDF'); }
    catch (e) { toast('导出失败:' + e.message); }
  });
  ipcRenderer.on('export-png', async () => {
    try { const r = await window.HTMLPadExportPNG(state, ipcRenderer); if (r.success) toast('已导出 PNG'); }
    catch (e) { toast('导出失败:' + e.message); }
  });
  ipcRenderer.on('export-html', async () => {
    try { const r = await window.HTMLPadExportHTML(state, ipcRenderer, getCurrentThemeCSS()); if (r.success) toast('已导出 HTML'); }
    catch (e) { toast('导出失败:' + e.message); }
  });
  ipcRenderer.on('show-about', () => { document.getElementById('aboutModal').hidden = false; });
  ipcRenderer.on('language-changed', (_e, lang) => { state.language = lang; });

  // 拖拽打开
  window.addEventListener('dragover', e => { e.preventDefault(); });
  window.addEventListener('drop', async e => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => /\.html?$/i.test(f.name));
    for (const f of files) {
      const content = await f.text();
      newTab({ filePath: f.path, content });
    }
  });

  // 初始 tab
  newTab();

  // 启动 Monaco
  const editorHost = document.getElementById('editorHost');
  try {
    state.editorInstance = await window.HTMLPadEditor.createEditor(editorHost, state.activeTab.content, onEditorChange);
  } catch (e) {
    console.error('Monaco 加载失败,降级为 textarea:', e);
    editorHost.innerHTML = '';
    const ta = document.createElement('textarea');
    ta.style.cssText = 'width:100%;height:100%;border:none;outline:none;padding:16px;font-family:SF Mono,monospace;font-size:13px;resize:none;background:white;color:#1D1D1F;';
    ta.value = state.activeTab.content;
    ta.addEventListener('input', () => onEditorChange(ta.value));
    editorHost.appendChild(ta);
    state.editorInstance = {
      setValue: v => { ta.value = v; },
      getValue: () => ta.value,
      layout: () => {}
    };
  }

  updatePreview();
}

document.addEventListener('DOMContentLoaded', init);
