'use strict';

import test from 'ava';
const [Char] = require('../models/char.js')
const [AttackConsts, Attack] = require('../models/attack.js')
const [Log] = require('../models/log.js')


Log.debug = true
 
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





test('resolveDamage', t => {
  const weapon = new Attack("Weapon", {primaryDamage:4, resist:"reflex"})
  const attacker = new Char({name: "Attacker", attacks: [weapon]})
  const target = new Char({name: "Target", hits:80})
  target.resolveDamage(attacker, weapon, 10, AttackConsts.CRITICAL_MISS)
  t.is(target.hits, 80);
  t.is(Log.last, "Attacker misses Target by a mile.");

  target.resolveDamage(attacker, weapon, 10, AttackConsts.PLAIN_MISS)
  t.is(target.hits, 80);
  t.is(Log.last, "Attacker just misses Target.");

  target.resolveDamage(attacker, weapon, 10, AttackConsts.SHIELD_MISS)
  t.is(target.hits, 80);
  t.is(Log.last, "Target's shield stops Attacker's attack.");

  target.resolveDamage(attacker, weapon, 10, AttackConsts.PLAIN_HIT)
  t.is(target.hits, 70);
  t.is(Log.last, "Target is hit by Attacker with Weapon, doing 10 hits.");

  target.armour = 2
  target.resolveDamage(attacker, weapon, 10, AttackConsts.PLAIN_HIT)
  t.is(target.hits, 62);
  t.is(Log.last, "Target is hit by Attacker with Weapon, doing 8 hits (10 before armour).");

  target.resolveDamage(attacker, weapon, 10, AttackConsts.CRITICAL_HIT)
  t.is(target.hits, 54);
  t.is(Log.last, "Target is hit by Attacker with Weapon (a critical), doing 8 hits (10 before armour).");
});


test('resolveDamageImmuneToNormal', t => {
  const weapon1 = new Attack("Weapon", {primaryDamage:4, resist:"reflex"})
  const weapon2 = new Attack("Weapon", {primaryDamage:4, resist:"reflex", special:"silver"})
  const weapon3 = new Attack("Weapon", {primaryDamage:4, resist:"reflex", special:"fire"})
  const attacker = new Char({name: "Attacker", attacks: [weapon1, weapon2, weapon3]})
  const target = new Char({name: "Target", hits:80, ignoreAttackTypes:[false, 'silver']})

  target.resolveDamage(attacker, weapon1, 10, AttackConsts.PLAIN_HIT)
  t.is(target.hits, 80);
  t.is(Log.last, "Target is hit by Attacker with Weapon, doing 10 hits. Sadly Target is not affected by attacks of that type.");

  target.resolveDamage(attacker, weapon2, 10, AttackConsts.PLAIN_HIT)
  t.is(target.hits, 80);
  t.is(Log.last, "Target is hit by Attacker with Weapon, doing 10 hits. Sadly Target is not affected by attacks of that type.");

  target.resolveDamage(attacker, weapon3, 10, AttackConsts.PLAIN_HIT)
  t.is(target.hits, 70);
  t.is(Log.last, "Target is hit by Attacker with Weapon, doing 10 hits.");
});




test('resolveDamageElemental', t => {
  const addFireDamage = function(char, hits) {
    Log.add(char.display + " is on fire.")
  }
  const weapon = new Attack("Weapon", {primaryDamage:4, resist:"reflex", onHit:addFireDamage, special:'fire'})
  const attacker = new Char({name: "Attacker", attacks: [weapon]})
  const target = new Char({name: "Target", hits:80, ignoreAttackTypes:[false, 'silver']})

  target.resolveDamage(attacker, weapon, 10, AttackConsts.PLAIN_MISS)
  t.is(Log.last, "Attacker just misses Target.");

  target.resolveDamage(attacker, weapon, 10, AttackConsts.PLAIN_HIT)
  t.is(Log.last, "Target is on fire.");
});


