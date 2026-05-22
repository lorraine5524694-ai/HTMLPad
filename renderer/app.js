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
    type: 'editor',
    filePath: opts.filePath || null,
    name: opts.filePath ? path.basename(opts.filePath) : 'Untitled',
    content: opts.content ?? DEFAULT_HTML,
    savedContent: opts.content ?? null,
    dirty: false
  };
}

function newWelcomeTabObj() {
  return {
    id: uid(),
    type: 'welcome',
    filePath: null,
    name: '最近文件',
    content: '',
    savedContent: null,
    dirty: false
  };
}

function findWelcomeTab() {
  return state.tabs.find(t => t.type === 'welcome');
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

function applyActiveTabView() {
  const tab = state.activeTab;
  const ws = document.getElementById('workspace');
  if (!ws) return;
  if (tab && tab.type === 'welcome') {
    ws.dataset.view = 'welcome';
    renderWelcomeView();
  } else {
    ws.dataset.view = state.viewMode;
  }
}

function activateTab(id) {
  if (state.activeTabId === id) return;
  state.activeTabId = id;
  const tab = state.activeTab;
  if (!tab) return;

  if (tab.type !== 'welcome' && state.editorInstance) {
    state.editorInstance.setValue(tab.content);
  }
  renderTabs();
  applyActiveTabView();
  updatePreview();
  updateStatusBar();
}

function newTab(opts) {
  const tab = newBlankTab(opts);
  state.tabs.push(tab);
  state.activeTabId = tab.id;
  if (state.editorInstance) state.editorInstance.setValue(tab.content);
  renderTabs();
  applyActiveTabView();
  updatePreview();
  updateStatusBar();
}

function newWelcomeTab() {
  const existing = findWelcomeTab();
  if (existing) {
    activateTab(existing.id);
    return;
  }
  const tab = newWelcomeTabObj();
  state.tabs.push(tab);
  state.activeTabId = tab.id;
  renderTabs();
  applyActiveTabView();
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
      if (next.type !== 'welcome' && state.editorInstance) {
        state.editorInstance.setValue(next.content);
      }
    } else {
      // 没有 tab 了,回到欢迎页
      newWelcomeTab();
      return;
    }
  }
  renderTabs();
  applyActiveTabView();
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
  document.querySelector('.preview-pane').dataset.device = mode;
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
    if (!tab || tab.type === 'welcome') return;
    const iframe = document.getElementById('previewFrame');
    window.HTMLPadPreview.setPreview(iframe, tab.content || '', getCurrentThemeCSS(), tab.filePath);
  }, PREVIEW_DEBOUNCE_MS);
}

function updateStatusBar() {
  const tab = state.activeTab;
  if (tab && tab.type === 'welcome') {
    document.getElementById('filePath').textContent = '最近文件';
    document.getElementById('docStats').textContent = '';
    document.getElementById('statusDot').className = 'status-dot';
    document.getElementById('statusText').textContent = '欢迎页';
    return;
  }
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
  if (!tab || tab.type === 'welcome') return;
  tab.content = value;
  tab.dirty = tab.savedContent !== null ? value !== tab.savedContent : value !== DEFAULT_HTML;
  renderTabs();
  updatePreview();
  updateStatusBar();
}

// ============== File ops ==============

async function saveCurrent() {
  const tab = state.activeTab;
  if (!tab || tab.type === 'welcome') return;
  if (!tab.filePath) return saveCurrentAs();
  const res = await ipcRenderer.invoke('save-file', { filePath: tab.filePath, content: tab.content });
  if (res.success) {
    tab.savedContent = tab.content;
    tab.dirty = false;
    renderTabs();
    updateStatusBar();
    refreshWelcomeIfMounted();
    toast('已保存');
  } else {
    toast('保存失败:' + res.error);
  }
}

async function saveCurrentAs() {
  const tab = state.activeTab;
  if (!tab || tab.type === 'welcome') return;
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
    refreshWelcomeIfMounted();
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
    refreshWelcomeIfMounted();
  }
}

async function formatHTML() {
  const tab = state.activeTab;
  if (!tab || tab.type === 'welcome' || !state.editorInstance) return;
  const res = await ipcRenderer.invoke('format-html', { content: tab.content });
  if (res.success) {
    state.editorInstance.setValue(res.content);
    toast('已格式化');
  } else {
    toast('格式化失败:' + res.error);
  }
}

async function copyHTML() {
  const tab = state.activeTab;
  if (!tab || tab.type === 'welcome') return;
  await navigator.clipboard.writeText(tab.content);
  toast('已复制 HTML 源码');
}

