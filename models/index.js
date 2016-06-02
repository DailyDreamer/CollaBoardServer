let mongoose = require('mongoose');

function createModels() {
  mongoose.connect('mongodb://lixc12:123456@ds038379.mlab.com:38379/collaboard', { config: { autoIndex: false } });
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
