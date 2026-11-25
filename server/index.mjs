import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { TEMPLATES, scaffoldProject } from './kickstart.mjs';
import {
  DESIGN_PRESETS,
  exportDesignSystem,
  scanProjectTokens,
} from './uikit.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PLUGIN_ROOT = path.resolve(__dirname, '..');

const APP_URI = 'ui://project-studio/app.html';
const APP_MIME = 'text/html;profile=mcp-app';

function parseDataDir(argv) {
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--data-dir=')) return arg.slice('--data-dir='.length);
    if (arg === '--data-dir' && argv[i + 1]) return argv[i + 1];
  }
  return path.join(PLUGIN_ROOT, 'data');
}

const dataDir = parseDataDir(process.argv.slice(2));
const prefsPath = path.join(dataDir, 'prefs.json');

function defaultProjectsRoot() {
  return path.join(os.homedir(), 'projects');
}

function readPrefs() {
  try {
    if (fs.existsSync(prefsPath)) {
      const parsed = JSON.parse(fs.readFileSync(prefsPath, 'utf8'));
      return {
        lang: parsed?.lang === 'tr' ? 'tr' : 'en',
        parentDir: typeof parsed?.parentDir === 'string' && parsed.parentDir.trim()
          ? parsed.parentDir.trim()
          : defaultProjectsRoot(),
        activePresetId: typeof parsed?.activePresetId === 'string' ? parsed.activePresetId : 'midnight-saas',
        customTokens: parsed?.customTokens && typeof parsed.customTokens === 'object' ? parsed.customTokens : null,
      };
    }
  } catch {
    // default
  }
  return {
    lang: 'en',
    parentDir: defaultProjectsRoot(),
    activePresetId: 'midnight-saas',
    customTokens: null,
  };
}

function writePrefs(patch = {}) {
  const current = readPrefs();
  const next = {
    ...current,
    ...(patch.lang === 'tr' || patch.lang === 'en' ? { lang: patch.lang } : {}),
    ...(typeof patch.parentDir === 'string' && patch.parentDir.trim() ? { parentDir: patch.parentDir.trim() } : {}),
    ...(typeof patch.activePresetId === 'string' ? { activePresetId: patch.activePresetId } : {}),
    ...(patch.customTokens && typeof patch.customTokens === 'object' ? { customTokens: patch.customTokens } : {}),
  };
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(prefsPath, JSON.stringify(next, null, 2), 'utf8');
  return next;
}

function readAppHtml() {
  const htmlPath = process.env.PROJECT_STUDIO_APP_HTML || path.join(__dirname, 'app.html');
  if (!fs.existsSync(htmlPath)) {
    return '<!doctype html><html><body><p>Project Studio UI not built yet. Run <code>npm run build:ui</code>.</p></body></html>';
  }
  return fs.readFileSync(htmlPath, 'utf8');
}

const TOOLS = [
  {
    name: 'open_project_studio',
    title: 'Project Studio',
    description:
      'Open the Project Studio UI panel (Project Kickstart Scaffolder + Live UI Kit & Design System Previewer).',
    inputSchema: {
      type: 'object',
      properties: {
        tab: { type: 'string', enum: ['kickstart', 'uikit'], description: 'Optional initial tab.' },
      },
    },
    _meta: {
      ui: { resourceUri: APP_URI },
      'com.google.antigravity/ui': {
        entrypoints: [
          { type: 'aux_pane', title: 'Project Studio' },
          { type: 'global', title: 'Project Studio' },
        ],
      },
    },
  },
  {
    name: 'list_project_templates',
    title: 'List Project Templates',
    description: 'Return all available stack templates for Project Kickstart.',
    inputSchema: { type: 'object', properties: {} },
    _meta: { ui: { visibility: ['model', 'app'] } },
  },
  {
    name: 'scaffold_project',
    title: 'Scaffold New Project',
    description: 'Create a new project directory with starter files, .gitignore, README, LICENSE, and AGENTS.md.',
    inputSchema: {
      type: 'object',
      properties: {
        project_name: { type: 'string', description: 'Human-readable project name.' },
        parent_dir: { type: 'string', description: 'Parent directory where the project folder will be created.' },
        template_id: {
          type: 'string',
          enum: TEMPLATES.map((t) => t.id),
          description: 'Stack template ID.',
        },
        license: { type: 'string', enum: ['MIT', 'Apache-2.0'] },
        lang: { type: 'string', enum: ['en', 'tr'] },
        init_git: { type: 'boolean' },
      },
      required: ['project_name'],
    },
    _meta: { ui: { visibility: ['model', 'app'] } },
  },
  {
    name: 'scan_design_tokens',
    title: 'Scan Project Design Tokens',
    description: 'Scan CSS/SCSS files in a project directory and extract all CSS custom properties (--var).',
    inputSchema: {
      type: 'object',
      properties: {
        project_dir: { type: 'string' },
      },
      required: ['project_dir'],
    },
    _meta: { ui: { visibility: ['model', 'app'] } },
  },
  {
    name: 'export_design_system',
    title: 'Export Design System Files',
    description: 'Write tokens.css and DESIGN_SYSTEM.md into a target project directory.',
    inputSchema: {
      type: 'object',
      properties: {
        project_dir: { type: 'string' },
        name: { type: 'string' },
        tokens: { type: 'object' },
      },
      required: ['project_dir', 'tokens'],
    },
    _meta: { ui: { visibility: ['model', 'app'] } },
  },
  {
    name: 'get_preferences',
    title: 'Get Preferences',
    description: 'Read persisted Project Studio UI preferences.',
    inputSchema: { type: 'object', properties: {} },
    _meta: { ui: { visibility: ['app'] } },
  },
  {
    name: 'set_preferences',
    title: 'Set Preferences',
    description: 'Persist Project Studio UI preferences.',
    inputSchema: {
      type: 'object',
      properties: {
        lang: { type: 'string', enum: ['en', 'tr'] },
        parentDir: { type: 'string' },
        activePresetId: { type: 'string' },
        customTokens: { type: 'object' },
      },
    },
    _meta: { ui: { visibility: ['app'] } },
  },
];

