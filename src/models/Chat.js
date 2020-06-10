const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChatSchema = new Schema({
  nicksent: String,
  nickreceive: { type: String, default: "all" },
  msg: String,
  type: String,
  created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', ChatSchema);
