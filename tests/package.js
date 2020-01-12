'use strict';

import test from 'ava';
const [Package, packages, Bonus] = require('../models/package.js')
 


test('_gradeByArray', t => {
  const test = new Bonus('Shield', {progression:[1, 3, 7, 12]})
  t.is(test._grade(0), 0)
  t.is(test._grade(1), 1)
  t.is(test._grade(2), 1)
  t.is(test._grade(3), 2)
  t.is(test._grade(5), 2)
  t.is(test._grade(99), 4)
});

test('appliesByArray', t => {
  const test = new Bonus('Shield', {progression:[1, 3, 7, 12]})
  t.is(test.applies(0), 0)
  t.is(test.applies(1), 1)
  t.is(test.applies(2), 0)
  t.is(test.applies(3), 2)
  t.is(test.applies(5), 0)
});


test('_gradePrimary', t => {
  const test = new Bonus('Shield', {progression:'primary'})
  t.is(test._grade(0), 0)
  t.is(test._grade(1), 1)
  t.is(test._grade(5), 5)
  t.is(test._grade(6), 5)
  t.is(test._grade(7), 6)
  t.is(test._grade(8), 6)
  t.is(test._grade(9), 7)
  t.is(test._grade(15), 10)
  t.is(test._grade(16), 10)
  t.is(test._grade(17), 10)
  t.is(test._grade(18), 11)
  t.is(test._grade(29), 14)
  t.is(test._grade(30), 15)
  t.is(test._grade(31), 15)
  t.is(test._grade(32), 15)
  t.is(test._grade(33), 15)
  t.is(test._grade(34), 16)
  t.is(test._grade(49), 19)
  t.is(test._grade(50), 20)
  t.is(test._grade(51), 20)
  t.is(test._grade(55), 21)
});

test('appliesPrimary', t => {
  const test = new Bonus('Shield', {progression:'primary'})
  t.is(test.applies(0), 0)
  t.is(test.applies(1), 1)
  t.is(test.applies(5), 2)
  t.is(test.applies(6), 0)
  t.is(test.applies(7), 2)
  t.is(test.applies(8), 0)
  t.is(test.applies(9), 2)
  t.is(test.applies(15), 2)
  t.is(test.applies(16), 0)
  t.is(test.applies(17), 0)
  t.is(test.applies(18), 2)
  t.is(test.applies(29), 0)
  t.is(test.applies(30), 2)
  t.is(test.applies(31), 0)
  t.is(test.applies(32), 0)
  t.is(test.applies(33), 0)
  t.is(test.applies(34), 2)
  t.is(test.applies(49), 0)
  t.is(test.applies(50), 2)
  t.is(test.applies(51), 0)
  t.is(test.applies(55), 2)
});


test('_gradeSecondary', t => {
  const test = new Bonus('Shield', {progression:'secondary'})
  
  t.is(test._grade(0), 0)
  t.is(test._grade(1), 1)
  t.is(test._grade(2), 1)
  t.is(test._grade(3), 1)
  t.is(test._grade(4), 2)
});

test('appliesSecondary', t => {
  const test = new Bonus('Shield', {progression:'secondary'})
  
  t.is(test.applies(0), 0)
  t.is(test.applies(1), 1)
  t.is(test.applies(2), 0)
  t.is(test.applies(3), 0)
  t.is(test.applies(4), 2)
});

test('_gradeSecondary2', t => {
  const test = new Bonus('Shield', {progression:'secondary2'})

  t.is(test._grade(0), 0)
  t.is(test._grade(1), 0)
  t.is(test._grade(2), 1)
  t.is(test._grade(3), 1)
  t.is(test._grade(4), 1)
});

test('appliesSecondary2', t => {
  const test = new Bonus('Shield', {progression:'secondary2'})

  t.is(test.applies(0), 0)
  t.is(test.applies(1), 0)
  t.is(test.applies(2), 1)
  t.is(test.applies(3), 0)
  t.is(test.applies(4), 0)
  t.is(test.applies(5), 2)
});

  //const r = []
  //for (let i = 0; i < 10; i++) r.push(i + ":" + test._grade(i))
  //console.log(r)


test('getBonuses1', t => {
  const tester = { shield:0, armour:0, maxHits:20 }
  const test = new Package('Package', { hitsPerLevel:0.5, bonuses:[
    new Bonus('nature', {progression:'secondary2'}),
    new Bonus('shield', {progression:[3, 7, 11]}),
    new Bonus('armour', {progression:2}),
  ]})

  test.setBonuses(tester, 1)
  
  t.is(tester.maxHits, 20)
  t.is(tester.shield, 0)
  t.is(tester.nature, undefined)
  t.is(tester.armour, 0)
});

test('getBonuses2', t => {
  const tester = { shield:0, armour:0, maxHits:20 }
  const test = new Package('Package', { hitsPerLevel:0.5, bonuses:[
    new Bonus('nature', {progression:'secondary2'}),
    new Bonus('Shield', {progression:[3, 7, 11], altName:'shield'}),
    new Bonus('armour', {progression:2}),
  ]})

  test.setBonuses(tester, 2)
  
  t.is(tester.maxHits, 21)
  t.is(tester.shield, 0)
  t.is(tester.nature, 1)
  t.is(tester.armour, 1)
});

test('getBonuses10', t => {
  const tester = { shield:0, armour:0, maxHits:20 }
  const test = new Package('Package', { hitsPerLevel:0.5, bonuses:[
    new Bonus('nature', {progression:'secondary2'}),
    new Bonus('shield', {progression:[3, 7, 11]}),
    new Bonus('armour', {progression:2}),
  ]})

  test.setBonuses(tester, 10)
  
  t.is(tester.maxHits, 25)
  t.is(tester.shield, 2)
  t.is(tester.nature, 3)
  t.is(tester.armour, 1)
});

test('getBonuses20', t => {
  const tester = { shield:0, armour:0, maxHits:20 }
  const test = new Package('Package', { hitsPerLevel:0.5, bonuses:[
    new Bonus('nature', {progression:'secondary2'}),
    new Bonus('shield', {progression:[3, 7, 11]}),
    new Bonus('armour', {progression:2}),
  ]})

  test.setBonuses(tester, 20)
  
  t.is(tester.maxHits, 30)
  t.is(tester.shield, 3)
  t.is(tester.nature, 7)
  t.is(tester.armour, 1)
});





test('getBonusPerLevel1', t => {
  const test = new Package('Package', { hitsPerLevel:0.5, bonuses:[
    new Bonus('nature', {progression:'secondary2'}),
    new Bonus('shield', {progression:[3, 7, 11]}),
    new Bonus('armour', {progression:2}),
  ]})

  const ary = test.getBonuses(1)
  
  t.is(test.getBonuses(1).length, 0)
  t.is(test.getBonuses(2).length, 2)
  t.is(test.getBonuses(3).length, 1)
  t.is(test.getBonuses(4).length, 0)
  t.is(test.getBonuses(5).length, 1)
});
