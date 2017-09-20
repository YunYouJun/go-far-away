var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Go-Far-Away' });
});

router.get('/test', function(req, res, next) {
  res.render('test/hello', { title: 'Go-Far-Away' });
});

module.exports = router;
