const mongoose = require('mongoose');

const blueprintSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'General' },
  definition: { type: Object, required: true }, // The react-flow nodes and edges
  tags: [String],
  authorName: { type: String, default: 'ORvexia User' },
  isFeatured: { type: Boolean, default: false },
  popularity: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blueprint', blueprintSchema);
