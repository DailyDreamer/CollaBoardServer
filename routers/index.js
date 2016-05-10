let router = require('express').Router()

router.use('/', require('./auth'));
router.use('/user', require('./user'));
router.use('/room', require('./room'));

module.exports = router;
