'use strict';

const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const [Message] = require('../models/message.js')


// Gets the character page that the players see
const charsGetFun = function(req, res, next) {
  const chars = req.app.get('chars');
  const refresh = req.app.get('refresh');
  const maxMessages = req.app.get('maxMessages');
  if (req.query.name) {
    const char = chars.find(el => el.name === req.query.name)
    if (char) {
      char.penalty = char.getAttackModifier()
      //console.log(chars)
      //console.log(list)
      //console.log(list)
      //console.log(list)
      const list = chars.filter(el => el.charType === 'pc' && el.name !== char.name).map(el => el.name)
      console.log('list')
      console.log(list)
      res.render('char', { char: char, fields:req.app.get('fields'), timestamp:req.timestamp, refresh:refresh, maxMessages:maxMessages, list:list });
    }
    else {
      res.render('nochar', { name: req.query.name, timestamp:req.timestamp });
    }
  }
  else {
    const first = chars.find(el => el.current)
    if (!first) {
      res.render('nochars', { timestamp:req.timestamp, refresh:refresh });
      return
    }
    
    let c = first
    const list = [];
    do {
      if (!c.disabled) list.push(c)
      c = chars.find(el => el.name === c.next)
    } while (c !== first)
    res.render('chars', { chars:list, timestamp:req.timestamp, refresh:refresh });
  }
}



const charsGetJsonFun = function(req, res, next) {
  console.log("in charsGetJsonFun")
  const maxMessages = req.app.get('maxMessages');
  const chars = req.app.get('chars');
  const char = chars.find(el => el.name === req.query.name)
  console.log("char=" + char.name)
  if (char) {
    char.penalty = char.getAttackModifier()
    res.json({ char: char.toHash(), messages:char.getMessages().reverse().slice(0, maxMessages) });
  }
  else {
    console.log("Failed to find character in charsGetJsonFun: " + req.query.name)
  }
}







// Page is approx 610 by 790
const charsGetPdfFun = function(req, res, next) {
  const chars = req.app.get('chars');
  const char = chars.find(el => el.name === req.query.name)
  console.log(char)


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
  doc.info.Author = "Pixies and Predators"
  doc.pipe(res);
  
  doc.rect(0, 0, 615, 60).fill(blue)
  doc.font('Helvetica-BoldOblique')
    .fill('white')
    .fontSize(32)
    .text("Pixies and Predators", 40, 20)
  doc.font('Helvetica-Bold')
    .fill('black')
    .fontSize(20)
    .text(char.name, 40, 80)
  doc.font('Helvetica')
    .fontSize(12)
  
  display(doc, 'Identity', '', 0, 0, true)

  display(doc, "Sex", char.sex, 0, 1)
  display(doc, "Race", char.race, 0, 2)
  display(doc, "Profession", char.profession, 0, 3)
  display(doc, "Level", char.level, 0, 4)
  display(doc, "Points", char.points + '/' + char.maxPoints, 0, 5)
  
  const atts = ["Hits", "Attack", "Weapons", "Armour", "Shield", "Init", "Reflex", "Stamina", "Will"]

  display(doc, 'Stats', '', 0, 7, true)
  for (let i = 0; i < atts.length; i++) {
    display(doc, atts[i], char[atts[i].toLowerCase()], 0, 8 + i)
  }
  
  let count = 9 + atts.length
  display(doc, 'Packages', '', 0, count, true)
  count++
  for (let key in char.packages) {
    if (char.packages[key] && char.packages[key] > 0) {
      display(doc, key, char.packages[key], 0, count, false, true)
      count++
    }
  }
  
  
  
  
  
  count = 0
  display(doc, 'Skills, spells, abilities', '', 1, count, true)
  count++
  for (let name in char) {
    if (name.match(/^[A-Z]/)) {
      display(doc, name, char[name], 1, count, false, true)
      count++
    }
  }
  /*
  count++
  display(doc, 'Notes', '', 1, count, true)
  count++
  for (let s of char.notes) {
    display(doc, s, '', 1, count, false, true)
    count++
  }*/
  
  doc.end();
}


const display = function(doc, name, value, x, y, title, longName) {
  const offset = (x === 0 ? 40 : 305)
  doc.font(title ? 'Helvetica-BoldOblique' : 'Helvetica-Oblique')
    .text(name, offset, 115 + y * 15)
  doc.font('Helvetica')
    .text(value, (longName ? 200 : 100) + offset, 115 + y * 15)
}  



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



const charsPostJsonFun = function(req, res, next) {
  Message.send(req.body.sender, req.body.recipient, req.body.content)
  res.json({ result:'okay' });
}



module.exports = [charsGetFun, charsGetJsonFun, charsGetPdfFun, charsPostFun, charsPostJsonFun];
