let mongoose = require('mongoose');

function createModels() {
  mongoose.connect('mongodb://localhost:27017/CollaBoard', { config: { autoIndex: false } });
  let User= mongoose.model('User', require('./User'));
  let Room= mongoose.model('Room', require('./Room'));
  let models = {
    User,
    Room,
  }
  return models;
}

let models = createModels();

module.exports = models;
