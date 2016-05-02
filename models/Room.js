var mongoose = require('mongoose');

var RoomSchema = {
  _id: String,
  name: String,
  notes: String,
  links: String,
};

module.exports = new mongoose.Schema(RoomSchema);
