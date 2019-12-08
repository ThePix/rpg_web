var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
  console.log("ATTACK")
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
  
  primarySuccess = []
  primaryFailure = []
  for (let i = 0; i < primary.length; i++) {
    let hit
    if (attack.primaryResolve) {
      hit = attack.primaryResolve(char, primary[i], primary[i].tmp_roll, primary[i].tmp_bonus)
    }
    else {
      const result = attack.bonus + primary[i].tmp_roll + primary[i].tmp_bonus - primary[i][attack.resist]
      hit = (result > 10)
    }
    if (primary[i].tmp_roll === 1) hit = false
    if (primary[i].tmp_roll === 20) hit = true
    if (hit) {
      primarySuccess.push(primary[i])
    }
    else {
      primaryFailure.push(primary[i])
    }
    
    secondarySuccess = []
    secondaryFailure = []
    for (let i = 0; i < secondary.length; i++) {
      let hit
      if (attack.rollForSecondary) {
        if (attack.secondaryResolve) {
          hit = attack.secondaryResolve(char, secondary[i], roll, bonus)
        }
        else {
          const result = attack.bonus + roll + bonus - secondary[i][attack.resist]
          hit = (result > 10)
        }
        if (roll === 1) hit = false
        if (roll === 20) hit = true
      }
      else {
        hit = true
      }
      if (hit) {
        secondarySuccess.push(secondary[i])
      }
      else {
        secondaryFailure.push(secondary[i])
      }
    }
    res.render('damage', { char:char, attack:attack, primarySuccess:primarySuccess, primaryFailure:primaryFailure, secondarySuccess:secondarySuccess, secondaryFailure:secondaryFailure, timestamp:req.timestamp });
  
  }

  //res.render('results', { char:char, attack:attack, results:results, timestamp:req.timestamp });
})

module.exports = router;
