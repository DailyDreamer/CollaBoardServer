let router = require('express').Router()
let models = require('../models')

router.get('/', (req, res) => {
  models.User.findById(req.user._id, (err, data) => {
    if (err) {
      res.json({err: err});
    } else if (data) {
      res.json(data);
    } else {
      res.json({err: 'User not exist!'});
    }
  });
});

module.exports = router;
