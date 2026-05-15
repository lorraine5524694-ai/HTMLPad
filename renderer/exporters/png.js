// exporters/png.js — 用 html-to-image 把 iframe 内容截成 PNG 长图

async function exportPNG(state, ipcRenderer) {
  const previewFrame = document.getElementById('previewFrame');
  if (!previewFrame || !previewFrame.contentDocument) {
    throw new Error('预览未就绪');
  }

  const htmlToImage = require('html-to-image');
  const target = previewFrame.contentDocument.body;
  if (!target) throw new Error('预览内容为空');

  // 临时调整尺寸:让 iframe 自然撑开到完整高度
  const originalHeight = previewFrame.style.height;
  previewFrame.style.height = target.scrollHeight + 'px';

  try {
    const dataUrl = await htmlToImage.toPng(target, {
      backgroundColor: getComputedStyle(target).backgroundColor || '#FFFFFF',
      pixelRatio: 2,
      width: target.scrollWidth,
      height: target.scrollHeight,
      cacheBust: true
    });

    const defaultName = (state.activeTab?.filePath?.split('/').pop() || 'untitled').replace(/\.html?$/i, '') + '.png';
    const result = await ipcRenderer.invoke('export-binary', {
      defaultPath: defaultName,
      dataUrl,
      filters: [{ name: 'PNG', extensions: ['png'] }]
    });
    return result;
  } finally {
    previewFrame.style.height = originalHeight;
  }
}

window.HTMLPadExportPNG = exportPNG;
