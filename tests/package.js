'use strict';

import test from 'ava';
const [Char] = require('../models/char.js')
const [Package, Bonus, Penalty, BonusAttack, BonusSpell] = require('../models/package.js')
const [AttackConsts, Attack] = require('../models/attack.js')
const packages = require('../data/packages.js')
 


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




const getTester = function(level) {
  const test = new Package('Package', { hitsPerLevel:0.5, bonuses:[
    new Bonus('nature', {progression:'secondary2', notes:"Good at nature skill"}),
    new Bonus('shield', {progression:[3, 7, 11], notes:["Small shield", "Medium shield", "Large shield"]}),
    new Bonus('armour', {progression:2, notes:function(grade) { return "Armour " + grade }}),
    new Penalty('poison', {progression:2}),
    new Penalty('sneak', {progression:'primary'}),
  ]})
  const tester = Char.create("Tester", [test], {Package:level}, [])

  return tester  
}

test('getBonuses1', t => {
  const tester = getTester(1)  
  t.is(tester.maxHits, 20)
  t.is(tester.shield, 0)
  t.is(tester.nature, undefined)
  t.is(tester.armour, 0)
  t.is(tester.poison, undefined)
  t.is(tester.sneak, -1)
});

test('getBonuses2', t => {
  const tester = getTester(2)
  t.is(tester.maxHits, 21)
  t.is(tester.shield, 0)
  t.is(tester.nature, 1)
  t.is(tester.armour, 1)
  t.is(tester.poison, -1)
  t.is(tester.sneak, -2)
});

test('getBonuses10', t => {
  const tester = getTester(10)  
  t.is(tester.maxHits, 25)
  t.is(tester.shield, 2)
  t.is(tester.nature, 3)
  t.is(tester.armour, 1)
  t.is(tester.poison, -1)
  t.is(tester.sneak, -7)

  t.is(tester.notes[0], "Good at nature skill")
  t.is(tester.notes[1], "Medium shield")
  t.is(tester.notes[2], "Armour 1")
});

test('getBonuses20', t => {
  const tester = getTester(20)
  t.is(tester.maxHits, 30)
  t.is(tester.shield, 3)
  t.is(tester.nature, 7)
  t.is(tester.armour, 1)
});







test('adding attacks', t => {

  const test1 = new Package('Package1', { hitsPerLevel:0.5, bonuses:[
    new Bonus('nature', {progression:'secondary2', notes:"Good at nature skill"}),
    new Bonus('shield', {progression:[3, 7, 11], notes:["Small shield", "Medium shield", "Large shield"]}),
    new Bonus('armour', {progression:2, notes:function(grade) { return "Armour " + grade }}),
    new Bonus('weaponMax', {progression:3}),
    new Bonus('attack', {progression:'primary', notes:"Good at fighting"}),
  ]})
  const test2 = new Package('Package2', { bonuses:[
    new Bonus('shield', {progression:2}),
    new BonusAttack('Sneak', {progression:3, weaponCheck:function(weapon) { 
      //console.log(weapon.name + "..." + weapon.is('fast'));
      return weapon.is('fast');
    }}),
  ]})
  const test3 = new Package('Package3', { bonuses:[
    new BonusSpell('Ice blast', {progression:3}),
    new Bonus('weaponMax', {progression:3}),
  ]})
  const tester = Char.create("Tester", [test1, test2, test3], {Package1:10, Package2:4, Package3:6}, ["Dagger", "Warhammer", "Flail"])

  t.is(tester.weaponMax, 3)
  t.is(tester.attacks.length, 5)
  t.is(tester.warnings.length, 0)
  t.is(tester.attacks[0].name, 'Dagger')
  t.is(tester.attacks[2].name, 'Flail')
  t.is(tester.attacks[3].name, 'Sneak (Dagger)')
  t.is(tester.attacks[4].name, 'Ice blast')

})


test('adding attacks restricted', t => {

  const test1 = new Package('Package1', { hitsPerLevel:0.5, bonuses:[
    new Bonus('nature', {progression:'secondary2', notes:"Good at nature skill"}),
    new Bonus('shield', {progression:[3, 7, 11], notes:["Small shield", "Medium shield", "Large shield"]}),
    new Bonus('armour', {progression:2, notes:function(grade) { return "Armour " + grade }}),
    new Bonus('weaponMax', {progression:3}),
    new Bonus('attack', {progression:'primary', notes:"Good at fighting"}),
  ]})
  const test2 = new Package('Package2', { bonuses:[
    new Bonus('shield', {progression:2}),
    new BonusAttack('Sneak', {progression:3, weaponCheck:function(weapon) { 
      //console.log(weapon.name + "..." + weapon.is('fast'));
      return weapon.is('fast');
    }}),
  ]})
  const test3 = new Package('Package3', { bonuses:[
    new BonusSpell('Ice blast', {progression:3}),
  ]})
  const tester = Char.create("Tester", [test1, test2, test3], {Package1:10, Package2:4, Package3:6}, ["Warhammer", "Flail", "Dagger"])

  t.is(tester.weaponMax, 2)
  t.is(tester.attacks.length, 3)
  t.is(tester.warnings.length, 2)
  t.is(tester.warnings[0], "Additional weapon discarded")
  t.is(tester.warnings[1], "No weapons suitable for Sneak")
  t.is(tester.attacks[0].name, 'Warhammer')
  t.is(tester.attacks[2].name, 'Ice blast')

})


