# Contributing to Project Studio

1. Clone into `~/.gemini/config/plugins/project-studio`.
2. Run `npm install` and `npm run build:ui`.
3. Verify syntax:
   ```bash
   node --check server/index.mjs server/kickstart.mjs server/uikit.mjs ui/build.mjs
   ```
4. Keep both **English (`en`)** and **Turkish (`tr`)** translations updated in `ui/app.js`.
5. Never commit personal paths or secrets.
