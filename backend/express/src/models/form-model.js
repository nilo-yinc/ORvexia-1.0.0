const mongoose = require('mongoose');

const FormSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workflow_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow' },
  fields: [{
    label: String,
    name: String,
    type: { type: String, enum: ['text', 'textarea', 'number', 'email', 'select'], default: 'text' },
    required: { type: Boolean, default: false },
    options: [String] // For select fields
  }],
  settings: {
    submitButtonText: { type: String, default: 'Submit' },
    successMessage: { type: String, default: 'Form submitted successfully!' },
    theme: { type: String, default: 'dark' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Form', FormSchema);
