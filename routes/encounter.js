'use strict';

const SAVEFILE = 'save'
const PATH = 'saved_data'

const fs = require('fs');
const express = require('express');
const router = express.Router();
const [Char] = require('./../models/char.js')
const [Log] = require('../models/log.js')
const [Message] = require('./../models/message.js')
const settings = require('../data/settings.js')




router.get('/', function(req, res, next) {
  const chars = req.app.get('chars');
  const char = chars.find(el => el.current)
  res.render('encounter', { chars:chars, char:char, current:char, attacks:char.attacks, timestamp:req.timestamp, refresh:settings.refresh, maxMessages:settings.maxMessages });
});

router.get('/inits', function(req, res, next) {
  const chars = req.app.get('chars');
  Log.add("Turn sequence set")
  res.render('inits', { chars:chars, timestamp:req.timestamp });
});

router.get('/focus/:char', function(req, res, next) {
  const chars = req.app.get('chars');
  const current = chars.find(el => el.current)
  const char = chars.find(el => el.name === req.params.char)
  console.log("here3")
  res.render('encounter', { chars:chars, char:char, current:current, attacks:char.attacks, timestamp:req.timestamp, refresh:settings.refresh, maxMessages:settings.maxMessages });
});

router.get('/next/:char', function(req, res, next) {
  const chars = req.app.get('chars');
  let char = chars.find(el => el.name === req.params.char)
  char = char.nextChar(chars)
  const filename = PATH + '/' + SAVEFILE + '.chr'
  fs.writeFile(filename, Char.saveData(chars), function (err) {
    if (err) {
      console.log('ERROR: Characters save failed!');
      console.log('Check the folder exists');
      console.log('filename=' + filename);
      console.log(err);
      Log.add("comment", "Characters save failed")
    }
    else {
      Log.add("comment", "Characters saved")
    }
  });
  fs.writeFile(PATH + '/' + SAVEFILE + '.msg', Message.saveData(), function (err) {
    if (err) {
      console.log('ERROR: Messages save failed!');
      console.log('Check the folder exists');
      console.log('filename=' + filename);
      console.log(err);
      Log.add("comment", "Messages save failed")
    }
    else {
      Log.add("comment", "Messages saved")
    }
  });
  Log.add("title", "Next!")
  res.redirect('/encounter/')
});

router.get('/load', function(req, res, next) {
  Log.recover()
  fs.readFile(PATH + '/' + SAVEFILE + '.chr', function(err, s) {
    if (err) throw err;
    Log.add("comment", "About to load last saved game...")
    const chars = req.app.get('chars');
    Char.loadData(chars, String(s))
    const char = chars.find(el => el.current)
    Log.add("comment", "...Load last saved game")
    res.redirect('/encounter/')
  });  
  fs.readFile(PATH + '/' + SAVEFILE + '.msg', function(err, s) {
    if (err) throw err;
    Log.add("comment", "About to load last saved messages...")
    Message.loadData(String(s))
    Log.add("comment", "...Load last saved messages")
  });  
});

router.get('/delay/:char', function(req, res, next) {
  const chars = req.app.get('chars');
  let char = chars.find(el => el.name === req.params.char)
  Log.add(char.display + " delays a turn")
  char = char.delay(chars)
  res.redirect('/encounter/')
});

// This is useful when debugging; probably not otherwise
router.get('/refresh/:char', function(req, res, next) {
  const chars = req.app.get('chars');
  let char = chars.find(el => el.name === req.params.char)
  if (!char) char = chars.find(el => el.current)
  res.redirect('/encounter/focus/' + char.name)
});



router.get('/add-file/:char', function(req, res, next) {
  const chars = req.app.get('chars');
  const char = chars.find(el => el.name === req.params.char)
  files = ['one', 'two'];
  res.render('add', { options:files, timestamp:req.timestamp, char:char, title:"Pick one or more sets of characters to add", action:'add-file' });
});

router.get('/add-stock/:char', function(req, res, next) {
  const chars = req.app.get('chars');
  const stocks = req.app.get('stocks').map(el => el.display);
  const char = chars.find(el => el.name === req.params.char)
  res.render('add', { options:stocks, timestamp:req.timestamp, char:char, title:"Pick one or more stock characters to add", action:'add-stock' });
});

router.get('/add-custom/:char', function(req, res, next) {
  const chars = req.app.get('chars');
  const char = chars.find(el => el.name === req.params.char)
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
      chr.hits = chr.maxHits
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
    if (a.charType === 'pc') return 1;
    if (b.charType !== 'pc') return -1;
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
