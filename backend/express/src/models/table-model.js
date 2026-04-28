const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  columns: [{
    name: String,
    type: { type: String, enum: ['text', 'number', 'date', 'boolean', 'json', 'ai'], default: 'text' },
    ai_prompt: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Table', TableSchema);
