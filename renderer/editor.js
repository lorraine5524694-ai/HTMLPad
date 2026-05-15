// editor.js — Monaco 编辑器封装(从本地 node_modules 加载,无 CDN 依赖)

let monaco = null;
let monacoLoadPromise = null;

function loadMonaco() {
  if (monaco) return Promise.resolve(monaco);
  if (monacoLoadPromise) return monacoLoadPromise;

  monacoLoadPromise = new Promise((resolve, reject) => {
    const path = require('path');
    const fs = require('fs');

    const monacoBase = path.join(__dirname, '..', 'node_modules', 'monaco-editor', 'min');
    const loaderPath = path.join(monacoBase, 'vs', 'loader.js');

    if (!fs.existsSync(loaderPath)) {
      reject(new Error(`Monaco not found at ${loaderPath}. Run: npm install`));
      return;
    }

    // Monaco 的 AMD loader 需要 self.module = undefined
    const script = document.createElement('script');
    script.src = loaderPath;
    script.onload = () => {
      const baseUrl = 'file://' + monacoBase.replace(/\\/g, '/') + '/';
      window.require.config({
        baseUrl,
        paths: { vs: baseUrl + 'vs' }
      });

      window.require(['vs/editor/editor.main'], () => {
        monaco = window.monaco;
        configureMonaco(monaco);
        resolve(monaco);
      }, reject);
    };
    script.onerror = () => reject(new Error('Failed to load Monaco loader'));
    document.head.appendChild(script);
  });

  return monacoLoadPromise;
}

function configureMonaco(m) {
  // 苹果浅色风的自定义 light 主题
  m.editor.defineTheme('apple-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'tag', foreground: 'AD1A60' },
      { token: 'attribute.name', foreground: '0550AE' },
      { token: 'attribute.value', foreground: '116329' },
      { token: 'comment', foreground: '6E7781', fontStyle: 'italic' }
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#1D1D1F',
      'editor.lineHighlightBackground': '#F5F5F7',
      'editorLineNumber.foreground': '#C7C7CC',
      'editorLineNumber.activeForeground': '#8E8E93',
      'editor.selectionBackground': '#B3D7FF',
      'editorIndentGuide.background': '#F0F0F2',
      'editorIndentGuide.activeBackground': '#D1D1D6',
      'editorCursor.foreground': '#007AFF'
    }
  });

  m.editor.defineTheme('apple-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'tag', foreground: 'FF7AB6' },
      { token: 'attribute.name', foreground: '79C0FF' },
      { token: 'attribute.value', foreground: '7EE787' },
      { token: 'comment', foreground: '8B949E', fontStyle: 'italic' }
    ],
    colors: {
      'editor.background': '#1C1C1E',
      'editor.foreground': '#F2F2F7',
      'editor.lineHighlightBackground': '#2C2C2E',
      'editorLineNumber.foreground': '#48484A',
      'editorLineNumber.activeForeground': '#AEAEB2',
      'editorCursor.foreground': '#0A84FF'
    }
  });

  // HTML 增强:自动闭合标签 + 基础 Emmet 缩写
  m.languages.registerCompletionItemProvider('html', {
    triggerCharacters: ['!', '.', '#', '>', '*', '+'],
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const line = model.getLineContent(position.lineNumber);
      const before = line.slice(0, position.column - 1);

      const suggestions = [];

      // ! → 完整 HTML5 模板
      if (before.trim() === '!') {
        suggestions.push({
          label: '! → HTML5 boilerplate',
          kind: m.languages.CompletionItemKind.Snippet,
          insertText: [
            '<!DOCTYPE html>',
            '<html lang="zh-CN">',
            '<head>',
            '  <meta charset="UTF-8">',
            '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
            '  <title>${1:Document}</title>',
            '</head>',
            '<body>',
            '  ${0}',
            '</body>',
            '</html>'
          ].join('\n'),
          insertTextRules: m.languages.CompletionItemRules?.InsertAsSnippet ?? 4,
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: before.indexOf('!') + 1,
            endColumn: position.column
          }
        });
      }

      // 常用 Emmet 缩写
      const emmet = {
        'div': '<div>${0}</div>',
        'p': '<p>${0}</p>',
        'a': '<a href="${1:#}">${0}</a>',
        'img': '<img src="${1}" alt="${2}">',
        'ul>li*3': '<ul>\n  <li>${1}</li>\n  <li>${2}</li>\n  <li>${0}</li>\n</ul>',
        'btn': '<button>${0}</button>',
        'h1': '<h1>${0}</h1>',
        'link:css': '<link rel="stylesheet" href="${1:style.css}">',
        'script:src': '<script src="${1}"></script>'
      };
      Object.entries(emmet).forEach(([key, val]) => {
        if (key.startsWith(word.word)) {
          suggestions.push({
            label: key,
            kind: m.languages.CompletionItemKind.Snippet,
            insertText: val,
            insertTextRules: 4,
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn
            }
          });
        }
      });

      return { suggestions };
    }
  });
}

async function createEditor(container, initialValue, onChange) {
  const m = await loadMonaco();
  const editor = m.editor.create(container, {
    value: initialValue || '',
    language: 'html',
    theme: document.documentElement.dataset.theme === 'dark' ? 'apple-dark' : 'apple-light',
    fontSize: 13,
    fontFamily: 'SF Mono, Menlo, Consolas, monospace',
    fontLigatures: true,
    lineNumbers: 'on',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    automaticLayout: true,
    padding: { top: 16, bottom: 16 },
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    renderLineHighlight: 'line',
    tabSize: 2,
    autoClosingTags: true,
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    formatOnPaste: false,
    bracketPairColorization: { enabled: true },
    guides: { indentation: true, bracketPairs: true }
  });

  if (onChange) {
    editor.onDidChangeModelContent(() => onChange(editor.getValue()));
  }

  return editor;
}

function setEditorTheme(editor, isDark) {
  if (!monaco || !editor) return;
  monaco.editor.setTheme(isDark ? 'apple-dark' : 'apple-light');
}

window.HTMLPadEditor = { createEditor, setEditorTheme, loadMonaco };
