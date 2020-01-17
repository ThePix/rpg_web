'use strict';

const SAVEFILE = 'data/save.txt'

const fs = require('fs');
const express = require('express');
const router = express.Router();
const [Char] = require('./../models/char.js')




router.get('/', function(req, res, next) {
  const chars = req.app.get('chars');
  const char = chars.find(el => el.current)
  res.render('encounter', { chars:chars, char:char, current:char, attacks:char.attacks, timestamp:req.timestamp });
});

router.get('/inits', function(req, res, next) {
  const chars = req.app.get('chars');
  Log.add("Turn sequence set")
  res.render('inits', { chars:chars, timestamp:req.timestamp });
});

router.get('/focus', function(req, res, next) {
  const chars = req.app.get('chars');
  const current = chars.find(el => el.current)
  const char = chars.find(el => el.name === req.query.char)
  res.render('encounter', { chars:chars, char:char, current:current, attacks:char.attacks, timestamp:req.timestamp });
});

router.get('/next', function(req, res, next) {
  const chars = req.app.get('chars');
  let char = chars.find(el => el.name === req.query.char)
  char = char.nextChar(chars)
  fs.writeFile(SAVEFILE, Char.saveData(chars), function (err) {
    if (err) throw err;
    console.log('Saved!');
    Log.add("comment", "Game state saved")
  });
  Log.add("title", "Next!")
  res.render('encounter', { chars:chars, char:char, current:char, attacks:char.attacks, timestamp:req.timestamp });
});

router.get('/load', function(req, res, next) {
  fs.readFile(SAVEFILE, function(err, s) {
    if (err) throw err;
    Log.add("comment", "About to load last saved game...")
    const chars = req.app.get('chars');
    Char.loadData(chars, String(s))
    const char = chars.find(el => el.current)
    Log.recover()
    Log.add("comment", "...Load last saved game")
    res.render('encounter', { chars:chars, char:char, current:char, attacks:char.attacks, timestamp:req.timestamp });
  });  
});

router.get('/delay', function(req, res, next) {
  const chars = req.app.get('chars');
  let char = chars.find(el => el.name === req.query.char)
  Log.add(char.display + " delays a turn")
  char = char.delay(chars)
  res.render('encounter', { chars:chars, char:char, current:char, attacks:char.attacks, timestamp:req.timestamp });
});

// This is useful when debugging; probably not otherwise
router.get('/refresh', function(req, res, next) {
  const chars = req.app.get('chars');
  let char = chars.find(el => el.name === req.query.char)
  if (!char) char = chars.find(el => el.current)
  res.render('encounter', { chars:chars, char:char , current:char, attacks:char.attacks, timestamp:req.timestamp });
});



router.get('/add-file', function(req, res, next) {
  const chars = req.app.get('chars');
  const char = chars.find(el => el.name === req.query.char)
  files = ['one', 'two'];
  res.render('add', { options:files, timestamp:req.timestamp, char:char, title:"Pick one or more sets of characters to add", action:'add-file' });
});

router.get('/add-stock', function(req, res, next) {
  const chars = req.app.get('chars');
  const stocks = req.app.get('stocks').map(el => el.display);
  const char = chars.find(el => el.name === req.query.char)
  res.render('add', { options:stocks, timestamp:req.timestamp, char:char, title:"Pick one or more stock characters to add", action:'add-stock' });
});

router.get('/add-custom', function(req, res, next) {
  const chars = req.app.get('chars');
  const char = chars.find(el => el.name === req.query.char)
  const newchar = new Char({name:'char' + Math.random()})
  newchar.next = char.next
  char.next = newchar.name
  newchar.disabled = true
  chars.push(newchar)
  res.render('edit', { char:newchar, fields: req.app.get('fields'), timestamp:req.timestamp });
});



router.get('/db-reset', function(req, res, next) {
  Char.clearDb()
  res.redirect('/')
});
router.get('/db-load', function(req, res, next) {
  const chars = req.app.get('chars');
  Char.loadFromDb(chars)
  res.redirect('/')
});
router.get('/db-save', function(req, res, next) {
  const chars = req.app.get('chars');
  Char.saveToDb(chars)
  res.redirect('/')
});




router.post('/clear-alerts', function(req, res, next) {
  const chars = req.app.get('chars');
  const current = chars.find(el => el.current)
  const char = chars.find(el => el.name === req.body.name)
  char.cancelAlerts()
  res.render('encounter', { chars:chars, char:char, current:current, attacks:char.attacks, timestamp:req.timestamp });
});




// To do!!!
router.post('/add', function(req, res, next) {
  const chars = req.app.get('chars');
  const current = chars.find(el => el.current)
  const char = chars.find(el => el.name === req.body.name)
  const action = req.body.action
  delete req.body.submit_param
  delete req.body.action
  delete req.body.name
  //console.log(req.body)
  for (let file in req.body) {
    console.log("Adding " + action + " " + file + " after " + char.name)
  }
  res.render('encounter', { chars:chars, char:char, current:current, attacks:char.attacks, timestamp:req.timestamp });
});

router.post('/add-stock', function(req, res, next) {
  const chars = req.app.get('chars');
  const stocks = req.app.get('stocks');
  const current = chars.find(el => el.current)
  const char = chars.find(el => el.name === req.body.name)
  delete req.body.submit_param
  delete req.body.name
  //console.log(req.body)
  let previous = char
  for (let name in req.body) {
    //console.log("Adding stock " + name + " after " + char.name)
    const chr = stocks.find(el => el.display === name)
    const newchar = chr.clone()
    newchar.next = previous.next
    previous.next = newchar.name
    previous = newchar
    chars.push(newchar)
  }
  res.render('encounter', { chars:chars, char:char, current:current, attacks:char.attacks, timestamp:req.timestamp });
});

router.post('/inits', function(req, res, next) {
  const chars = req.app.get('chars');

  for (let chr of chars) {
    if (typeof chr.init === "number") {
      chr.initScore = chr.init + parseInt(req.body[chr.name])
    }
  }
  for (let chr of chars) {
    if (typeof chr.init === "string") {
      const chr2 = chars.find(el => el.name === chr.init)
      chr.initScore = chr2.initScore
    }
  }
  chars.sort(function(a, b) {
    if (a.initScore !== b.initScore) return b.initScore - a.initScore;
    if (a.pc) return 1;
    if (!b.pc) return -1;
    return 1;
  })

  for (let i = 1; i < chars.length; i++) {
    chars[i - 1].next = chars[i].name
    chars[i].current = false
  }
  chars[chars.length - 1].next = chars[0].name
  chars[0].current = true
  res.redirect('/encounter')
});


module.exports = router;
