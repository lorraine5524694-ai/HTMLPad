// themes.js — 10 套阅读增强主题。
// 注入策略:把这些 CSS 注入到 iframe head;<html>/<body> 加 .htmlpad-theme class。
// 选择器用 `html.htmlpad-theme body.htmlpad-theme` 取得 (0,0,2,2) 特异性,
// 配合关键属性 !important,确保覆盖用户 HTML 的内联 <style>。

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
      html.htmlpad-theme { font-size: 16px !important; background: #FBFAF7 !important; }
      html.htmlpad-theme body.htmlpad-theme {
        max-width: 720px !important;
        margin: 0 auto !important;
        padding: 60px 24px !important;
        font-family: "Charter", "Iowan Old Style", "Source Serif Pro", "PingFang SC", Georgia, serif !important;
        font-size: 1.0625rem !important;
        line-height: 1.78 !important;
        color: #2C2C2E !important;
        background: transparent !important;
      }
      html.htmlpad-theme body.htmlpad-theme h1,
      html.htmlpad-theme body.htmlpad-theme h2,
      html.htmlpad-theme body.htmlpad-theme h3 {
        font-family: -apple-system, "SF Pro Display", "PingFang SC", sans-serif !important;
        font-weight: 700 !important;
        letter-spacing: -0.02em !important;
        margin: 1.6em 0 0.6em !important;
        color: #1D1D1F !important;
      }
      html.htmlpad-theme body.htmlpad-theme h1 { font-size: 2rem !important; }
      html.htmlpad-theme body.htmlpad-theme h2 { font-size: 1.5rem !important; }
      html.htmlpad-theme body.htmlpad-theme p { margin: 1em 0 !important; }
      html.htmlpad-theme body.htmlpad-theme a { color: #007AFF !important; text-decoration: none !important; border-bottom: 1px solid rgba(0,122,255,.3) !important; }
      html.htmlpad-theme body.htmlpad-theme img { max-width: 100% !important; border-radius: 8px !important; }
      html.htmlpad-theme body.htmlpad-theme code { font-family: "SF Mono", Menlo, monospace !important; background: #F0EFEA !important; padding: 2px 6px !important; border-radius: 4px !important; font-size: .9em !important; }
      html.htmlpad-theme body.htmlpad-theme pre { background: #2C2C2E !important; color: #F2F2F7 !important; padding: 16px !important; border-radius: 10px !important; overflow-x: auto !important; }
      html.htmlpad-theme body.htmlpad-theme pre code { background: transparent !important; color: inherit !important; padding: 0 !important; }
      html.htmlpad-theme body.htmlpad-theme blockquote { border-left: 3px solid #C7C7CC !important; padding-left: 16px !important; color: #6E6E73 !important; font-style: italic !important; }
    `
  },
  {
    id: 'paper',
    name: '报纸风',
    css: `
      html.htmlpad-theme { font-size: 15px !important; background: #F4EFE6 !important; }
      html.htmlpad-theme body.htmlpad-theme {
        max-width: 820px !important;
        margin: 0 auto !important;
        padding: 56px 32px !important;
        font-family: "Times New Roman", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif !important;
        line-height: 1.85 !important;
        color: #1A1A1A !important;
        background: transparent !important;
      }
      html.htmlpad-theme body.htmlpad-theme h1 {
        font-size: 2.6rem !important;
        font-weight: 900 !important;
        text-align: center !important;
        border-bottom: 3px double #1A1A1A !important;
        padding-bottom: 12px !important;
        margin-bottom: 28px !important;
        letter-spacing: -0.01em !important;
        color: #1A1A1A !important;
      }
      html.htmlpad-theme body.htmlpad-theme h2 {
        font-size: 1.5rem !important;
        font-weight: 700 !important;
        border-bottom: 1px solid #1A1A1A !important;
        padding-bottom: 4px !important;
        color: #1A1A1A !important;
      }
      html.htmlpad-theme body.htmlpad-theme p:first-of-type::first-letter {
        font-size: 3em !important;
        float: left !important;
        line-height: .85 !important;
        padding: 6px 8px 0 0 !important;
        font-weight: 700 !important;
      }
      html.htmlpad-theme body.htmlpad-theme p { text-indent: 2em !important; margin: 0.8em 0 !important; text-align: justify !important; }
      html.htmlpad-theme body.htmlpad-theme img { max-width: 100% !important; filter: grayscale(.2) contrast(1.05) !important; border: 1px solid #1A1A1A !important; }
    `
  },
  {
    id: 'notion',
    name: 'Notion 简洁',
    css: `
      html.htmlpad-theme { font-size: 16px !important; background: #FFFFFF !important; }
      html.htmlpad-theme body.htmlpad-theme {
        max-width: 720px !important;
        margin: 0 auto !important;
        padding: 96px 96px 200px !important;
        font-family: -apple-system, "SF Pro Text", "PingFang SC", "Inter", sans-serif !important;
        font-size: 1rem !important;
        line-height: 1.7 !important;
        color: rgba(55, 53, 47, .95) !important;
        background: transparent !important;
      }
      html.htmlpad-theme body.htmlpad-theme h1 { font-size: 2.25rem !important; font-weight: 700 !important; letter-spacing: -0.025em !important; margin: .8em 0 .5em !important; color: rgb(55,53,47) !important; }
      html.htmlpad-theme body.htmlpad-theme h2 { font-size: 1.5rem !important; font-weight: 600 !important; letter-spacing: -0.015em !important; margin: 1.4em 0 .4em !important; color: rgb(55,53,47) !important; }
      html.htmlpad-theme body.htmlpad-theme h3 { font-size: 1.25rem !important; font-weight: 600 !important; margin: 1em 0 .3em !important; color: rgb(55,53,47) !important; }
      html.htmlpad-theme body.htmlpad-theme p { margin: .25em 0 !important; }
      html.htmlpad-theme body.htmlpad-theme a { color: rgba(55,53,47,1) !important; text-decoration: underline !important; text-decoration-color: rgba(55,53,47,.4) !important; }
      html.htmlpad-theme body.htmlpad-theme code { background: rgba(135,131,120,.15) !important; color: #EB5757 !important; padding: 2px 4px !important; border-radius: 3px !important; font-size: .85em !important; }
      html.htmlpad-theme body.htmlpad-theme pre { background: #F7F6F3 !important; padding: 16px !important; border-radius: 4px !important; }
      html.htmlpad-theme body.htmlpad-theme blockquote { border-left: 3px solid currentColor !important; padding-left: 14px !important; margin: 1em 0 !important; }
      html.htmlpad-theme body.htmlpad-theme hr { border: none !important; height: 1px !important; background: rgba(55,53,47,.1) !important; margin: 2em 0 !important; }
    `
  },
  {
    id: 'github',
    name: 'GitHub 文档',
    css: `
      html.htmlpad-theme { font-size: 16px !important; background: #FFFFFF !important; }
      html.htmlpad-theme body.htmlpad-theme {
        max-width: 1012px !important;
        margin: 0 auto !important;
        padding: 48px 32px !important;
        font-family: -apple-system, "Segoe UI", "Helvetica Neue", sans-serif !important;
        font-size: 1rem !important;
        line-height: 1.5 !important;
        color: #1F2328 !important;
        background: transparent !important;
      }
      html.htmlpad-theme body.htmlpad-theme h1, html.htmlpad-theme body.htmlpad-theme h2 { border-bottom: 1px solid #D1D9E0 !important; padding-bottom: .3em !important; color: #1F2328 !important; }
      html.htmlpad-theme body.htmlpad-theme h1 { font-size: 2em !important; font-weight: 600 !important; }
      html.htmlpad-theme body.htmlpad-theme h2 { font-size: 1.5em !important; font-weight: 600 !important; }
      html.htmlpad-theme body.htmlpad-theme a { color: #0969DA !important; text-decoration: none !important; }
      html.htmlpad-theme body.htmlpad-theme a:hover { text-decoration: underline !important; }
      html.htmlpad-theme body.htmlpad-theme code { background: rgba(175,184,193,.2) !important; padding: .2em .4em !important; border-radius: 6px !important; font-family: "SF Mono", Menlo, monospace !important; font-size: 85% !important; color: #1F2328 !important; }
      html.htmlpad-theme body.htmlpad-theme pre { background: #F6F8FA !important; padding: 16px !important; border-radius: 6px !important; overflow-x: auto !important; }
      html.htmlpad-theme body.htmlpad-theme pre code { background: transparent !important; padding: 0 !important; }
      html.htmlpad-theme body.htmlpad-theme blockquote { border-left: 4px solid #D1D9E0 !important; color: #59636E !important; padding: 0 1em !important; }
      html.htmlpad-theme body.htmlpad-theme table { border-collapse: collapse !important; }
      html.htmlpad-theme body.htmlpad-theme th, html.htmlpad-theme body.htmlpad-theme td { border: 1px solid #D1D9E0 !important; padding: 6px 13px !important; }
      html.htmlpad-theme body.htmlpad-theme th { background: #F6F8FA !important; font-weight: 600 !important; }
    `
  },
  {
    id: 'apple',
    name: 'Apple 文档',
    css: `
      html.htmlpad-theme { font-size: 17px !important; background: #FFFFFF !important; }
      html.htmlpad-theme body.htmlpad-theme {
        max-width: 1024px !important;
        margin: 0 auto !important;
        padding: 80px 40px !important;
        font-family: -apple-system, "SF Pro Display", "SF Pro Text", "PingFang SC", sans-serif !important;
        line-height: 1.5 !important;
        color: #1D1D1F !important;
        letter-spacing: -0.003em !important;
        background: transparent !important;
      }
      html.htmlpad-theme body.htmlpad-theme h1 {
        font-size: 48px !important;
        font-weight: 700 !important;
        letter-spacing: -0.025em !important;
        line-height: 1.08 !important;
        margin: .8em 0 .4em !important;
        color: #1D1D1F !important;
      }
      html.htmlpad-theme body.htmlpad-theme h2 { font-size: 32px !important; font-weight: 600 !important; letter-spacing: -0.02em !important; color: #1D1D1F !important; }
      html.htmlpad-theme body.htmlpad-theme h3 { font-size: 24px !important; font-weight: 600 !important; color: #1D1D1F !important; }
      html.htmlpad-theme body.htmlpad-theme p { font-size: 17px !important; line-height: 1.47 !important; color: #424245 !important; margin: 1em 0 !important; }
      html.htmlpad-theme body.htmlpad-theme a { color: #0066CC !important; text-decoration: none !important; }
      html.htmlpad-theme body.htmlpad-theme a:hover { text-decoration: underline !important; }
      html.htmlpad-theme body.htmlpad-theme code { font-family: "SF Mono", Menlo, monospace !important; background: #F5F5F7 !important; padding: 2px 6px !important; border-radius: 4px !important; color: #1D1D1F !important; }
      html.htmlpad-theme body.htmlpad-theme pre { background: #1D1D1F !important; color: #F5F5F7 !important; padding: 20px !important; border-radius: 12px !important; }
      html.htmlpad-theme body.htmlpad-theme pre code { background: transparent !important; color: inherit !important; }
    `
  },
  {
    id: 'magazine',
    name: '杂志风',
    css: `
      html.htmlpad-theme { font-size: 16px !important; background: #FAF8F5 !important; }
      html.htmlpad-theme body.htmlpad-theme {
        max-width: 800px !important;
        margin: 0 auto !important;
        padding: 80px 40px !important;
        font-family: "Cormorant Garamond", "Source Han Serif SC", Georgia, serif !important;
        line-height: 1.75 !important;
        color: #2A2A2A !important;
        background: transparent !important;
      }
      html.htmlpad-theme body.htmlpad-theme h1 {
        font-size: 4rem !important;
        font-weight: 300 !important;
        line-height: 1.05 !important;
        letter-spacing: -0.03em !important;
        text-align: center !important;
        margin: 0 0 .3em !important;
        color: #2A2A2A !important;
      }
      html.htmlpad-theme body.htmlpad-theme h2 {
        font-size: 2rem !important;
        font-weight: 400 !important;
        font-style: italic !important;
        text-align: center !important;
        margin-bottom: 1em !important;
        color: #8B7355 !important;
      }
      html.htmlpad-theme body.htmlpad-theme h1 + p,
      html.htmlpad-theme body.htmlpad-theme h2 + p {
        text-align: center !important;
        font-style: italic !important;
        color: #6E6E73 !important;
        font-size: 1.1rem !important;
      }
      html.htmlpad-theme body.htmlpad-theme p { font-size: 1.05rem !important; }
      html.htmlpad-theme body.htmlpad-theme p:first-of-type::first-letter {
        font-size: 5em !important;
        float: left !important;
        line-height: .8 !important;
        padding: 8px 12px 0 0 !important;
        font-weight: 400 !important;
        color: #8B7355 !important;
      }
      html.htmlpad-theme body.htmlpad-theme blockquote {
        font-size: 1.5rem !important;
        font-style: italic !important;
        text-align: center !important;
        border: none !important;
        margin: 2em 0 !important;
        color: #8B7355 !important;
      }
    `
  },
  {
    id: 'terminal',
    name: '终端绿屏',
    css: `
      html.htmlpad-theme { background: #0A0E14 !important; }
      html.htmlpad-theme body.htmlpad-theme {
        max-width: 900px !important;
        margin: 0 auto !important;
        padding: 40px !important;
        font-family: "SF Mono", "JetBrains Mono", "Cascadia Code", Menlo, monospace !important;
        font-size: 14px !important;
        line-height: 1.7 !important;
        color: #5DD78B !important;
        background: transparent !important;
      }
      html.htmlpad-theme body.htmlpad-theme::before {
        content: "$ render --theme=terminal\\A" !important;
        white-space: pre !important;
        color: #8E8E93 !important;
        display: block !important;
        margin-bottom: 20px !important;
      }
      html.htmlpad-theme body.htmlpad-theme h1,
      html.htmlpad-theme body.htmlpad-theme h2,
      html.htmlpad-theme body.htmlpad-theme h3 { color: #6BE0FF !important; font-weight: 700 !important; }
      html.htmlpad-theme body.htmlpad-theme h1::before { content: "## " !important; opacity: .5 !important; }
      html.htmlpad-theme body.htmlpad-theme h2::before { content: "### " !important; opacity: .5 !important; }
      html.htmlpad-theme body.htmlpad-theme a { color: #FFD60A !important; text-decoration: underline !important; }
      html.htmlpad-theme body.htmlpad-theme code { color: #FF7AB6 !important; background: rgba(255,255,255,.05) !important; padding: 1px 5px !important; border-radius: 3px !important; }
      html.htmlpad-theme body.htmlpad-theme pre { background: rgba(255,255,255,.04) !important; padding: 16px !important; border-left: 3px solid #5DD78B !important; border-radius: 0 4px 4px 0 !important; }
      html.htmlpad-theme body.htmlpad-theme blockquote { border-left: 3px solid #FFD60A !important; color: #FFD60A !important; padding-left: 12px !important; }
    `
  },
  {
    id: 'print',
    name: '打印优化',
    css: `
      html.htmlpad-theme { background: white !important; font-size: 12pt !important; }
      html.htmlpad-theme body.htmlpad-theme {
        max-width: 21cm !important;
        margin: 0 auto !important;
        padding: 2.5cm 2cm !important;
        font-family: "Times New Roman", "Source Han Serif SC", Georgia, serif !important;
        line-height: 1.6 !important;
        color: black !important;
        background: white !important;
      }
      html.htmlpad-theme body.htmlpad-theme h1 { font-size: 22pt !important; text-align: center !important; margin-bottom: 16pt !important; color: black !important; }
      html.htmlpad-theme body.htmlpad-theme h2 { font-size: 16pt !important; color: black !important; }
      html.htmlpad-theme body.htmlpad-theme h3 { font-size: 13pt !important; color: black !important; }
      html.htmlpad-theme body.htmlpad-theme p { margin: 8pt 0 !important; text-align: justify !important; }
      html.htmlpad-theme body.htmlpad-theme a { color: black !important; text-decoration: underline !important; }
      html.htmlpad-theme body.htmlpad-theme img { max-width: 100% !important; }
      html.htmlpad-theme body.htmlpad-theme pre,
      html.htmlpad-theme body.htmlpad-theme code { font-family: "Courier New", monospace !important; font-size: 10pt !important; }
      html.htmlpad-theme body.htmlpad-theme pre { border: 1px solid #888 !important; padding: 8pt !important; background: #F8F8F8 !important; }
    `
  },
  {
    id: 'sepia',
    name: '护眼米色',
    css: `
      html.htmlpad-theme { background: #F4ECD8 !important; }
      html.htmlpad-theme body.htmlpad-theme {
        max-width: 720px !important;
        margin: 0 auto !important;
        padding: 56px 32px !important;
        font-family: "Georgia", "Source Han Serif SC", "PingFang SC", serif !important;
        font-size: 17px !important;
        line-height: 1.8 !important;
        color: #5B4636 !important;
        background: transparent !important;
      }
      html.htmlpad-theme body.htmlpad-theme h1,
      html.htmlpad-theme body.htmlpad-theme h2,
      html.htmlpad-theme body.htmlpad-theme h3 { color: #3E2C1C !important; font-weight: 700 !important; }
      html.htmlpad-theme body.htmlpad-theme h1 { font-size: 2em !important; margin: 1em 0 .5em !important; }
      html.htmlpad-theme body.htmlpad-theme h2 { font-size: 1.5em !important; }
      html.htmlpad-theme body.htmlpad-theme a { color: #8B4513 !important; text-decoration: underline !important; text-decoration-color: rgba(139,69,19,.4) !important; }
      html.htmlpad-theme body.htmlpad-theme code { background: rgba(139,69,19,.1) !important; color: #5B4636 !important; padding: 2px 5px !important; border-radius: 3px !important; font-family: "SF Mono", monospace !important; }
      html.htmlpad-theme body.htmlpad-theme pre { background: #EDE0C8 !important; padding: 16px !important; border-radius: 6px !important; border-left: 3px solid #8B4513 !important; }
      html.htmlpad-theme body.htmlpad-theme blockquote { border-left: 3px solid #8B4513 !important; color: #6B5440 !important; padding-left: 16px !important; font-style: italic !important; }
    `
  },
  // ── 以下 4 套新主题灵感来自 https://github.com/zarazhangrui/beautiful-html-templates (MIT License) ──
  {
    id: 'vellum',
    name: '羊皮纸·深蓝',
    css: `
      html.htmlpad-theme { background: #2a3870 !important; }
      html.htmlpad-theme body.htmlpad-theme {
        max-width: 820px !important;
        margin: 0 auto !important;
        padding: 60px 40px !important;
        font-family: "DM Sans", "Noto Sans SC", system-ui, sans-serif !important;
        font-size: 1.05rem !important;
        line-height: 1.75 !important;
        color: #E8D85C !important;
        background: transparent !important;
      }
      html.htmlpad-theme body.htmlpad-theme h1,
      html.htmlpad-theme body.htmlpad-theme h2,
      html.htmlpad-theme body.htmlpad-theme h3 {
        font-family: "Cormorant Garamond", "Noto Serif SC", Georgia, serif !important;
        color: #F5E168 !important;
        font-weight: 500 !important;
      }
      html.htmlpad-theme body.htmlpad-theme h1 { font-size: 3rem !important; font-style: italic !important; letter-spacing: -0.02em !important; margin: .5em 0 !important; }
      html.htmlpad-theme body.htmlpad-theme h2 { font-size: 1.8rem !important; font-style: italic !important; color: rgba(232,216,92,.62) !important; }
      html.htmlpad-theme body.htmlpad-theme h3 { font-size: 1.3rem !important; color: rgba(232,216,92,.8) !important; }
      html.htmlpad-theme body.htmlpad-theme p { color: #E8D85C !important; margin: .8em 0 !important; }
      html.htmlpad-theme body.htmlpad-theme a { color: #F5E168 !important; text-decoration: underline !important; }
      html.htmlpad-theme body.htmlpad-theme code { font-family: "Courier Prime", monospace !important; color: #E8D85C !important; background: rgba(232,216,92,.12) !important; padding: 2px 6px !important; border-radius: 3px !important; }
      html.htmlpad-theme body.htmlpad-theme pre { background: rgba(255,255,255,.05) !important; padding: 16px !important; border-left: 3px solid #3a7878 !important; border-radius: 0 4px 4px 0 !important; }
      html.htmlpad-theme body.htmlpad-theme pre code { background: transparent !important; color: #E8D85C !important; }
      html.htmlpad-theme body.htmlpad-theme blockquote { border-left: 3px solid #3a7878 !important; color: rgba(232,216,92,.62) !important; padding-left: 16px !important; font-style: italic !important; }
      html.htmlpad-theme body.htmlpad-theme em { color: #F5E168 !important; font-style: italic !important; }
    `
  },
  {
    id: 'grove',
    name: '森林·羊皮',
    css: `
      html.htmlpad-theme { background: #192b1b !important; }
      html.htmlpad-theme body.htmlpad-theme {
        max-width: 800px !important;
        margin: 0 auto !important;
        padding: 60px 40px !important;
        font-family: "Jost", "Noto Sans SC", system-ui, sans-serif !important;
        font-size: 1rem !important;
        line-height: 1.7 !important;
        color: #d4cfbf !important;
        background: transparent !important;
      }
      html.htmlpad-theme body.htmlpad-theme h1,
      html.htmlpad-theme body.htmlpad-theme h2,
      html.htmlpad-theme body.htmlpad-theme h3 {
        font-family: "Playfair Display", "Noto Serif SC", Georgia, serif !important;
        color: #d4cfbf !important;
        font-weight: 400 !important;
        letter-spacing: -0.01em !important;
      }
      html.htmlpad-theme body.htmlpad-theme h1 { font-size: 2.4rem !important; margin: .5em 0 !important; }
      html.htmlpad-theme body.htmlpad-theme h2 { font-size: 1.6rem !important; margin: 1.2em 0 .6em !important; }
      html.htmlpad-theme body.htmlpad-theme h3 { font-size: 1.25rem !important; font-style: italic !important; color: #c8524a !important; }
      html.htmlpad-theme body.htmlpad-theme p { color: #d4cfbf !important; margin: .6em 0 !important; }
      html.htmlpad-theme body.htmlpad-theme a { color: #c8524a !important; text-decoration: none !important; border-bottom: 1px solid rgba(200,82,74,.4) !important; }
      html.htmlpad-theme body.htmlpad-theme code { font-family: "JetBrains Mono", monospace !important; background: rgba(212,207,191,.1) !important; color: #d4cfbf !important; padding: 2px 5px !important; border-radius: 3px !important; font-size: .9em !important; }
      html.htmlpad-theme body.htmlpad-theme pre { background: rgba(212,207,191,.06) !important; padding: 16px !important; border-radius: 4px !important; border-left: 3px solid #c8524a !important; }
      html.htmlpad-theme body.htmlpad-theme pre code { background: transparent !important; }
      html.htmlpad-theme body.htmlpad-theme blockquote { border-left: 3px solid #c8524a !important; color: rgba(212,207,191,.6) !important; padding-left: 16px !important; font-style: italic !important; }
      html.htmlpad-theme body.htmlpad-theme hr { border: none !important; border-top: 1px solid rgba(212,207,191,.12) !important; margin: 2em 0 !important; }
    `
  },
  {
    id: 'editorial-soft',
    name: '粉彩编辑风',
    css: `
      html.htmlpad-theme { background: #F2EEDF !important; }
      html.htmlpad-theme body.htmlpad-theme {
        max-width: 780px !important;
        margin: 0 auto !important;
        padding: 64px 40px !important;
        font-family: "Cormorant Garamond", "Noto Serif SC", Georgia, serif !important;
        font-size: 1.1rem !important;
        line-height: 1.8 !important;
        color: #2A241B !important;
        background: transparent !important;
      }
      html.htmlpad-theme body.htmlpad-theme h1,
      html.htmlpad-theme body.htmlpad-theme h2,
      html.htmlpad-theme body.htmlpad-theme h3 {
        font-family: "Work Sans", "Noto Sans SC", system-ui, sans-serif !important;
        color: #2A241B !important;
        font-weight: 500 !important;
        letter-spacing: -0.01em !important;
      }
      html.htmlpad-theme body.htmlpad-theme h1 { font-size: 2.2rem !important; margin: .4em 0 !important; }
      html.htmlpad-theme body.htmlpad-theme h2 { font-size: 1.5rem !important; color: #5C5345 !important; }
      html.htmlpad-theme body.htmlpad-theme h3 { font-size: 1.2rem !important; color: #5C5345 !important; }
      html.htmlpad-theme body.htmlpad-theme p { color: #2A241B !important; margin: .7em 0 !important; }
      html.htmlpad-theme body.htmlpad-theme a { color: #0969DA !important; text-decoration: none !important; border-bottom: 1px solid rgba(9,105,218,.3) !important; }
      html.htmlpad-theme body.htmlpad-theme code { font-family: "Courier Prime", monospace !important; background: #ECE6D2 !important; color: #2A241B !important; padding: 2px 6px !important; border-radius: 4px !important; }
      html.htmlpad-theme body.htmlpad-theme pre { background: #2A241B !important; color: #F2EEDF !important; padding: 20px !important; border-radius: 8px !important; }
      html.htmlpad-theme body.htmlpad-theme pre code { background: transparent !important; color: inherit !important; }
      html.htmlpad-theme body.htmlpad-theme blockquote { border-left: 4px solid #B7C7A8 !important; color: #5C5345 !important; padding-left: 16px !important; font-style: italic !important; }
      html.htmlpad-theme body.htmlpad-theme em { color: #5C5345 !important; }
    `
  },
  {
    id: 'coral',
    name: '珊瑚·墨黑',
    css: `
      html.htmlpad-theme { background: #1A1A1A !important; }
      html.htmlpad-theme body.htmlpad-theme {
        max-width: 820px !important;
        margin: 0 auto !important;
        padding: 60px 40px !important;
        font-family: "Inter", "Noto Sans SC", system-ui, sans-serif !important;
        font-size: 1rem !important;
        line-height: 1.7 !important;
        color: #d4d4d4 !important;
        background: transparent !important;
      }
      html.htmlpad-theme body.htmlpad-theme h1,
      html.htmlpad-theme body.htmlpad-theme h2,
      html.htmlpad-theme body.htmlpad-theme h3 {
        font-family: "Bebas Neue", "Noto Sans SC", sans-serif !important;
        color: #FFFFFF !important;
        letter-spacing: 0.05em !important;
        text-transform: uppercase !important;
      }
      html.htmlpad-theme body.htmlpad-theme h1 { font-size: 3.5rem !important; margin: .3em 0 !important; color: #E85D5D !important; }
      html.htmlpad-theme body.htmlpad-theme h2 { font-size: 2rem !important; margin: 1em 0 .5em !important; color: #FFFFFF !important; }
      html.htmlpad-theme body.htmlpad-theme h3 { font-size: 1.4rem !important; color: #FFFFFF !important; }
      html.htmlpad-theme body.htmlpad-theme p { color: #d4d4d4 !important; margin: .7em 0 !important; }
      html.htmlpad-theme body.htmlpad-theme a { color: #E85D5D !important; text-decoration: none !important; }
      html.htmlpad-theme body.htmlpad-theme a:hover { text-decoration: underline !important; }
      html.htmlpad-theme body.htmlpad-theme code { font-family: "Inter", monospace !important; background: rgba(255,255,255,.08) !important; color: #E85D5D !important; padding: 2px 6px !important; border-radius: 4px !important; }
      html.htmlpad-theme body.htmlpad-theme pre { background: rgba(232,93,93,.12) !important; padding: 16px !important; border-left: 3px solid #E85D5D !important; border-radius: 0 4px 4px 0 !important; }
      html.htmlpad-theme body.htmlpad-theme pre code { background: transparent !important; color: #FFFFFF !important; }
      html.htmlpad-theme body.htmlpad-theme blockquote { border-left: 3px solid #E85D5D !important; color: rgba(255,255,255,.6) !important; padding-left: 16px !important; font-style: italic !important; }
      html.htmlpad-theme body.htmlpad-theme hr { border: none !important; border-top: 1px solid rgba(255,255,255,.1) !important; margin: 2em 0 !important; }
    `
  },
  {
    id: 'signal',
    name: '墨蓝·象牙',
    css: `
      html.htmlpad-theme { background: #0D1B2A !important; }
      html.htmlpad-theme body.htmlpad-theme {
        max-width: 800px !important;
        margin: 0 auto !important;
        padding: 64px 48px !important;
        font-family: "Inter", "Noto Sans SC", system-ui, sans-serif !important;
        font-size: 1rem !important;
        line-height: 1.75 !important;
        color: #E8D9C0 !important;
        background: transparent !important;
      }
      html.htmlpad-theme body.htmlpad-theme h1,
      html.htmlpad-theme body.htmlpad-theme h2,
      html.htmlpad-theme body.htmlpad-theme h3 {
        font-family: "Playfair Display", "Noto Serif SC", Georgia, serif !important;
        color: #E8D9C0 !important;
        font-weight: 400 !important;
      }
      html.htmlpad-theme body.htmlpad-theme h1 { font-size: 2.5rem !important; letter-spacing: -0.02em !important; margin: .5em 0 !important; }
      html.htmlpad-theme body.htmlpad-theme h2 { font-size: 1.7rem !important; font-style: italic !important; color: #D4A574 !important; margin: 1em 0 .5em !important; }
      html.htmlpad-theme body.htmlpad-theme h3 { font-size: 1.3rem !important; color: #D4A574 !important; }
      html.htmlpad-theme body.htmlpad-theme p { color: #E8D9C0 !important; margin: .6em 0 !important; }
      html.htmlpad-theme body.htmlpad-theme a { color: #D4A574 !important; text-decoration: underline !important; text-decoration-color: rgba(212,165,116,.5) !important; }
      html.htmlpad-theme body.htmlpad-theme code { font-family: "JetBrains Mono", monospace !important; background: rgba(232,217,192,.1) !important; color: #E8D9C0 !important; padding: 2px 5px !important; border-radius: 3px !important; }
      html.htmlpad-theme body.htmlpad-theme pre { background: rgba(232,217,192,.06) !important; padding: 16px !important; border-radius: 6px !important; border-left: 3px solid #D4A574 !important; }
      html.htmlpad-theme body.htmlpad-theme pre code { background: transparent !important; color: #E8D9C0 !important; }
      html.htmlpad-theme body.htmlpad-theme blockquote { border-left: 3px solid #D4A574 !important; color: rgba(232,217,192,.6) !important; padding-left: 16px !important; font-style: italic !important; }
      html.htmlpad-theme body.htmlpad-theme hr { border: none !important; height: 1px !important; background: rgba(232,217,192,.15) !important; margin: 2em 0 !important; }
    `
  }
];

window.HTMLPadThemes = THEMES;
