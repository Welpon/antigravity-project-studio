# Project Studio — Antigravity MCP App Plugin

**Project Kickstart Scaffolder + Live UI Kit & Design System Previewer** inside Antigravity's Side Pane and Sidebar.

## Features

- **Project Kickstart:**
  - 6 ready-to-use stack templates: **Node.js + TypeScript**, **React + Vite**, **Python + FastAPI**, **Chrome Extension (MV3)**, **Antigravity MCP Plugin**, and **Static Landing Page**.
  - Generates starter code, `.gitignore`, `.env.example`, `README.md`, `LICENSE` (`MIT` / `Apache-2.0`), and tailored `AGENTS.md` (EN or TR), with optional `git init`.
  - 1-click **"Plan with AI"** sends the new project path and file list directly to chat.
- **UI Kit & Design System Previewer:**
  - 4 curated design presets (*Midnight SaaS*, *Emerald Fintech*, *Warm Editorial*, *Clean Light Minimal*) + live color pickers, border radius slider, and typography controls.
  - Real-time interactive component gallery (Buttons, Badges, Inputs, Cards, Alerts) reflecting every token change immediately.
  - Scan any existing project's CSS custom properties (`--*`).
  - 1-click **Export `tokens.css` & `DESIGN_SYSTEM.md`** into any project and **"Send Design System to AI"** so every new screen stays visually consistent.
- **Bilingual UI:** English (`EN`) primary, Turkish (`TR`) secondary, persisted locally.

## Installation

1. Clone this repository into your Antigravity plugins folder (`~/.gemini/config/plugins/project-studio`).
2. Install dependencies and build the UI:
   ```bash
   npm install
   npm run build:ui
   ```
3. Reload MCP servers or restart Antigravity, then open **Project Studio** from the Sidebar or Side Pane.

## License

MIT
