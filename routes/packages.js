'use strict';

const express = require('express');
const router = express.Router();

const [Package, packages, Bonus] = require('../models/package.js')
const [AttackConsts, Attack, WeaponAttack, WEAPONS] = require('../models/attack.js')
const [Char] = require('../models/char.js')

const maxLevel = 20

function toSentenceCase(s) {
	return s.slice(0, 1).toUpperCase() + s.slice(1)
}



router.get('/', function(req, res, next) {
  res.render('packages', { packages:packages, timestamp:req.timestamp });
});


router.get('/import', function(req, res, next) {
  const fs = require('fs');
  fs.readFile('models/packs.txt', function(err, s) {
    if (err) throw err;
    const ary = String(s).split('\n')
    console.log(ary.length)
    const packs = []
    let pack
    let count
    for (let s of ary) {
      s = s.trim()
      if (s.startsWith('### ')) {
        pack = new Package(s.replace('### ', ''), {notes:[], bonuses:[]})
        packs.push(pack)
        count = 1
      }
      else if (s.startsWith('_')) {
        pack.notes.push(s.replaceAll('_', ''))
      }
      else if (s.startsWith('Bonus hit points')) {
        if (s.match(/1\/2/)) {
          hitsPerLevel = 0.5
        }
        else if (s.match(/\+1/)) {
          hitsPerLevel = 1
        }
        else if (s.match(/\+2/)) {
          hitsPerLevel = 2
        }
        else {
          console.log("Failed for hits with: " + s)
        }
      }
      else if (s.startsWith('Primary skill: ')) {
        pack.bonuses.push(new Bonus(s.replace('Primary skill: ', ''), {progression:'\"primary\"'}))
      }
      else if (s.startsWith('Secondary skill: ')) {
        pack.bonuses.push(new Bonus(s.replace('Secondary skill: ', ''), {progression:'\"secondary\"'}))
      }
      else if (s.startsWith('- ')) {
        const ary = s.split('(')
        let b
        if (ary.length === 1) {
          b = new Bonus(s.slice(2), {progression:count})
        }
        else {
          b = new Bonus(ary[0].slice(2, -1), {progression:count, notes:[toSentenceCase(ary[1]).replace(')', '')]})
        }
        const ary2 = ary[0].split('[')
        if (ary2.length === 2) {
          b.name = ary2[0].slice(2)
          b.flags = ary2[1].replace(']', '').replace(' ', '')
        }
        else {
          b.flags = ''
        }
        pack.bonuses.push(b)
        count++
      }
      else if (s.trim().endsWith(']')) {
        const ary = s.split(' ')
        pack.bonuses.push(new Bonus(ary[0], {progression:ary[1]}))
      }
      else {
        console.log("Failed with: '" + s + "'")
      }
    }
    //for (pack of packs) console.log(pack.to_js())
    console.log(packs[0].to_js())
  
    fs.writeFile('data.txt', packs.map(el => el.to_js()).join('\n\n\n'), function (err) {
      if (err) throw err;
    });    
    console.log("Done")
  });  
  res.render('packages', { packages:packages, timestamp:req.timestamp });
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
  char.maxPoints = char.level * 2 + 2
  char.exists = req.body.true
  res.render('creator', { timestamp:req.timestamp, weapons:WEAPONS, packages:packages, char:char, title:charTypes[char.charType].name });
})



router.post('/', function(req, res, next) {
  const data = {}
  let points = 0
  for (let key in req.body) {
    if (!key.startsWith('package_')) continue
    const name = key.replace('package_', '')
    data[name] = parseInt(req.body[key])
    points += data[name]
    //const p = packages.find(el => el.name === name)
    //p.setBonuses(char, data.packages[name])
  }
  const char = Char.create(req.body.name || '', packages, data)

  char.charType = req.body.charType || 'pc'
  char.sex = req.body.sex || ''
  char.race = req.body.race || ''
  char.profession = req.body.profession || ''
  char.level = parseInt(req.body.level || '4')
  char.points = points
  char.maxPoints = char.level * 2 + 2
  char.exists = req.body.exists
  
  for (let n of [1, 2, 3, 4]) {
    char['weapon' + n] = req.body['weapon' + n]
  }
  
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
    res.render('creator', { timestamp:req.timestamp, weapons:WEAPONS, packages:packages, char:char, title:charTypes[char.charType].name });
  }
});


router.get('/:page', function(req, res, next) {
  const p = packages.find(el => el.name === req.params.page)
  res.render('package', { pack:p, maxLevel:maxLevel, timestamp:req.timestamp });
});


module.exports = router;
