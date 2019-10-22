var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
  console.log("ATTACK")
  console.log(req.body.name)
  const chars = req.app.get('chars');
  const char = chars.find(el => el.name === req.body.name)
  const attack = char.attacks.find(el => el.name === req.body.attack)
  
  const primary = []
  const secondary = []
  for (let i = 0; i < chars.length; i++) {
    if (req.body[chars[i].name + "_pri"]) {
      chars[i].tmp_roll = parseInt(req.body[chars[i].name + "_roll"])
      chars[i].tmp_bonus = parseInt(req.body[chars[i].name + "_bonus"])
      primary.push(chars[i])
    }
    if (req.body[chars[i].name + '_sec']) secondary.push(chars[i])
  }
  const roll = req.body.roll
  const bonus = req.body.bonus
  console.log(primary)
  console.log(secondary)
  
  results = []
  if (attack.primary) {
    for (let i = 0; i < primary.length; i++) {
      results.push(attack.primary(char, primary[i], primary[i].tmp_roll, primary[i].tmp_bonus, i === 0))
    }
  }
  if (attack.secondary) {
    for (let i = 0; i < secondary.length; i++) {
      results.push(attack.secondary(char, secondary[i], roll, bonus, i === 0))
    }
  }

  res.render('results', { char:char, attack:attack, results:results, timestamp:req.timestamp });
})

module.exports = router;
