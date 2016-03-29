var mongoose = require('mongoose');

var createModels = function() {
  mongoose.connect('mongodb://localhost:27017/CollaBoard');
  var User= mongoose.model('User', require('./User'));
  var Room= mongoose.model('Room', require('./Room'));
  var models = {
    User: User,
    Room: Room,
  }
  return models;
}

module.exports = createModels();
