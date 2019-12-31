'use strict';

import test from 'ava';
const [Char] = require('./models/char.js')
const [AttackConsts, Attack] = require('./models/attack.js')
 
test('standard character', t => {
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
  
  

});
 


test('protected from fire', t => {
  const test = new Char({name: "Tester", protectedFromFire:2})
  t.is(test.name, "Tester");
  t.is(test.elementalThreshold, 8);

  t.is(test.elements.fire.vulnProt, 8);
  t.is(test.elements.fire.toString(), false);
  test.elements.fire.count = 4096
  t.is(test.elements.fire.toString(), "Fire: 4, +2 protection");
  for (let i = 0; i < 2; i++) {
    test.elements.fire.endTurn()
  }
  t.is(test.elements.fire.toString(), false);

  test.elements.fire.count = 0
  test.elementalDamage(3, "fire")
  t.is(test.elements.fire.count, 1024);

});


test('vulnerable to fire', t => {
  const test = new Char({name: "Tester", vulnerableToFire:1})
  t.is(test.name, "Tester");
  t.is(test.elements.fire.vulnProt, 11);
  t.is(test.elements.fire.toString(), false);
  test.elements.fire.count = 4096
  t.is(test.elements.fire.toString(), "Fire: 4, +1 vulnerability");
  for (let i = 0; i < 4; i++) {
    test.elements.fire.endTurn()
  }
  t.is(test.elements.fire.toString(), "Fire: 2, +1 vulnerability");

  test.elements.fire.count = 0
  test.elementalDamage(2, "fire")
  t.is(test.elements.fire.count, 2048 * 2);

});




test('weapon d3', t => {
  const test = new Attack("Test weapon", {primaryDamage:'d3'})
  t.is(test.maxDamage(), 3);
  t.is(test.diceCount(), 1);
});

test('weapon 3d6', t => {
  const test = new Attack("Test weapon", {primaryDamage:'3d6'})
  t.is(test.maxDamage(), 18);
  t.is(test.diceCount(), 3);
});

test('weapon 2d10+2', t => {
  const test = new Attack("Test weapon", {primaryDamage:'2d10+2'})
  t.is(test.maxDamage(), 22);
  t.is(test.diceCount(), 2);
});

test('weapon 4', t => {
  const test = new Attack("Test weapon", {primaryDamage:4})
  t.is(test.maxDamage(), 4);
  t.is(test.diceCount(), 1);
});



test('attack primaryResolve', t => {
  const weapon = new Attack("Weapon", {primaryDamage:4})
  const attacker = new Char({name: "Attacker", attacks: [weapon]})
  const target = new Char({name: "Target", })
  t.is(weapon.primaryResolve(attacker, target, 1, 0), AttackConsts.CRITICAL_MISS);
  t.is(weapon.primaryResolve(attacker, target, 1, 5), AttackConsts.CRITICAL_MISS);
  t.is(weapon.primaryResolve(attacker, target, 2, 9), AttackConsts.PLAIN_HIT);
  t.is(weapon.primaryResolve(attacker, target, 2, 0), AttackConsts.BAD_MISS);
  t.is(weapon.primaryResolve(attacker, target, 10, 0), AttackConsts.PLAIN_MISS);
  t.is(weapon.primaryResolve(attacker, target, 11, 0), AttackConsts.PLAIN_HIT);
  t.is(weapon.primaryResolve(attacker, target, 20, 0), AttackConsts.CRITICAL_HIT);
});

test('attack secondaryResolve', t => {
  const weapon = new Attack("Weapon", {primaryDamage:4})
  const attacker = new Char({name: "Attacker", attacks: [weapon]})
  const target = new Char({name: "Target", })
  t.is(weapon.secondaryResolve(attacker, target, 1, 0), AttackConsts.BAD_MISS);
  t.is(weapon.secondaryResolve(attacker, target, 2, 0), AttackConsts.BAD_MISS);
  t.is(weapon.secondaryResolve(attacker, target, 10, 0), AttackConsts.PLAIN_MISS);
  t.is(weapon.secondaryResolve(attacker, target, 11, 0), AttackConsts.PLAIN_HIT);
  t.is(weapon.secondaryResolve(attacker, target, 20, 0), AttackConsts.GOOD_HIT);
});



