

//const express = require('express');
//const router = express.Router();




console.log("Here")

import test from 'ava';
//const [Char] = require('./models/char.js')
//const [AttackConsts, Attack] = require('./models/attack.js')
const [Log] = require('../models/log.js')
const router = require('../routes/damage.js')

Log.debug = true
 
test('standard character', t => {
  console.log('-----------')
  getMethods(router)
  console.log('-----------')
  console.log("handle")
  console.log(router.handle)
  console.log('-----------')
  console.log("process_params")
  console.log(router.process_params)
  console.log('-----------')
  console.log("route")
  console.log(router.route)
  console.log('-----------')
  router.handle({ url: '/', method: 'GET' }, { end: 'done' });

  console.log('-----------')

  router.get('/', function() {})
  t.is("Tester", "Tester");
  

});



const getMethods = (obj) => {
  for (let prop in obj) {
    console.log(prop)
  }
}