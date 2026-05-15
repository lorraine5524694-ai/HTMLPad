// exporters/pdf.js — 走 Electron printToPDF。
// 临时把 iframe 内容投影到主窗口当前页面,打印当前 webContents。
// 简化方案:打开一个新隐藏窗口加载 srcdoc 然后打印——这里直接由主窗口打印 iframe 范围比较复杂,
// 所以我们改方案:通过 main 进程的 export-pdf 直接打印当前 BrowserWindow,
// 而为了只打印预览部分,渲染层临时切换到"打印模式"(隐藏其他 UI)。

async function exportPDF(state, ipcRenderer) {
  const previewFrame = document.getElementById('previewFrame');
  if (!previewFrame || !previewFrame.contentDocument) {
    throw new Error('预览未就绪');
  }

  // 进入打印模式:隐藏 UI 只显示 iframe
  document.body.classList.add('print-mode');
  const html = previewFrame.contentDocument.documentElement.outerHTML;

  // 用一个临时全屏 iframe 承载,确保打印的是预览内容而不是壳子
  const tmp = document.createElement('iframe');
  tmp.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;border:none;background:white;z-index:99999;';
  tmp.srcdoc = html;
  document.body.appendChild(tmp);

  await new Promise(r => tmp.onload = r);
  await new Promise(r => setTimeout(r, 200));

  const defaultName = (state.activeTab?.filePath?.split('/').pop() || 'untitled').replace(/\.html?$/i, '') + '.pdf';
  const result = await ipcRenderer.invoke('export-pdf', { defaultPath: defaultName });

  document.body.removeChild(tmp);
  document.body.classList.remove('print-mode');

  return result;
}

window.HTMLPadExportPDF = exportPDF;
