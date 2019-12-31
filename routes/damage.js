'use strict';

const express = require('express');
const router = express.Router();

router.post('/', function(req, res, next) {
  console.log("ATTACK/DAMAGE")
  console.log(req.body)
  const chars = req.app.get('chars');
  const attacker = chars.find(el => el.name === req.body.name)
  const attack = attacker.attacks.find(el => el.name === req.body.attack)
  
  secondary_damage = req.body.secondary_damage
  delete req.body.name
  delete req.body.attack
  delete req.body.secondary_damage
  
  console.log(req.body)

  for (let key in req.body) {
    if (key.endsWith("_primary")) {
      console.log("Doing " + key)
      const name = key.replace("_primary", "")
      console.log("name " + name)
      const result = parseInt(req.body[key])
      console.log("Result " + result)
      const char = chars.find(el => el.name === name)
      const damage = parseInt(req.body[name + "_damage"])
      char.resolveDamage(attacker, attack, damage, result)
    }
    if (key.endsWith("_secondary")) {
      console.log("Doing " + key)
      const name = key.replace("_secondary", "")
      console.log("name " + name)
      const result = parseInt(req.body[key])
      console.log("Result " + result)
      const char = chars.find(el => el.name === name)
      char.resolveDamage(attacker, attack, secondary_damage, result)
    }
  }
  
  

  res.redirect('/encounter');
})

module.exports = router;
