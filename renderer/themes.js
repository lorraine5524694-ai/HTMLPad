// themes.js — 10 套阅读增强主题。
// 实现策略:把这些 CSS 注入到 iframe head,通过 :root 包裹覆盖,不破坏用户 HTML。
// 每套主题在 HTML 的 body 上添加 .htmlpad-theme-<id> class 以获得作用域。

const THEMES = [
  {
    id: 'native',
    name: '原生',
    css: ''
  },
  {
    id: 'reader',
    name: '阅读模式',
    css: `
      html.htmlpad-theme { font-size: 16px; background: #FBFAF7; }
      body.htmlpad-theme {
        max-width: 720px;
        margin: 0 auto;
        padding: 60px 24px;
        font-family: "Charter", "Iowan Old Style", "Source Serif Pro", "PingFang SC", serif;
        font-size: 1.0625rem;
        line-height: 1.78;
        color: #2C2C2E;
        background: transparent;
      }
      body.htmlpad-theme h1, body.htmlpad-theme h2, body.htmlpad-theme h3 {
        font-family: -apple-system, "SF Pro Display", "PingFang SC", sans-serif;
        font-weight: 700;
        letter-spacing: -0.02em;
        margin: 1.6em 0 0.6em;
      }
      body.htmlpad-theme h1 { font-size: 2rem; }
      body.htmlpad-theme h2 { font-size: 1.5rem; }
      body.htmlpad-theme p { margin: 1em 0; }
      body.htmlpad-theme a { color: #007AFF; text-decoration: none; border-bottom: 1px solid rgba(0,122,255,.3); }
      body.htmlpad-theme img { max-width: 100%; border-radius: 8px; }
      body.htmlpad-theme code { font-family: "SF Mono", Menlo, monospace; background: #F0EFEA; padding: 2px 6px; border-radius: 4px; font-size: .9em; }
      body.htmlpad-theme pre { background: #2C2C2E; color: #F2F2F7; padding: 16px; border-radius: 10px; overflow-x: auto; }
      body.htmlpad-theme pre code { background: transparent; color: inherit; padding: 0; }
      body.htmlpad-theme blockquote { border-left: 3px solid #C7C7CC; padding-left: 16px; color: #6E6E73; font-style: italic; }
    `
  },
  {
    id: 'paper',
    name: '报纸风',
    css: `
      html.htmlpad-theme { font-size: 15px; background: #F4EFE6; }
      body.htmlpad-theme {
        max-width: 820px;
        margin: 0 auto;
        padding: 56px 32px;
        font-family: "Times New Roman", "Source Han Serif SC", "Noto Serif CJK SC", serif;
        line-height: 1.85;
        color: #1A1A1A;
        background: transparent;
        column-rule: 1px solid rgba(0,0,0,.1);
      }
      body.htmlpad-theme h1 {
        font-size: 2.6rem;
        font-weight: 900;
        text-align: center;
        border-bottom: 3px double #1A1A1A;
        padding-bottom: 12px;
        margin-bottom: 28px;
        letter-spacing: -0.01em;
      }
      body.htmlpad-theme h2 {
        font-size: 1.5rem;
        font-weight: 700;
        border-bottom: 1px solid #1A1A1A;
        padding-bottom: 4px;
      }
      body.htmlpad-theme p:first-of-type::first-letter {
        font-size: 3em;
        float: left;
        line-height: .85;
        padding: 6px 8px 0 0;
        font-weight: 700;
      }
      body.htmlpad-theme p { text-indent: 2em; margin: 0.8em 0; text-align: justify; }
      body.htmlpad-theme img { max-width: 100%; filter: grayscale(.2) contrast(1.05); border: 1px solid #1A1A1A; }
    `
  },
  {
    id: 'notion',
    name: 'Notion 简洁',
    css: `
      html.htmlpad-theme { font-size: 16px; background: #FFFFFF; }
      body.htmlpad-theme {
        max-width: 720px;
        margin: 0 auto;
        padding: 96px 96px 200px;
        font-family: -apple-system, "SF Pro Text", "PingFang SC", "Inter", sans-serif;
        font-size: 1rem;
        line-height: 1.7;
        color: rgba(55, 53, 47, .95);
      }
      body.htmlpad-theme h1 { font-size: 2.25rem; font-weight: 700; letter-spacing: -0.025em; margin: .8em 0 .5em; }
      body.htmlpad-theme h2 { font-size: 1.5rem; font-weight: 600; letter-spacing: -0.015em; margin: 1.4em 0 .4em; }
      body.htmlpad-theme h3 { font-size: 1.25rem; font-weight: 600; margin: 1em 0 .3em; }
      body.htmlpad-theme p { margin: .25em 0; }
      body.htmlpad-theme a { color: rgba(55,53,47,1); text-decoration: underline; text-decoration-color: rgba(55,53,47,.4); }
      body.htmlpad-theme code { background: rgba(135,131,120,.15); color: #EB5757; padding: 2px 4px; border-radius: 3px; font-size: .85em; }
      body.htmlpad-theme pre { background: #F7F6F3; padding: 16px; border-radius: 4px; }
      body.htmlpad-theme blockquote { border-left: 3px solid currentColor; padding-left: 14px; margin: 1em 0; }
      body.htmlpad-theme hr { border: none; height: 1px; background: rgba(55,53,47,.1); margin: 2em 0; }
    `
  },
  {
    id: 'github',
    name: 'GitHub 文档',
    css: `
      html.htmlpad-theme { font-size: 16px; background: #FFFFFF; }
      body.htmlpad-theme {
        max-width: 1012px;
        margin: 0 auto;
        padding: 48px 32px;
        font-family: -apple-system, "Segoe UI", "Helvetica Neue", sans-serif;
        font-size: 1rem;
        line-height: 1.5;
        color: #1F2328;
      }
      body.htmlpad-theme h1, body.htmlpad-theme h2 { border-bottom: 1px solid #D1D9E0; padding-bottom: .3em; }
      body.htmlpad-theme h1 { font-size: 2em; font-weight: 600; }
      body.htmlpad-theme h2 { font-size: 1.5em; font-weight: 600; }
      body.htmlpad-theme a { color: #0969DA; text-decoration: none; }
      body.htmlpad-theme a:hover { text-decoration: underline; }
      body.htmlpad-theme code { background: rgba(175,184,193,.2); padding: .2em .4em; border-radius: 6px; font-family: "SF Mono", Menlo, monospace; font-size: 85%; }
      body.htmlpad-theme pre { background: #F6F8FA; padding: 16px; border-radius: 6px; overflow-x: auto; }
      body.htmlpad-theme pre code { background: transparent; padding: 0; }
      body.htmlpad-theme blockquote { border-left: 4px solid #D1D9E0; color: #59636E; padding: 0 1em; }
      body.htmlpad-theme table { border-collapse: collapse; }
      body.htmlpad-theme th, body.htmlpad-theme td { border: 1px solid #D1D9E0; padding: 6px 13px; }
      body.htmlpad-theme th { background: #F6F8FA; font-weight: 600; }
    `
  },
  {
    id: 'apple',
    name: 'Apple 文档',
    css: `
      html.htmlpad-theme { font-size: 17px; background: #FFFFFF; }
      body.htmlpad-theme {
        max-width: 1024px;
        margin: 0 auto;
        padding: 80px 40px;
        font-family: -apple-system, "SF Pro Display", "SF Pro Text", "PingFang SC", sans-serif;
        line-height: 1.5;
        color: #1D1D1F;
        letter-spacing: -0.003em;
      }
      body.htmlpad-theme h1 {
        font-size: 48px;
        font-weight: 700;
        letter-spacing: -0.025em;
        line-height: 1.08;
        margin: .8em 0 .4em;
      }
      body.htmlpad-theme h2 { font-size: 32px; font-weight: 600; letter-spacing: -0.02em; }
      body.htmlpad-theme h3 { font-size: 24px; font-weight: 600; }
      body.htmlpad-theme p { font-size: 17px; line-height: 1.47; color: #424245; margin: 1em 0; }
      body.htmlpad-theme a { color: #0066CC; text-decoration: none; }
      body.htmlpad-theme a:hover { text-decoration: underline; }
      body.htmlpad-theme code { font-family: "SF Mono", Menlo, monospace; background: #F5F5F7; padding: 2px 6px; border-radius: 4px; }
      body.htmlpad-theme pre { background: #1D1D1F; color: #F5F5F7; padding: 20px; border-radius: 12px; }
      body.htmlpad-theme pre code { background: transparent; color: inherit; }
    `
  },
  {
    id: 'magazine',
    name: '杂志风',
    css: `
      html.htmlpad-theme { font-size: 16px; background: #FAF8F5; }
      body.htmlpad-theme {
        max-width: 800px;
        margin: 0 auto;
        padding: 80px 40px;
        font-family: "Cormorant Garamond", "Source Han Serif SC", Georgia, serif;
        line-height: 1.75;
        color: #2A2A2A;
      }
      body.htmlpad-theme h1 {
        font-size: 4rem;
        font-weight: 300;
        line-height: 1.05;
        letter-spacing: -0.03em;
        text-align: center;
        margin: 0 0 .3em;
      }
      body.htmlpad-theme h2 {
        font-size: 2rem;
        font-weight: 400;
        font-style: italic;
        text-align: center;
        margin-bottom: 1em;
        color: #8B7355;
      }
      body.htmlpad-theme h1 + p, body.htmlpad-theme h2 + p {
        text-align: center;
        font-style: italic;
        color: #6E6E73;
        font-size: 1.1rem;
      }
      body.htmlpad-theme p { font-size: 1.05rem; }
      body.htmlpad-theme p:first-of-type::first-letter {
        font-size: 5em;
        float: left;
        line-height: .8;
        padding: 8px 12px 0 0;
        font-weight: 400;
        color: #8B7355;
      }
      body.htmlpad-theme blockquote {
        font-size: 1.5rem;
        font-style: italic;
        text-align: center;
        border: none;
        margin: 2em 0;
        color: #8B7355;
      }
    `
  },
  {
    id: 'terminal',
    name: '终端绿屏',
    css: `
      html.htmlpad-theme { background: #0A0E14; }
      body.htmlpad-theme {
        max-width: 900px;
        margin: 0 auto;
        padding: 40px;
        font-family: "SF Mono", "JetBrains Mono", "Cascadia Code", Menlo, monospace;
        font-size: 14px;
        line-height: 1.7;
        color: #5DD78B;
        background: transparent;
      }
      body.htmlpad-theme::before {
        content: "$ render --theme=terminal\\A";
        white-space: pre;
        color: #8E8E93;
        display: block;
        margin-bottom: 20px;
      }
      body.htmlpad-theme h1, body.htmlpad-theme h2, body.htmlpad-theme h3 { color: #6BE0FF; font-weight: 700; }
      body.htmlpad-theme h1::before { content: "## "; opacity: .5; }
      body.htmlpad-theme h2::before { content: "### "; opacity: .5; }
      body.htmlpad-theme a { color: #FFD60A; text-decoration: underline; }
      body.htmlpad-theme code { color: #FF7AB6; background: rgba(255,255,255,.05); padding: 1px 5px; border-radius: 3px; }
      body.htmlpad-theme pre { background: rgba(255,255,255,.04); padding: 16px; border-left: 3px solid #5DD78B; border-radius: 0 4px 4px 0; }
      body.htmlpad-theme blockquote { border-left: 3px solid #FFD60A; color: #FFD60A; padding-left: 12px; }
    `
  },
  {
    id: 'print',
    name: '打印优化',
    css: `
      html.htmlpad-theme { background: white; font-size: 12pt; }
      body.htmlpad-theme {
        max-width: 21cm;
        margin: 0 auto;
        padding: 2.5cm 2cm;
        font-family: "Times New Roman", "Source Han Serif SC", serif;
        line-height: 1.6;
        color: black;
        background: white;
      }
      body.htmlpad-theme h1 { font-size: 22pt; text-align: center; margin-bottom: 16pt; }
      body.htmlpad-theme h2 { font-size: 16pt; }
      body.htmlpad-theme h3 { font-size: 13pt; }
      body.htmlpad-theme p { margin: 8pt 0; text-align: justify; }
      body.htmlpad-theme a { color: black; text-decoration: underline; }
      body.htmlpad-theme img { max-width: 100%; }
      body.htmlpad-theme pre, body.htmlpad-theme code { font-family: "Courier New", monospace; font-size: 10pt; }
      body.htmlpad-theme pre { border: 1px solid #888; padding: 8pt; background: #F8F8F8; }
    `
  },
  {
    id: 'sepia',
    name: '护眼米色',
    css: `
      html.htmlpad-theme { background: #F4ECD8; }
      body.htmlpad-theme {
        max-width: 720px;
        margin: 0 auto;
        padding: 56px 32px;
        font-family: "Georgia", "Source Han Serif SC", "PingFang SC", serif;
        font-size: 17px;
        line-height: 1.8;
        color: #5B4636;
        background: transparent;
      }
      body.htmlpad-theme h1, body.htmlpad-theme h2, body.htmlpad-theme h3 { color: #3E2C1C; font-weight: 700; }
      body.htmlpad-theme h1 { font-size: 2em; margin: 1em 0 .5em; }
      body.htmlpad-theme h2 { font-size: 1.5em; }
      body.htmlpad-theme a { color: #8B4513; text-decoration: underline; text-decoration-color: rgba(139,69,19,.4); }
      body.htmlpad-theme code { background: rgba(139,69,19,.1); color: #5B4636; padding: 2px 5px; border-radius: 3px; font-family: "SF Mono", monospace; }
      body.htmlpad-theme pre { background: #EDE0C8; padding: 16px; border-radius: 6px; border-left: 3px solid #8B4513; }
      body.htmlpad-theme blockquote { border-left: 3px solid #8B4513; color: #6B5440; padding-left: 16px; font-style: italic; }
    `
  }
];

window.HTMLPadThemes = THEMES;
