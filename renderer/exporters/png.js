// exporters/png.js — 把组装好的预览 HTML 发给主进程,在隐藏窗口里完整渲染后 capturePage 为 PNG 长图。

async function exportPNG(state, ipcRenderer) {
  const tab = state.activeTab;
  if (!tab) throw new Error('无活动文档');
  if (typeof window.HTMLPadBuildExportHTML !== 'function') {
    throw new Error('导出模块未加载');
  }
  const themeCSS = (window.HTMLPadThemes.find(t => t.id === state.themeId) || {}).css || '';
  const html = window.HTMLPadBuildExportHTML(tab.content || '', themeCSS);
  const defaultName = (tab.filePath?.split('/').pop() || tab.name || 'untitled').replace(/\.html?$/i, '') + '.png';
  return ipcRenderer.invoke('export-png-fullpage', { defaultPath: defaultName, html });
}

window.HTMLPadExportPNG = exportPNG;
