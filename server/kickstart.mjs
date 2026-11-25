import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const TEMPLATES = [
  {
    id: 'node-ts',
    name: 'Node.js + TypeScript',
    badge: 'Backend / CLI',
    description: 'TypeScript starter with strict tsconfig, scripts, .gitignore, README, and AGENTS.md.',
  },
  {
    id: 'react-vite',
    name: 'React + Vite',
    badge: 'Frontend SPA',
    description: 'Modern React + Vite app skeleton with design tokens CSS and component folder.',
  },
  {
    id: 'python-fastapi',
    name: 'Python + FastAPI',
    badge: 'Python API',
    description: 'FastAPI REST API with /health endpoint, pyproject.toml, pytest starter, and .gitignore.',
  },
  {
    id: 'chrome-ext',
    name: 'Chrome Extension (MV3)',
    badge: 'Browser Ext',
    description: 'Manifest V3 extension with popup UI, background service worker, and clean permissions.',
  },
  {
    id: 'antigravity-plugin',
    name: 'Antigravity MCP Plugin',
    badge: 'AGY Plugin',
    description: 'Ready-to-build Antigravity MCP App plugin with plugin.json, mcp_config.json, server, and SKILL.md.',
  },
  {
    id: 'static-web',
    name: 'Static Landing Page',
    badge: 'HTML / CSS / JS',
    description: 'Zero-build responsive HTML5 + CSS design tokens + vanilla JS starter.',
  },
];

function slugify(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'my-project';
}

function buildLicense(type, author = 'Project Author') {
  const year = new Date().getFullYear();
  if (type === 'Apache-2.0') {
    return `Copyright ${year} ${author}\n\nLicensed under the Apache License, Version 2.0 (the "License");\nyou may not use this file except in compliance with the License.\nYou may obtain a copy of the License at\n\n    http://www.apache.org/licenses/LICENSE-2.0\n`;
  }
  return `MIT License\n\nCopyright (c) ${year} ${author}\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.\n`;
}

function buildAgentsMd(projectName, templateId, lang = 'en') {
  if (lang === 'tr') {
    return `# AGENTS.md — ${projectName}\n\nBu proje **${templateId}** şablonuyla oluşturuldu.\n\n## Çalışma Kuralları\n- Kod değişikliklerinden sonra ilgili test/build komutunu mutlaka çalıştır.\n- API anahtarı, token veya kişisel bilgisayar yollarını asla koda yazma (\`.env\` kullan).\n- Yeni bileşenlerde \`tokens.css\` veya mevcut tasarım değişkenlerine sadık kal.\n- Küçük, odaklı ve geri alınabilir commit'ler yap.\n`;
  }
  return `# AGENTS.md — ${projectName}\n\nThis project was scaffolded with the **${templateId}** template.\n\n## Agent Guidelines\n- Always run the project's build/test/lint command after code edits.\n- Never hardcode API keys, tokens, or personal OS paths; use environment variables.\n- Reuse design tokens in \`tokens.css\` (or the project design system) for UI consistency.\n- Keep commits small, focused, and verifiable.\n`;
}

