'use strict';

const express = require('express');
const router = express.Router();

// Submitting damage.pug brings us here, which sends us, via redirect, back to encounter.pug
// This is the only part of the attack process that changes the game state
const damagePostFun = function(req, res, next) {
  //console.log("ATTACK/DAMAGE")
  //console.log(req)
  const chars = req.app.get('chars');
  //console.log(chars)
  const attacker = chars.find(el => el.name === req.body.name)
  const attack = attacker.attacks.find(el => el.name === req.body.attack)
  
  const secondary_damage = req.body.secondary_damage
  delete req.body.name
  delete req.body.attack
  delete req.body.secondary_damage
  
  //console.log(req.body)

  for (let key in req.body) {
    if (key.endsWith("_primary")) {
      //console.log("Doing " + key)
      const name = key.replace("_primary", "")
      //console.log("name " + name)
      const result = parseInt(req.body[key])
      //console.log("Result " + result)
      const char = chars.find(el => el.name === name)
      const damage = parseInt(req.body[name + "_damage"])
      const additional = req.body[name + "_additional"] ? parseInt(req.body[name + "_additional"]) : false
      char.resolveDamage(attacker, attack, damage, result, additional)
    }
    if (key.endsWith("_secondary")) {
      //console.log("Doing " + key)
      const name = key.replace("_secondary", "")
      //console.log("name " + name)
      const result = parseInt(req.body[key])
      //console.log("Result " + result)
      const char = chars.find(el => el.name === name)
      char.resolveDamage(attacker, attack, secondary_damage, result)
    }
  }

  res.redirect('/encounter');
}

//router.post('/', damageRouteFun)

module.exports = [damagePostFun];
