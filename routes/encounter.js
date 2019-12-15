const express = require('express');
const router = express.Router();


const log = function(s) {
  console.log("[93m" + s + "[0m")
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  log("*** ENCOUNTER GET ***")
  const chars = req.app.get('chars');
  const char = chars.find(el => el.current)
  console.log("char: " + char.name)
  res.render('encounter', { chars:chars, char:char, current:char, attacks:char.attacks, timestamp:req.timestamp });
});



router.get('/focus', function(req, res, next) {
  console.log("*** ENCOUNTER GET/FOCUS ***")
  const chars = req.app.get('chars');
  console.log("chars: " + chars.length)
  const current = chars.find(el => el.current)
  const char = chars.find(el => el.name === req.query.char)
  console.log("char: " + req.query.char)
  res.render('encounter', { chars:chars, char:char, current:current, attacks:char.attacks, timestamp:req.timestamp });
});




router.get('/action', function(req, res, next) {
  console.log("*** ENCOUNTER GET/ACTION ***")
  const chars = req.app.get('chars');
  console.log("chars: " + chars.length)
  let char = chars.find(el => el.name === req.query.char)
  console.log("char: " + req.query.char)
  //let char = chars.find(el => el.name === req.query.char)
  console.log("char: " + char.name)
  console.log("action: " + req.query.action)
  let handled
  if (req.query.action === "edit") {
    console.log("Editing...")
    handled = true
    res.render('edit', { char:char, fields: req.app.get('fields'), timestamp:req.timestamp });
  }
  else if (req.query.action === "delay") {
    console.log("Delaying...")
    char = char.delay(chars)
  }
  else if (req.query.action === "next") {
    console.log("Nexting...")
    char = char.nextChar(chars)
  }
  if (!handled) {
    res.render('encounter', { chars:chars, char:char, current:char, attacks:char.attacks, timestamp:req.timestamp });
  }
});



router.get('/attack', function(req, res, next) {
  console.log("*** ENCOUNTER GET/ATTACK ***")
  const chars = req.app.get('chars');
  console.log("char: " + req.query.char)
  const char = chars.find(el => el.name === req.query.char)
  console.log("char: " + char.name)
  console.log("Here...")
  console.log("attack: " + req.query.attack)
  const attack = char.attacks.find(el => el.name === req.query.attack)
  console.log(attack)
  console.log("Attacking...")
  handled = true
  res.render('attack', { 
    chars:chars.filter(el => !el.link),  // do not want extra places in attack sequence 
    char:char,
    attack:attack,
    charList:chars.map(el => el.name).join(' '),
    timestamp:req.timestamp
  });
});



/*
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
*/


module.exports = router;
