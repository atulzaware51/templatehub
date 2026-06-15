/*
  server.js
  ----------
  Lightweight Express server for TemplateHub.
  Serves the client app from /public and exposes API endpoints
  for reading and saving user templates in a JSON data file.
*/

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_PATH = path.join(__dirname, 'data', 'user-templates.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper: read user-created templates from disk and return empty array if absent.
async function readUserTemplates() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Helper: write user-created templates back to disk.
async function writeUserTemplates(templates) {
  await fs.writeFile(DATA_PATH, JSON.stringify(templates, null, 2), 'utf-8');
}

// API: return saved templates from the server.
app.get('/api/templates', async (req, res) => {
  try {
    const saved = await readUserTemplates();
    res.json({ success: true, saved });
  } catch (error) {
    console.error('Failed to read templates:', error);
    res.status(500).json({ success: false, message: 'Unable to load saved templates.' });
  }
});

// API: save or update one user template.
app.post('/api/templates', async (req, res) => {
  try {
    const { template } = req.body;
    if (!template || !template.id) {
      return res.status(400).json({ success: false, message: 'Template object with an id is required.' });
    }

    const saved = await readUserTemplates();
    const existingIndex = saved.findIndex((entry) => entry.id === template.id);

    if (existingIndex >= 0) {
      saved[existingIndex] = template;
    } else {
      saved.push(template);
    }

    await writeUserTemplates(saved);
    res.json({ success: true, saved });
  } catch (error) {
    console.error('Failed to save template:', error);
    res.status(500).json({ success: false, message: 'Unable to save template.' });
  }
});

// API: reset saved templates to empty state.
app.post('/api/templates/reset', async (req, res) => {
  try {
    await writeUserTemplates([]);
    res.json({ success: true, saved: [] });
  } catch (error) {
    console.error('Failed to reset templates:', error);
    res.status(500).json({ success: false, message: 'Unable to reset templates.' });
  }
});

// Fallback: serve index.html for single-page navigation.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`TemplateHub server is running on http://localhost:${PORT}`);
});
