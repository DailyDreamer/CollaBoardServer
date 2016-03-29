var mongoose = require('mongoose');

var UserSchema = {
  _id: String,
  password: String,
  rooms: [{ rid:String }]
};

module.exports = new mongoose.Schema(UserSchema);
