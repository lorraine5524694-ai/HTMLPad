// preview.js — iframe 预览,负责注入主题、设置设备外框、隔离脚本

function isCompleteDocument(html) {
  return /<html[\s>]/i.test(html) || /<!DOCTYPE/i.test(html);
}

function injectTheme(html, themeCSS) {
  if (!themeCSS) return html;

  // 把 html 元素和 body 元素加上 .htmlpad-theme class,且头部注入 CSS
  const styleTag = `<style data-htmlpad-theme>${themeCSS}</style>`;

  if (isCompleteDocument(html)) {
    let out = html;
    // <html> → <html class="htmlpad-theme">
    if (/<html(\s[^>]*)?>/i.test(out)) {
      out = out.replace(/<html(\s[^>]*)?>/i, (_m, attr = '') => {
        if (/class\s*=/i.test(attr)) {
          return `<html${attr.replace(/class\s*=\s*(["'])(.*?)\1/i, (_mm, q, v) => `class=${q}${v} htmlpad-theme${q}`)}>`;
        }
        return `<html${attr || ''} class="htmlpad-theme">`;
      });
    }
    if (/<body(\s[^>]*)?>/i.test(out)) {
      out = out.replace(/<body(\s[^>]*)?>/i, (_m, attr = '') => {
        if (/class\s*=/i.test(attr)) {
          return `<body${attr.replace(/class\s*=\s*(["'])(.*?)\1/i, (_mm, q, v) => `class=${q}${v} htmlpad-theme${q}`)}>`;
        }
        return `<body${attr || ''} class="htmlpad-theme">`;
      });
    }
    // 注入 style 到 head
    if (/<\/head>/i.test(out)) {
      out = out.replace(/<\/head>/i, `${styleTag}</head>`);
    } else {
      out = out.replace(/<html([^>]*)>/i, `<html$1><head>${styleTag}</head>`);
    }
    return out;
  }

  // 片段:包成完整文档
  return `<!DOCTYPE html>
<html lang="zh-CN" class="htmlpad-theme">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${styleTag}
</head>
<body class="htmlpad-theme">
${html}
</body>
</html>`;
}

function ensureCharset(html) {
  if (!isCompleteDocument(html)) return html;
  if (/<meta[^>]+charset/i.test(html)) return html;
  return html.replace(/<head(\s[^>]*)?>/i, m => `${m}\n  <meta charset="UTF-8">`);
}

function setDevice(deviceFrame, mode) {
  deviceFrame.dataset.device = mode;
  const iframe = deviceFrame.querySelector('iframe');
  if (!iframe) return;
  if (mode === 'desktop') {
    autoResize(iframe);
  } else {
    iframe.style.height = '';
    if (iframe._htmlpadObserver) {
      iframe._htmlpadObserver.disconnect();
      iframe._htmlpadObserver = null;
    }
  }
}

function setTheme(iframe, html, themeCSS) {
  if (iframe._htmlpadObserver) {
    try { iframe._htmlpadObserver.disconnect(); } catch (e) {}
    iframe._htmlpadObserver = null;
  }
  const finalHtml = injectTheme(ensureCharset(html), themeCSS);
  iframe.onload = () => autoResize(iframe);
  iframe.srcdoc = finalHtml;
}

function autoResize(iframe) {
  const deviceFrame = iframe.parentElement;
  const device = deviceFrame?.dataset.device || 'desktop';
  if (device !== 'desktop') return;

  try {
    const doc = iframe.contentDocument;
    if (!doc || !doc.body) return;
    const measure = () => Math.max(
      doc.body.scrollHeight,
      doc.documentElement.scrollHeight,
      doc.body.offsetHeight,
      doc.documentElement.offsetHeight
    );
    iframe.style.height = measure() + 'px';

    if (typeof ResizeObserver !== 'undefined' && !iframe._htmlpadObserver) {
      const ro = new ResizeObserver(() => {
        iframe.style.height = measure() + 'px';
      });
      ro.observe(doc.body);
      iframe._htmlpadObserver = ro;
    }
  } catch (e) {
    console.warn('autoResize failed:', e);
  }
}

function getRenderedText(iframe) {
  try {
    return iframe.contentDocument?.body?.innerText || '';
  } catch (e) {
    return '';
  }
}

function getRenderedDOM(iframe) {
  try {
    return iframe.contentDocument?.documentElement;
  } catch (e) {
    return null;
  }
}

window.HTMLPadPreview = {
  injectTheme,
  setDevice,
  setTheme,
  getRenderedText,
  getRenderedDOM,
  isCompleteDocument
};
