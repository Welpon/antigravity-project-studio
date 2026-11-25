import {
  App,
  applyDocumentTheme,
  applyHostStyleVariables,
} from '@modelcontextprotocol/ext-apps';

const I18N = {
  en: {
    appName: 'Project Studio',
    tabKickstart: 'Project Kickstart',
    tabUiKit: 'UI Kit Preview',
    chooseStack: '1. Choose Stack Template',
    projectSettings: '2. Project Settings',
    projectName: 'Project Name',
    projectNamePh: 'e.g. my-saas-app',
    parentDir: 'Target Parent Folder',
    license: 'License',
    agentsLang: 'AGENTS.md Language',
    initGit: 'Initialize Git repository (git init)',
    createProjectBtn: 'Create Project',
    creating: 'Creating...',
    createdSuccess: 'Project created successfully!',
    planWithAi: 'Open & Plan with AI',
    presetsTitle: 'Design System Presets',
    paletteTitle: 'Color Palette (Live Editable)',
    radiusLabel: 'Border Radius',
    liveGallery: 'Live Component Preview',
    exportDirPh: 'Target project folder to scan or export...',
    scanCssBtn: 'Scan Project CSS',
    exportFilesBtn: 'Export tokens.css + DESIGN_SYSTEM.md',
    sendDesignAi: 'Send Design System to AI',
    scannedTokens: 'Scanned CSS Tokens',
    sentToChat: 'Sent to chat.',
    chatUnavailable: 'Host does not support sending messages to chat.',
    nameRequired: 'Please enter a project name.',
  },
  tr: {
    appName: 'Project Studio',
    tabKickstart: 'Proje Başlatıcı',
    tabUiKit: 'UI Kit Önizleyici',
    chooseStack: '1. Stack Şablonu Seç',
    projectSettings: '2. Proje Ayarları',
    projectName: 'Proje Adı',
    projectNamePh: 'örn. my-saas-app',
    parentDir: 'Hedef Ana Klasör',
    license: 'Lisans',
    agentsLang: 'AGENTS.md Dili',
    initGit: 'Git deposu başlat (git init)',
    createProjectBtn: 'Projeyi Oluştur',
    creating: 'Oluşturuluyor...',
    createdSuccess: 'Proje başarıyla oluşturuldu!',
    planWithAi: 'AI ile Planla & Geliştir',
    presetsTitle: 'Hazır Tasarım Sistemleri',
    paletteTitle: 'Renk Paleti (Canlı Düzenle)',
    radiusLabel: 'Köşe Yuvarlaklığı (Radius)',
    liveGallery: 'Canlı Bileşen Önizleme',
    exportDirPh: 'CSS taranacak veya dışa aktarılacak proje klasörü...',
    scanCssBtn: 'Proje CSS Tara',
    exportFilesBtn: 'tokens.css + DESIGN_SYSTEM.md Kaydet',
    sendDesignAi: 'Tasarım Sistemini AI\'a Gönder',
    scannedTokens: 'Taranan CSS Değişkenleri',
    sentToChat: 'Sohbete gönderildi.',
    chatUnavailable: 'Bu ortam sohbete doğrudan mesaj göndermeyi desteklemiyor.',
    nameRequired: 'Lütfen bir proje adı girin.',
  },
};

const COLOR_FIELDS = [
  ['primary', 'Primary'],
  ['secondary', 'Secondary'],
  ['background', 'Background'],
  ['surface', 'Surface'],
  ['text', 'Text'],
  ['muted', 'Muted'],
  ['border', 'Border'],
  ['success', 'Success'],
  ['warning', 'Warning'],
  ['danger', 'Danger'],
];

const state = {
  lang: 'en',
  activeTab: 'kickstart',
  busy: false,
  toast: null,
  canSendMessage: false,
  // Kickstart
  templates: [],
  selectedTemplate: 'node-ts',
  projectName: '',
  parentDir: '',
  license: 'MIT',
  agentsLang: 'en',
  initGit: true,
  lastCreated: null,
  // UI Kit
  presets: [],
  activePresetId: 'midnight-saas',
  tokens: {
    primary: '#6366f1',
    secondary: '#06b6d4',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    muted: '#94a3b8',
    border: '#334155',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    radius: '10px',
    fontSans: 'Inter, system-ui, sans-serif',
    fontMono: 'JetBrains Mono, ui-monospace, monospace',
  },
  targetProjectDir: '',
  scannedCss: null,
};

function t(key) {
  return (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key;
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(text, isError = false) {
  state.toast = { text, isError };
  render();
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    state.toast = null;
    render();
  }, 5000);
}

