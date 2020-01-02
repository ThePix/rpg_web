'use strict';

const express = require('express');
const router = express.Router();

// Gets the character page that the players see
const charsGetFun = function(req, res, next) {
  const chars = req.app.get('chars');
  const refresh = req.app.get('refresh');
  if (req.query.name) {
    const char = chars.find(el => el.name === req.query.name)
    if (char) {
      res.render('char', { char: char, fields: req.app.get('fields'), timestamp:req.timestamp, refresh:refresh });
    }
    else {
      res.render('nochar', { name: req.query.name, timestamp:req.timestamp, refresh:refresh });
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
  //console.log(char)
  res.redirect('/encounter')
}


module.exports = [charsGetFun, charsPostFun];
