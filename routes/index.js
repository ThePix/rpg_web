'use strict';

const express = require('express');
const router = express.Router();

const [Log] = require('../models/log.js')

const LENGTH = 50


/* GET home page. */
router.get('/', function(req, res, next) {
  //console.log(req.app.get('chars'))
  const refresh = req.app.get('refresh');
  const chars = req.app.get('chars').filter(el => el.pc);
  res.render('index', { chars:chars, timestamp:req.timestamp, refreshRate:refresh });
});

router.get('/log', function(req, res, next) {
  const refresh = req.app.get('refresh');
  res.render('log', { log:Log.getData(LENGTH), timestamp:req.timestamp, refreshRate:refresh, title:'Log of last ' + LENGTH + ' events' });
});





module.exports = router;
