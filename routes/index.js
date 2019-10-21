var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const chars = req.app.get('chars').filter(el => el.pc);
  res.render('index', { title: 'Express2', chars:chars, timestamp:req.timestamp });
});

module.exports = router;
