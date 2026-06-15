// Small helper for editor page to open a specific template when ?id=... is provided
window.addEventListener('load', () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id && window.app && typeof window.app.openTemplate === 'function') {
    // Defer slightly to allow app.init to finish
    setTimeout(() => window.app.openTemplate(id), 300);
  }
});
