var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  const chars = req.app.get('chars');
  if (req.query.name) {
    const char = chars.find(el => el.name === req.query.name)
    if (char) {
      res.render('char', { char: char, fields: req.app.get('fields'), timestamp:req.timestamp });
    }
    else {
      res.render('nochar', { name: req.query.name, timestamp:req.timestamp });
    }
  }
  else {
    const list = [];
    const partList = [];
    list.push(chars.find(el => el.current))
    partList.push(list[0])
    for (let i = 1; i < chars.length; i++) {
      const c = chars.find(el => el.name === list[i - 1].next)
      list.push(c)
      if (!c.disabled) {
        partList.push(c)
      }
    }
    res.render('chars', { chars:partList, timestamp:req.timestamp });
  }
});

module.exports = router;
