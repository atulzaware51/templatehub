/**
 * Template/project CRUD routes
 */
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Project = require('../models/Project');
const sanitizeHtml = require('sanitize-html');

const sanitizeOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img','section','nav','iframe','video','h1','h2','h3']),
  allowedAttributes: {
    '*': ['style','class','id','data-th-uid','src','alt','href','title','allow','allowfullscreen','frameborder','width','height']
  },
  allowedSchemesByTag: {
    img: ['http','https','data'],
    iframe: ['http','https']
  },
  allowedStyles: {
    '*': {
      'color': [/^.*$/],
      'background.*': [/^.*$/],
      'font.*': [/^.*$/],
      'padding': [/^.*$/],
      'margin': [/^.*$/],
      'border.*': [/^.*$/],
      'width': [/^.*$/],
      'height': [/^.*$/],
      'display': [/^.*$/]
    }
  }
};

// Get projects for current user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user._id });
    res.json({ success: true, projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create or update project
router.post('/', auth, async (req, res) => {
  try {
    const data = req.body.project;
    if (!data) return res.status(400).json({ success: false, message: 'Project data required' });
    let project;
    if (data._id) {
      // Sanitize incoming HTML fragments
      if (Array.isArray(data.pages)) {
        data.pages = data.pages.map((pg) => ({ ...pg, html: sanitizeHtml(pg.html || '', sanitizeOptions) }));
      }
      data.css = typeof data.css === 'string' ? data.css.replace(/<\/?script[\s\S]*?>/gi, '') : data.css;
      project = await Project.findOneAndUpdate({ _id: data._id, owner: req.user._id }, data, { new: true });
    } else {
      const pages = Array.isArray(data.pages) ? data.pages.map((pg) => ({ ...pg, html: sanitizeHtml(pg.html || '', sanitizeOptions) })) : [];
      const sanitizedCss = typeof data.css === 'string' ? data.css.replace(/<\/?script[\s\S]*?>/gi, '') : '';
      project = new Project({ ...data, pages, css: sanitizedCss, owner: req.user._id });
      await project.save();
    }
    res.json({ success: true, project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    await Project.deleteOne({ _id: req.params.id, owner: req.user._id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