const server = new Server(
  { name: 'project-studio', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
);

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: APP_URI,
      name: 'Project Studio App',
      description: 'Interactive Project Kickstart & UI Kit Design System Previewer',
      mimeType: APP_MIME,
      _meta: { ui: { prefersBorder: false } },
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri !== APP_URI) {
    throw new Error(`Unknown resource URI: ${request.params.uri}`);
  }
  return {
    contents: [
      {
        uri: APP_URI,
        mimeType: APP_MIME,
        text: readAppHtml(),
        _meta: { ui: { prefersBorder: false } },
      },
    ],
  };
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  try {
    if (name === 'open_project_studio') {
      const prefs = readPrefs();
      const validTabs = new Set(['kickstart', 'uikit']);
      return {
        content: [
          {
            type: 'text',
            text: `Project Studio ready | ${TEMPLATES.length} stack templates | ${DESIGN_PRESETS.length} UI Kit presets`,
          },
        ],
        structuredContent: {
          activeTab: validTabs.has(args.tab) ? args.tab : 'kickstart',
          prefs,
          templates: TEMPLATES,
          presets: DESIGN_PRESETS,
        },
      };
    }

    if (name === 'list_project_templates') {
      return {
        content: [{ type: 'text', text: TEMPLATES.map((t) => `${t.id}: ${t.name}`).join('\n') }],
        structuredContent: { templates: TEMPLATES },
      };
    }

    if (name === 'scaffold_project') {
      const prefs = readPrefs();
      const parentDir = args.parent_dir || prefs.parentDir;
      const res = scaffoldProject({
        projectName: args.project_name,
        parentDir,
        templateId: args.template_id || 'node-ts',
        license: args.license || 'MIT',
        lang: args.lang || prefs.lang,
        initGit: args.init_git !== false,
      });
      writePrefs({ parentDir });
      return {
        content: [
          {
            type: 'text',
            text: `Created ${res.projectName} (${res.templateId}) at ${res.projectDir} (${res.createdFiles.length} files).`,
          },
        ],
        structuredContent: res,
      };
    }

    if (name === 'scan_design_tokens') {
      const res = scanProjectTokens(args.project_dir);
      return {
        content: [
          {
            type: 'text',
            text: `Found ${res.count} CSS custom property token(s) across ${res.scannedFiles.length} file(s).`,
          },
        ],
        structuredContent: res,
      };
    }

    if (name === 'export_design_system') {
      const res = exportDesignSystem(args.project_dir, args.tokens, args.name || 'Design System');
      return {
        content: [
          {
            type: 'text',
            text: `Exported tokens.css and DESIGN_SYSTEM.md to ${res.projectDir}.`,
          },
        ],
        structuredContent: res,
      };
    }

    if (name === 'get_preferences') {
      const prefs = readPrefs();
      return { content: [{ type: 'text', text: JSON.stringify(prefs) }], structuredContent: prefs };
    }

    if (name === 'set_preferences') {
      const prefs = writePrefs(args);
      return { content: [{ type: 'text', text: JSON.stringify(prefs) }], structuredContent: prefs };
    }

    return { isError: true, content: [{ type: 'text', text: `Unknown tool: ${name}` }] };
  } catch (err) {
    return { isError: true, content: [{ type: 'text', text: `Error: ${err?.message || String(err)}` }] };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
