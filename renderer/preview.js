// preview.js — iframe 预览,负责注入 base href、主题、设备外框、双向定位

function isCompleteDocument(html) {
  return /<html[\s>]/i.test(html) || /<!DOCTYPE/i.test(html);
}

// 把已有标签注入字符偏移量,用于点击预览 → 跳转编辑器光标
function injectSourceMap(html) {
  // 跳过 <!DOCTYPE> 和 <!-- 注释 --> 与 <script>/<style> 内部
  let result = '';
  let i = 0;
  const len = html.length;

  while (i < len) {
    const ch = html[i];

    // 跳过 <!-- 注释 --> 和 <!DOCTYPE>
    if (ch === '<' && html[i + 1] === '!') {
      const endComment = html.indexOf('-->', i);
      const endDoctype = html.indexOf('>', i);
      if (html.slice(i, i + 4) === '<!--' && endComment !== -1) {
        result += html.slice(i, endComment + 3);
        i = endComment + 3;
      } else if (endDoctype !== -1) {
        result += html.slice(i, endDoctype + 1);
        i = endDoctype + 1;
      } else {
        result += ch;
        i++;
      }
      continue;
    }

    // 跳过 <script>/<style> 内部内容
    if (ch === '<' && /^<(script|style)[\s>]/i.test(html.slice(i, i + 8))) {
      const tagMatch = html.slice(i).match(/^<(script|style)[\s>]/i);
      const tagName = tagMatch[1].toLowerCase();
      const closeTag = '</' + tagName;
      const close = html.toLowerCase().indexOf(closeTag, i + 1);
      if (close === -1) {
        result += html.slice(i);
        break;
      }
      // 把开标签注入,然后原样保留中间到结束
      const openEnd = html.indexOf('>', i);
      const openTag = html.slice(i, openEnd + 1);
      // 注入 data-htmlpad-id 到 script/style 的开标签
      const injectedOpen = openTag.replace(/^<(\w+)/, `<$1 data-htmlpad-id="${i}"`);
      result += injectedOpen + html.slice(openEnd + 1, close);
      i = close;
      continue;
    }

    // 普通开标签 <tag ...>
    if (ch === '<' && /^<\w/.test(html.slice(i, i + 2))) {
      const endTag = html.indexOf('>', i);
      if (endTag === -1) { result += ch; i++; continue; }
      const openTag = html.slice(i, endTag + 1);
      // 跳过自闭合检测,直接注入 data-htmlpad-id
      // 不注入到 <html>/<head>/<body> 因为这些内置元素改写后影响主题注入
      const tagNameMatch = openTag.match(/^<(\w+)/);
      const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : '';
      if (['html', 'head', 'body', 'meta', 'title', 'link', 'base'].includes(tagName)) {
        result += openTag;
      } else {
        // 已经有 data-htmlpad-id 就不重复注入
        if (/data-htmlpad-id/.test(openTag)) {
          result += openTag;
        } else {
          // 检查自闭合标签 </ 或 />
          const isSelfClose = openTag.endsWith('/>');
          const insertAt = isSelfClose ? openTag.length - 2 : openTag.length - 1;
          const inject = ` data-htmlpad-id="${i}"`;
          result += openTag.slice(0, insertAt) + inject + openTag.slice(insertAt);
        }
      }
      i = endTag + 1;
      continue;
    }

    result += ch;
    i++;
  }

  return result;
}

function injectBaseAndTheme(html, themeCSS, baseHref) {
  const baseTag = baseHref ? `<base href="${escapeAttr(baseHref)}">` : '';
  const styleTag = themeCSS ? `<style data-htmlpad-theme>${themeCSS}</style>` : '';
  // 注入用于双向定位的客户端脚本
  const bridgeScript = `<script data-htmlpad-bridge>
(function(){
  document.addEventListener('click', function(e) {
    var el = e.target;
    while (el && el !== document.documentElement) {
      var id = el.getAttribute && el.getAttribute('data-htmlpad-id');
      if (id) {
        try { window.parent.postMessage({ type: 'htmlpad-jump', offset: parseInt(id, 10) }, '*'); } catch(_){}
        // 高亮一下
        var prev = el.style.outline;
        el.style.outline = '2px solid #007AFF';
        el.style.outlineOffset = '2px';
        setTimeout(function(){ el.style.outline = prev || ''; el.style.outlineOffset=''; }, 600);
        return;
      }
      el = el.parentElement;
    }
  }, true);
})();
<\/script>`;

  if (isCompleteDocument(html)) {
    let out = html;
    // 主题 class 注入(只在主题 CSS 非空时)
    if (themeCSS) {
      out = applyClass(out, 'html', 'htmlpad-theme');
      out = applyClass(out, 'body', 'htmlpad-theme');
    }
    // 注入到 head
    const inject = baseTag + styleTag + bridgeScript;
    if (/<\/head>/i.test(out)) {
      out = out.replace(/<\/head>/i, `${inject}</head>`);
    } else if (/<head(\s[^>]*)?>/i.test(out)) {
      out = out.replace(/<head(\s[^>]*)?>/i, m => `${m}${inject}`);
    } else if (/<html([^>]*)>/i.test(out)) {
      out = out.replace(/<html([^>]*)>/i, `<html$1><head>${inject}</head>`);
    } else {
      out = inject + out;
    }
    return out;
  }

  // 片段 → 包成完整文档
  return `<!DOCTYPE html>
<html lang="zh-CN"${themeCSS ? ' class="htmlpad-theme"' : ''}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${baseTag}
  ${styleTag}
  ${bridgeScript}
</head>
<body${themeCSS ? ' class="htmlpad-theme"' : ''}>
${html}
</body>
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

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
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

// filePath:用户原文件的绝对路径,用来计算 base href 让相对资源能加载
function setPreview(iframe, html, themeCSS, filePath) {
  if (iframe._htmlpadObserver) {
    try { iframe._htmlpadObserver.disconnect(); } catch (e) {}
    iframe._htmlpadObserver = null;
  }
  const baseHref = filePath ? toFileUrl(dirOf(filePath)) + '/' : '';
  const mappedHtml = injectSourceMap(ensureCharset(html));
  const finalHtml = injectBaseAndTheme(mappedHtml, themeCSS, baseHref);
  iframe.onload = () => autoResize(iframe);
  iframe.srcdoc = finalHtml;
}

function dirOf(p) {
  if (!p) return '';
  const idx = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\'));
  return idx > 0 ? p.slice(0, idx) : p;
}

function toFileUrl(p) {
  if (!p) return '';
  const norm = p.replace(/\\/g, '/');
  return 'file://' + (norm.startsWith('/') ? '' : '/') + encodeURI(norm).replace(/#/g, '%23');
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

// 老 API 兼容:setTheme(iframe, html, themeCSS) → 等价于无 filePath 调用
function setTheme(iframe, html, themeCSS) {
  setPreview(iframe, html, themeCSS, null);
}

window.HTMLPadPreview = {
  injectBaseAndTheme,
  setDevice,
  setTheme,
  setPreview,
  getRenderedText,
  getRenderedDOM,
  isCompleteDocument
};
