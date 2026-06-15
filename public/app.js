/*
  public/app.js
  ------------
  Main browser application logic for TemplateHub.
  Handles template loading, editor actions, preview rendering,
  command palette, asset management, page state, and API persistence.
*/

const SNIPPETS = {
  container: '<div style="padding:24px; background:#ffffff; border:1px dashed #d1d5db; border-radius:18px; min-height:120px;"><p>Container</p></div>',
  row: '<div style="display:flex; gap:16px; flex-wrap:wrap;"><div style="flex:1; min-width:120px; padding:20px; border:1px dashed #d1d5db; border-radius:18px;">Column</div><div style="flex:1; min-width:120px; padding:20px; border:1px dashed #d1d5db; border-radius:18px;">Column</div></div>',
  navbar: '<nav style="display:flex; justify-content:space-between; align-items:center; gap:16px; padding:18px 24px; background:#f8fafc; border-radius:26px;"><strong>Brand</strong><div><a href="#" style="margin-right:18px; color:#4b5563; text-decoration:none;">Home</a><a href="#" style="color:#4b5563; text-decoration:none;">About</a></div></nav>',
  heading: '<h2 style="font-size:2rem; margin:0;">New Heading</h2>',
  text: '<p style="margin:0; color:#4b5563; line-height:1.8;">Editable paragraph text placeholder.</p>',
  button: '<button style="padding:12px 22px; border:none; border-radius:999px; background:#4f46e5; color:white; cursor:pointer;">Call to Action</button>',
  image: '<img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" alt="Placeholder image" style="width:100%; border-radius:18px; display:block;" />',
  form: '<form style="display:grid; gap:12px; padding:24px; background:#f8fafc; border-radius:24px;"><label>Email address<input type="email" placeholder="you@example.com" style="width:100%; padding:12px; border:1px solid #d1d5db; border-radius:14px;" /></label><button style="padding:12px 20px; border:none; border-radius:999px; background:#4f46e5; color:white; cursor:pointer;">Subscribe</button></form>',
  video: '<div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:24px;"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Video" style="position:absolute; inset:0; width:100%; height:100%; border:0;" allowfullscreen></iframe></div>'
};

const BUILT_IN_TEMPLATES = [
  {
    id: 'template-saas',
    title: 'SaaS Landing',
    category: 'Business',
    pages: [
      {
        name: 'Home',
        slug: 'index.html',
        html: '<main style="padding:64px 48px; max-width:960px; margin:0 auto;">' +
              '<section style="display:grid; gap:18px; max-width:640px;"><span style="font-size:0.95rem; color:#6366f1; font-weight:700;">LAUNCH FAST</span>' +
              '<h1 style="font-size:3rem; line-height:1.05; margin:0;">Build modern landing pages instantly.</h1>' +
              '<p style="color:#4b5563; font-size:1rem; line-height:1.75;">A designer-friendly template builder for teams and agencies.</p>' +
              '<button style="padding:14px 26px; border:none; border-radius:999px; background:#4f46e5; color:white; cursor:pointer;">Start Building</button></section>' +
              '</main>'
      }
    ],
    css: 'body{margin:0;font-family:Inter,sans-serif;background:#f8fafc;color:#111827;}button{font:inherit;} a{color:inherit;text-decoration:none;}'
  },
  {
    id: 'template-portfolio',
    title: 'Portfolio',
    category: 'Creative',
    pages: [
      {
        name: 'Home',
        slug: 'index.html',
        html: '<div style="display:grid; grid-template-columns:260px 1fr; min-height:100vh;">' +
              '<aside style="background:#111827; color:white; padding:48px; display:flex; flex-direction:column; justify-content:center; gap:22px;"><h1 style="margin:0;">Alex.</h1><p style="color:#9ca3af;">Designer & Creator</p></aside>' +
              '<main style="padding:48px; display:grid; gap:30px;"><h2 style="margin:0; font-size:2.5rem;">Selected work.</h2><div style="display:grid; gap:18px;"><article style="padding:24px; background:white; border-radius:24px; box-shadow:0 24px 60px rgba(15,23,42,0.08);"><h3>Brand refresh</h3><p style="color:#6b7280;">Modern visual identity for a product studio.</p></article></div></main></div>'
      }
    ],
    css: 'body{margin:0;font-family:Inter,sans-serif;background:#f8fafc;color:#111827;}article{font-family:Inter,sans-serif;}'
  }
];

