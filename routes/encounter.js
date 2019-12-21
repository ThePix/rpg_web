const express = require('express');
const router = express.Router();


const log = function(s) {
  console.log("[93m" + s + "[0m")
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  const chars = req.app.get('chars');
  const char = chars.find(el => el.current)
  res.render('encounter', { chars:chars, char:char, current:char, attacks:char.attacks, timestamp:req.timestamp });
});

router.get('/focus', function(req, res, next) {
  const chars = req.app.get('chars');
  const current = chars.find(el => el.current)
  const char = chars.find(el => el.name === req.query.char)
  res.render('encounter', { chars:chars, char:char, current:current, attacks:char.attacks, timestamp:req.timestamp });
});

router.get('/next', function(req, res, next) {
  const chars = req.app.get('chars');
  let char = chars.find(el => el.name === req.query.char)
  char = char.nextChar(chars)
  res.render('encounter', { chars:chars, char:char, current:char, attacks:char.attacks, timestamp:req.timestamp });
});

router.get('/delay', function(req, res, next) {
  const chars = req.app.get('chars');
  let char = chars.find(el => el.name === req.query.char)
  char = char.delay(chars)
  res.render('encounter', { chars:chars, char:char, current:char, attacks:char.attacks, timestamp:req.timestamp });
});

router.get('/refresh', function(req, res, next) {
  const chars = req.app.get('chars');
  const char = chars.find(el => el.name === req.query.char)
  res.render('encounter', { chars:chars, char:char, current:char, attacks:char.attacks, timestamp:req.timestamp });
});

router.get('/edit', function(req, res, next) {
  const chars = req.app.get('chars');
  const char = chars.find(el => el.name === req.query.char)
  res.render('edit', { char:char, fields: req.app.get('fields'), timestamp:req.timestamp });
});

router.get('/add', function(req, res, next) {
  //const chars = req.app.get('chars');
  files = ['one', 'two'];
  res.render('add', { files:files, timestamp:req.timestamp });
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




router.post('/edit', function(req, res, next) {
  console.log("*** ENCOUNTER POST/EDIT ***")
  const chars = req.app.get('chars');
  const current = chars.find(el => el.current)
  const char = chars.find(el => el.name === req.body.name)
  for (let field of req.app.get('fields')) {
    if (field.type === 'bool') char[field.name] = (req.body[field.name] === 'on')
    if (field.type === 'int') char[field.name] = parseInt(req.body[field.name])
    if (field.type === 'string') char[field.name] = req.body[field.name]
  }
  res.render('encounter', { chars:chars, char:char, current:current, attacks:char.attacks, timestamp:req.timestamp });
});

router.post('/add', function(req, res, next) {
  console.log("*** ENCOUNTER POST/ADD ***")
  const chars = req.app.get('chars');
  const current = chars.find(el => el.current)
  const char = current
  delete req.body.submit_param
  console.log(req.body)
  for (let file in req.body) {
    console.log("Adding file: " + file)
  }
  res.render('encounter', { chars:chars, char:char, current:current, attacks:char.attacks, timestamp:req.timestamp });
});


module.exports = router;
