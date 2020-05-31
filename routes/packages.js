'use strict';

const express = require('express');
const router = express.Router();

const [Package, Bonus] = require('../models/package.js')
const [AttackConsts, Attack, WEAPONS] = require('../models/attack.js')
const [Char] = require('../models/char.js')
const settings = require('../settings.js')
const packages = require('../models/package_data.js')

const maxLevel = 20

function toSentenceCase(s) {
	return s.slice(0, 1).toUpperCase() + s.slice(1)
}



const groupedPackages = []
for (let group of settings.packageGroups) {
  const data = {name:group.name, comment:group.comment, display:group.display}
  data.packages = packages.filter(el => el.category === group.name)
  groupedPackages.push(data)
}



router.get('/', function(req, res, next) {
  res.render('packages', { packages:groupedPackages, timestamp:req.timestamp });
});



const charTypes = {
  pc:{name:'Player Character'},
  npc:{name:'Non-Player Character'},
  min:{name:'Minion'},
  std:{name:'Standard Monster'},
  elite:{name:'Elite Monster (counts as 2 standard)'},
  boss:{name:'Boss Monster (counts as four standard)'},
  solo:{name:'Solo Monster'},
}

router.post('/:page', function(req, res, next) {
  const chars = req.app.get('chars')
  const char = chars.find(el => el.name === req.params.page)
  
  if (char === undefined) {
    console.log("----------------")
    console.log("Failed to find character = " + req.params.page)
    console.log("----------------")
    console.log("length=" + chars.length)
    console.log("----------------")
    for (let c of chars) {
      console.log(c.name)
    }
    res.redirect('/')
    return
  }
  
  let points = 0
  for (let key in req.body) {
    if (!key.startsWith('package_')) continue
    const name = key.replace('package_', '')
    data[name] = parseInt(req.body[key])
    points += data[name]
  }
  char.level = parseInt(req.body.level || '4')
  char.points = points
  //char.maxPoints = char.level * 2 + 2
  char.exists = req.body.true
  res.render('creator', { timestamp:req.timestamp, weapons:WEAPONS, packages:groupedPackages, char:char, title:charTypes[char.charType].name, settings:settings });
})



router.post('/', function(req, res, next) {
  const data = {}
  const weaponNames = []
  let points = 0
  
  for (let key in req.body) {
    if (!key.startsWith('package_')) continue
    const name = key.replace('package_', '')
    data[name] = parseInt(req.body[key])
    points += data[name]
  }
  
  for (let i = 1; i <= 4; i++) {
    if (req.body['weapon' + i] !== 'None') {
      weaponNames.push(req.body['weapon' + i])
    }
  }
  
  
  const char = Char.create(req.body.name || '', packages, data, weaponNames)

  char.charType = req.body.charType || 'pc'
  char.sex = req.body.sex || ''
  char.race = req.body.race || ''
  char.profession = req.body.profession || ''
  char.points = points
  char.level = parseInt(req.body.level || settings.startLevel)
  //char.maxPoints = char.level * 2 + 2
  char.exists = req.body.exists
  
  
  if (req.body.submit_param === "Create") {
    const chars = req.app.get('chars')
    for( var i = 0; i < chars.length; i++){ 
       if (chars[i].name === char.name) {
         chars.splice(i, 1); 
       }
    }
    char.exists = true
    chars.push(char)
    res.redirect('/')
    
    //console.log(chars.length)
    req.app.set('chars', chars);
    const chars2 = req.app.get('chars');
  }
  else {
    //console.log(char)
    res.render('creator', { timestamp:req.timestamp, weapons:WEAPONS, packages:groupedPackages, char:char, title:charTypes[char.charType].name, settings:settings });
  }
});


router.get('/weapons', function(req, res, next) {
  const p = packages.find(el => el.name === req.params.page)
  res.render('weapons', { weapons:WEAPONS });
});


router.get('/:page', function(req, res, next) {
  const p = packages.find(el => el.name === req.params.page)
  res.render('package', { pack:p, maxLevel:maxLevel, timestamp:req.timestamp });
});


module.exports = router;
