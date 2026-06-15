/**
 * Migration script to import legacy templates from data/user-templates.json
 * into MongoDB Project documents. Creates a demo user if none exists.
 */
const fs = require('fs');
const path = require('path');
const connectDB = require('../config/db');
const User = require('../models/User');
const Project = require('../models/Project');

async function run() {
  await connectDB();
  const file = path.resolve(__dirname, '../../../data/user-templates.json');
  if (!fs.existsSync(file)) {
    console.log('No legacy file found, skipping.');
    process.exit(0);
  }
  const raw = fs.readFileSync(file, 'utf8');
  let templates = [];
  try { templates = JSON.parse(raw || '[]'); } catch (e) { templates = []; }
  if (!templates.length) {
    console.log('No templates to migrate.');
    process.exit(0);
  }

  // Ensure demo user
  let user = await User.findOne({ email: 'demo@local' });
  if (!user) {
    user = new User({ name: 'Demo', email: 'demo@local', password: 'demo' });
    await user.save();
    console.log('Created demo user: demo@local / demo');
  }

  for (const t of templates) {
    const p = new Project({
      owner: user._id,
      title: t.title || t.name || 'Imported Template',
      category: t.category || 'Imported',
      css: t.css || '',
      pages: t.pages || [],
      customComponents: t.customComponents || []
    });
    await p.save();
    console.log('Imported:', p.title);
  }

  console.log('Migration complete.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
