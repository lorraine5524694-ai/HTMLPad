const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const Store = require('electron-store');

const APP_NAME = 'HTMLPad';
const store = new Store();

const RECENT_FILES_KEY = 'recentFiles';
const RECENT_MAX = 50;
const RECENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

function readRecent() {
  const arr = store.get(RECENT_FILES_KEY, []);
  return Array.isArray(arr) ? arr : [];
}

function writeRecent(arr) {
  store.set(RECENT_FILES_KEY, arr.slice(0, RECENT_MAX));
}

function touchRecent(filePath, kind) {
  if (!filePath) return;
  const now = Date.now();
  const list = readRecent();
  const idx = list.findIndex(r => r.path === filePath);
  const base = idx >= 0 ? list[idx] : {
    path: filePath,
    name: path.basename(filePath),
    openedAt: 0,
    modifiedAt: 0
  };
  if (kind === 'edit') base.modifiedAt = now;
  else base.openedAt = now;
  if (idx >= 0) list.splice(idx, 1);
  list.unshift(base);
  writeRecent(list);
}

app.setName(APP_NAME);

let windows = [];
let pendingFilePath = null;
let currentLanguage = store.get('language', 'zh');

const menuTexts = {
  en: {
    file: 'File', newTab: 'New Tab', newWindow: 'New Window', open: 'Open',
    save: 'Save', saveAs: 'Save As', closeTab: 'Close Tab',
    export: 'Export', exportPDF: 'Export as PDF', exportPNG: 'Export as PNG',
    exportHTML: 'Export Standalone HTML', copyHTML: 'Copy HTML Source',
    copyRendered: 'Copy Rendered Text', close: 'Close Window', quit: 'Quit',
    edit: 'Edit', undo: 'Undo', redo: 'Redo', cut: 'Cut', copy: 'Copy',
    paste: 'Paste', selectAll: 'Select All', format: 'Format HTML',
    view: 'View', viewEdit: 'Editor Only', viewSplit: 'Split View',
    viewPreview: 'Preview Only', toggleTheme: 'Toggle Dark Mode',
    devicePhone: 'iPhone', deviceTablet: 'iPad', deviceDesktop: 'Desktop',
    reload: 'Reload', devtools: 'Toggle DevTools', resetZoom: 'Actual Size',
    zoomIn: 'Zoom In', zoomOut: 'Zoom Out', fullscreen: 'Toggle Full Screen',
    window: 'Window', minimize: 'Minimize', zoom: 'Zoom', front: 'Bring All to Front',
    help: 'Help', about: `About ${APP_NAME}`, language: 'Language',
    english: 'English', chinese: '中文'
  },
  zh: {
    file: '文件', newTab: '新建标签页', newWindow: '新建窗口', open: '打开',
    save: '保存', saveAs: '另存为', closeTab: '关闭标签页',
    export: '导出', exportPDF: '导出为 PDF', exportPNG: '导出为 PNG 长图',
    exportHTML: '导出独立 HTML', copyHTML: '复制 HTML 源码',
    copyRendered: '复制渲染后文本', close: '关闭窗口', quit: '退出',
    edit: '编辑', undo: '撤销', redo: '重做', cut: '剪切', copy: '复制',
    paste: '粘贴', selectAll: '全选', format: '格式化 HTML',
    view: '视图', viewEdit: '仅编辑', viewSplit: '分屏',
    viewPreview: '仅预览', toggleTheme: '切换深色模式',
    devicePhone: 'iPhone', deviceTablet: 'iPad', deviceDesktop: '桌面',
    reload: '重新加载', devtools: '开发者工具', resetZoom: '实际大小',
    zoomIn: '放大', zoomOut: '缩小', fullscreen: '全屏',
    window: '窗口', minimize: '最小化', zoom: '缩放', front: '前置所有窗口',
    help: '帮助', about: `关于 ${APP_NAME}`, language: '语言',
    english: 'English', chinese: '中文'
  }
};

const t = (k) => menuTexts[currentLanguage][k] || k;

function switchLanguage(lang) {
  currentLanguage = lang;
  store.set('language', lang);
  windows.forEach(w => {
    if (w && !w.isDestroyed()) {
      buildMenu(w);
      w.webContents.send('language-changed', lang);
    }
  });
}

