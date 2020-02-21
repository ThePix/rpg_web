'use strict';

const express = require('express');
const router = express.Router();

const [Log] = require('../models/log.js')
const settings = require('../settings.js')


/* GET home page. */
const indexGetFun = function(req, res, next) {
  const chars = req.app.get('chars').filter(el => el.charType === 'pc');
  res.render('index', { chars:chars, timestamp:req.timestamp, refreshRate:settings.refresh });
}

const logGetFun = function(req, res, next) {
  res.render('log', { log:Log.getData(settings.logLength), timestamp:req.timestamp, refresh:settings.refresh, title:'Log of last ' + settings.logLength + ' events' });
}


module.exports = [indexGetFun, logGetFun];
