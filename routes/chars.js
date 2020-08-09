'use strict';

const folder = require('../settings.js').folder
const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const [Message] = require('../models/message.js')
const settings = require('../' + folder + '/settings.js')



// Gets the character page that the players see
// GET chars/:char
const charGetFun = function(req, res, next) {
  const chars = req.app.get('chars');
  const char = chars.find(el => el.name === req.params.char)
  if (char) {
    char.penalty = char.getAttackModifier()
    const list = chars.filter(el => el.charType === 'pc' && el.name !== char.name).map(el => el.name)
    res.render('char', { char: char, fields:req.app.get('fields'), timestamp:req.timestamp, refresh:settings.refresh, maxMessages:settings.maxMessages, list:list });
  }
  else {
    res.render('nochar', { name: req.params.char, timestamp:req.timestamp });
  }
}



// GET chars
const allGetFun = function(req, res, next) {
  const chars = req.app.get('chars');
  const first = chars.find(el => el.current)
  if (!first) {
    res.render('nochars', { timestamp:req.timestamp, refresh:settings.refresh });
    return
  }
  
  let c = first
  const list = [];
  do {
    if (!c.disabled) list.push(c)
    c = chars.find(el => el.name === c.next)
  } while (c !== first)
  res.render('chars', { chars:list, timestamp:req.timestamp, refresh:settings.refresh });
}



// Page is approx 610 by 790
// GET chars/:char.pdf
const charsGetPdfFun = function(req, res, next) {
  const chars = req.app.get('chars');
  const char = chars.find(el => el.name === req.params.char)
  //console.log(char)

  const blue = "#006"
  const green = "#80c88d"
  const line = 17

  const doc = new PDFDocument({
    layout:'A4',
    margin:50,
    layout:'portrait',
    bufferPages: true,
  });
  
  doc.info.Title = char.name
  doc.info.Author = "RPG Web/The Pixie"
  doc.pipe(res);
  
  doc.rect(0, 0, 615, 60).fill(blue)
  doc.font('Helvetica-BoldOblique')
    .fill('white')
    .fontSize(32)
    .text(settings.title ? settings.title : "Pixies and Predators", 40, 20)
  doc.font('Helvetica-Bold')
    .fill('black')
    .fontSize(20)
    .text(char.name, 40, 80)
  doc.font('Helvetica')
    .fontSize(12)
  
  display(doc, 'Identity', '', 0, 0, true)

  display(doc, "Sex", char.sex, 0, 1)
  if (char.profession) display(doc, "Profession", char.profession, 0, 2)
  if (char.race) display(doc, "Race", char.race, 0, 3)
  
  const atts = settings.pdfAtts

  display(doc, 'Stats', '', 0, 5, true)
  display(doc, "Level", char.level, 0, 6)
  display(doc, "Points", char.points + '/' + char.getMaxPoints(), 0, 7)

  for (let i = 0; i < atts.length; i++) {
    display(doc, atts[i], char[atts[i].toLowerCase()], 0, 8 + i)
  }
  
  let count = 9 + atts.length
  display(doc, 'Packages', '', 0, count, true)
  count++
  for (let key in char.packages) {
    if (char.packages[key] && char.packages[key] > 0) {
      display(doc, key, char.packages[key], 0, count)
      count++
    }
  }

  count = 0
  display(doc, 'Skills', '', 1, count, true)
  count++
  for (let skill in char.skills) {
    display(doc, skill, char.skills[skill], 1, count)
    count++
  }

  count++
  display(doc, 'Spells and abilities', '', 1, count, true)
  count++
  for (let attack of char.attacks) {
    display(doc, attack.name, attack.display(), 1, count)
    count++
  }
  doc.end();
}

const display = function(doc, name, value, x, y, title, longValue) {
  const offset = (x === 0 ? 40 : 305)
  doc.font(title ? 'Helvetica-BoldOblique' : 'Helvetica-Oblique')
    .text(name, offset, 115 + y * 15)
  doc.font('Helvetica')
    .text(value, (longValue ? 100 : 200) + offset, 115 + y * 15)
}  




// GET chars/:char.json
const charsGetJsonFun = function(req, res, next) {
  const chars = req.app.get('chars');
  const char = chars.find(el => el.name === req.params.char)
  if (char) {
    char.penalty = char.getAttackModifier()
    res.json({ char: char.toHash(), messages:char.getMessages().reverse().slice(0, settings.maxMessages) });
  }
  else {
    res.json({ messages:Message.getMessages(req.params.char).reverse().slice(0, settings.maxMessages) });
  }
}




// POST /chars
const charsPostFun = function(req, res, next) {
  const fields = req.app.get('fields')
  const chars = req.app.get('chars');
  const char = chars.find(el => el.name === req.body.name)
  for (let i = 0; i < fields.length; i++) {
    if (fields[i].type === 'int') {
      char[fields[i].name] = parseInt(req.body[fields[i].name])
    }
    else if (fields[i].type === 'bool') {
      char[fields[i].name] = (req.body[fields[i].name] !== undefined)
    }
    else {
      char[fields[i].name] = req.body[fields[i].name]
    }
  }
  char.statusCheck()
  //console.log(char)
  res.redirect('/encounter')
}



// POST chars/message
const charsPostJsonFun = function(req, res, next) {
  /*if (req.body.recipient === 'All') {
    for (let c of req.app.get('chars')) {
      if (c.charType === 'pc') Message.send(req.body.sender, c.name, req.body.content)
    }
  }
  else {*/
    Message.send(req.body.sender, req.body.recipient, req.body.content)
  //}
  res.json({ result:'okay' });
}


router.get('/', allGetFun);
router.get('/:char.json', charsGetJsonFun);
router.get('/:char.pdf', charsGetPdfFun);
router.get('/:char', charGetFun);
router.post('/', charsPostFun);
router.post('/message', charsPostJsonFun);




module.exports = router;
