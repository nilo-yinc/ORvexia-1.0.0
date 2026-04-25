const mongoose = require("mongoose");

const ConnectionSchema = new mongoose.Schema({
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

module.exports = mongoose.model("Connection", ConnectionSchema);
