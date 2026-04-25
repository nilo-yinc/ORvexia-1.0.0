const mongoose = require("mongoose");

const ExecutionSchema = new mongoose.Schema({
  workflow_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workflow",
    required: true,
  },
  version_id: { type: mongoose.Schema.Types.ObjectId, ref: "WorkflowVersion" }, // Audit trail: Which version ran?

  // Global Status
  status: {
    type: String,
    enum: ["PENDING", "RUNNING", "COMPLETED", "FAILED"],
    default: "PENDING",
  },

  // "The Bag" - Shared data context accessible by all nodes [cite: 81]
  contextData: { type: mongoose.Schema.Types.Mixed, default: {} },

  // EMBEDDED STEPS (The "Lunchbox" Strategy) for high-speed reads [cite: 92]
  steps: [
    {
      nodeId: { type: String, required: true }, // Matches React Flow Node ID
      label: String, // e.g., "Check Inventory"
      status: {
        type: String,
        enum: ["PENDING", "RUNNING", "SUCCESS", "FAILED"],
      },
      input: Object,
      output: Object, // Result from FastAPI
      error: String,
      startedAt: Date,
      completedAt: Date,
    },
  ],

  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
});

module.exports = mongoose.model("Execution", ExecutionSchema);
