var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
  console.log("ATTACK/DAMAGE")
  console.log(req.body)
  const chars = req.app.get('chars');
  console.log("chars " + chars.length)
  
  for (key in req.body) {
    if (key === 'secondary_damage' || key === 'sec_damage') continue
    if (key.endsWith("_damage")) {
      console.log("Doing " + key)
      const name = key.replace("_damage", "")
      console.log("name " + name)
      const damage = parseInt(req.body[key])
      console.log("Damage " + damage)
      const char = chars.find(el => el.name === name)
      char.hits -= damage
    }
  }
  
  

  res.redirect('/encounter');
})

module.exports = router;
