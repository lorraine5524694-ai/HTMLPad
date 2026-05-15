// exporters/html.js — 导出带主题样式的独立 HTML 文件

async function exportHTML(state, ipcRenderer, themeCSS) {
  const sourceHtml = state.activeTab?.content || '';
  const finalHtml = window.HTMLPadPreview.injectTheme(sourceHtml, themeCSS);

  const defaultName = (state.activeTab?.filePath?.split('/').pop() || 'untitled.html');
  const result = await ipcRenderer.invoke('export-text', {
    defaultPath: defaultName,
    content: finalHtml,
    filters: [{ name: 'HTML', extensions: ['html'] }]
  });
  return result;
}

window.HTMLPadExportHTML = exportHTML;
