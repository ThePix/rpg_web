'use strict';

const express = require('express');
const router = express.Router();

router.post('/', function(req, res, next) {
  console.log("ATTACK/DAMAGE")
  console.log(req.body)
  const chars = req.app.get('chars');
  console.log("chars " + chars.length)
  const attacker = chars.find(el => el.name === req.body.name)
  const attack = attacker.attacks.find(el => el.name === req.body.attack)
  
  for (let key in req.body) {
    if (key === 'secondary_damage' || key === 'sec_damage') continue
    if (key.endsWith("_damage")) {
      console.log("Doing " + key)
      const name = key.replace("_damage", "")
      console.log("name " + name)
      const damage = parseInt(req.body[key])
      console.log("Damage " + damage)
      const char = chars.find(el => el.name === name)
      const critical = (req.body[name + "_critical"] === 'yes')
      char.resolveDamage(damage, attacker, attack, critical)
    }
  }
  
  

  res.redirect('/encounter');
})

module.exports = router;
