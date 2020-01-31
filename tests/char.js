'use strict';

import test from 'ava';
const [Char] = require('../models/char.js')
const [AttackConsts, Attack] = require('../models/attack.js')
const [Log] = require('../models/log.js')
const [Package, packages, Bonus] = require('../models/package.js')


Log.debug = true


test('fieldsInclude', t => {
  const test = new Char({name: "Tester", size:"Tiny"})
  t.is(test.fieldsInclude("will"), true);
  t.is(test.fieldsInclude("armour"), true);
  t.is(test.fieldsInclude("shield"), true);
  t.is(test.fieldsInclude("hats"), false);
  t.is(test.fieldsInclude("ghost"), false);
});
 


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



test('getAttackModifier', t => {
  const test = new Char({name: "Tester", size:"Tiny", hits:40 })
  t.is(test.getAttackModifier(), -0);
  test.hits = 31
  t.is(test.getAttackModifier(), -0);
  test.hits = 30
  t.is(test.getAttackModifier(), -1);
  test.hits = 10
  t.is(test.getAttackModifier(), -3);
  test.hits = 1
  t.is(test.getAttackModifier(), -3);
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


test('resolveDamage with additional', t => {
  const weapon = new Attack("Weapon", {primaryDamage:4, resist:"reflex", additionalDamage:6})
  const attacker = new Char({name: "Attacker", attacks: [weapon]})
  const target = new Char({name: "Target", hits:80})

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


test('load', t => {
  const test1 = new Char({name: "Tester1", vulnerableToFire:1})
  const test2 = new Char({name: "Tester2", hits:40})
  const test3 = new Char({name: "Tester3", shield:2})

  const s = 'character~Tester1[\n  hits~15\n  stunned~true\n]\n\ncharacter~Tester2[\n  hits~30\n  blooded~true\n  fire~5~true~8\n]\n\n'
  Char.loadData([test1, test2, test3], s)
  t.is(test1.hits, 15)
  t.is(test1.stunned, true)
  t.is(test1.blooded, false)
  
  t.is(test2.hits, 30)
  t.is(test2.stunned, false)
  t.is(test2.blooded, true)
  t.is(test2.elements.fire.count, 5)
  t.is(test2.elements.fire.condition, true)
  t.is(test2.elements.fire.vulnProt, 8)
  
})



test('save and load', t => {
  const test1 = new Char({name: "Tester1", vulnerableToFire:1})
  const test2 = new Char({name: "Tester2", hits:40})
  const test3 = new Char({name: "Tester3", shield:2})

  const s = Char.saveData([test1, test2, test3])
  Char.loadData([test1, test2, test3], s)
  
  t.is(test1.elements.fire.vulnProt, 11)
  t.is(test2.hits, 40)
  t.is(test3.shield, 2)
  
})



test('Char.create', t => {
  const test1 = new Package('Package1', { hitsPerLevel:0.5, bonuses:[
    new Bonus('nature', {progression:'secondary2', notes:"Good at nature skill"}),
    new Bonus('shield', {progression:[3, 7, 11], notes:["Small shield", "Medium shield", "Large shield"]}),
    new Bonus('armour', {progression:2, notes:function(grade) { return "Armour " + grade }}),
  ]})
  const test2 = new Package('Package2', { bonuses:[
    new Bonus('talking', {progression:'primary', notes:"Good at talking"}),
    new Bonus('shield', {progression:2}),
  ]})
  const tester = Char.create("Tester", [test1, test2], {Package1:10, Package2:4})
  
  t.is(tester.hits, 25)
  t.is(tester.armour, 1)
  t.is(tester.shield, 3)
  t.is(tester.nature, 3)
  t.is(tester.talking, 4)
  
})
