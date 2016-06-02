let mongoose = require('mongoose')
let config = require('../config.json')

function createModels() {
  mongoose.connect(config.dbaddr, { config: { autoIndex: false } });
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