function getTemplateFiles(templateId, displayName, slug, licenseType, lang) {
  const common = {
    'LICENSE': buildLicense(licenseType),
    'AGENTS.md': buildAgentsMd(displayName, templateId, lang),
    '.env.example': '# Copy to .env and fill in values\nAPP_ENV=development\n',
  };

  if (templateId === 'node-ts') {
    return {
      ...common,
      '.gitignore': 'node_modules/\ndist/\n.env\n.env.*\n!.env.example\n',
      'README.md': `# ${displayName}\n\nNode.js + TypeScript starter.\n\n## Quick Start\n\`\`\`bash\nnpm install\nnpm run build\nnpm start\n\`\`\`\n`,
      'package.json': JSON.stringify({
        name: slug,
        version: '0.1.0',
        type: 'module',
        scripts: { build: 'tsc', start: 'node dist/index.js', typecheck: 'tsc --noEmit' },
        devDependencies: { typescript: '^5.7.0', '@types/node': '^22.0.0' },
      }, null, 2),
      'tsconfig.json': JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          outDir: 'dist',
          rootDir: 'src',
          strict: true,
          skipLibCheck: true,
        },
        include: ['src'],
      }, null, 2),
      'src/index.ts': `export function greet(name: string): string {\n  return \`Hello from \${name}!\`;\n}\n\nconsole.log(greet(${JSON.stringify(displayName)}));\n`,
    };
  }

  if (templateId === 'react-vite') {
    return {
      ...common,
      '.gitignore': 'node_modules/\ndist/\n.env\n.env.*\n!.env.example\n',
      'README.md': `# ${displayName}\n\nReact + Vite starter.\n\n## Quick Start\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n`,
      'package.json': JSON.stringify({
        name: slug,
        version: '0.1.0',
        private: true,
        type: 'module',
        scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
        dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' },
        devDependencies: { '@vitejs/plugin-react': '^4.3.0', vite: '^6.0.0' },
      }, null, 2),
      'index.html': `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1" />\n  <title>${displayName}</title>\n</head>\n<body>\n  <div id="root"></div>\n  <script type="module" src="/src/main.jsx"></script>\n</body>\n</html>\n`,
      'src/tokens.css': `:root {\n  --color-primary: #6366f1;\n  --color-bg: #0f172a;\n  --color-surface: #1e293b;\n  --color-text: #f8fafc;\n  --radius-md: 10px;\n}\n`,
      'src/main.jsx': `import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport './tokens.css';\n\nfunction App() {\n  return (\n    <main style={{ padding: 32, fontFamily: 'system-ui', color: 'var(--color-text)', background: 'var(--color-bg)', minHeight: '100vh' }}>\n      <h1>${displayName}</h1>\n      <p>Scaffolded with Project Studio.</p>\n    </main>\n  );\n}\n\ncreateRoot(document.getElementById('root')).render(<App />);\n`,
    };
  }

  if (templateId === 'python-fastapi') {
    return {
      ...common,
      '.gitignore': '__pycache__/\n.venv/\nvenv/\n*.pyc\n.pytest_cache/\n.env\n.env.*\n!.env.example\n',
      'README.md': `# ${displayName}\n\nPython + FastAPI starter.\n\n## Quick Start\n\`\`\`bash\npython -m venv .venv\npip install -r requirements.txt\nuvicorn app.main:app --reload\n\`\`\`\n`,
      'requirements.txt': 'fastapi>=0.115.0\nuvicorn[standard]>=0.32.0\npytest>=8.0.0\nhttpx>=0.27.0\n',
      'app/__init__.py': '',
      'app/main.py': `from fastapi import FastAPI\n\napp = FastAPI(title=${JSON.stringify(displayName)})\n\n@app.get("/health")\ndef health():\n    return {"status": "ok", "service": ${JSON.stringify(slug)}}\n`,
      'tests/test_health.py': `from fastapi.testclient import TestClient\nfrom app.main import app\n\nclient = TestClient(app)\n\ndef test_health():\n    res = client.get("/health")\n    assert res.status_code == 200\n    assert res.json()["status"] == "ok"\n`,
    };
  }

  if (templateId === 'chrome-ext') {
    return {
      ...common,
      '.gitignore': 'node_modules/\ndist/\n.DS_Store\n',
      'README.md': `# ${displayName}\n\nChrome Extension (Manifest V3) starter. Load unpacked from \`chrome://extensions\`.\n`,
      'manifest.json': JSON.stringify({
        manifest_version: 3,
        name: displayName,
        version: '0.1.0',
        description: `${displayName} browser extension.`,
        action: { default_popup: 'popup.html' },
        background: { service_worker: 'background.js' },
        permissions: ['storage'],
      }, null, 2),
      'popup.html': `<!doctype html>\n<html>\n<head><meta charset="utf-8"><title>${displayName}</title></head>\n<body style="width:280px;font-family:system-ui;padding:12px">\n  <h3>${displayName}</h3>\n  <button id="ping">Ping</button>\n  <p id="out"></p>\n  <script src="popup.js"></script>\n</body>\n</html>\n`,
      'popup.js': `document.getElementById('ping').addEventListener('click', () => {\n  document.getElementById('out').textContent = 'Extension active!';\n});\n`,
      'background.js': `chrome.runtime.onInstalled.addListener(() => {\n  console.log('${slug} installed');\n});\n`,
    };
  }

  if (templateId === 'antigravity-plugin') {
    return {
      ...common,
      '.gitignore': 'node_modules/\ndata/\n.env\n.env.*\n!.env.example\n',
      'README.md': `# ${displayName}\n\nAntigravity MCP App plugin.\n\n\`\`\`bash\nnpm install\n\`\`\`\n`,
      'plugin.json': JSON.stringify({
        name: slug,
        displayName,
        version: '0.1.0',
        description: `${displayName} plugin for Antigravity.`,
        license: licenseType,
      }, null, 2),
      'mcp_config.json': JSON.stringify({
        mcpServers: {
          [slug]: {
            command: 'node',
            args: ['${PLUGIN_ROOT}/server/index.mjs', '--data-dir', '${PLUGIN_DATA}'],
          },
        },
      }, null, 2),
      'package.json': JSON.stringify({
        name: `antigravity-${slug}`,
        version: '0.1.0',
        private: true,
        type: 'module',
        dependencies: { '@modelcontextprotocol/sdk': '^1.12.0', zod: '^4.6.7' },
      }, null, 2),
      'server/index.mjs': `// Starter MCP server for ${displayName}\nconsole.error('${slug} MCP server skeleton ready');\n`,
      [`skills/${slug}/SKILL.md`]: `---\nname: ${slug}\ndescription: Helper skill for ${displayName}.\n---\n\n# ${displayName}\n\nDescribe when the agent should use this plugin.\n`,
    };
  }

  // default: static-web
  return {
    ...common,
    '.gitignore': '.DS_Store\nThumbs.db\n',
    'README.md': `# ${displayName}\n\nZero-build static web starter.\n`,
    'tokens.css': `:root {\n  --color-primary: #6366f1;\n  --color-bg: #0f172a;\n  --color-surface: #1e293b;\n  --color-text: #f8fafc;\n  --radius-md: 10px;\n}\n`,
    'index.html': `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1" />\n  <title>${displayName}</title>\n  <link rel="stylesheet" href="tokens.css" />\n</head>\n<body style="margin:0;padding:40px;font-family:system-ui;background:var(--color-bg);color:var(--color-text)">\n  <h1>${displayName}</h1>\n  <p>Ready to build.</p>\n</body>\n</html>\n`,
  };
}

export function scaffoldProject({
  projectName,
  parentDir,
  templateId = 'node-ts',
  license = 'MIT',
  lang = 'en',
  initGit = true,
}) {
  const displayName = String(projectName || '').trim();
  if (!displayName) throw new Error('Project name is required.');
  const slug = slugify(displayName);
  const resolvedParent = path.resolve(String(parentDir || process.cwd()));
  const projectDir = path.join(resolvedParent, slug);

  if (fs.existsSync(projectDir) && fs.readdirSync(projectDir).length > 0) {
    throw new Error(`Target directory already exists and is not empty: ${projectDir}`);
  }

  const files = getTemplateFiles(templateId, displayName, slug, license, lang);
  const createdFiles = [];
  for (const [relPath, content] of Object.entries(files)) {
    const full = path.join(projectDir, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf8');
    createdFiles.push(relPath);
  }

  let gitInitialized = false;
  if (initGit) {
    try {
      execFileSync('git', ['init'], { cwd: projectDir, stdio: 'ignore' });
      gitInitialized = true;
    } catch {
      gitInitialized = false;
    }
  }

  return {
    projectName: displayName,
    slug,
    templateId,
    projectDir,
    createdFiles,
    gitInitialized,
  };
}
