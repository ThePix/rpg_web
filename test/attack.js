'use strict';

const assert = require('assert')
const [Char] = require('../models/char.js')
const [AttackConsts, Attack, WEAPONS, Weapon] = require('../models/attack.js')
 
describe('Attack', function() {


it('weapon d3', function() {
  const test = new Attack("Test weapon", {primaryDamage:'d3'})
  assert.equal(test.maxDamage(), 3);
  assert.equal(test.diceCount(), 1);
});

it('weapon 3d6', function() {
  const test = new Attack("Test weapon", {primaryDamage:'3d6'})
  assert.equal(test.maxDamage(), 18);
  assert.equal(test.diceCount(), 3);
});

it('weapon 2d10+2', function() {
  const test = new Attack("Test weapon", {primaryDamage:'2d10+2'})
  assert.equal(test.maxDamage(), 22);
  assert.equal(test.diceCount(), 2);
});

it('weapon 4', function() {
  const test = new Attack("Test weapon", {primaryDamage:4})
  assert.equal(test.maxDamage(), 4);
  assert.equal(test.diceCount(), 1);
});



it('weaponattack basic', function() {
  const test = Attack.createFromWeapon(Weapon.find("Warhammer"), {attack:4})
  assert.equal(test.maxDamage(), 20);
  assert.equal(test.diceCount(), 2);
});

it('weaponattack not recognised', function() {
  assert.throws(() => { Attack.createFromWeapon(Weapon.find("Nonsense"), {attack:4}) });
});

it('weaponattack additional', function() {
  const test = Attack.createFromWeapon(Weapon.find("Warhammer"), {attack:4}, {secondaryDamage:'3d6'})
  assert.equal(test.secondaryDamage, '3d6');
});

it('weaponattack altName', function() {
  const test = Attack.createFromWeapon(Weapon.find("Warhammer"), {attack:4}, {altName:"Swinging warhammer"})
  assert.equal(test.name, "Swinging warhammer");
  assert.equal(test.maxDamage(), 20);
  assert.equal(test.diceCount(), 2);
});




it('weapon', function() {
  const weapon = new Weapon("Short bow", {damage:"2d6", atts:"bpFX", desc:"Fast reload"})

  assert.equal(weapon.is('skilled'), true);
  assert.equal(weapon.is('bow'), true);
  assert.equal(weapon.is('melee'), false);
  assert.equal(weapon.is('throwable'), false);
  assert.equal(weapon.attackType(), 'bow');
  assert.equal(weapon.damageType(), 'pierce');
  assert.equal(weapon.group(), 'weaponAdept_bow_pierce');
});





it('weapon target desc', function() {
  const test = new Attack("Test weapon",{})
  assert.equal(test.primaryTargetNote(), "1");
  assert.equal(test.secondaryTargetNote(), "0");
  test.primaryMin = 2
  test.primaryMax = 4
  test.secondaryMin = 3
  test.secondaryMax = 999
  assert.equal(test.primaryTargetNote(), "2 to 4");
  assert.equal(test.secondaryTargetNote(), "3 or more");
});



it('attack primaryResolve', function() {
  const weapon = new Attack("Weapon", {primaryDamage:4})
  const attacker = Char.create("Attacker", {attacks: [weapon]})
  const target = Char.create("Target", {})
  assert.equal(weapon.primaryResolve(attacker, target, 1, 0), AttackConsts.CRITICAL_MISS);
  assert.equal(weapon.primaryResolve(attacker, target, 1, 5), AttackConsts.CRITICAL_MISS);
  assert.equal(weapon.primaryResolve(attacker, target, 2, 9), AttackConsts.PLAIN_HIT);
  assert.equal(weapon.primaryResolve(attacker, target, 2, 0), AttackConsts.BAD_MISS);
  assert.equal(weapon.primaryResolve(attacker, target, 10, 0), AttackConsts.PLAIN_MISS);
  assert.equal(weapon.primaryResolve(attacker, target, 11, 0), AttackConsts.PLAIN_HIT);
  assert.equal(weapon.primaryResolve(attacker, target, 20, 0), AttackConsts.CRITICAL_HIT);
});

it('attack secondaryResolve', function() {
  const weapon = new Attack("Weapon", {primaryDamage:4})
  const attacker = Char.create("Attacker", {attacks: [weapon]})
  const target = Char.create("Target", {})
  assert.equal(weapon.secondaryResolve(attacker, target, 1, 0), AttackConsts.BAD_MISS);
  assert.equal(weapon.secondaryResolve(attacker, target, 2, 0), AttackConsts.BAD_MISS);
  assert.equal(weapon.secondaryResolve(attacker, target, 10, 0), AttackConsts.PLAIN_MISS);
  assert.equal(weapon.secondaryResolve(attacker, target, 11, 0), AttackConsts.PLAIN_HIT);
  assert.equal(weapon.secondaryResolve(attacker, target, 20, 0), AttackConsts.GOOD_HIT);
});


})