const mongoose = require("mongoose");

const WorkflowSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Unique URL slug for webhook triggers
  triggerSlug: { type: String, required: true, unique: true, index: true },

  // Reference to the active workflow version
  active_version_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WorkflowVersion",
  },

  // Controls whether the workflow can be triggered
  is_active: { type: Boolean, default: false },

  // Quick stats for dashboard (Optional but helpful)
  stats: {
    total_runs: { type: Number, default: 0 },
    success_rate: { type: Number, default: 0 },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Workflow", WorkflowSchema);
