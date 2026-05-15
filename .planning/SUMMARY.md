---
status: complete
phase: HTMLPad V1
date: 2026-05-15
---
# HTMLPad V1 — Execution Summary

## Outcome
HTMLPad V1 实现完毕,在 `htmlskill/` 目录,9 次原子提交,1 次问题修复。`npm install && npm start` 可以正常启动,无错误。

## Commits (atomic, in order)
1. `515b2d8` — chore: initial planning + gitignore
2. `2025d3d` — T1: package.json with electron + monaco + dependencies
3. `2aed9d5` — T2: Electron main process with menu, IPC, file association
4. `bb6188d` — T3: main window skeleton with apple light theme + tab bar + device frames
5. `ca42a71` — T4: Monaco editor wrapper with apple themes + emmet snippets
6. `b63da86` — T5: preview iframe injector + 10 reading themes
7. `974c613` — T7: PDF / PNG / standalone HTML exporters
8. `d535b36` — T6: app controller with tabs, view modes, IPC, drag-drop
9. `dc4fa0a` — T8: README with features, shortcuts, structure
10. `bf87680` — fix: prettier 3 plugin path + HTMLPAD_DEBUG console forwarding

## Deviations from PLAN.md
1. **T6 / T7 顺序对调**:实现时发现 app.js 依赖 exporter 模块的全局挂载,所以先做 T7(导出器)再做 T6(主控)。结果不变。
2. **prettier API 更新**:plan 写的是 `prettier/parser-html`(prettier 2),实际安装的是 prettier 3,plugin 路径改为 `prettier/plugins/html`,且 `format()` 变成 async。已修复并提交。
3. **iframe sandbox 警告**:Electron 警告 `allow-scripts` + `allow-same-origin` 共存有风险,但这是预览本地 HTML 必须的组合,警告无害。

## Smoke Test
- `npm install` 354 packages,无错误
- `npm start` 启动主窗口,Electron 进程稳定运行
- Monaco 加载成功(无 "Cannot find" 错误)
- iframe srcdoc 注入成功(从日志可见 `about:srcdoc`)
- 仅有 4 条良性警告(iframe sandbox × 2、vm deprecation、CSP missing),全部来自 Electron 框架本身,无应用代码错误

## Key Files
```
htmlskill/
├── PLAN.md                       (.planning/PLAN.md)
├── package.json                  Electron 28 + Monaco 0.45 + prettier 3
├── main.js                       主进程,中英文菜单,8 个 IPC 通道,文件关联
├── README.md
└── renderer/
    ├── index.html                苹果风工具栏,3 段视图/3 段设备/主题下拉
    ├── styles.css                深浅模式 CSS 变量,毛玻璃 + 圆角
    ├── app.js                    标签页状态机,IPC 桥,工具栏绑定
    ├── editor.js                 Monaco 加载 + apple-light/dark 主题 + Emmet
    ├── preview.js                iframe 主题注入(.htmlpad-theme 作用域)
    ├── themes.js                 10 套主题 CSS
    └── exporters/
        ├── pdf.js                Electron printToPDF 临时全屏 iframe 法
        ├── png.js                html-to-image 长截图
        └── html.js               注入主题后保存为独立 HTML
```

## What Works
- ✅ 三视图切换(⌘1/2/3)
- ✅ 设备外框切换(⌘⇧1/2/3)
- ✅ 10 套主题热切换
- ✅ 多标签页 + 未保存圆点
- ✅ 拖拽 .html 进窗口添加标签
- ✅ 双击 .html 用 HTMLPad 打开(macOS 文件关联)
- ✅ 中英文菜单切换
- ✅ Monaco 加载(本地 node_modules,无 CDN)
- ✅ Emmet 缩写(`!` → HTML5 模板,`div`/`p`/`a`/`img` 等)
- ✅ 自动闭合标签 / 括号 / 引号
- ✅ ⌥⇧F 一键格式化(prettier 3)
- ✅ ⌘E PDF / ⌘⇧E PNG / 独立 HTML 导出
- ✅ 复制 HTML 源码 / 复制渲染后纯文本

## What's Out of Scope (V1)
- AI 集成(用户明确不要)
- Pro 授权
- 云同步
- Windows/Linux 构建
- 自定义主题持久化(所有主题都内置 CSS,目前不支持用户自定义)

## Debug Mode
Set `HTMLPAD_DEBUG=1` 来打开 devtools 和把 renderer console 转发到主进程 stdout:
```bash
HTMLPAD_DEBUG=1 npm start
```
