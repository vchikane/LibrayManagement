var express = require('express');
var router = express.Router();

/* get singleton instance of redis connection */
var client = require('../redis_lib/redis_connection.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
