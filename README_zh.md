# HTMLPad

> HTML 双向编辑与沉浸式阅读工具 · macOS 原生体验 · 零 AI 依赖 · 纯本地运行

HTMLPad 是一款专为 macOS 打造的专业 HTML 编辑与阅读工具。无论你是正在编写营销页、邮件模板、AI 生成的单页报告，还是产品文档，它都能让你在专业代码编辑和沉浸式阅读两种模式之间自由切换，愉悦地完成工作。

---

## 核心特性

**编辑器**
- Monaco Editor（与 VS Code 同款引擎），支持 HTML/CSS/JS 语法高亮、自动闭合、Emmet 缩写
- 多标签页编辑，未保存内容有圆点提示
- 一键格式化 HTML（Prettier，`⌥⇧F`）

**预览**
- 三种视图模式：仅编辑 / 分屏 / 仅预览（`⌘1` `⌘2` `⌘3`）
- 三种设备预览：iPhone / iPad / Desktop（`⌘⇧1/2/3`），真实尺寸与边框
- 10 套阅读主题，无缝注入不破坏原始 CSS

**阅读主题**
| 主题 | 说明 |
|------|------|
| 原生 | 不注入任何样式，完整保留作者原始 CSS |
| 阅读模式 | 衬线字体 + 720px 窄栏 + 暖米色背景，适合长文 |
| Notion 简洁 | 大留白，无衬线，行高宽松 |
| GitHub 文档 | github-markdown 同款样式，标题带分隔线 |
| Apple 文档 | SF Pro 字体 + 苹果官网配色，字号偏大 |
| 杂志风 | Cormorant Garamond + 首字下沉 + 居中标题 |
| 终端绿屏 | 等宽字体 + 绿底黑字，前缀 `$ render` |
| 打印优化 | A4 + 衬线 + 黑白，可直接打印或导出 PDF |
| 护眼米色 | 米色底棕字，长时间阅读不刺眼 |

**导出**
- PDF — 全页面导出，主题 CSS 注入渲染，在隐藏离屏窗口中完整渲染后生成
- PNG 长图 — 全页面截图，2× 像素密度
- 独立 HTML — 主题 CSS 内嵌，任意浏览器直接打开

**原生 macOS 体验**
- 苹果浅色风 — 毛玻璃工具栏、SF Pro 字体、圆角、深浅模式
- 文件关联 — 双击 `.html`/`.htm` 直接用 HTMLPad 打开
- 菜单栏、快捷键支持，多窗口与多标签页

---

## 快速开始

### 环境要求
- macOS 10.12+
- Node.js 18+（开发模式）
- npm

### 安装

**源码运行：**
```bash
git clone <仓库地址> htmlpad
cd htmlpad
npm install
npm run dev     # 开发模式（含 DevTools）
npm start       # 生产模式
```

**直接安装：**
从 releases 下载 `.dmg` 文件，拖入 Applications 即可。

### 打包
```bash
npm run build        # 生成 .dmg + .zip 到 dist/
npm run build:mac    # 仅打包 macOS
```

---

## 快捷键一览

| 类别 | 快捷键 | 功能 |
|------|--------|------|
| 文件 | `⌘N` | 新建窗口 |
| 文件 | `⌘T` | 新建标签页 |
| 文件 | `⌘O` | 打开 HTML |
| 文件 | `⌘S` | 保存 |
| 文件 | `⌘⇧S` | 另存为 |
| 文件 | `⌘W` | 关闭当前标签页 |
| 视图 | `⌘1` / `⌘2` / `⌘3` | 编辑 / 分屏 / 预览 |
| 设备 | `⌘⇧1` / `⌘⇧2` / `⌘⇧3` | iPhone / iPad / 桌面 |
| 视图 | `⌘⇧L` | 切换深色模式 |
| 编辑 | `⌥⇧F` | 格式化 HTML |
| 导出 | `⌘E` | 导出 PDF |
| 导出 | `⌘⇧E` | 导出 PNG 全页长图 |
| 复制 | `⌘⇧C` | 复制 HTML 源码 |
| 编辑 | `⌘Z` / `⌘⇧Z` | 撤销 / 重做 |
| 编辑 | `⌘A` | 全选 |

---

## 项目结构

```
htmlpad/
├── main.js              Electron 主进程 + 菜单 + IPC + 文件关联
├── package.json
├── assets/
│   ├── icon.icns        应用图标（macOS）
│   ├── icon.png         应用图标（备选）
│   └── logo.svg         Logo
└── renderer/
    ├── index.html       主窗口结构
    ├── styles.css       苹果浅色风样式
    ├── app.js           状态管理 + 标签页 + 事件桥接
    ├── editor.js        Monaco 封装
    ├── preview.js       iframe + 主题注入 + 双向桥接
    ├── themes.js        10 套阅读增强主题
    └── exporters/
        ├── pdf.js       离屏窗口 PDF 导出
        ├── png.js       离屏窗口 PNG 全页截图
        └── html.js      带主题样式的独立 HTML 导出
```

---

## 技术栈

| 层次 | 技术 |
|------|------|
| 框架 | Electron 28 |
| 编辑器 | Monaco Editor 0.45（本地加载，无 CDN） |
| 存储 | electron-store 8 |
| 格式化 | Prettier 3.1 |
| 打包 | electron-builder 24 |
| 平台 | macOS（ARM64 + x64） |

---

## 与 mdskill 的关系

HTMLPad 是 [mdskill](../mdskill/)（Markdown 编辑器）的姊妹产品——把 Markdown 换成 HTML，专注 HTML 的编辑与阅读：

| 维度 | mdskill | HTMLPad |
|------|---------|---------|
| 输入 | Markdown | HTML |
| 编辑器 | textarea | Monaco |
| 预览 | marked 转 HTML | iframe 沙箱直接渲染 |
| 主题 | 13 套渲染主题 | 10 套阅读增强主题 |
| 设备预览 | ✗ | ✓ |
| 多标签页 | ✗ | ✓ |
| AI | 有 | 无（纯本地） |
| 视觉风格 | VS Code 深色 | 苹果浅色 |

---

## 参与贡献与合作

本项目欢迎各种形式的贡献——修复 bug、完善主题、添加功能、编写文档，只要对项目有帮助我们都欣然接受。

**贡献方式：**
1. Fork 本仓库
2. 创建功能分支（`git checkout -b feature/你的功能`）
3. 开发完成后提交（`git commit -m '添加了某个实用功能'`）
4. 推送到你的 Fork 并发起 Pull Request

**商务合作或技术交流：** 欢迎通过 GitHub 发起 issue 或直接联系作者，讨论合作可能性。

---

## 开源协议

MIT License — 可自由使用、修改和分发。

---

## 关于作者

**Lorraine** — 独立开发者，热衷于为 macOS 生态打造优雅、实用的工具。

- 乐于探索有意思的项目合作
- 专注领域：效率工具、开发者实用工具、内容创作工作流
- 欢迎通过 GitHub 联系讨论合作机会

---

*如果 HTMLPad 提升了你的工作效率，给仓库点个 Star，也欢迎推荐给需要的朋友。*