var mongoose = require('mongoose');

var UserSchema = {
  _id: String,
  salt: String,
  password: String,
  rooms: [{ rid:String, rname:String }]
};

module.exports = new mongoose.Schema(UserSchema);