const app = new App({ name: 'Project Studio', version: '1.0.0' });

function applyThemeFromContext(ctx) {
  if (!ctx) return;
  if (ctx.theme) applyDocumentTheme(ctx.theme);
  if (ctx.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
}

app.onhostcontextchanged = (ctx) => applyThemeFromContext(ctx);

app.ontoolinput = (params) => {
  const args = params?.arguments || {};
  if (args.tab === 'kickstart' || args.tab === 'uikit') state.activeTab = args.tab;
  render();
};

app.ontoolresult = (result) => {
  const sc = result?.structuredContent;
  if (!sc) return;
  applyBootstrapPayload(sc);
  render();
};

function applyBootstrapPayload(sc) {
  if (sc.activeTab === 'kickstart' || sc.activeTab === 'uikit') state.activeTab = sc.activeTab;
  if (Array.isArray(sc.templates)) state.templates = sc.templates;
  if (Array.isArray(sc.presets)) state.presets = sc.presets;
  if (sc.prefs) {
    if (sc.prefs.lang === 'en' || sc.prefs.lang === 'tr') {
      state.lang = sc.prefs.lang;
      state.agentsLang = sc.prefs.lang;
    }
    if (sc.prefs.parentDir) {
      state.parentDir = sc.prefs.parentDir;
      if (!state.targetProjectDir) state.targetProjectDir = sc.prefs.parentDir;
    }
    if (sc.prefs.activePresetId) state.activePresetId = sc.prefs.activePresetId;
    if (sc.prefs.customTokens) {
      state.tokens = { ...state.tokens, ...sc.prefs.customTokens };
    } else if (sc.presets?.length) {
      const found = sc.presets.find((p) => p.id === state.activePresetId) || sc.presets[0];
      if (found) state.tokens = { ...found.tokens };
    }
  }
}

async function callTool(name, args = {}) {
  const res = await app.callServerTool({ name, arguments: args });
  if (res?.isError) throw new Error(res?.content?.[0]?.text || 'Tool call failed');
  return res;
}

async function sendPromptToChat(text) {
  if (!state.canSendMessage) {
    showToast(t('chatUnavailable'), true);
    return;
  }
  try {
    await app.sendMessage({ role: 'user', content: [{ type: 'text', text }] });
    showToast(t('sentToChat'));
  } catch (err) {
    showToast(err.message || t('chatUnavailable'), true);
  }
}

async function loadInitial() {
  state.busy = true;
  render();
  try {
    const res = await callTool('open_project_studio', { tab: state.activeTab });
    if (res?.structuredContent) applyBootstrapPayload(res.structuredContent);
  } catch (err) {
    showToast(err.message, true);
  } finally {
    state.busy = false;
    render();
  }
}

async function toggleLang() {
  state.lang = state.lang === 'en' ? 'tr' : 'en';
  render();
  try {
    await callTool('set_preferences', { lang: state.lang });
  } catch {
    // non-fatal
  }
}

async function handleCreateProject() {
  if (!state.projectName.trim()) {
    showToast(t('nameRequired'), true);
    return;
  }
  state.busy = true;
  render();
  try {
    const res = await callTool('scaffold_project', {
      project_name: state.projectName.trim(),
      parent_dir: state.parentDir.trim(),
      template_id: state.selectedTemplate,
      license: state.license,
      lang: state.agentsLang,
      init_git: state.initGit,
    });
    state.lastCreated = res?.structuredContent || null;
    if (state.lastCreated?.projectDir) {
      state.targetProjectDir = state.lastCreated.projectDir;
    }
    showToast(t('createdSuccess'));
  } catch (err) {
    showToast(err.message, true);
  } finally {
    state.busy = false;
    render();
  }
}

async function handlePlanCreatedWithAi() {
  if (!state.lastCreated) return;
  const p = state.lastCreated;
  const prompt =
    state.lang === 'tr'
      ? `Project Studio ile yeni bir proje oluşturdum:\n- Klasör: \`${p.projectDir}\`\n- Şablon: \`${p.templateId}\`\n- Dosyalar: ${p.createdFiles.join(', ')}\n\nBu proje için ilk geliştirme adımlarını planlayalım.`
      : `I just scaffolded a new project with Project Studio:\n- Folder: \`${p.projectDir}\`\n- Template: \`${p.templateId}\`\n- Files: ${p.createdFiles.join(', ')}\n\nLet's plan the first implementation steps for this project.`;
  await sendPromptToChat(prompt);
}

async function selectPreset(presetId) {
  const found = state.presets.find((p) => p.id === presetId);
  if (!found) return;
  state.activePresetId = found.id;
  state.tokens = { ...found.tokens };
  render();
  try {
    await callTool('set_preferences', { activePresetId: found.id, customTokens: state.tokens });
  } catch {
    // non-fatal
  }
}

async function handleScanCss() {
  if (!state.targetProjectDir.trim()) return;
  state.busy = true;
  render();
  try {
    const res = await callTool('scan_design_tokens', { project_dir: state.targetProjectDir.trim() });
    state.scannedCss = res?.structuredContent || null;
    showToast(res?.content?.[0]?.text || 'Scanned.');
  } catch (err) {
    showToast(err.message, true);
  } finally {
    state.busy = false;
    render();
  }
}

async function handleExportDesign() {
  if (!state.targetProjectDir.trim()) return;
  state.busy = true;
  render();
  try {
    const preset = state.presets.find((p) => p.id === state.activePresetId);
    const res = await callTool('export_design_system', {
      project_dir: state.targetProjectDir.trim(),
      name: preset ? preset.name : 'Custom Design System',
      tokens: state.tokens,
    });
    showToast(res?.content?.[0]?.text || 'Exported.');
  } catch (err) {
    showToast(err.message, true);
  } finally {
    state.busy = false;
    render();
  }
}

async function handleSendDesignToAi() {
  const tk = state.tokens;
  const prompt =
    state.lang === 'tr'
      ? `Yeni arayüz ve bileşenler çizerken şu Project Studio tasarım sistemine birebir uy:\n- Primary: \`${tk.primary}\` | Secondary: \`${tk.secondary}\`\n- Background: \`${tk.background}\` | Surface: \`${tk.surface}\`\n- Text: \`${tk.text}\` | Muted: \`${tk.muted}\` | Border: \`${tk.border}\`\n- Success: \`${tk.success}\` | Warning: \`${tk.warning}\` | Danger: \`${tk.danger}\`\n- Radius: \`${tk.radius}\` | Sans: \`${tk.fontSans}\` | Mono: \`${tk.fontMono}\``
      : `Follow this exact Project Studio design system for all new screens and UI components:\n- Primary: \`${tk.primary}\` | Secondary: \`${tk.secondary}\`\n- Background: \`${tk.background}\` | Surface: \`${tk.surface}\`\n- Text: \`${tk.text}\` | Muted: \`${tk.muted}\` | Border: \`${tk.border}\`\n- Success: \`${tk.success}\` | Warning: \`${tk.warning}\` | Danger: \`${tk.danger}\`\n- Radius: \`${tk.radius}\` | Sans: \`${tk.fontSans}\` | Mono: \`${tk.fontMono}\``;
  await sendPromptToChat(prompt);
}

function renderKickstartTab() {
  const created = state.lastCreated;
  return `
    <div class="card">
      <div class="card-header"><span class="card-title">${esc(t('chooseStack'))}</span></div>
      <div class="grid-2">
        ${state.templates
          .map(
            (tpl) => `
          <button class="tpl-card ${state.selectedTemplate === tpl.id ? 'active' : ''}" data-action="select-template" data-id="${esc(tpl.id)}">
            <div class="row-between">
              <strong style="font-size:12.5px">${esc(tpl.name)}</strong>
              <span class="badge badge-accent">${esc(tpl.badge)}</span>
            </div>
            <span class="muted">${esc(tpl.description)}</span>
          </button>`
          )
          .join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-header"><span class="card-title">${esc(t('projectSettings'))}</span></div>
      <div class="grid-2">
        <div>
          <div class="muted" style="margin-bottom:3px">${esc(t('projectName'))}</div>
          <input class="input" id="projectNameInput" placeholder="${esc(t('projectNamePh'))}" value="${esc(state.projectName)}" />
        </div>
        <div>
          <div class="muted" style="margin-bottom:3px">${esc(t('parentDir'))}</div>
          <input class="input mono" id="parentDirInput" value="${esc(state.parentDir)}" />
        </div>
        <div>
          <div class="muted" style="margin-bottom:3px">${esc(t('license'))}</div>
          <select class="select" id="licenseSelect">
            <option value="MIT" ${state.license === 'MIT' ? 'selected' : ''}>MIT</option>
            <option value="Apache-2.0" ${state.license === 'Apache-2.0' ? 'selected' : ''}>Apache-2.0</option>
          </select>
        </div>
        <div>
          <div class="muted" style="margin-bottom:3px">${esc(t('agentsLang'))}</div>
          <select class="select" id="agentsLangSelect">
            <option value="en" ${state.agentsLang === 'en' ? 'selected' : ''}>English (en)</option>
            <option value="tr" ${state.agentsLang === 'tr' ? 'selected' : ''}>Türkçe (tr)</option>
          </select>
        </div>
      </div>
      <div class="row-between" style="margin-top:4px">
        <label class="toggle-label">
          <input type="checkbox" id="initGitCheck" ${state.initGit ? 'checked' : ''} />
          <span>${esc(t('initGit'))}</span>
        </label>
        <button class="btn btn-primary" data-action="create-project" ${state.busy ? 'disabled' : ''}>🚀 ${state.busy ? esc(t('creating')) : esc(t('createProjectBtn'))}</button>
      </div>
    </div>

    ${
      created
        ? `
    <div class="card" style="border-color:rgba(34,197,94,0.45)">
      <div class="row-between">
        <strong>✅ ${esc(created.projectName)}</strong>
        ${
          state.canSendMessage
            ? `<button class="btn btn-sm btn-primary" data-action="plan-ai">✨ ${esc(t('planWithAi'))}</button>`
            : ''
        }
      </div>
      <div class="mono muted">${esc(created.projectDir)}</div>
      <div class="row">
        ${created.createdFiles.map((f) => `<span class="badge mono">${esc(f)}</span>`).join('')}
      </div>
    </div>`
        : ''
    }
  `;
}

function renderUiKitTab() {
  const tk = state.tokens;
  const scannedEntries = state.scannedCss ? Object.entries(state.scannedCss.variables || {}).slice(0, 24) : [];

  return `
    <div class="card">
      <div class="card-header">
        <span class="card-title">${esc(t('presetsTitle'))}</span>
        ${
          state.canSendMessage
            ? `<button class="btn btn-sm btn-primary" data-action="send-design-ai">✨ ${esc(t('sendDesignAi'))}</button>`
            : ''
        }
      </div>
      <div class="row">
        ${state.presets
          .map(
            (p) => `
          <button class="btn btn-sm ${state.activePresetId === p.id ? 'btn-primary' : ''}" data-action="select-preset" data-id="${esc(p.id)}">
            <span style="width:10px;height:10px;border-radius:50%;background:${esc(p.tokens.primary)};display:inline-block"></span>
            ${esc(p.name)}
          </button>`
          )
          .join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">${esc(t('paletteTitle'))}</span>
        <div class="row">
          <span class="muted">${esc(t('radiusLabel'))}:</span>
          <select class="select" id="radiusSelect" style="width:82px;padding:3px 6px">
            ${['4px', '6px', '8px', '10px', '14px', '20px']
              .map((r) => `<option value="${r}" ${tk.radius === r ? 'selected' : ''}>${r}</option>`)
              .join('')}
          </select>
        </div>
      </div>
      <div class="swatch-grid">
        ${COLOR_FIELDS.map(
          ([key, label]) => `
          <label class="swatch-item">
            <input type="color" data-color-key="${key}" value="${esc(tk[key] || '#000000')}" />
            <div style="display:flex;flex-direction:column;min-width:0">
              <span style="font-size:11px;font-weight:600">${label}</span>
              <span class="mono muted" style="font-size:10px">${esc(tk[key])}</span>
            </div>
          </label>`
        ).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-header"><span class="card-title">${esc(t('liveGallery'))}</span></div>
      <div class="preview-stage" style="background:${esc(tk.background)};color:${esc(tk.text)};font-family:${esc(tk.fontSans)};border-color:${esc(tk.border)}">
        <div style="background:${esc(tk.surface)};border:1px solid ${esc(tk.border)};border-radius:${esc(tk.radius)};padding:12px;display:flex;flex-direction:column;gap:9px">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
            <div>
              <div style="font-size:16px;font-weight:700">Heading / Card Title</div>
              <div style="font-size:12px;color:${esc(tk.muted)}">Subtitle and helper copy styled with your live design tokens.</div>
            </div>
            <div style="display:flex;gap:5px;flex-wrap:wrap">
              <span style="padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;background:${esc(tk.success)};color:#04120a">Success</span>
              <span style="padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;background:${esc(tk.warning)};color:#1a1000">Warning</span>
              <span style="padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;background:${esc(tk.danger)};color:#fff">Danger</span>
            </div>
          </div>
          <div style="display:flex;gap:7px;flex-wrap:wrap">
            <button type="button" style="border:none;padding:7px 12px;border-radius:${esc(tk.radius)};background:${esc(tk.primary)};color:#fff;font-weight:600;font-size:12px;cursor:default">Primary Action</button>
            <button type="button" style="border:none;padding:7px 12px;border-radius:${esc(tk.radius)};background:${esc(tk.secondary)};color:#fff;font-weight:600;font-size:12px;cursor:default">Secondary</button>
            <button type="button" style="border:1px solid ${esc(tk.border)};padding:7px 12px;border-radius:${esc(tk.radius)};background:transparent;color:${esc(tk.text)};font-weight:600;font-size:12px;cursor:default">Ghost Button</button>
          </div>
          <input type="text" readonly value="Sample Input Field (${esc(tk.radius)})" style="padding:7px 9px;border-radius:${esc(tk.radius)};border:1px solid ${esc(tk.border)};background:${esc(tk.background)};color:${esc(tk.text)};font-size:12px" />
        </div>
      </div>
    </div>

    <div class="card">
      <div class="row">
        <input class="input mono" id="targetProjectInput" placeholder="${esc(t('exportDirPh'))}" value="${esc(state.targetProjectDir)}" style="flex:1" />
      </div>
      <div class="row">
        <button class="btn btn-sm" data-action="scan-css" ${state.busy ? 'disabled' : ''}>🔍 ${esc(t('scanCssBtn'))}</button>
        <button class="btn btn-sm btn-primary" data-action="export-design" ${state.busy ? 'disabled' : ''}>💾 ${esc(t('exportFilesBtn'))}</button>
      </div>
      ${
        scannedEntries.length > 0
          ? `
        <div class="muted">${esc(t('scannedTokens'))} (${state.scannedCss.count}):</div>
        <div class="row">
          ${scannedEntries.map(([k, v]) => `<span class="badge mono">${esc(k)}: ${esc(v)}</span>`).join('')}
        </div>`
          : ''
      }
    </div>
  `;
}

function render() {
  const root = document.getElementById('root');
  if (!root) return;
  const toastHtml = state.toast
    ? `<div class="toast ${state.toast.isError ? 'toast-err' : 'toast-ok'}">${esc(state.toast.text)}</div>`
    : '';

  root.innerHTML = `
    <div class="app-shell">
      <div class="topbar">
        <div class="brand">
          <span class="brand-icon">🎨</span>
          <span>${esc(t('appName'))}</span>
        </div>
        <button class="btn btn-sm" data-action="toggle-lang">${state.lang === 'en' ? 'EN / TR' : 'TR / EN'}</button>
      </div>

      <div class="tabs">
        <button class="tab-btn ${state.activeTab === 'kickstart' ? 'active' : ''}" data-action="tab" data-tab="kickstart">🚀 ${esc(t('tabKickstart'))}</button>
        <button class="tab-btn ${state.activeTab === 'uikit' ? 'active' : ''}" data-action="tab" data-tab="uikit">🎨 ${esc(t('tabUiKit'))}</button>
      </div>

      ${toastHtml}
      ${state.activeTab === 'kickstart' ? renderKickstartTab() : renderUiKitTab()}
    </div>
  `;
}

document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.id === 'projectNameInput') state.projectName = el.value;
  if (el.id === 'parentDirInput') state.parentDir = el.value;
  if (el.id === 'targetProjectInput') state.targetProjectDir = el.value;
  if (el.dataset?.colorKey) {
    state.tokens = { ...state.tokens, [el.dataset.colorKey]: el.value };
    render();
  }
});

