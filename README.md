# HTMLPad

> HTML 双向编辑与阅读工具 for Mac · 苹果浅色风 · 零 AI 依赖 · 纯本地

HTMLPad 是 [mdskill](../mdskill/) 的姊妹产品 —— 把 Markdown 换成 HTML,既能像 IDE 一样写 HTML/CSS/JS 实时预览,也能像沉浸式阅读器一样打开 AI 生成的单页报告、邮件模板、营销页。

## ✨ 核心特性

- **Monaco 编辑器** · VS Code 同款,HTML/CSS/JS 高亮 + 自动闭合 + Emmet 缩写
- **三视图自由切换** · 仅编辑 / 分屏 / 仅预览(`⌘1` `⌘2` `⌘3`)
- **多设备预览** · iPhone / iPad / Desktop 三档真实尺寸(`⌘⇧1/2/3`)
- **10 套阅读主题** · 原生、阅读模式、报纸风、Notion 简洁、GitHub 文档、Apple 文档、杂志风、终端绿屏、打印优化、护眼米色
- **多标签页** · 同时打开多个 HTML,未保存圆点提示
- **导出能力** · PDF · PNG 长截图 · 带主题样式的独立 HTML
- **苹果浅色风** · 毛玻璃工具栏 · SF Pro 字体 · 圆角 · 深浅模式
- **文件关联** · 双击 `.html`、`.htm` 直接用 HTMLPad 打开

## 📦 安装与启动

```bash
cd htmlskill
npm install
npm start
```

首次启动会从 `node_modules/monaco-editor/min` 加载本地 Monaco,无 CDN 依赖。

## ⌨️ 快捷键

| 类别 | 快捷键 | 功能 |
|------|--------|------|
| 文件 | `⌘N` | 新建窗口 |
| 文件 | `⌘T` | 新建标签页 |
| 文件 | `⌘O` | 打开 HTML |
| 文件 | `⌘S` | 保存 |
| 文件 | `⌘⇧S` | 另存为 |
| 文件 | `⌘W` | 关闭当前标签页 |
| 视图 | `⌘1` / `⌘2` / `⌘3` | 编辑 / 分屏 / 预览 |
| 设备 | `⌘⇧1` / `⌘⇧2` / `⌘⇧3` | iPhone / iPad / Desktop |
| 视图 | `⌘⇧L` | 切换深色模式 |
| 编辑 | `⌥⇧F` | 一键格式化 HTML |
| 导出 | `⌘E` | 导出 PDF |
| 导出 | `⌘⇧E` | 导出 PNG 长截图 |
| 复制 | `⌘⇧C` | 复制 HTML 源码 |

## 🎨 主题预览说明

- **原生** —— 不加任何样式,完全保留作者原始 CSS
- **阅读模式** —— 衬线字体 + 720px 窄栏 + 米色底,适合长文阅读
- **Notion 简洁** —— 大留白,无衬线,行高 1.7
- **GitHub 文档** —— github-markdown 同款,标题带横线
- **Apple 文档** —— SF Pro 字体 + 苹果官网配色,大字号
- **杂志风** —— Cormorant Garamond + drop cap + 居中标题
- **终端绿屏** —— 等宽字体 + 绿底黑字 + `$ render` 前缀
- **打印优化** —— A4 + 黑白 + 衬线,直接打印或导出 PDF 用
- **护眼米色** —— 米色底棕字,长时间阅读不刺眼

## 🏗 项目结构

```
htmlskill/
├── main.js                Electron 主进程 + 菜单 + IPC + 文件关联
├── package.json
├── assets/
└── renderer/
    ├── index.html         主窗口结构
    ├── styles.css         苹果浅色风
    ├── app.js             状态管理 + tab + 事件桥接
    ├── editor.js          Monaco 封装
    ├── preview.js         iframe + 主题注入
    ├── themes.js          10 套主题 CSS
    └── exporters/
        ├── pdf.js
        ├── png.js
        └── html.js
```

## 🛠 技术栈

- Electron 28
- Monaco Editor 0.45(本地加载)
- electron-store 8
- html-to-image 1.11(PNG 导出)
- prettier 3.1(格式化)

## 🆚 和 mdskill 的关系

| 维度 | mdskill | HTMLPad |
|------|---------|---------|
| 输入 | Markdown | HTML |
| 编辑器 | textarea | Monaco |
| 预览 | marked 转 HTML | 直接渲染(iframe 沙箱) |
| 主题 | 13 套渲染主题 | 10 套阅读增强主题 |
| 设备预览 | ❌ | ✅ |
| 多标签页 | ❌ | ✅ |
| AI | 有 | 无(纯本地) |
| 视觉 | VS Code 深色 | 苹果浅色 |

## 📄 License

MIT
