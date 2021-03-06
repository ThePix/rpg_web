'use strict';

const express = require('express');
const router = express.Router();
const [AttackConsts] = require('../models/attack.js')

// Clicking an attack icon on the encouter page brings us here, which sends us to attack.pug
// Does not change the game state
const attackGetFun = function(req, res, next) {
  const chars = req.app.get('chars');
  const char = chars.find(el => el.name === req.params.char)
  const attack = char.attacks.find(el => el.name === req.params.attack)
  const handled = true
  res.render('attack', { 
    chars:chars.filter(el => !el.link),  // do not want extra places in attack sequence 
    char:char,
    attack:attack,
    charList:chars.map(el => el.name).join('|'),
    timestamp:req.timestamp
  });
}


// Submitting attack.pug brings us here, which sends us to damage.pug
// Does not change the game state
const attackPostFun = function(req, res, next) {
  const chars = req.app.get('chars');
  const char = chars.find(el => el.name === req.body.name)
  const attack = char.attacks.find(el => el.name === req.body.attack)
  if (attack === undefined) {
    const s = "Failed to find an attack named '" + req.body.attack + "' for " + char.name + " (in routes/attack, attackPostFun)"
    console.log(s)
    console.log(char)
    res.render('error', {message:'Error in server code', error:{status:s}})
    return
  }
  const roll = req.body.roll
  const bonus = req.body.bonus
    
  const primary = []
  const secondary = []
  let secondaryFlag = false
  for (let i = 0; i < chars.length; i++) {
    const safe_name = chars[i].name.replace(/ /, '_')
    if (req.body[safe_name + "_pri"]) {
      chars[i].tmp_roll = parseInt(req.body[safe_name + "_roll"])
      chars[i].tmp_bonus = parseInt(req.body[safe_name + "_bonus"])
      chars[i].tmp_primary = attack.primaryResolve(char, chars[i], chars[i].tmp_roll, chars[i].tmp_bonus)
      primary.push(chars[i])
    }
    if (req.body[safe_name + '_sec']) {
      chars[i].tmp_secondary = attack.secondaryResolve(char, chars[i], roll, bonus)
      if (chars[i].tmp_secondary >= AttackConsts.PLAIN_HIT) secondaryFlag = true
      secondary.push(chars[i])
    }
  }
  
  res.render('damage', {
    char:char,
    attack:attack,
    primary:primary, 
    secondary:secondary,
    secondaryFlag:secondaryFlag,
    consts:AttackConsts,
    timestamp:req.timestamp
  });
}

module.exports = [attackGetFun, attackPostFun];
