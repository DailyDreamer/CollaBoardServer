let crypto = require('crypto')

exports.hmac = function(salt, data) {
  return crypto.createHmac('sha256', salt).update( data ).digest('hex');
}
