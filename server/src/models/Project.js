/**
 * Project model — stores pages, css, owner reference
 */
const mongoose = require('mongoose');

const PageSchema = new mongoose.Schema({
  name: String,
  slug: String,
  html: String
}, { _id: false });

const ComponentSchema = new mongoose.Schema({
  name: String,
  html: String
}, { _id: false });

const ProjectSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Untitled' },
  category: String,
  css: String,
  pages: [PageSchema],
  customComponents: [ComponentSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ProjectSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', ProjectSchema);