function sendToFocused(channel, payload) {
  const w = BrowserWindow.getFocusedWindow();
  if (w) w.webContents.send(channel, payload);
}

function buildMenu(win) {
  const template = [
    {
      label: t('file'),
      submenu: [
        { label: t('newTab'), accelerator: 'CmdOrCtrl+T', click: () => sendToFocused('tab-new') },
        { label: t('newWindow'), accelerator: 'CmdOrCtrl+N', click: () => createWindow() },
        { label: t('open'), accelerator: 'CmdOrCtrl+O', click: () => sendToFocused('file-open-request') },
        { type: 'separator' },
        { label: t('save'), accelerator: 'CmdOrCtrl+S', click: () => sendToFocused('file-save') },
        { label: t('saveAs'), accelerator: 'CmdOrCtrl+Shift+S', click: () => sendToFocused('file-save-as') },
        { label: t('closeTab'), accelerator: 'CmdOrCtrl+W', click: () => sendToFocused('tab-close') },
        { type: 'separator' },
        {
          label: t('export'),
          submenu: [
            { label: t('exportPDF'), accelerator: 'CmdOrCtrl+E', click: () => sendToFocused('export-pdf') },
            { label: t('exportPNG'), accelerator: 'CmdOrCtrl+Shift+E', click: () => sendToFocused('export-png') },
            { label: t('exportHTML'), click: () => sendToFocused('export-html') },
            { type: 'separator' },
            { label: t('copyHTML'), accelerator: 'CmdOrCtrl+Shift+C', click: () => sendToFocused('copy-html') },
            { label: t('copyRendered'), click: () => sendToFocused('copy-rendered') }
          ]
        },
        { type: 'separator' },
        { role: 'close', label: t('close') },
        { role: 'quit', label: t('quit') }
      ]
    },
    {
      label: t('edit'),
      submenu: [
        { role: 'undo', label: t('undo') },
        { role: 'redo', label: t('redo') },
        { type: 'separator' },
        { role: 'cut', label: t('cut') },
        { role: 'copy', label: t('copy') },
        { role: 'paste', label: t('paste') },
        { role: 'selectAll', label: t('selectAll') },
        { type: 'separator' },
        { label: t('format'), accelerator: 'Alt+Shift+F', click: () => sendToFocused('format-html') }
      ]
    },
    {
      label: t('view'),
      submenu: [
        { label: t('viewEdit'), accelerator: 'CmdOrCtrl+1', click: () => sendToFocused('view-mode', 'edit') },
        { label: t('viewSplit'), accelerator: 'CmdOrCtrl+2', click: () => sendToFocused('view-mode', 'split') },
        { label: t('viewPreview'), accelerator: 'CmdOrCtrl+3', click: () => sendToFocused('view-mode', 'preview') },
        { type: 'separator' },
        { label: t('devicePhone'), accelerator: 'CmdOrCtrl+Shift+1', click: () => sendToFocused('device-mode', 'phone') },
        { label: t('deviceTablet'), accelerator: 'CmdOrCtrl+Shift+2', click: () => sendToFocused('device-mode', 'tablet') },
        { label: t('deviceDesktop'), accelerator: 'CmdOrCtrl+Shift+3', click: () => sendToFocused('device-mode', 'desktop') },
        { type: 'separator' },
        { label: t('toggleTheme'), accelerator: 'CmdOrCtrl+Shift+L', click: () => sendToFocused('toggle-dark') },
        { type: 'separator' },
        { role: 'reload', label: t('reload') },
        { role: 'toggleDevTools', label: t('devtools') },
        { type: 'separator' },
        { role: 'resetZoom', label: t('resetZoom') },
        { role: 'zoomIn', label: t('zoomIn') },
        { role: 'zoomOut', label: t('zoomOut') },
        { type: 'separator' },
        { role: 'togglefullscreen', label: t('fullscreen') }
      ]
    },
    {
      label: t('window'),
      submenu: [
        { role: 'minimize', label: t('minimize') },
        { role: 'zoom', label: t('zoom') },
        { type: 'separator' },
        { role: 'front', label: t('front') }
      ]
    },
    {
      label: t('help'),
      submenu: [
        { label: t('about'), click: () => sendToFocused('show-about') },
        { type: 'separator' },
        {
          label: t('language'),
          submenu: [
            { label: t('english'), type: 'radio', checked: currentLanguage === 'en', click: () => switchLanguage('en') },
            { label: t('chinese'), type: 'radio', checked: currentLanguage === 'zh', click: () => switchLanguage('zh') }
          ]
        }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow(filePath = null) {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: APP_NAME,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#F5F5F7',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: false
    }
  });

  windows.push(win);
  win.loadFile('renderer/index.html');

  if (process.env.HTMLPAD_DEBUG) {
    win.webContents.on('console-message', (_e, level, message, line, sourceId) => {
      const lvl = ['LOG', 'WARN', 'ERR', 'INFO'][level] || 'LOG';
      console.log(`[renderer:${lvl}] ${message} (${sourceId}:${line})`);
    });
  }
  if (process.env.HTMLPAD_DEVTOOLS) {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  win.on('closed', () => {
    const i = windows.indexOf(win);
    if (i > -1) windows.splice(i, 1);
  });

  if (filePath) {
    win.webContents.on('did-finish-load', async () => {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        win.webContents.send('file-opened', { path: filePath, content });
        store.set('lastOpenedFile', filePath);
        touchRecent(filePath, 'open');
      } catch (e) {
        console.error('Failed to open file:', e);
      }
    });
  }

  buildMenu(win);
  return win;
}

ipcMain.handle('read-file', async (_e, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('save-file', async (_e, { filePath, content }) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    store.set('lastOpenedFile', filePath);
    touchRecent(filePath, 'edit');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('save-file-as', async (e, payload) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  const result = await dialog.showSaveDialog(win, {
    defaultPath: payload.defaultPath || 'untitled.html',
    filters: [
      { name: 'HTML', extensions: ['html', 'htm'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  if (!result.canceled && result.filePath) {
    try {
      await fs.writeFile(result.filePath, payload.content, 'utf-8');
      store.set('lastOpenedFile', result.filePath);
      touchRecent(result.filePath, 'edit');
      return { success: true, filePath: result.filePath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  return { success: false, canceled: true };
});

ipcMain.handle('open-file-dialog', async (e) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  const result = await dialog.showOpenDialog(win, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'HTML', extensions: ['html', 'htm'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  if (result.canceled || !result.filePaths.length) return { success: false, canceled: true };
  const files = await Promise.all(result.filePaths.map(async p => ({
    path: p,
    content: await fs.readFile(p, 'utf-8')
  })));
  files.forEach(f => touchRecent(f.path, 'open'));
  return { success: true, files };
});

ipcMain.handle('get-last-file', () => store.get('lastOpenedFile'));
ipcMain.handle('get-language', () => currentLanguage);

ipcMain.handle('recent-files-list', async () => {
  const cutoff = Date.now() - RECENT_WINDOW_MS;
  const list = readRecent();
  const checked = await Promise.all(list.map(async (r) => {
    const ts = Math.max(r.openedAt || 0, r.modifiedAt || 0);
    if (ts < cutoff) return null;
    try {
      await fs.access(r.path);
      return { ...r, lastActiveAt: ts };
    } catch (_) {
      return null;
    }
  }));
  const surviving = checked.filter(Boolean).sort((a, b) => b.lastActiveAt - a.lastActiveAt);
  // 反向同步 store：把死链与超期的清掉，避免无限累积
  if (surviving.length !== list.length) {
    writeRecent(surviving.map(({ lastActiveAt, ...rest }) => rest));
  }
  return surviving;
});

ipcMain.handle('recent-files-touch', (_e, { path: p, kind }) => {
  touchRecent(p, kind);
  return { success: true };
});

ipcMain.handle('recent-files-remove', (_e, { path: p }) => {
  const list = readRecent().filter(r => r.path !== p);
  writeRecent(list);
  return { success: true };
});

ipcMain.handle('recent-files-clear', () => {
  writeRecent([]);
  return { success: true };
});

ipcMain.handle('export-pdf', async (e, { defaultPath, html }) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  const result = await dialog.showSaveDialog(win, {
    defaultPath: defaultPath || 'export.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });
  if (result.canceled || !result.filePath) return { success: false, canceled: true };
  try {
    const data = await renderAndExport(html, async (offscreen) => {
      return offscreen.webContents.printToPDF({
        printBackground: true,
        pageSize: 'A4',
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        preferCSSPageSize: true
      });
    });
    await fs.writeFile(result.filePath, data);
    return { success: true, filePath: result.filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('export-png-fullpage', async (e, { defaultPath, html }) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  const result = await dialog.showSaveDialog(win, {
    defaultPath: defaultPath || 'export.png',
    filters: [{ name: 'PNG', extensions: ['png'] }]
  });
  if (result.canceled || !result.filePath) return { success: false, canceled: true };
  try {
    const buf = await renderAndExport(html, async (offscreen) => {
      const image = await offscreen.webContents.capturePage();
      return image.toPNG();
    });
    await fs.writeFile(result.filePath, buf);
    return { success: true, filePath: result.filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 在隐藏窗口里完整渲染 html,自动撑高到内容自然高度,然后回调里执行 printToPDF/capturePage
async function renderAndExport(html, run) {
  const PRINT_WIDTH = 1024;
  const offscreen = new BrowserWindow({
    width: PRINT_WIDTH,
    height: 800,
    show: false,
    webPreferences: {
      offscreen: false,
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false
    }
  });
  try {
    const dataUrl = 'data:text/html;charset=UTF-8,' + encodeURIComponent(html);
    await offscreen.loadURL(dataUrl);
    // 等图片/字体
    await offscreen.webContents.executeJavaScript(`
      Promise.all([
        document.fonts ? document.fonts.ready : Promise.resolve(),
        ...Array.from(document.images).map(img =>
          img.complete ? Promise.resolve() :
          new Promise(r => { img.addEventListener('load', r); img.addEventListener('error', r); })
        )
      ]).then(() => true)
    `);
    // 量内容真实高度,把窗口撑到这个尺寸,再渲染一帧
    const fullHeight = await offscreen.webContents.executeJavaScript(`
      Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight
      )
    `);
    const targetHeight = Math.max(800, Math.ceil(fullHeight));
    offscreen.setContentSize(PRINT_WIDTH, targetHeight);
    await new Promise(r => setTimeout(r, 200));
    return await run(offscreen);
  } finally {
    if (!offscreen.isDestroyed()) offscreen.destroy();
  }
}

ipcMain.handle('export-binary', async (e, { defaultPath, dataUrl, filters }) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  const result = await dialog.showSaveDialog(win, {
    defaultPath: defaultPath || 'export.png',
    filters: filters || [{ name: 'PNG', extensions: ['png'] }]
  });
  if (result.canceled || !result.filePath) return { success: false, canceled: true };
  try {
    const b64 = dataUrl.split(',')[1];
    await fs.writeFile(result.filePath, Buffer.from(b64, 'base64'));
    return { success: true, filePath: result.filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('export-text', async (e, { defaultPath, content, filters }) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  const result = await dialog.showSaveDialog(win, {
    defaultPath: defaultPath || 'export.html',
    filters: filters || [{ name: 'HTML', extensions: ['html'] }]
  });
  if (result.canceled || !result.filePath) return { success: false, canceled: true };
  try {
    await fs.writeFile(result.filePath, content, 'utf-8');
    return { success: true, filePath: result.filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.on('open-external', (_e, url) => shell.openExternal(url));

ipcMain.handle('format-html', async (_e, { content }) => {
  try {
    const prettier = require('prettier');
    const formatted = await prettier.format(content || '', {
      parser: 'html',
      printWidth: 100,
      tabWidth: 2,
      htmlWhitespaceSensitivity: 'css'
    });
    return { success: true, content: formatted };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

app.on('open-file', (e, filePath) => {
  e.preventDefault();
  if (app.isReady()) {
    const w = BrowserWindow.getFocusedWindow();
    if (w) {
      fs.readFile(filePath, 'utf-8')
        .then(content => {
          w.webContents.send('file-opened', { path: filePath, content });
          touchRecent(filePath, 'open');
        })
        .catch(err => console.error(err));
    } else {
      createWindow(filePath);
    }
  } else {
    pendingFilePath = filePath;
  }
});

app.whenReady().then(() => {
  if (pendingFilePath) {
    createWindow(pendingFilePath);
    pendingFilePath = null;
  } else {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (windows.length === 0) createWindow();
});
