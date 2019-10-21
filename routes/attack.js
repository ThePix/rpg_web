var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
  console.log("Editing " + req.body.name)
  const chars = req.app.get('chars');
  const char = chars.find(el => el.name === req.body.name)
  const attack = char.attacks.find(el => el.name === req.body.attack)
  const roll = parseInt(req.body.roll)
  const bonus = parseInt(req.body.bonus)
  console.log(char)
  console.log(attack)
  //console.log(req.body)

  const primary = []
  const secondary = []
  for (let i = 0; i < chars.length; i++) {
    if (req.body[chars[i].name + '_pri']) primary.push(chars[i])
    if (req.body[chars[i].name + '_sec']) secondary.push(chars[i])
  }
  console.log(primary)
  console.log(secondary)
  
  results = []
  for (let i = 0; i < primary.length; i++) {
    results.push(attack.primary(char, primary[i], roll, bonus))
  }
  if (attack.secondary) {
    for (let i = 0; i < secondary.length; i++) {
      results.push(attack.secondary(char, secondary[i], roll, bonus))
    }
  }

  res.render('results', { char:char, attack:attack, results:results, timestamp:req.timestamp });
})

module.exports = router;
