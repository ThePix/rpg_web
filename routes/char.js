'use strict';

const express = require('express');
const router = express.Router();
const [Char] = require('./../models/char.js')
const [Log] = require('../models/log.js')





const charGetFun = function(req, res, next) {
  const chars = req.app.get('chars');
  const char = chars.find(el => el.name === req.params.char)
  //console.log(char)
  res.render('edit', { char:char, fields: req.app.get('fields'), timestamp:req.timestamp });
}





// POST /char
const charPostFun = function(req, res, next) {
  const chars = req.app.get('chars')
  chars.sort(Char.charSortFunc)
  const current = chars[0]
  const char = chars.find(el => el.name === req.body.name)
  for (let field of req.app.get('fields')) {
    if (!field.display) continue
    if (field.type === 'bool') char[field.name] = (req.body[field.name] === 'on')
    if (field.type === 'int') char[field.name] = parseInt(req.body[field.name])
    if (field.type === 'string') char[field.name] = req.body[field.name]
  }
  char.statusCheck()
  Log.add(char.display + " edited. " + req.body.comment)
  
  res.redirect('/encounter/focus/' + current.name)
}





module.exports = [charGetFun, charPostFun];

