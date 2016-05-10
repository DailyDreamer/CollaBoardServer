let router = require('express').Router()
let jwt = require('jsonwebtoken')
let models = require('../models')
let Helper = require('../lib/Helper')
let config = require('../config.json')

router.post('/signup', (req, res) => {
  let user = req.body;
  models.User.findById(user._id, (err, data) => {
    if (err) {
      res.json({err: err});
    } else if(data) {
      res.json({err: 'User already exist!'});
    } else {
      let salt = new Date().getTime().toString();
      models.User.create({
        _id: user._id,
        salt: salt,
        password: Helper.hmac(salt, user.password)
      });
      res.json({success: 'Signup success!'});
    }
  });
});

router.post('/login', (req, res) => {
  let user = req.body;
  models.User.findById(user._id, (err, data) => {
    if (err) {
      res.json({err: err});
    } else if(data) {
      if (Helper.hmac(data.salt, user.password) === data.password){
        let token = jwt.sign({ _id: data._id }, config.JWTSecret);
        res.cookie('token', token, { maxAge: 180*24*3600*1000, httpOnly: true });
        res.json({ success: 'Login success!' });
      } else {
        res.json({err: 'Password not valid!'});
      }
    } else {
      res.json({err: 'User not exist!'});
    }
  });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
});

module.exports = router;
