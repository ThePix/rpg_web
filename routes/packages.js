'use strict';

const express = require('express');
const router = express.Router();

const [Package, Bonus] = require('../models/package.js')
const [AttackConsts, Attack, WEAPONS] = require('../models/attack.js')
const [Char] = require('../models/char.js')
const settings = require('../data/settings.js')
const packages = require('../data/packages.js')

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


const charTypes = {
  pc:{name:'Player Character'},
  npc:{name:'Non-Player Character'},
  min:{name:'Minion'},
  std:{name:'Standard Monster'},
  elite:{name:'Elite Monster (counts as 2 standard)'},
  boss:{name:'Boss Monster (counts as four standard)'},
  solo:{name:'Solo Monster'},
}




// GET packages/
router.get('/', function(req, res, next) {
  res.render('packages', { packages:groupedPackages, timestamp:req.timestamp });
});


// Create new or edit existing character
// POST /packages/
router.post('/', function(req, res, next) {
  console.log("======================================")
  let char
  
  // Collect up the form data
  let weaponNames
  let data
  if (req.body.action === 'new') {
    weaponNames = []
    data = {}  // packages
  }
  else if (req.body.action === undefined) {
    weaponNames = []
    for (let i = 1; i <= (settings.maxWeaponLines * 2); i++) {
      if (req.body['weapon' + i] !== 'None' && req.body['weapon' + i] !== undefined) {
        weaponNames.push(req.body['weapon' + i])
      }
    }
    if (weaponNames.length === 0) weaponNames.push(settings.defaultWeapon)
    console.log(weaponNames)
    data = {}  // packages
    for (let key in req.body) {
      if (!key.startsWith('package_')) continue
      const name = key.replace('package_', '')
      data[name] = parseInt(req.body[key])
    }
    console.log(data)
  }
  
  // Create or edit a character object
  if (req.body.name !== undefined) {
    // We have a name, so get the data
    console.log("we have a name: " + req.body.name)
    const chars = req.app.get('chars')
    char = chars.find(el => el.name === req.body.name)
    if (char === undefined) {
      // No existing data, so create
      console.log("not in database, so create new")
      char = Char.create(req.body.name, data, weaponNames)
    }
    else {
      // Existing data, so update
      console.log("in database, so update")
      char.update(data, weaponNames)
      //console.log(char)
    }
  }
  else {  
    char = Char.create('', data, weaponNames)
  }
  console.log('-----------')
  console.log(char)
  console.log('-----------')
  
  console.log("name=" + char.name)
  //console.log(char.attacks)
  console.log(char.weapons)
      
  if (req.body.action !== 'edit') {
    console.log("updating background")
    char.sex = req.body.sex || ''
    char.race = req.body.race || ''
    char.profession = req.body.profession || ''
  }
  char.charType = req.body.charType || 'pc'
  char.level = parseInt(req.body.level || settings.startLevel)
  char.exists = req.body.exists  // is this used????
  
  if (req.body.submit_param === "Create") {
    console.log("All done, save data")
    const chars = req.app.get('chars')
    for (var i = 0; i < chars.length; i++){ 
       if (chars[i].name === char.name) {
         chars.splice(i, 1); 
       }
    }
    char.exists = true
    chars.push(char)
    res.redirect('/')
    
    console.log(char)
    req.app.set('chars', chars);
    const chars2 = req.app.get('chars');
    console.log(chars2)
  }
  else {
    console.log("still going, just starting or refreshing")
    res.render('creator', { timestamp:req.timestamp, weapons:WEAPONS, packages:groupedPackages, char:char, title:charTypes[char.charType].name, settings:settings });
    //console.log(char)
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
