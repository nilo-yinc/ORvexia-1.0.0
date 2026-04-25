const mongoose = require("mongoose");

const WorkflowVersionSchema = new mongoose.Schema({
  workflow_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workflow",
    required: true,
    index: true,
  },
  version: { type: String, required: true }, // e.g., "1.0.0"

  // React Flow data structure for workflow visualization
  definition: {
    nodes: [], // Array of workflow nodes with flexible structure
    edges: [],
    viewport: { x: Number, y: Number, zoom: Number }, // Canvas viewport state
  },

  isValid: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Composite Index: Ensure one workflow can't have duplicate version numbers
WorkflowVersionSchema.index({ workflow_id: 1, version: 1 }, { unique: true });

module.exports = mongoose.model("WorkflowVersion", WorkflowVersionSchema);
