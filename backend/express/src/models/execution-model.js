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
    enum: ["PENDING", "RUNNING", "COMPLETED", "FAILED", "PAUSED", "STOPPED"],
    default: "PENDING",
  },

  // LangGraph State Checkpoint (The "MemorySaver" state)
  checkpoint: { type: mongoose.Schema.Types.Mixed, default: {} },
  contextData: { type: mongoose.Schema.Types.Mixed, default: {} },

  // EMBEDDED STEPS (The "Lunchbox" Strategy) for high-speed reads [cite: 92]
  steps: [
    {
      nodeId: { type: String, required: true }, // Matches React Flow Node ID
      label: String, // e.g., "Check Inventory"
      status: {
        type: String,
        enum: ["PENDING", "RUNNING", "SUCCESS", "FAILED", "STOPPED", "SKIPPED"],
      },
      input: mongoose.Schema.Types.Mixed,
      output: mongoose.Schema.Types.Mixed, // Result from API/AI
      error: String,
      startedAt: Date,
      completedAt: Date,
      latencyMs: Number, // Performance metric
    },
  ],

  // Structured System Logs for Frontend Terminal Stream
  logs: [
    {
      timestamp: { type: Date, default: Date.now },
      level: { type: String, enum: ["INFO", "WARN", "ERROR", "DEBUG"], default: "INFO" },
      message: String,
      nodeId: String, // Optional relation to specific node
    }
  ],

  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
});

module.exports = mongoose.model("Execution", ExecutionSchema);
