var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log("*** ENCOUNTER GET ***")
  const chars = req.app.get('chars');
  let char = chars.find(el => el.current)
  let handled = false
  if (req.query.action) {
    if (req.query.action === "edit") {
      console.log("Editing...")
      handled = true
      res.render('edit', { char:char, fields: req.app.get('fields'), timestamp:req.timestamp });
    }
  }
  if (req.query.attack) {
    const attack = char.attacks.find(el => el.name === req.query.attack)
  console.log(attack)
    console.log("Attacking...")
    handled = true
    res.render('attack', { chars:chars, char:char, attack:attack, charList:chars.map(el => el.name).join(' '), timestamp:req.timestamp });
  }
  if (!handled) {
    res.render('encounter', { chars:chars, char:char, attacks:char.attacks, timestamp:req.timestamp });
  }
});

router.post('/', function(req, res, next) {
  console.log("*** ENCOUNTER POST ***")
  console.log(req.query)
  console.log(req.body)
  const chars = req.app.get('chars');
  let char = chars.find(el => el.current)
  if (req.body.action) {
    if (req.body.action === "delay") {
      char.delay(chars)
    }
    else {
      char.nextChar(chars)
    }
    char = chars.find(el => el.current)
  }
  res.render('encounter', { chars:chars, char:char, attacks:char.attacks, timestamp:req.timestamp });
});



module.exports = router;
