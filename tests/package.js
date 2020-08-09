'use strict';

import test from 'ava';
const [Char] = require('../models/char.js')
const [Package, BonusStat, PenaltyStat, BonusSkill, PenaltySkill, BonusAttack, BonusWeaponAttack, BonusEffect] = require('../models/package.js')
const [AttackConsts, Attack] = require('../models/attack.js')
 


test('_gradeByArray', t => {
  const test = new BonusStat('Shield', {progression:[1, 3, 7, 12]})
  t.is(test._grade(0), 0)
  t.is(test._grade(1), 1)
  t.is(test._grade(2), 1)
  t.is(test._grade(3), 2)
  t.is(test._grade(5), 2)
  t.is(test._grade(99), 4)
});

test('appliesByArray', t => {
  const test = new BonusStat('Shield', {progression:[1, 3, 7, 12]})
  t.is(test.applies(0), 0)
  t.is(test.applies(1), 1)
  t.is(test.applies(2), 0)
  t.is(test.applies(3), 2)
  t.is(test.applies(5), 0)
});


test('_gradePrimary', t => {
  const test = new BonusStat('Shield', {progression:'primary'})
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
  const test = new BonusStat('Shield', {progression:'primary'})
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
  const test = new BonusStat('Shield', {progression:'secondary'})
  
  t.is(test._grade(0), 0)
  t.is(test._grade(1), 1)
  t.is(test._grade(2), 1)
  t.is(test._grade(3), 1)
  t.is(test._grade(4), 2)
});

test('appliesSecondary', t => {
  const test = new BonusStat('Shield', {progression:'secondary'})
  
  t.is(test.applies(0), 0)
  t.is(test.applies(1), 1)
  t.is(test.applies(2), 0)
  t.is(test.applies(3), 0)
  t.is(test.applies(4), 2)
});

test('_gradeSecondary2', t => {
  const test = new BonusStat('Shield', {progression:'secondary2'})

  t.is(test._grade(0), 0)
  t.is(test._grade(1), 0)
  t.is(test._grade(2), 1)
  t.is(test._grade(3), 1)
  t.is(test._grade(4), 1)
});

test('appliesSecondary2', t => {
  const test = new BonusStat('Shield', {progression:'secondary2'})

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




test('getBonusPerLevel', t => {
  const test = new Package('Package', { hitsPerLevel:0.5, bonuses:[
    new BonusStat('nature', {progression:'secondary2'}),
    new BonusStat('shield', {progression:[3, 7, 11]}),
    new BonusStat('armour', {progression:2}),
  ]})

  const ary = test.getBonuses(1)
  
  t.is(test.getBonuses(1).length, 0)
  t.is(test.getBonuses(2).length, 2)
  t.is(test.getBonuses(3).length, 1)
  t.is(test.getBonuses(4).length, 0)
  t.is(test.getBonuses(5).length, 1)
});





test('BonusStat', t => {
  const test = new Package('Package', { hitsPerLevel:0.5, bonuses:[
    new BonusStat('will', {progression:2}),
    new BonusStat('reflex', {progression:7}),
  ]})

  const char = Char.create('tester', {})
  char.packages.Package = 4
  test.apply(char)
  t.is(char.will, 1)
  t.is(char.reflex, 0)
});

test('PenaltyStat', t => {
  const test = new Package('Package', { hitsPerLevel:0.5, bonuses:[
    new PenaltyStat('will', {progression:2}),
    new PenaltyStat('reflex', {progression:7}),
  ]})

  const char = Char.create('tester', {})
  char.packages.Package = 4
  test.apply(char)
  t.is(char.will, -1)
  t.is(char.reflex, 0)
});

test('BonusSkill', t => {
  const test = new Package('Package', { hitsPerLevel:0.5, bonuses:[
    new BonusSkill('Arcana', {progression:2}),
    new BonusSkill('Pick lock', {progression:7}),
  ]})

  const char = Char.create('tester', {})
  char.packages.Package = 4
  test.apply(char)
  t.is(char.skills.Arcana, 1)
  t.is(char.skills['Pick lock'], 0)
});

test('PenaltySkill', t => {
  const test = new Package('Package', { hitsPerLevel:0.5, bonuses:[
    new PenaltySkill('Arcana', {progression:2}),
    new PenaltySkill('Pick lock', {progression:7}),
  ]})

  const char = Char.create('tester', {})
  char.packages.Package = 4
  test.apply(char)
  t.is(char.skills.Arcana, -1)
  t.is(char.skills['Pick lock'], 0)
});

test('BonusAttack', t => {
  const test = new Package('Package', { hitsPerLevel:0.5, bonuses:[
    new BonusAttack('Icedart', {progression:2, secondaryDamage:'2'}),
    new BonusAttack('Ice storm', {progression:7}),
  ]})

  const char = Char.create('tester', {})
  char.packages.Package = 4
  t.is(char.attacks.length, 0)
  test.apply(char)
  test.applyAttacks(char)
  t.is(char.attacks.length, 1)
  t.is(char.attacks[0].name, 'Icedart')
  t.is(char.attacks[0].primaryDamage, 'd4')
  t.is(char.attacks[0].secondaryDamage, '2')
  
  // need char.attacks[0] to have substance
  
});

test('BonusWeaponAttack', t => {
  const test = new Package('Package', { hitsPerLevel:0.5, bonuses:[
    new BonusWeaponAttack('Backstab', {progression:2, secondaryDamage:'2', bonus:2}),
    new BonusWeaponAttack('Greater backstab', {progression:7}),
  ]})

  const char = Char.create('tester', {'Warrior (sword and shield)':3})
  char.packages.Package = 4
  char.weaponMax = 2
  char.updateWeapons(['Dagger', 'Flail'])

  t.is(char.attacks.length, 2)
  test.apply(char)
  test.applyAttacks(char)
  t.is(char.attacks.length, 4)
  t.is(char.attacks[2].name, 'Backstab (Dagger)')
  t.is(char.attacks[3].name, 'Backstab (Flail)')
  t.is(char.attacks[2].secondaryDamage, '2')
  t.is(char.attacks[2].bonus, 5)
});

test('BonusWeaponAttack with restriction', t => {
  const test = new Package('Package', { hitsPerLevel:0.5, bonuses:[
    new BonusWeaponAttack('Backstab', {
        progression:[3, 9, 15, 21],
        weaponCheck:function(weapon) { 
          return weapon.is('fast');
        },
      }),
    new BonusWeaponAttack('Greater backstab', {progression:7}),
  ]})

  const char = Char.create('tester', {'Warrior (sword and shield)':3})
  char.packages.Package = 4
  char.weaponMax = 2
  char.updateWeapons(['Dagger', 'Flail'])

  t.is(char.attacks.length, 2)
  test.apply(char)
  test.applyAttacks(char)
  t.is(char.attacks.length, 3)
  t.is(char.attacks[2].name, 'Backstab (Dagger)')
});




