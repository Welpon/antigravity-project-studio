# Project Studio for Antigravity

**Project Kickstart Scaffolder + Live UI Kit & Design System Previewer** right inside your Google Antigravity Side Pane and Sidebar.

- **Zero extra cost (0 tokens / 0 external APIs):** Runs 100% locally.
- **10-Second Project Setup:** Generates folder structure, starter code, `.gitignore`, `.env.example`, `README.md`, `LICENSE`, and tailored `AGENTS.md` rules in one click.
- **Live Design System Sync:** Preview colors, radius, and components in real time, export `tokens.css` + `DESIGN_SYSTEM.md`, and send exact design tokens to AI.
- **Bilingual UI (EN / TR):** English by default, with persistent one-click Turkish (`TR`) switching.

---

## Features

### 1. Project Kickstart (`Project Kickstart` / `Proje Başlatıcı`)
- **6 Stack Templates:**
  - **Node.js + TypeScript** (strict `tsconfig.json`, scripts, starter source)
  - **React + Vite** (SPA starter with `tokens.css`)
  - **Python + FastAPI** (`/health` endpoint, `requirements.txt`, `pytest` starter)
  - **Chrome Extension (MV3)** (manifest, popup UI, background service worker)
  - **Antigravity MCP Plugin** (`plugin.json`, `mcp_config.json`, server skeleton, `SKILL.md`)
  - **Static Landing Page** (zero-build HTML5 + CSS tokens)
- Configurable project name, target folder, license (`MIT` / `Apache-2.0`), `AGENTS.md` language (`en` / `tr`), and automatic `git init`.
- **✨ Open & Plan with AI:** Sends the newly created project path and file list directly to chat.

### 2. UI Kit & Design System Previewer (`UI Kit Preview` / `UI Kit Önizleyici`)
- **4 Curated Presets:** *Midnight SaaS*, *Emerald Fintech*, *Warm Editorial*, and *Clean Light Minimal*.
- **Live Token Editor:** Real-time color pickers for all 10 semantic colors + `Border Radius` selector.
- **Live Component Gallery:** Preview headings, badges, primary/secondary/ghost buttons, cards, and inputs updating live as you tweak tokens.
- **CSS Scanner & Exporter:** Scan any existing project's CSS custom properties (`--*`), export `tokens.css` + `DESIGN_SYSTEM.md`, or click **✨ Send Design System to AI** so every new screen stays visually consistent.

---

## Installation

**Requirement:** Node.js 18+

### Windows (PowerShell)
```powershell
git clone https://github.com/Welpon/antigravity-project-studio.git "$env:USERPROFILE\.gemini\config\plugins\project-studio"
cd "$env:USERPROFILE\.gemini\config\plugins\project-studio"
npm install
```

### macOS / Linux
```bash
git clone https://github.com/Welpon/antigravity-project-studio.git ~/.gemini/config/plugins/project-studio
cd ~/.gemini/config/plugins/project-studio && npm install
```

### Without Git (ZIP Download)
1. Click **Code → Download ZIP** on GitHub.
2. Extract into `~/.gemini/config/plugins/project-studio`.
3. Open a terminal in that folder and run `npm install`.

Antigravity discovers the plugin automatically. Open it from the **Side Pane (`+` → Project Studio)** or **Sidebar (Plugins → Project Studio)**.

---

## Related Antigravity Plugins
- **[Context Brain](https://github.com/Welpon/antigravity-context-brain)** — Live Context Monitor, Markdown Memory Vault, Kanban & Activity Log
- **[Ship Guard](https://github.com/Welpon/antigravity-ship-guard)** — Git Flow, Safe Rollback, Secret Guard Hook, Quality Gate & GitHub Releases
- **[Local Studio](https://github.com/Welpon/antigravity-local-studio)** — SQLite / PostgreSQL Explorer & Localhost API Tester
- **[Project Studio](https://github.com/Welpon/antigravity-project-studio)** — Project Kickstart Scaffolder & Live UI Kit Previewer

## Contributing
Pull requests and issues are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for local development steps.

## License
[MIT](LICENSE)
