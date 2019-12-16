var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  const chars = req.app.get('chars');
  const refresh = req.app.get('refresh');
  if (req.query.name) {
    const char = chars.find(el => el.name === req.query.name)
    if (char) {
      res.render('char', { char: char, fields: req.app.get('fields'), timestamp:req.timestamp, refresh:refresh });
    }
    else {
      res.render('nochar', { name: req.query.name, timestamp:req.timestamp, refresh:refresh });
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
    res.render('chars', { chars:partList, timestamp:req.timestamp, refresh:refresh });
  }
});

router.post('/', function(req, res, next) {
  console.log("Editing " + req.body.name)
  const fields = req.app.get('fields')
  const chars = req.app.get('chars');
  const char = chars.find(el => el.name === req.body.name)
  console.log(char)
  console.log(req.body)
  for (let i = 0; i < fields.length; i++) {
    if (fields[i].type === 'int') {
      char[fields[i].name] = parseInt(req.body[fields[i].name])
    }
    else if (fields[i].type === 'bool') {
      char[fields[i].name] = (req.body[fields[i].name] !== undefined)
    }
    else {
      char[fields[i].name] = req.body[fields[i].name]
    }
  }
  console.log(char)
  res.redirect('/encounter')
})


module.exports = router;