const STORAGE_KEY = 'th_saved_templates';
const API_BASE = 'http://localhost:4000';
const AUTH_URL = `${API_BASE}/auth`;
const PROJECTS_URL = `${API_BASE}/projects`;
const UPLOADS_URL = `${API_BASE}/uploads`;

const app = {
  templates: [],
  currentView: 'home',
  savedTemplates: [],
  serverAvailable: false,
  commands: [
    { id: 'save', label: 'Save Project', action: () => editor.saveProject() },
    { id: 'export', label: 'Export Code', action: () => editor.exportCode() },
    { id: 'newpage', label: 'Add New Page', action: () => editor.addPage() },
    { id: 'responsive', label: 'Auto Responsive Styles', action: () => editor.autoResponsive() }
  ],

  // Initialize the application.
  init() {
    this.checkAuth().then(() => {
      this.loadSavedTemplates().then(() => {
        this.templates = [...this.savedTemplates, ...BUILT_IN_TEMPLATES];
        this.renderGallery();
        this.setupCommandPalette();
        editor.init();
      });
    });
  },

  async checkAuth() {
    try {
      const res = await fetch(`${AUTH_URL}/me`, { credentials: 'include' });
      const j = await res.json();
      this.authUser = j && j.ok ? j.user : null;
      this.updateAuthUI();
      return this.authUser;
    } catch (err) {
      this.authUser = null;
      this.updateAuthUI();
      return null;
    }
  },

  // Load saved templates from server or fallback to localStorage.
  async loadSavedTemplates() {
    const localSaved = this.getLocalTemplates();
    this.savedTemplates = [...localSaved];

    try {
        const response = await fetch(PROJECTS_URL, { credentials: 'include' });
      if (!response.ok) throw new Error('Network fetch failed');
      const json = await response.json();
      if (json.success) {
        this.serverAvailable = true;
        // Convert server projects to client template shape
        this.savedTemplates = json.projects.map((p) => ({ id: p._id, title: p.title, category: p.category, css: p.css, pages: p.pages, customComponents: p.customComponents }));
        this.persistLocalTemplates(this.savedTemplates);
      }
    } catch (error) {
      this.serverAvailable = false;
      console.warn('Server unavailable, using local storage only.', error);
    }
  },

  // Local storage helpers.
  getLocalTemplates() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  persistLocalTemplates(templates) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  },

  // Render the home screen gallery of templates.
  renderGallery() {
    const grid = document.getElementById('template-grid');
    grid.innerHTML = this.templates
      .map((template) => `
        <article class="template-card" onclick="app.openTemplate('${template.id}')">
          <div class="template-preview"><span>📄</span></div>
          <div class="template-meta">
            <h3>${template.title}</h3>
            <p>${template.category}</p>
          </div>
        </article>
      `)
      .join('');
  },

  // Load a template into the editor.
  openTemplate(id) {
    const template = this.templates.find((entry) => entry.id === id);
    if (!template) return;
    editor.loadTemplate(JSON.parse(JSON.stringify(template)));
    this.navigate('editor');
  },

  // Show the chosen app view.
  navigate(view) {
    this.currentView = view;
    document.querySelectorAll('.view').forEach((item) => item.classList.toggle('active', item.id === `view-${view}`));
    document.getElementById('toolbar').style.display = view === 'editor' ? 'flex' : 'none';
  },

  openSaveModal() {
    document.getElementById('save-modal').classList.remove('hidden');
    document.getElementById('save-name').value = editor.currentProject?.title || '';
  },

  // Authentication helpers
  getToken() {
    return localStorage.getItem('th_token');
  },

  setToken(token) {
    // when using HTTP-only cookies the server manages the token; clear local storage fallback
    if (!token) localStorage.removeItem('th_token');
    this.updateAuthUI();
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  showAuthModal() {
    document.getElementById('auth-modal').classList.remove('hidden');
  },

  closeAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
  },

  async performSignup() {
    const name = document.getElementById('auth-name').value.trim();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    if (!email || !password) return editor.showToast('Email and password required');
    try {
      const res = await fetch(`${AUTH_URL}/signup`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password })
      });
      const j = await res.json();
      if (!res.ok) return editor.showToast(j.message || 'Signup failed');
      this.closeAuthModal();
      editor.showToast('Signed up and logged in');
      await this.loadSavedTemplates();
    } catch (err) { editor.showToast('Signup failed'); }
  },

  async performLogin() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    if (!email || !password) return editor.showToast('Email and password required');
    try {
      const res = await fetch(`${AUTH_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const j = await res.json();
      if (!res.ok) return editor.showToast(j.message || 'Login failed');
      this.closeAuthModal();
      editor.showToast('Logged in');
      await this.loadSavedTemplates();
    } catch (err) { editor.showToast('Login failed'); }
  },

  logout() {
    // hit server to clear cookie
    fetch(`${AUTH_URL}/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    localStorage.removeItem('th_token');
    editor.showToast('Logged out');
    this.loadSavedTemplates();
  },

  updateAuthUI() {
    const btn = document.getElementById('auth-btn');
    if (!btn) return;
    if (this.isAuthenticated()) {
      btn.textContent = 'Logout';
      btn.onclick = () => this.logout();
    } else {
      btn.textContent = 'Login';
      btn.onclick = () => this.showAuthModal();
    }
  },

  closeSaveModal() {
    document.getElementById('save-modal').classList.add('hidden');
  },

  // Create and open an empty starter template for a new project.
  createNewProject() {
    const blankTemplate = {
      id: `user-${Date.now()}`,
      title: 'New Template',
      category: 'Draft',
      css: 'body{margin:0;font-family:Inter,sans-serif;background:#f8fafc;color:#111827;} img{max-width:100%;height:auto;}',
      customComponents: [],
      pages: [
        {
          name: 'Home',
          slug: 'index.html',
          html: '<section style="padding:48px; max-width:960px; margin:0 auto;"><h1 style="font-size:2.8rem; margin-bottom:16px;">New Page</h1><p style="color:#4b5563; line-height:1.8;">Use the editor to add content and customize this page.</p></section>'
        }
      ]
    };

    editor.loadTemplate(blankTemplate);
    this.closeSaveModal();
    this.openSaveModal();
  },

  // Confirm save and write template to localStorage and server.
  async confirmSave() {
    const name = document.getElementById('save-name').value.trim();
    if (!name) {
      editor.showToast('Please enter a template name.');
      return;
    }

    const project = editor.currentProject;
    if (!project) return;

    project.title = name;
    project.id ||= `user-${Date.now()}`;
    project.isUser = true;

    const existingIndex = this.savedTemplates.findIndex((item) => item.id === project.id);
    if (existingIndex > -1) {
      this.savedTemplates[existingIndex] = project;
    } else {
      this.savedTemplates.push(project);
    }

    this.persistLocalTemplates(this.savedTemplates);

    if (this.serverAvailable) {
      try {
        await this.saveTemplateToServer(project);
      } catch (error) {
        editor.showToast('Saved locally. Server sync failed.');
      }
    }

    this.templates = [...this.savedTemplates, ...BUILT_IN_TEMPLATES];
    this.renderGallery();
    this.closeSaveModal();
    editor.showToast('Template saved.');
  },

  // POST a template to the API server.
  async saveTemplateToServer(template) {
    const response = await fetch(PROJECTS_URL, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project: template })
    });
    if (!response.ok) throw new Error('Save API failed');
    const json = await response.json();
    if (!json.success) throw new Error(json.message || 'Save failed');
    const p = json.project;
    const converted = { id: p._id, title: p.title, category: p.category, css: p.css, pages: p.pages, customComponents: p.customComponents };
    const idx = this.savedTemplates.findIndex((s) => s.id === converted.id || s.id === template.id);
    if (idx > -1) this.savedTemplates[idx] = converted; else this.savedTemplates.push(converted);
    this.persistLocalTemplates(this.savedTemplates);
  },

  // Remove all saved templates from storage and server.
  async resetSavedTemplates() {
    if (!confirm('This will remove all saved templates. Continue?')) return;

    localStorage.removeItem(STORAGE_KEY);
    this.savedTemplates = [];
    this.templates = [...this.savedTemplates, ...BUILT_IN_TEMPLATES];
    this.renderGallery();

    if (this.serverAvailable) {
      try {
        await fetch(`${API_URL}/reset`, { method: 'POST' });
        this.showToast('Server templates reset.');
      } catch (error) {
        editor.showToast('Reset locally. Server reset failed.');
      }
    } else {
      editor.showToast('Saved templates reset.');
    }
  },

  setupCommandPalette() {
    document.getElementById('cmd-query').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const first = document.querySelector('.cmd-item');
        if (first) first.click();
      }
    });
    this.renderCommands();
  },

  renderCommands() {
    const list = document.getElementById('cmd-list');
    list.innerHTML = this.commands
      .map((cmd) => `<div class="cmd-item" onclick="app.executeCommand('${cmd.id}')">${cmd.label}</div>`)
      .join('');
  },

  executeCommand(id) {
    const command = this.commands.find((entry) => entry.id === id);
    if (command) command.action();
    this.toggleCommandPalette();
  },

  filterCommands() {
    const query = document.getElementById('cmd-query').value.toLowerCase();
    document.querySelectorAll('.cmd-item').forEach((item) => {
      item.style.display = item.textContent.toLowerCase().includes(query) ? 'grid' : 'none';
    });
  },

  toggleCommandPalette() {
    const palette = document.getElementById('command-palette');
    palette.classList.toggle('hidden');
    if (!palette.classList.contains('hidden')) {
      document.getElementById('cmd-query').value = '';
      document.getElementById('cmd-query').focus();
    }
  }
};

