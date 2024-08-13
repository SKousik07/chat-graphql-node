const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["text", "image"],
    default: "text",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const groupSchema = new mongoose.Schema({
  combinedId: {
    type: String,
    required: true,
    unique: true,
  },
  messages: [messageSchema],
});

const Group = mongoose.models.Group || mongoose.model("Group", groupSchema);

module.exports = { Group };
