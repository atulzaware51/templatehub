/*
  public/gallery.js
  Minimal gallery renderer used by /gallery page.
  It fetches templates from the backend API, falls back to localStorage, and renders clickable cards.
*/

const API_URL = '/api/templates';
const STORAGE_KEY = 'th_saved_templates';

async function loadTemplates() {
  // Try server first
  try {
    const res = await fetch(API_URL);
    if (res.ok) {
      const json = await res.json();
      if (json.success) return json.saved || [];
    }
  } catch (e) {
    console.warn('Server unavailable, falling back to local storage');
  }

  const local = localStorage.getItem(STORAGE_KEY);
  return local ? JSON.parse(local) : [];
}

function renderTemplates(templates) {
  const grid = document.getElementById('template-grid');
  grid.innerHTML = templates.map(t => `
    <article class="template-card" onclick="openEditor('${t.id}')">
      <div class="template-preview"><span>📄</span></div>
      <div class="template-meta"><h3>${t.title}</h3><p class="muted">${t.category || ''}</p></div>
    </article>
  `).join('');
}

function openEditor(id) {
  // Open editor and pass template id in query
  window.location.href = `/editor?id=${encodeURIComponent(id)}`;
}

window.addEventListener('DOMContentLoaded', async () => {
  const templates = await loadTemplates();
  // if no saved templates, show built-in ones by fetching /editor page data (fallback)
  if (!templates || !templates.length) {
    // create a basic local list from built-in default inside editor if available
    renderTemplates([{id:'template-saas', title:'SaaS Landing', category:'Business'},{id:'template-portfolio', title:'Portfolio', category:'Creative'}]);
    return;
  }
  renderTemplates(templates);
});
