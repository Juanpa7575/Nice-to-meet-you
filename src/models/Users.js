const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChatSchema = new Schema({
  nick: String,
  pass: String,
  level: Int,
  avatar: String,
  created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', ChatSchema);
