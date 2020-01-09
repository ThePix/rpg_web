'use strict';

import test from 'ava';
const [Package, packages, Bonus, LevelBonus, MultiBonus, SkillBonus] = require('../models/package.js')
 


test('_gradeByArray', t => {
  const test = new Bonus('Shield', {progression:[1, 3, 7, 12]})
  t.is(test._grade(0), 0)
  t.is(test._grade(1), 1)
  t.is(test._grade(2), 1)
  t.is(test._grade(3), 2)
  t.is(test._grade(5), 2)
  t.is(test._grade(99), 4)
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
  t.is(test._grade(30), 15)
  t.is(test._grade(50), 20)
});


test('_gradeSecondary', t => {
  const test = new Bonus('Shield', {progression:'secondary'})
  
  const r = []
  for (let i = 0; i < 10; i++) r.push(i + ":" + test._grade(i))
  console.log(r)
  
  t.is(test._grade(0), 0)
  t.is(test._grade(1), 1)
  t.is(test._grade(2), 1)
  t.is(test._grade(3), 1)
  t.is(test._grade(4), 2)
});

test('_gradeSecondary2', t => {
  const test = new Bonus('Shield', {progression:'secondary2'})

  const r = []
  for (let i = 0; i < 10; i++) r.push(i + ":" + test._grade(i))
  console.log(r)
  
  t.is(test._grade(0), 0)
  t.is(test._grade(1), 0)
  t.is(test._grade(2), 1)
  t.is(test._grade(3), 1)
  t.is(test._grade(4), 1)
});