document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.id === 'licenseSelect') state.license = el.value;
  if (el.id === 'agentsLangSelect') state.agentsLang = el.value;
  if (el.id === 'initGitCheck') state.initGit = el.checked;
  if (el.id === 'radiusSelect') {
    state.tokens = { ...state.tokens, radius: el.value };
    render();
  }
  if (el.dataset?.colorKey) {
    callTool('set_preferences', { customTokens: state.tokens }).catch(() => {});
  }
});

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;

  if (action === 'tab') {
    state.activeTab = btn.dataset.tab;
    render();
  } else if (action === 'toggle-lang') {
    toggleLang();
  } else if (action === 'select-template') {
    state.selectedTemplate = btn.dataset.id;
    render();
  } else if (action === 'create-project') {
    handleCreateProject();
  } else if (action === 'plan-ai') {
    handlePlanCreatedWithAi();
  } else if (action === 'select-preset') {
    selectPreset(btn.dataset.id);
  } else if (action === 'scan-css') {
    handleScanCss();
  } else if (action === 'export-design') {
    handleExportDesign();
  } else if (action === 'send-design-ai') {
    handleSendDesignToAi();
  }
});

async function bootstrap() {
  render();
  await app.connect();
  applyThemeFromContext(app.getHostContext());
  const caps = app.getHostCapabilities();
  state.canSendMessage = Boolean(caps?.message);
  await loadInitial();
}

bootstrap().catch((err) => {
  showToast(err?.message || 'Failed to connect MCP App', true);
});
