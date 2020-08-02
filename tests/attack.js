'use strict';

import test from 'ava';
const [Char] = require('../models/char.js')
const [AttackConsts, Attack, WEAPONS, Weapon] = require('../models/attack.js')
 


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



test('weaponattack basic', t => {
  const test = Attack.createFromWeapon(Weapon.find("Warhammer"), {attack:4})
  t.is(test.maxDamage(), 20);
  t.is(test.diceCount(), 2);
});

test('weaponattack not recognised', t => {
  t.throws(() => { Attack.createFromWeapon(Weapon.find("Nonsense"), {attack:4}) });
});

test('weaponattack additional', t => {
  const test = Attack.createFromWeapon(Weapon.find("Warhammer"), {attack:4}, {secondaryDamage:'3d6'})
  t.is(test.secondaryDamage, '3d6');
});

test('weaponattack altName', t => {
  const test = Attack.createFromWeapon(Weapon.find("Warhammer"), {attack:4}, {altName:"Swinging warhammer"})
  t.is(test.name, "Swinging warhammer");
  t.is(test.maxDamage(), 20);
  t.is(test.diceCount(), 2);
});




test('weapon', t => {
  const weapon = new Weapon("Short bow", {damage:"2d6", atts:"bpFX", desc:"Fast reload"})

  t.is(weapon.is('skilled'), true);
  t.is(weapon.is('bow'), true);
  t.is(weapon.is('melee'), false);
  t.is(weapon.is('throwable'), false);
  t.is(weapon.attackType(), 'bow');
  t.is(weapon.damageType(), 'pierce');
  t.is(weapon.group(), 'weaponAdept_bow_pierce');
});





test('weapon target desc', t => {
  const test = new Attack("Test weapon",{})
  t.is(test.primaryTargetNote(), "1");
  t.is(test.secondaryTargetNote(), "0");
  test.primaryMin = 2
  test.primaryMax = 4
  test.secondaryMin = 3
  test.secondaryMax = 999
  t.is(test.primaryTargetNote(), "2 to 4");
  t.is(test.secondaryTargetNote(), "3 or more");
});



test('attack primaryResolve', t => {
  const weapon = new Attack("Weapon", {primaryDamage:4})
  const attacker = Char.create("Attacker", {attacks: [weapon]})
  const target = Char.create("Target", {})
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
  const attacker = Char.create("Attacker", {attacks: [weapon]})
  const target = Char.create("Target", {})
  t.is(weapon.secondaryResolve(attacker, target, 1, 0), AttackConsts.BAD_MISS);
  t.is(weapon.secondaryResolve(attacker, target, 2, 0), AttackConsts.BAD_MISS);
  t.is(weapon.secondaryResolve(attacker, target, 10, 0), AttackConsts.PLAIN_MISS);
  t.is(weapon.secondaryResolve(attacker, target, 11, 0), AttackConsts.PLAIN_HIT);
  t.is(weapon.secondaryResolve(attacker, target, 20, 0), AttackConsts.GOOD_HIT);
});