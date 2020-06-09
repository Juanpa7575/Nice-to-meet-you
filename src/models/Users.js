const mongoose = require('mongoose');
const { Schema } = mongoose;

const UsersSchema = new Schema({
  name: String,
  email: String,
  nick: String,
  pass: String,
  avatar: String,
  level: { type: String, default: 1 },
});

module.exports = mongoose.model('Users', UsersSchema);
