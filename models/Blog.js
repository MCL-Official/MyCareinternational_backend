// models/Blog.js
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  meta_title: { type: String, required: true },
  meta_tags: { type: String, required: true },
  meta_description: { type: String, required: true },
  added_by: { type: String, required: true },
  read_time: { type: String, required: true },
  blog_short_content1: { type: String, required: true },
  blog_content: { type: String, required: true },
  banner_content: { type: String, required: true },
  blog_short_content2: { type: String, required: true },
  category: { type: String, required: true },
  tags: { type: [String], required: true },
  status: { type: String, required: true },
  banner_image: { type: String},
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
