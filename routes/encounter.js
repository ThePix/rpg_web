var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log("*** ENCOUNTER ***")
  const chars = req.app.get('chars');
  console.log(chars)
  if (req.query.name) {
    const char = chars.find(el => el.name === req.query.name)
    if (char) {
      res.render('char', { char: char, fields: req.app.get('fields') });
    }
    else {
      res.render('nochar', { name: req.query.name });
    }
  }
  else {
    const list = [];
    list[0] = chars.find(el => el.current)
    for (let i = 1; i < chars.length; i++) {
      list[i] = chars.find(el => el.name === list[i - 1].next)
    }
    console.log(list)
    res.render('chars', { chars:list });
  }
});

module.exports = router;
