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
          console.log('------')
          console.log(b.name)
          console.log(b.notes[0])
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


router.post('/', function(req, res, next) {
  console.log("Here")
  const data = {packages:[]}
  data.name = req.body.name || ''
  data.sex = req.body.sex || ''
  data.race = req.body.race || ''
  data.profession = req.body.profession || ''
  data.level = parseInt(req.body.level || '4')
  data.points = 0
  const char = new Char(data)
  for (let key in req.body) {
    if (!key.startsWith('package_')) continue
    const name = key.replace('package_', '')
    data.packages[name] = parseInt(req.body[key])
    data.points += data.packages[name]
    const p = packages.find(el => el.name === name)
    p.setBonuses(char, data.packages[name])
  }
  for (let n of [1, 2, 3, 4]) {
    data['weapon' + n] = req.body['weapon' + n]
  }
  console.log(data)
  
  console.log(char)
  
  const warning = (data.points < data.level * 2 + 2) ? "tooLow" : ((data.points > data.level * 2 + 2) ? "tooHigh" : "okay")
  
  res.render('creator', { data:data, timestamp:req.timestamp, weapons:WEAPONS, packages:packages, char:char, warning:warning });
});


router.get('/:page', function(req, res, next) {
  const p = packages.find(el => el.name === req.params.page)
  res.render('package', { pack:p, maxLevel:maxLevel, timestamp:req.timestamp });
});


module.exports = router;