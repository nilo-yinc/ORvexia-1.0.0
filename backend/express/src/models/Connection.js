const mongoose = require("mongoose");

const ConnectionSchema = new mongoose.Schema({
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  appKey: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  data: {
    type: Object, // Store access tokens, refresh tokens, etc. here
    default: {},
  },
  publicData: {
    type: Object,
    default: {},
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ConnectionSchema.index({ owner_id: 1, appKey: 1 }, { unique: true });

module.exports = mongoose.model("Connection", ConnectionSchema);
