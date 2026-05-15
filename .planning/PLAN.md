# HTMLPad - GSD Phase Plan

## Goal
Build HTMLPad — a Mac Electron HTML 双向工具(编辑+阅读对等),苹果浅色风,支持 Monaco 编辑器、三视图切换、多设备预览、10 套预览主题、多标签页、PDF/PNG/HTML 导出。结构对标 mdskill,语言换成 HTML,无 AI、无授权体系,纯本地。

## Success Criteria
- `npm install && npm start` 能启动应用
- 双击 .html 文件能用 HTMLPad 打开(macOS 文件关联)
- Monaco 编辑器有 HTML/CSS/JS 高亮、Emmet、自动闭合
- 三视图(编辑/分屏/预览)可切换
- 多设备预览(iPhone/iPad/Desktop)可切换
- 10 套预览主题(Native/Reader/Paper/Notion/GitHub/Apple/Magazine/Terminal/Print/Sepia)可切换
- 多标签页能新建、关闭、切换、显示未保存圆点
- 导出 PDF / PNG 长截图 / 独立 HTML / 复制源码 都可用
- 中英文菜单切换
- 苹果浅色风 + 毛玻璃工具栏 + 圆角

## Tech Stack
- Electron 28
- electron-store 8 (持久化)
- Monaco Editor 0.45 (本地资源,从 node_modules)
- DOMPurify 3 (iframe 注入前清洗)
- html-to-image 1 (PNG 长截图)
- prettier 3 (HTML 格式化,可选 standalone build)

## Architecture
```
htmlskill/
├── package.json
├── main.js                Electron 主进程 + 菜单 + IPC + 文件关联
├── assets/icon.png
└── renderer/
    ├── index.html         主窗口结构
    ├── styles.css         苹果浅色风全局样式
    ├── app.js             tab 管理 + IPC 桥接 + 状态机
    ├── editor.js          Monaco 加载与封装
    ├── preview.js         iframe 沙箱 + 设备容器 + 主题注入
    ├── themes.js          10 套阅读主题 CSS 字符串
    └── exporters/
        ├── pdf.js
        ├── png.js
        └── html.js
```

## Tasks (atomic commits, in order)

### T1 — package.json & 依赖声明
**File**: `package.json`
**Done when**: `npm install` 成功;声明所有依赖、构建配置、文件关联(html/htm)。
**Commit**: `chore: bootstrap HTMLPad package.json with electron + monaco + dependencies`

### T2 — Electron 主进程 main.js
**File**: `main.js`
**Done when**: 主进程能创建窗口、加载 renderer/index.html、构建中英文菜单、监听 open-file 事件支持 macOS 双击打开、注册所有 IPC 通道(read-file, save-file, save-file-as, get-last-file, export-pdf, export-png, get-language, set-language)。
**Commit**: `feat: add Electron main process with menu, IPC, file association`

### T3 — 主窗口骨架 index.html + styles.css
**Files**: `renderer/index.html`, `renderer/styles.css`
**Done when**: 苹果浅色风 + 毛玻璃工具栏(rgba 半透明 + backdrop-filter)、圆角、SF Pro 字体、工具栏含视图切换/设备切换/主题选择器/导出按钮组、tab bar 区域、底部状态条。打开时一片留白等 JS 注入,无报错。
**Commit**: `feat: add main window skeleton with apple light theme`

### T4 — Monaco 编辑器封装 editor.js
**File**: `renderer/editor.js`
**Done when**: 从 node_modules 加载 Monaco(本地资源),HTML 模式,自动闭合、格式化命令、Emmet 通过 `monaco-emmet` 或自定义触发。暴露 `createEditor(container, value, onChange)` API。
**Commit**: `feat: add Monaco editor wrapper with HTML mode`

### T5 — 预览 iframe + 设备容器 + 主题注入 preview.js + themes.js
**Files**: `renderer/preview.js`, `renderer/themes.js`
**Done when**: 预览用 iframe sandbox,根据设备模式(phone/pad/desktop)套外框,根据主题选择(10 套)注入额外 CSS。`updatePreview(html, device, themeId)` API。
**Commit**: `feat: add preview iframe with device sizing and 10 reading themes`

### T6 — 应用主控 app.js (tab 管理 + 视图切换 + 状态机)
**File**: `renderer/app.js`
**Done when**: tab 数组管理、新建/关闭/切换 tab、未保存状态、三视图(编辑/分屏/预览)切换、绑定所有工具栏按钮和快捷键、IPC 桥接 main 进程。
**Commit**: `feat: add app controller with tab management and view modes`

### T7 — 导出器 pdf.js / png.js / html.js
**Files**: `renderer/exporters/pdf.js`, `renderer/exporters/png.js`, `renderer/exporters/html.js`
**Done when**: PDF 走 Electron printToPDF;PNG 走 html-to-image 长截图;HTML 走 inline 样式 + 主题 CSS 拼接独立文档。
**Commit**: `feat: add PDF / PNG / HTML exporters`

### T8 — 文档与启动验证 README + 烟测
**File**: `README.md`
**Done when**: README 写明安装、启动、快捷键、主题列表;手动启动 `npm install && npm start`,验证主窗口能打开、能切视图、能切主题。
**Commit**: `docs: add README and verify boot smoke test`

## Risk & Mitigation
- **Monaco 体积大**:从 node_modules 直接 require 而不打包,首启加载略慢但开发简单。生产可后续 webpack 优化。
- **iframe 跨域沙箱**:本地 HTML 用 `srcdoc` 注入,主题 CSS 拼到 head;不允许执行远程脚本但保留内联 `<script>`(因为本地工具,信任内容)。
- **AI 生成 HTML 安全性**:用 DOMPurify 在预览时清洗(可选开关),但默认信任,因为是本地阅读器。
- **快捷键冲突**:全部走 Electron menu accelerator,统一管理。

## Out of Scope (V1)
- AI 集成
- Pro 授权
- 云同步
- Windows / Linux 构建
- 插件系统
- Git 集成