async function copyRendered() {
  const iframe = document.getElementById('previewFrame');
  const text = window.HTMLPadPreview.getRenderedText(iframe);
  await navigator.clipboard.writeText(text);
  toast('已复制渲染后文本');
}

// ============== Pane Divider Drag ==============
function setupDividerDrag() {
  const workspace = document.getElementById('workspace');
  const divider = document.getElementById('paneDivider');
  if (!divider || !workspace) return;
  const MIN = 220;

  divider.addEventListener('mousedown', (e) => {
    if (state.viewMode !== 'split') return;
    e.preventDefault();
    divider.classList.add('dragging');
    document.body.classList.add('divider-dragging');
    const rect = workspace.getBoundingClientRect();

    const onMove = (ev) => {
      const x = ev.clientX - rect.left;
      const w = rect.width;
      const dividerW = 6;
      const editorW = Math.max(MIN, Math.min(w - MIN - dividerW, x - dividerW / 2));
      workspace.style.setProperty('--editor-w', editorW + 'px');
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      divider.classList.remove('dragging');
      document.body.classList.remove('divider-dragging');
      if (state.editorInstance) state.editorInstance.layout();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // 双击复位 50/50
  divider.addEventListener('dblclick', () => {
    workspace.style.removeProperty('--editor-w');
    if (state.editorInstance) state.editorInstance.layout();
  });
}

// ============== Text Edit (preview → source) ==============
function applyTextEdit(offset, newText) {
  const tab = state.activeTab;
  if (!tab) return;
  const html = tab.content;
  const range = findInnerTextRange(html, offset);
  if (!range) { toast('该元素无法直接编辑'); return; }
  const escaped = String(newText)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const newHtml = html.slice(0, range.start) + escaped + html.slice(range.end);
  setCurrentDocumentContent(newHtml);
  toast('已更新文字');
}

function applyRichEdit(offset, newInnerHTML) {
  const tab = state.activeTab;
  if (!tab) return;
  const html = tab.content;
  const range = findInnerTextRange(html, offset);
  if (!range) { toast('该选区无法直接设置样式'); return; }
  const cleaned = sanitizePreviewHTMLFragment(newInnerHTML);
  const newHtml = html.slice(0, range.start) + cleaned + html.slice(range.end);
  setCurrentDocumentContent(newHtml);
  toast('已更新样式');
}

function setCurrentDocumentContent(newHtml) {
  if (state.editorInstance) {
    state.editorInstance.setValue(newHtml);
    if (typeof state.editorInstance.getModel !== 'function') {
      onEditorChange(newHtml);
    }
  } else {
    onEditorChange(newHtml);
  }
}

function sanitizePreviewHTMLFragment(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = String(html || '');
  tpl.content.querySelectorAll('*').forEach(el => {
    el.removeAttribute('data-htmlpad-id');
    el.removeAttribute('data-htmlpad-locked');
    el.removeAttribute('data-htmlpad-editing');
    el.removeAttribute('data-htmlpad-source-highlight');
    el.removeAttribute('contenteditable');
  });
  return tpl.innerHTML;
}

function findInnerTextRange(html, offset) {
  if (typeof offset !== 'number' || offset < 0 || offset >= html.length) return null;
  if (html[offset] !== '<') return null;
  const tagMatch = html.slice(offset).match(/^<([A-Za-z][\w-]*)/);
  if (!tagMatch) return null;
  const tagName = tagMatch[1].toLowerCase();
  const VOID = ['br','hr','img','input','meta','link','area','base','col','embed','source','track','wbr'];
  if (VOID.includes(tagName)) return null;
  const openEnd = html.indexOf('>', offset);
  if (openEnd === -1) return null;
  if (html[openEnd - 1] === '/') return null;

  const lower = html.toLowerCase();
  const openNeedle = '<' + tagName;
  const closeNeedle = '</' + tagName;
  let depth = 1;
  let i = openEnd + 1;
  while (i < html.length) {
    const nextClose = lower.indexOf(closeNeedle, i);
    if (nextClose === -1) return null;
    let validOpen = -1;
    let searchFrom = i;
    while (true) {
      const cand = lower.indexOf(openNeedle, searchFrom);
      if (cand === -1 || cand >= nextClose) break;
      const c = html[cand + openNeedle.length];
      if (c === undefined || /[\s>/]/.test(c)) { validOpen = cand; break; }
      searchFrom = cand + openNeedle.length;
    }
    if (validOpen !== -1) {
      depth++;
      i = validOpen + openNeedle.length;
    } else {
      depth--;
      if (depth === 0) {
        return { start: openEnd + 1, end: nextClose };
      }
      i = nextClose + closeNeedle.length;
    }
  }
  return null;
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

// ============== Welcome view ==============

function formatRelativeTime(ts) {
  const diff = Date.now() - ts;
  if (diff < 60_000) return '刚刚';
  if (diff < 3600_000) return Math.floor(diff / 60_000) + ' 分钟前';
  if (diff < 86_400_000) return Math.floor(diff / 3600_000) + ' 小时前';
  if (diff < 172_800_000) return '昨天';
  return Math.floor(diff / 86_400_000) + ' 天前';
}

function refreshWelcomeIfMounted() {
  if (findWelcomeTab()) renderWelcomeView();
}

async function openRecentFile(p) {
  const res = await ipcRenderer.invoke('read-file', p);
  if (!res.success) {
    toast('打开失败:' + res.error);
    return;
  }
  await ipcRenderer.invoke('recent-files-touch', { path: p, kind: 'open' });
  newTab({ filePath: p, content: res.content });
}

async function removeRecent(p) {
  await ipcRenderer.invoke('recent-files-remove', { path: p });
  refreshWelcomeIfMounted();
}

async function clearRecent() {
  if (!confirm('清空全部最近文件记录?')) return;
  await ipcRenderer.invoke('recent-files-clear');
  refreshWelcomeIfMounted();
  toast('已清空');
}

async function renderWelcomeView() {
  const grid = document.getElementById('welcomeGrid');
  const empty = document.getElementById('welcomeEmpty');
  const footer = document.getElementById('welcomeFooter');
  if (!grid) return;
  const list = await ipcRenderer.invoke('recent-files-list');
  grid.innerHTML = '';
  if (!list.length) {
    grid.hidden = true;
    empty.hidden = false;
    footer.hidden = true;
    return;
  }
  grid.hidden = false;
  empty.hidden = true;
  footer.hidden = false;
  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'welcome-card';
    card.title = item.path;
    const ext = (item.name.split('.').pop() || '').toUpperCase().slice(0, 4) || 'HTM';
    card.innerHTML = `
      <div class="welcome-card-icon">${escapeHtml(ext)}</div>
      <div class="welcome-card-name">${escapeHtml(item.name)}</div>
      <div class="welcome-card-path">${escapeHtml(item.path)}</div>
      <div class="welcome-card-time">${escapeHtml(formatRelativeTime(item.lastActiveAt))}</div>
      <button class="welcome-card-remove" type="button" aria-label="从最近记录中移除">×</button>
    `;
    card.addEventListener('click', e => {
      if (e.target.classList.contains('welcome-card-remove')) {
        e.stopPropagation();
        removeRecent(item.path);
        return;
      }
      openRecentFile(item.path);
    });
    grid.appendChild(card);
  });
}


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
  document.getElementById('newTabBtn').addEventListener('click', () => newWelcomeTab());
  document.getElementById('openBtn').addEventListener('click', () => openFileDialog());
  document.getElementById('saveBtn').addEventListener('click', () => saveCurrent());
  document.getElementById('formatBtn').addEventListener('click', () => formatHTML());
  document.getElementById('copyHtmlBtn').addEventListener('click', () => copyHTML());
  document.getElementById('tabAddBtn').addEventListener('click', () => newTab());

  // 欢迎页按钮
  document.getElementById('welcomeNewBtn').addEventListener('click', () => newTab());
  document.getElementById('welcomeOpenBtn').addEventListener('click', () => openFileDialog());
  document.getElementById('welcomeEmptyNewBtn').addEventListener('click', () => newTab());
  document.getElementById('welcomeEmptyOpenBtn').addEventListener('click', () => openFileDialog());
  document.getElementById('welcomeClearBtn').addEventListener('click', () => clearRecent());

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
  ipcRenderer.on('tab-new', () => newWelcomeTab());
  ipcRenderer.on('tab-close', () => state.activeTabId && closeTab(state.activeTabId));
  ipcRenderer.on('file-open-request', () => openFileDialog());
  ipcRenderer.on('file-save', () => saveCurrent());
  ipcRenderer.on('file-save-as', () => saveCurrentAs());
  ipcRenderer.on('file-opened', (_e, { path: p, content }) => {
    // 复用空 Untitled 或者新建 tab
    const empty = state.tabs.find(t => t.type !== 'welcome' && !t.filePath && !t.dirty && t.content === DEFAULT_HTML);
    if (empty && state.tabs.filter(t => t.type !== 'welcome').length === 1) {
      empty.filePath = p;
      empty.name = path.basename(p);
      empty.content = content;
      empty.savedContent = content;
      empty.dirty = false;
      state.activeTabId = empty.id;
      if (state.editorInstance) state.editorInstance.setValue(content);
      renderTabs();
      applyActiveTabView();
      updatePreview();
      updateStatusBar();
    } else {
      newTab({ filePath: p, content });
    }
    refreshWelcomeIfMounted();
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
      try { await ipcRenderer.invoke('recent-files-touch', { path: f.path, kind: 'open' }); } catch (_) {}
    }
    refreshWelcomeIfMounted();
  });

  // 初始 tab:欢迎页
  newWelcomeTab();

  // 设置初始 device 到 preview-pane(否则没 padding 切换会错位)
  document.querySelector('.preview-pane').dataset.device = state.deviceMode;

  // 监听预览 iframe 的点击,跳转 Monaco 光标;以及双击文本编辑回写
  window.addEventListener('message', (e) => {
    if (!e.data) return;
    if (e.data.type === 'htmlpad-jump' && state.editorInstance && state.monaco) {
      const offset = e.data.offset;
      const model = state.editorInstance.getModel();
      if (!model) return;
      const pos = model.getPositionAt(offset);
      state.editorInstance.revealLineInCenter(pos.lineNumber);
      state.editorInstance.setPosition(pos);
      state.editorInstance.focus();
    } else if (e.data.type === 'htmlpad-text-edit') {
      applyTextEdit(e.data.offset, e.data.newText);
    } else if (e.data.type === 'htmlpad-rich-edit') {
      applyRichEdit(e.data.offset, e.data.newInnerHTML);
    } else if (e.data.type === 'htmlpad-edit-begin') {
      // 让 Monaco 失焦,把焦点让给 iframe 的 contenteditable
      try {
        if (state.editorInstance && typeof state.editorInstance.getDomNode === 'function') {
          const dom = state.editorInstance.getDomNode();
          if (dom && document.activeElement && dom.contains(document.activeElement)) {
            document.activeElement.blur();
          }
        }
        const iframe = document.getElementById('previewFrame');
        if (iframe && iframe.contentWindow) iframe.contentWindow.focus();
      } catch (err) {
        console.warn('edit-begin focus handoff failed:', err);
      }
    } else if (e.data.type === 'htmlpad-debug') {
      console.log('[htmlpad/bridge]', e.data.msg);
    }
  });

  // 编辑器/预览分隔条拖动
  setupDividerDrag();

  // 启动 Monaco
  const editorHost = document.getElementById('editorHost');
  try {
    state.monaco = await window.HTMLPadEditor.loadMonaco();
    state.editorInstance = await window.HTMLPadEditor.createEditor(editorHost, state.activeTab.content, onEditorChange);

    // 左侧编辑器选区变化 → 右侧预览高亮对应元素
    let selectTimer = null;
    if (state.editorInstance.onDidChangeCursorSelection) {
      state.editorInstance.onDidChangeCursorSelection(() => {
        clearTimeout(selectTimer);
        const model = state.editorInstance.getModel();
        if (!model) return;
        const sel = state.editorInstance.getSelection();
        if (!sel || sel.isEmpty()) {
          // 空选区(光标移动):延迟清除,等后续非空选区打断
          selectTimer = setTimeout(() => {
            try {
              document.getElementById('previewFrame')?.contentWindow?.postMessage(
                { type: 'htmlpad-source-select', offset: -1 }, '*'
              );
            } catch (_) {}
          }, 250);
        } else {
          // 非空选区:打断清除,立即高亮
          const offset = model.getOffsetAt(sel.getStartPosition());
          selectTimer = setTimeout(() => {
            try {
              document.getElementById('previewFrame')?.contentWindow?.postMessage(
                { type: 'htmlpad-source-select', offset }, '*'
              );
            } catch (_) {}
          }, 60);
        }
      });
    } else {
      // textarea 降级模式:监听 select 事件
      const ta = editorHost.querySelector('textarea');
      if (ta) {
        ta.addEventListener('select', () => {
          clearTimeout(selectTimer);
          selectTimer = setTimeout(() => {
            const start = ta.selectionStart;
            try {
              document.getElementById('previewFrame')?.contentWindow?.postMessage(
                { type: 'htmlpad-source-select', offset: start }, '*'
              );
            } catch (_) {}
          }, 100);
        });
      }
    }
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
