const mongoose = require("mongoose");

const CopilotMessageSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.Mixed },
  role: { type: String, enum: ["user", "ai", "system"], required: true },
  text: { type: String, required: true },
  type: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const CopilotConversationSchema = new mongoose.Schema({
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  workflow_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workflow",
    required: true,
    index: true,
  },
  messages: {
    type: [CopilotMessageSchema],
    default: [],
  },
}, { timestamps: true });

CopilotConversationSchema.index({ owner_id: 1, workflow_id: 1 }, { unique: true });

module.exports = mongoose.model("CopilotConversation", CopilotConversationSchema);
