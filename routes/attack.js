'use strict';

const express = require('express');
const router = express.Router();
const [AttackConsts] = require('../models/attack.js')


router.get('/', function(req, res, next) {
  const chars = req.app.get('chars');
  const char = chars.find(el => el.name === req.query.char)
  const attack = char.attacks.find(el => el.name === req.query.attack)
  console.log(attack)
  const handled = true
  res.render('attack', { 
    chars:chars.filter(el => !el.link),  // do not want extra places in attack sequence 
    char:char,
    attack:attack,
    charList:chars.map(el => el.name).join(' '),
    timestamp:req.timestamp
  });
});



router.post('/', function(req, res, next) {
  console.log("ATTACK")
  const chars = req.app.get('chars');
  const char = chars.find(el => el.name === req.body.name)
  const attack = char.attacks.find(el => el.name === req.body.attack)
  const roll = req.body.roll
  const bonus = req.body.bonus
    
  const primary = []
  const secondary = []
  let secondaryFlag = false
  for (let i = 0; i < chars.length; i++) {
    if (req.body[chars[i].name + "_pri"]) {
      chars[i].tmp_roll = parseInt(req.body[chars[i].name + "_roll"])
      chars[i].tmp_bonus = parseInt(req.body[chars[i].name + "_bonus"])
      chars[i].tmp_primary = attack.primaryResolve(char, chars[i], chars[i].tmp_roll, chars[i].tmp_bonus)
      primary.push(chars[i])
    }
    if (req.body[chars[i].name + '_sec']) {
      chars[i].tmp_secondary = attack.secondaryResolve(char, chars[i], roll, bonus)
      if (chars[i].tmp_secondary >= AttackConsts.PLAIN_HIT) secondaryFlag = true
      secondary.push(chars[i])
    }
  }
  console.log(primary)
  console.log(secondary)
  
  res.render('damage', {
    char:char,
    attack:attack,
    primary:primary, 
    secondary:secondary,
    secondaryFlag:secondaryFlag,
    consts:AttackConsts,
    timestamp:req.timestamp
  });
})

module.exports = router;
