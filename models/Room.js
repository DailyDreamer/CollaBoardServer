var mongoose = require('mongoose');

var RoomSchema = {
  _id: String,
  name: String,
  objects: String,
};

module.exports = new mongoose.Schema(RoomSchema);
