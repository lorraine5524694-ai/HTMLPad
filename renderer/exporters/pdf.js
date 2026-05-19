// exporters/pdf.js — 把组装好的预览 HTML 发给主进程,在隐藏窗口里完整渲染后 printToPDF。

async function exportPDF(state, ipcRenderer) {
  const tab = state.activeTab;
  if (!tab) throw new Error('无活动文档');
  const html = buildExportHTML(tab.content || '', getCurrentThemeCSSForExport(state));
  const defaultName = (tab.filePath?.split('/').pop() || tab.name || 'untitled').replace(/\.html?$/i, '') + '.pdf';
  return ipcRenderer.invoke('export-pdf', { defaultPath: defaultName, html });
}

function getCurrentThemeCSSForExport(state) {
  const theme = window.HTMLPadThemes.find(t => t.id === state.themeId);
  return theme?.css || '';
}

// 组装完整 HTML:注入主题 CSS,注入 <html>/<body> 的 .htmlpad-theme class
function buildExportHTML(html, themeCSS) {
  const isCompleteDoc = /<html[\s>]/i.test(html) || /<!DOCTYPE/i.test(html);
  const styleTag = themeCSS ? `<style data-htmlpad-theme>${themeCSS}</style>` : '';
  if (isCompleteDoc) {
    let out = html;
    if (themeCSS) {
      out = applyClass(out, 'html', 'htmlpad-theme');
      out = applyClass(out, 'body', 'htmlpad-theme');
    }
    if (/<\/head>/i.test(out)) {
      out = out.replace(/<\/head>/i, `${styleTag}</head>`);
    } else if (/<head(\s[^>]*)?>/i.test(out)) {
      out = out.replace(/<head(\s[^>]*)?>/i, m => `${m}${styleTag}`);
    } else if (/<html([^>]*)>/i.test(out)) {
      out = out.replace(/<html([^>]*)>/i, `<html$1><head>${styleTag}</head>`);
    } else {
      out = `<!DOCTYPE html><html><head>${styleTag}</head><body>${out}</body></html>`;
    }
    return out;
  }
  return `<!DOCTYPE html>
<html lang="zh-CN"${themeCSS ? ' class="htmlpad-theme"' : ''}>
<head><meta charset="UTF-8">${styleTag}</head>
<body${themeCSS ? ' class="htmlpad-theme"' : ''}>${html}</body>
</html>`;
}

function applyClass(html, tagName, className) {
  const re = new RegExp(`<${tagName}(\\s[^>]*)?>`, 'i');
  if (!re.test(html)) return html;
  return html.replace(re, (_m, attr = '') => {
    if (/class\s*=/i.test(attr)) {
      return `<${tagName}${attr.replace(/class\s*=\s*(["'])(.*?)\1/i, (_mm, q, v) => `class=${q}${v} ${className}${q}`)}>`;
    }
    return `<${tagName}${attr || ''} class="${className}">`;
  });
}

window.HTMLPadExportPDF = exportPDF;
window.HTMLPadBuildExportHTML = buildExportHTML;
