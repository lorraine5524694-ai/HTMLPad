# HTMLPad

> HTML Dual-Mode Editor & Immersive Reader for Mac · Apple Light Aesthetic · Zero AI Dependency · Pure Local

HTMLPad is a beautifully crafted native macOS app for crafting and reading HTML content — whether you're building marketing pages, email templates, AI-generated reports, or documentation. It combines the power of a professional code editor with the comfort of an immersive reading experience.

---

## Key Features

**Editor**
- Monaco Editor (same engine as VS Code) with HTML/CSS/JS syntax highlighting, auto-closing, and Emmet abbreviation support
- Multi-tab editing with unsaved-change indicators
- One-click HTML formatting via Prettier (`⌥⇧F`)

**Preview**
- Three view modes: Editor Only / Split View / Preview Only (`⌘1` `⌘2` `⌘3`)
- Three device previews: iPhone / iPad / Desktop (`⌘⇧1/2/3`) with accurate frame sizes
- 14 reading themes that inject seamlessly without disturbing your original CSS

**Reading Themes**
| Theme | Description |
|-------|-------------|
| Native | No injection — pure author intent |
| Reading Mode | Serif + 720px narrow column, warm cream background |
| Notion | Clean, generous whitespace, sans-serif |
| GitHub Docs | github-markdown style, bordered headings |
| Apple Docs | SF Pro + Apple site palette, generous type scale |
| Magazine | Cormorant Garamond + drop cap + centered headings |
| Terminal | Monospace, green-on-black, `$ render` prefix |
| Print Optimized | A4 + serif + B&W, ready for PDF export |
| Eye Care Beige | Warm beige background, brown text, easy on the eyes |
| Vellum | Deep navy + warm yellow serif (inspired by beautiful-html-templates) |
| Grove | Forest green + warm cream serif (inspired by beautiful-html-templates) |
| Soft Editorial | Cream paper + sage/pink accents (inspired by beautiful-html-templates) |
| Coral | Dark canvas + coral red + Bebas Neue (inspired by beautiful-html-templates) |
| Signal | Deep navy + ivory + gold serif (inspired by beautiful-html-templates) |

**Export**
- PDF — full-page export with theme CSS injected, rendered in hidden offscreen window
- PNG Screenshot — full-page capture at 2× pixel ratio
- Standalone HTML — theme CSS baked in, opens in any browser

**Native macOS**
- Apple light aesthetic — vibrancy, SF Pro, rounded corners, light/dark mode
- File association — double-click `.html`/`.htm` to open directly in HTMLPad
- Menu bar, keyboard shortcuts, multiple windows and tabs

---

## Getting Started

### Prerequisites
- macOS 10.12+
- Node.js 18+ (for development)
- npm

### Installation

**From source:**
```bash
git clone <repo-url> htmlpad
cd htmlpad
npm install
npm run dev     # development mode with DevTools
npm start       # production mode
```

**From release:**
Download the `.dmg` from releases and drag into Applications.

### Building from source
```bash
npm run build        # builds .dmg + .zip into dist/
npm run build:mac    # macOS only
```

---

## Keyboard Shortcuts

| Category | Shortcut | Action |
|----------|----------|--------|
| File | `⌘N` | New Window |
| File | `⌘T` | New Tab |
| File | `⌘O` | Open HTML |
| File | `⌘S` | Save |
| File | `⌘⇧S` | Save As |
| File | `⌘W` | Close Tab |
| View | `⌘1` / `⌘2` / `⌘3` | Edit / Split / Preview |
| Device | `⌘⇧1` / `⌘⇧2` / `⌘⇧3` | iPhone / iPad / Desktop |
| View | `⌘⇧L` | Toggle Dark Mode |
| Edit | `⌥⇧F` | Format HTML |
| Export | `⌘E` | Export PDF |
| Export | `⌘⇧E` | Export PNG Full-Page |
| Copy | `⌘⇧C` | Copy HTML Source |
| Edit | `⌘Z` / `⌘⇧Z` | Undo / Redo |
| Edit | `⌘A` | Select All |

---

## Project Structure

```
htmlpad/
├── main.js              Electron main process + menus + IPC + file associations
├── package.json
├── assets/
│   ├── icon.icns        App icon (macOS)
│   ├── icon.png         App icon (fallback)
│   └── logo.svg         Logo
└── renderer/
    ├── index.html       Main window structure
    ├── styles.css       Apple light aesthetic styles
    ├── app.js           State management + tabs + event bridge
    ├── editor.js        Monaco wrapper
    ├── preview.js       iframe + theme injection + bidirectional bridge
    ├── themes.js        14 reading-enhancement themes
    └── exporters/
        ├── pdf.js        Offscreen-window PDF export
        ├── png.js        Offscreen-window PNG full-page capture
        └── html.js       Standalone HTML export with theme injection
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Electron 28 |
| Editor | Monaco Editor 0.45 (local load, no CDN) |
| Storage | electron-store 8 |
| Formatting | Prettier 3.1 |
| Bundler | electron-builder 24 |
| Platform | macOS (ARM64 + x64) |

---

---

## Contributing & Collaboration

This project is open to contributions and collaboration. Whether you're fixing bugs, improving themes, adding features, or writing documentation — your help is welcome.

**How to contribute:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes and commit (`git commit -m 'Add something useful'`)
4. Push to your fork and open a Pull Request

**For partnership or business inquiries:** Please check the repository profile or open an issue to discuss collaboration opportunities.

---

## License

MIT License — free to use, modify, and distribute.

---

## About Me

🚀 About Me
Lorraine
AI Marketing Practitioner & Independent Developer.
Building AI Agents, LLM workflows, automation systems, and practical tools that ship fast.

🤝 Contact
💬 WeChat: lorraine_xll

---

*If HTMLPad saved your workflow, star the repo and share it with someone who writes HTML.*