const editor = {
  currentProject: null,
  activePageSlug: 'index.html',
  selectedElementUid: null,
  selectedElementTag: null,
  history: [],
  historyIndex: -1,
  previewMode: false,
  assets: [],

  init() {
    this.renderComponentPalette();
    this.attachIframeListener();
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        app.toggleCommandPalette();
      }
    });
    this.openDefaultHome();
  },

  attachIframeListener() {
    window.addEventListener('message', (event) => {
      if (!event.data || event.data.type !== 'elementSelected') return;
      this.handleSelection(event.data.payload);
    });
  },

  openDefaultHome() {
    app.navigate('home');
  },

  loadTemplate(template) {
    template.customComponents ||= [];
    template.css ||= '';
    this.currentProject = template;
    this.activePageSlug = template.pages[0].slug;
    this.selectedElementUid = null;
    this.renderPageList();
    this.renderEditorHeader();
    this.renderCustomComponents();
    this.pushHistory();
    this.updatePreview();
    this.switchTab('pages');
  },

  renderComponentPalette() {
    const grid = document.getElementById('component-grid');
    const core = Object.keys(SNIPPETS)
      .map((key) => `
        <div class="component-card" draggable="true" ondragstart="editor.startDrag(event, '${key}')" onclick="editor.insertSnippet('${key}')">
          <strong>${key}</strong>
          <p class="muted">Add a ${key} element</p>
        </div>
      `)
      .join('');

    grid.innerHTML = core;
  },

  renderCustomComponents() {
    const custom = this.currentProject?.customComponents || [];
    const existingSection = document.getElementById('custom-component-section');
    if (!custom.length) {
      if (existingSection) existingSection.remove();
      return;
    }

    const grid = document.getElementById('component-grid');
    let container = existingSection;
    if (!container) {
      container = document.createElement('div');
      container.id = 'custom-component-section';
      container.innerHTML = '<div class="section-header"><span>My Components</span></div>';
      grid.parentElement.insertBefore(container, grid);
      const list = document.createElement('div');
      list.id = 'custom-component-list';
      list.className = 'component-grid';
      container.appendChild(list);
    }

    const list = document.getElementById('custom-component-list');
    list.innerHTML = custom
      .map((component, index) => `
        <div class="component-card" onclick="editor.insertCustomComponent(${index})">
          <strong>${component.name}</strong>
          <p class="muted">Saved layout</p>
        </div>
      `)
      .join('');
  },

  renderPageList() {
    const list = document.getElementById('pages-list');
    list.innerHTML = this.currentProject.pages
      .map((page) => `
        <div class="page-card" onclick="editor.switchPage('${page.slug}')">
          <strong>${page.name}</strong>
          <div class="muted">${page.slug}</div>
        </div>
      `)
      .join('');
  },

  renderEditorHeader() {
    const page = this.getActivePage();
    document.getElementById('page-title').innerText = `Editing: ${page.name}`;
    document.getElementById('page-path').innerText = `/${page.slug}`;
  },

  switchTab(tabId) {
    document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab.id === `tab-${tabId}`));
    document.querySelectorAll('.sidebar-panel').forEach((panel) => panel.classList.toggle('active', panel.id === `panel-${tabId}`));
  },

  getActivePage() {
    return this.currentProject.pages.find((page) => page.slug === this.activePageSlug);
  },

  switchPage(slug) {
    this.activePageSlug = slug;
    this.renderEditorHeader();
    this.clearSelection();
    this.updatePreview();
  },

  addPage() {
    const name = prompt('Enter a new page name:');
    if (!name) return;
    const slug = `${name.toLowerCase().trim().replace(/\s+/g, '-')}.html`;
    if (this.currentProject.pages.some((page) => page.slug === slug)) {
      editor.showToast('Page slug already exists.');
      return;
    }
    this.currentProject.pages.push({ name, slug, html: `<section style="padding:48px;"><h1>${name}</h1><p>New page content.</p></section>` });
    this.renderPageList();
    this.switchPage(slug);
    this.pushHistory();
  },

  insertSnippet(type) {
    const snippet = SNIPPETS[type] || SNIPPETS.container;
    const page = this.getActivePage();
    page.html += snippet;
    this.updatePreview();
    this.pushHistory();
  },

  insertCustomComponent(index) {
    const component = this.currentProject?.customComponents?.[index];
    if (!component) return;
    const page = this.getActivePage();
    page.html += component.html;
    this.updatePreview();
    this.pushHistory();
  },

  startDrag(event, type) {
    event.dataTransfer.setData('text/plain', type);
  },

  handleDrop(event) {
    event.preventDefault();
    const type = event.dataTransfer.getData('text/plain');
    if (!type) return;
    this.insertSnippet(type);
  },

  updatePreview() {
    const iframe = document.getElementById('preview-iframe');
    const page = this.getActivePage();
    const bodyWithIds = this.addUidAttributes(page.html);
    page.html = bodyWithIds;

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8" /><style>${this.currentProject.css || ''}</style></head><body>${page.html}</body><script>
      document.body.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        const element = event.target.closest('[data-th-uid]');
        if (!element) return;
        const styles = getComputedStyle(element);
        window.parent.postMessage({
          type: 'elementSelected',
          payload: {
            uid: element.dataset.thUid,
            tag: element.tagName,
            styles: {
              color: styles.color,
              backgroundColor: styles.backgroundColor,
              fontSize: styles.fontSize,
              padding: styles.padding,
              margin: styles.margin,
              borderRadius: styles.borderRadius,
              borderWidth: styles.borderWidth,
              borderColor: styles.borderColor
            },
            outerHTML: element.outerHTML
          }
        }, '*');
      }, true);
    <\/script></html>`;

    iframe.srcdoc = html;
    document.getElementById('preview-status').innerText = `Previewing ${this.getActivePage().name}`;
  },

  addUidAttributes(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const nodes = doc.body.firstElementChild.querySelectorAll('*');
    nodes.forEach((node) => {
      if (!node.dataset.thUid) {
        node.dataset.thUid = `uid-${Math.random().toString(16).slice(2)}`;
      }
    });
    return doc.body.firstElementChild.innerHTML;
  },

  handleSelection(payload) {
    this.selectedElementUid = payload.uid;
    this.selectedElementTag = payload.tag;
    document.getElementById('selection-panel').classList.remove('hidden');
    document.getElementById('selected-tag').innerText = payload.tag;
    document.getElementById('selected-uid').innerText = `#${payload.uid}`;
    document.getElementById('inp-color').value = this.rgbToHex(payload.styles.color);
    document.getElementById('inp-bg').value = this.rgbToHex(payload.styles.backgroundColor);
    document.getElementById('inp-font-size').value = parseInt(payload.styles.fontSize, 10) || 16;
    document.getElementById('inp-padding').value = this.extractPixels(payload.styles.padding);
    document.getElementById('inp-margin').value = this.extractPixels(payload.styles.margin);
    document.getElementById('inp-border-width').value = this.extractPixels(payload.styles.borderWidth);
    document.getElementById('inp-border-radius').value = this.extractPixels(payload.styles.borderRadius);
    document.getElementById('inp-border-color').value = this.rgbToHex(payload.styles.borderColor);
  },

  extractPixels(value) {
    return value?.replace('px', '') || '0';
  },

  rgbToHex(rgbValue) {
    if (!rgbValue || rgbValue === 'transparent') return '#ffffff';
    const matches = rgbValue.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!matches) return '#ffffff';
    const r = parseInt(matches[1], 10);
    const g = parseInt(matches[2], 10);
    const b = parseInt(matches[3], 10);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  },

  applyToSelectedElement(modifier) {
    if (!this.selectedElementUid) return;
    const page = this.getActivePage();
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${page.html}</div>`, 'text/html');
    const target = doc.querySelector(`[data-th-uid="${this.selectedElementUid}"]`);
    if (!target) return;
    modifier(target);
    page.html = doc.body.firstElementChild.innerHTML;
    this.updatePreview();
    this.pushHistory();
  },

  updateStyle(property, value) {
    if (!this.selectedElementUid) {
      editor.showToast('Select any element preview to style it.');
      return;
    }
    this.applyToSelectedElement((node) => {
      node.style[property] = value;
    });
  },

  updateClasses(value) {
    if (!this.selectedElementUid) {
      editor.showToast('Select an element first.');
      return;
    }
    this.applyToSelectedElement((node) => {
      node.className = value;
    });
  },

  clearPage() {
    if (!confirm('Clear the current page content?')) return;
    const page = this.getActivePage();
    page.html = '<section style="padding:48px;"><h1>Empty page</h1></section>';
    this.clearSelection();
    this.updatePreview();
    this.pushHistory();
  },

  autoResponsive() {
    if (!this.currentProject.css) this.currentProject.css = '';
    if (!this.currentProject.css.includes('@media')) {
      this.currentProject.css += `\n@media (max-width: 768px) {\n  body { padding: 16px !important; }\n  [style*='display:flex'] { flex-direction: column !important; }\n  img { max-width: 100% !important; height: auto !important; }\n}`;
      this.showToast('Responsive CSS added.');
      this.updatePreview();
      this.pushHistory();
    }
  },

  pushHistory() {
    const snapshot = JSON.stringify(this.currentProject);
    if (this.history[this.historyIndex] === snapshot) return;
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(snapshot);
    this.historyIndex = this.history.length - 1;
    document.getElementById('btn-undo').disabled = false;
    document.getElementById('btn-redo').disabled = false;
  },

  undo() {
    if (this.historyIndex <= 0) return;
    this.historyIndex -= 1;
    this.currentProject = JSON.parse(this.history[this.historyIndex]);
    this.renderPageList();
    this.renderEditorHeader();
    this.renderCustomComponents();
    this.updatePreview();
    document.getElementById('btn-redo').disabled = false;
    if (this.historyIndex === 0) document.getElementById('btn-undo').disabled = true;
  },

  redo() {
    if (this.historyIndex >= this.history.length - 1) return;
    this.historyIndex += 1;
    this.currentProject = JSON.parse(this.history[this.historyIndex]);
    this.renderPageList();
    this.renderEditorHeader();
    this.renderCustomComponents();
    this.updatePreview();
    document.getElementById('btn-undo').disabled = false;
    if (this.historyIndex === this.history.length - 1) document.getElementById('btn-redo').disabled = true;
  },

  saveSelectionAsComponent() {
    if (!this.selectedElementUid) {
      this.showToast('Select an element in the preview first.');
      return;
    }

    const page = this.getActivePage();
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${page.html}</div>`, 'text/html');
    const selected = doc.querySelector(`[data-th-uid="${this.selectedElementUid}"]`);
    if (!selected) return;

    const name = prompt('Enter a name for this component:');
    if (!name) return;

    this.currentProject.customComponents ||= [];
    this.currentProject.customComponents.push({ name, html: selected.outerHTML });
    this.renderCustomComponents();
    this.showToast(`Component saved: ${name}`);
  },

  wrapSelection() {
    if (!this.selectedElementUid) {
      this.showToast('Select an element to wrap first.');
      return;
    }

    this.applyToSelectedElement((node) => {
      const wrapper = node.ownerDocument.createElement('div');
      wrapper.style.padding = '16px';
      wrapper.style.border = '1px dashed #cbd5e1';
      wrapper.style.borderRadius = '18px';
      node.parentNode.replaceChild(wrapper, node);
      wrapper.appendChild(node);
    });
    this.showToast('Selected element wrapped.');
  },

  deleteSelection() {
    if (!this.selectedElementUid) {
      this.showToast('Select an element to delete.');
      return;
    }

    this.applyToSelectedElement((node) => {
      node.remove();
    });
    this.clearSelection();
    this.showToast('Element removed.');
  },

  clearSelection() {
    this.selectedElementUid = null;
    this.selectedElementTag = null;
    document.getElementById('selection-panel').classList.add('hidden');
  },

  addAsset(src) {
    this.assets.push(src);
    this.renderAssets();
  },

  uploadAsset(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];

    // If authenticated, attempt server upload first
    if (app.isAuthenticated()) {
      const fd = new FormData();
      fd.append('file', file);
      fetch(UPLOADS_URL, { method: 'POST', credentials: 'include', body: fd })
        .then((r) => r.json())
        .then((j) => {
          if (j && j.success && j.url) {
            this.addAsset(j.url);
            this.showToast('Asset uploaded to server. Click to insert.');
          } else {
            // fallback to data URL
            const reader = new FileReader();
            reader.onload = (event) => { this.addAsset(event.target.result); this.showToast('Asset uploaded. Click to insert.'); };
            reader.readAsDataURL(file);
          }
        })
        .catch(() => {
          const reader = new FileReader();
          reader.onload = (event) => { this.addAsset(event.target.result); this.showToast('Asset uploaded. Click to insert.'); };
          reader.readAsDataURL(file);
        });
      return;
    }

    // Not authenticated — use data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target.result;
      this.addAsset(src);
      this.showToast('Asset uploaded. Click to insert.');
    };
    reader.readAsDataURL(file);
  },

  renderAssets() {
    const grid = document.getElementById('asset-grid');
    grid.innerHTML = this.assets
      .map((src) => `
        <div class="asset-card" onclick="editor.insertImageAsset('${src}')">
          <img src="${src}" alt="Uploaded asset" style="width:100%; border-radius:14px; display:block;" />
        </div>
      `)
      .join('');
  },

  insertImageAsset(src) {
    const page = this.getActivePage();
    page.html += `<img src="${src}" alt="Uploaded asset" style="width:100%; border-radius:24px; display:block; margin-top:24px;" />`;
    this.updatePreview();
    this.pushHistory();
  },

  exportCode() {
    if (!this.currentProject) return;
    const zip = new JSZip();
    this.currentProject.pages.forEach((page) => {
      const fileContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${this.currentProject.title} - ${page.name}</title><style>${this.currentProject.css || ''}</style></head><body>${page.html}</body></html>`;
      zip.file(page.slug, fileContent);
    });
    zip.generateAsync({ type: 'blob' }).then((content) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${this.currentProject.title.replace(/\s+/g, '-') || 'templatehub'}.zip`;
      link.click();
    });
  },

  saveProject() {
    app.openSaveModal();
  },

  toggleCommandPalette() {
    app.toggleCommandPalette();
  },

  showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.padding = '14px 18px';
    toast.style.background = 'rgba(15, 23, 42, 0.92)';
    toast.style.color = 'white';
    toast.style.borderRadius = '18px';
    toast.style.boxShadow = '0 20px 50px rgba(15, 23, 42, 0.2)';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  }
};

window.addEventListener('DOMContentLoaded', () => app.init());
