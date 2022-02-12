'use strict';

const assert = require('assert')
const [Char] = require('../models/char.js')
const [Package, BonusStat, PenaltyStat, BonusSkill, PenaltySkill, BonusAttack, BonusWeaponAttack, BonusEffect] = require('../models/package.js')
const [AttackConsts, Attack] = require('../models/attack.js')
 
describe('Package', function() {


it('_gradeByArray', function() {
  const test = new BonusStat('Shield', {progression:[1, 3, 7, 12]})
  assert.equal(test._grade(0), 0)
  assert.equal(test._grade(1), 1)
  assert.equal(test._grade(2), 1)
  assert.equal(test._grade(3), 2)
  assert.equal(test._grade(5), 2)
  assert.equal(test._grade(99), 4)
});

it('appliesByArray', function() {
  const test = new BonusStat('Shield', {progression:[1, 3, 7, 12]})
  assert.equal(test.applies(0), 0)
  assert.equal(test.applies(1), 1)
  assert.equal(test.applies(2), 0)
  assert.equal(test.applies(3), 2)
  assert.equal(test.applies(5), 0)
});


it('_gradePrimary', function() {
  const test = new BonusStat('Shield', {progression:'primary'})
  assert.equal(test._grade(0), 0)
  assert.equal(test._grade(1), 1)
  assert.equal(test._grade(5), 5)
  assert.equal(test._grade(6), 5)
  assert.equal(test._grade(7), 6)
  assert.equal(test._grade(8), 6)
  assert.equal(test._grade(9), 7)
  assert.equal(test._grade(15), 10)
  assert.equal(test._grade(16), 10)
  assert.equal(test._grade(17), 10)
  assert.equal(test._grade(18), 11)
  assert.equal(test._grade(29), 14)
  assert.equal(test._grade(30), 15)
  assert.equal(test._grade(31), 15)
  assert.equal(test._grade(32), 15)
  assert.equal(test._grade(33), 15)
  assert.equal(test._grade(34), 16)
  assert.equal(test._grade(49), 19)
  assert.equal(test._grade(50), 20)
  assert.equal(test._grade(51), 20)
  assert.equal(test._grade(55), 21)
});

it('appliesPrimary', function() {
  const test = new BonusStat('Shield', {progression:'primary'})
  assert.equal(test.applies(0), 0)
  assert.equal(test.applies(1), 1)
  assert.equal(test.applies(5), 2)
  assert.equal(test.applies(6), 0)
  assert.equal(test.applies(7), 2)
  assert.equal(test.applies(8), 0)
  assert.equal(test.applies(9), 2)
  assert.equal(test.applies(15), 2)
  assert.equal(test.applies(16), 0)
  assert.equal(test.applies(17), 0)
  assert.equal(test.applies(18), 2)
  assert.equal(test.applies(29), 0)
  assert.equal(test.applies(30), 2)
  assert.equal(test.applies(31), 0)
  assert.equal(test.applies(32), 0)
  assert.equal(test.applies(33), 0)
  assert.equal(test.applies(34), 2)
  assert.equal(test.applies(49), 0)
  assert.equal(test.applies(50), 2)
  assert.equal(test.applies(51), 0)
  assert.equal(test.applies(55), 2)
});


it('_gradeSecondary', function() {
  const test = new BonusStat('Shield', {progression:'secondary'})
  
  assert.equal(test._grade(0), 0)
  assert.equal(test._grade(1), 1)
  assert.equal(test._grade(2), 1)
  assert.equal(test._grade(3), 1)
  assert.equal(test._grade(4), 2)
});

it('appliesSecondary', function() {
  const test = new BonusStat('Shield', {progression:'secondary'})
  
  assert.equal(test.applies(0), 0)
  assert.equal(test.applies(1), 1)
  assert.equal(test.applies(2), 0)
  assert.equal(test.applies(3), 0)
  assert.equal(test.applies(4), 2)
});

it('_gradeSecondary2', function() {
  const test = new BonusStat('Shield', {progression:'secondary2'})

  assert.equal(test._grade(0), 0)
  assert.equal(test._grade(1), 0)
  assert.equal(test._grade(2), 1)
  assert.equal(test._grade(3), 1)
  assert.equal(test._grade(4), 1)
});

it('appliesSecondary2', function() {
  const test = new BonusStat('Shield', {progression:'secondary2'})

  assert.equal(test.applies(0), 0)
  assert.equal(test.applies(1), 0)
  assert.equal(test.applies(2), 1)
  assert.equal(test.applies(3), 0)
  assert.equal(test.applies(4), 0)
  assert.equal(test.applies(5), 2)
});

  //const r = []
  //for (let i = 0; i < 10; i++) r.push(i + ":" + test._grade(i))
  //console.log(r)




it('getBonusPerLevel', function() {
  const test = new Package('Package', { hitsPerLevel:0.5, bonuses:[
    new BonusStat('nature', {progression:'secondary2'}),
    new BonusStat('shield', {progression:[3, 7, 11]}),
    new BonusStat('armour', {progression:2}),
  ]})

  const ary = test.getBonuses(1)
  
  assert.equal(test.getBonuses(1).length, 0)
  assert.equal(test.getBonuses(2).length, 2)
  assert.equal(test.getBonuses(3).length, 1)
  assert.equal(test.getBonuses(4).length, 0)
  assert.equal(test.getBonuses(5).length, 1)
});





it('BonusStat', function() {
  const test = new Package('Package', { hitsPerLevel:0.5, bonuses:[
    new BonusStat('will', {progression:2}),
    new BonusStat('reflex', {progression:7}),
  ]})

  const char = Char.create('tester', {})
  char.packages.Package = 4
  test.apply(char)
  assert.equal(char.will, 1)
  assert.equal(char.reflex, 0)
});

it('PenaltyStat', function() {
  const test = new Package('Package', { hitsPerLevel:0.5, bonuses:[
    new PenaltyStat('will', {progression:2}),
    new PenaltyStat('reflex', {progression:7}),
  ]})

  const char = Char.create('tester', {})
  char.packages.Package = 4
  test.apply(char)
  assert.equal(char.will, -1)
  assert.equal(char.reflex, 0)
});

it('BonusSkill', function() {
  const test = new Package('Package', { hitsPerLevel:0.5, bonuses:[
    new BonusSkill('Arcana', {progression:2}),
    new BonusSkill('Pick lock', {progression:7}),
  ]})

  const char = Char.create('tester', {})
  char.packages.Package = 4
  test.apply(char)
  assert.equal(char.skills.Arcana, 1)
  assert.equal(char.skills['Pick lock'], 0)
});

it('PenaltySkill', function() {
  const test = new Package('Package', { hitsPerLevel:0.5, bonuses:[
    new PenaltySkill('Arcana', {progression:2}),
    new PenaltySkill('Pick lock', {progression:7}),
  ]})

  const char = Char.create('tester', {})
  char.packages.Package = 4
  test.apply(char)
  assert.equal(char.skills.Arcana, -1)
  assert.equal(char.skills['Pick lock'], 0)
});

it('BonusAttack', function() {
  const test = new Package('Package', { hitsPerLevel:0.5, bonuses:[
    new BonusAttack('Icedart', {progression:2, secondaryDamage:'2'}),
    new BonusAttack('Ice storm', {progression:7}),
  ]})

  const char = Char.create('tester', {})
  char.packages.Package = 4
  assert.equal(char.attacks.length, 0)
  test.apply(char)
  test.applyAttacks(char)
  assert.equal(char.attacks.length, 1)
  assert.equal(char.attacks[0].name, 'Icedart')
  assert.equal(char.attacks[0].primaryDamage, 'd4')
  assert.equal(char.attacks[0].secondaryDamage, '2')
  
  // need char.attacks[0] to have substance
  
});

it('BonusWeaponAttack', function() {
  const test = new Package('Package', { hitsPerLevel:0.5, bonuses:[
    new BonusWeaponAttack('Backstab', {progression:2, secondaryDamage:'2', bonus:2}),
    new BonusWeaponAttack('Greater backstab', {progression:7}),
  ]})

  const char = Char.create('tester', {'Warrior (sword and shield)':3})
  char.packages.Package = 4
  char.weaponMax = 2
  char.updateWeapons(['Dagger', 'Flail'])

  assert.equal(char.attacks.length, 2)
  test.apply(char)
  test.applyAttacks(char)
  assert.equal(char.attacks.length, 4)
  assert.equal(char.attacks[2].name, 'Backstab (Dagger)')
  assert.equal(char.attacks[3].name, 'Backstab (Flail)')
  assert.equal(char.attacks[2].secondaryDamage, '2')
  assert.equal(char.attacks[2].bonus, 5)
});

it('BonusWeaponAttack with restriction', function() {
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

  assert.equal(char.attacks.length, 2)
  test.apply(char)
  test.applyAttacks(char)
  assert.equal(char.attacks.length, 3)
  assert.equal(char.attacks[2].name, 'Backstab (Dagger)')
});




})