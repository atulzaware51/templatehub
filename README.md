# TemplateHub

A browser-based visual website builder with a modern editor interface, template gallery, and simple API server for storing user templates.

## Project Structure

- `public/` — static frontend files
  - `index.html` — page layout and application shell
  - `styles.css` — UI styling for modern and classic presentation
  - `app.js` — editor logic, template loading, and interaction handling
- `server.js` — Express backend serving static assets and template storage API
- `data/user-templates.json` — saved user templates store
- `package.json` — Node project metadata and scripts

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. Open `http://localhost:3000`

## Notes

- User templates are persisted to `data/user-templates.json`.
- The editor supports page switching, drag/drop content snippets, style editing, and export.
