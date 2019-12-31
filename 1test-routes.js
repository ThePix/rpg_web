'use strict';
/*
const express = require('express');
const router = express.Router();

console.log("Here")

import test from 'ava';
const [Char] = require('./models/char.js')
const [AttackConsts, Attack] = require('./models/attack.js')
const [Log] = require('./models/log.js')

Log.debug = true
 
test('standard character', t => {
  console.log('-----------')
  console.log(router.params)
  console.log('-----------')
  console.log(router._params)
  console.log('-----------')
  const test = new Char({name: "Tester", size:"Tiny"})
  t.is(test.name, "Tester");
  t.is(test.elementalThreshold, 2);

  t.is(test.elements.fire.toString(), false);
  test.elements.fire.count = 4096
  t.is(test.elements.fire.toString(), "Fire: 4");
  for (let i = 0; i < 4; i++) {
    test.elements.fire.endTurn()
  }
  t.is(test.elements.fire.toString(), false);

  test.elements.fire.count = 0
  test.elementalDamage(2, "fire")
  t.is(test.elements.fire.count, 2048);
  
  

});*/