const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  emailId: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  creationDate: {
    type: Date,
    required: true,
  }
});

module.exports = mongoose.model('user', userSchema);