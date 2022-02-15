'use strict';

const assert = require('assert')
const folder = require('../settings.js').folder
const [Char] = require('../models/char.js')
const [AttackConsts, Attack] = require('../models/attack.js')
const [Log] = require('../models/log.js')
const [Package, Bonus] = require('../models/package.js')
const packages = require('../' + folder + '/packages.js')


Log.debug = true

describe('Char', function() {


it('fieldsInclude', function() {
  const test = new Char({name: "Tester", size:"Tiny"})
  assert.equal(test.fieldsInclude("will"), true);
  assert.equal(test.fieldsInclude("armour"), true);
  assert.equal(test.fieldsInclude("shield"), true);
  assert.equal(test.fieldsInclude("hats"), false);
  assert.equal(test.fieldsInclude("ghost"), false);
});
 


it('standard character', function() {
  const test = new Char({name: "Tester", size:"Tiny"})
  assert.equal(test.name, "Tester");
  assert.equal(test.elementalThreshold, 2);

  assert.equal(test.elements.fire.toString(), false);
  test.elements.fire.count = 4096
  assert.equal(test.elements.fire.toString(), "Fire: 4");
  for (let i = 0; i < 4; i++) {
    test.elements.fire.endTurn()
  }
  assert.equal(test.elements.fire.toString(), false);

  test.elements.fire.count = 0
  test.elementalDamage(2, "fire")
  assert.equal(test.elements.fire.count, 2048);
});
 


it('protected from fire', function() {
  const test = new Char({name: "Tester", protectedFromFire:2})
  assert.equal(test.name, "Tester");
  assert.equal(test.elementalThreshold, 8);

  assert.equal(test.elements.fire.vulnProt, 8);
  assert.equal(test.elements.fire.toString(), false);
  test.elements.fire.count = 4096
  assert.equal(test.elements.fire.toString(), "Fire: 4, +2 protection");
  for (let i = 0; i < 2; i++) {
    test.elements.fire.endTurn()
  }
  assert.equal(test.elements.fire.toString(), false);

  test.elements.fire.count = 0
  test.elementalDamage(3, "fire")
  assert.equal(test.elements.fire.count, 1024);

});


it('vulnerable to fire', function() {
  const test = new Char({name: "Tester", vulnerableToFire:1})
  assert.equal(test.name, "Tester");
  assert.equal(test.elements.fire.vulnProt, 11);
  assert.equal(test.elements.fire.toString(), false);
  test.elements.fire.count = 4096
  assert.equal(test.elements.fire.toString(), "Fire: 4, +1 vulnerability");
  for (let i = 0; i < 4; i++) {
    test.elements.fire.endTurn()
  }
  assert.equal(test.elements.fire.toString(), "Fire: 2, +1 vulnerability");

  test.elements.fire.count = 0
  test.elementalDamage(2, "fire")
  assert.equal(test.elements.fire.count, 2048 * 2);

});



it('getAttackModifier', function() {
  const test = new Char({name: "Tester", size:"Tiny", hits:40 })
  assert.equal(test.getAttackModifier(), -0);
  test.hits = 31
  assert.equal(test.getAttackModifier(), -0);
  test.hits = 30
  assert.equal(test.getAttackModifier(), -1);
  test.hits = 10
  assert.equal(test.getAttackModifier(), -3);
  test.hits = 1
  assert.equal(test.getAttackModifier(), -3);
});
 



it('resolveDamage', function() {
  const weapon = new Attack("Weapon", {primaryDamage:4, resist:"reflex"})
  const attacker = new Char({name: "Attacker", attacks: [weapon]})
  const target = new Char({name: "Target", hits:80})
  target.resolveDamage(attacker, weapon, 10, AttackConsts.CRITICAL_MISS)
  assert.equal(target.hits, 80);
  assert.equal(Log.last, "Attacker misses Target by a mile.");

  target.resolveDamage(attacker, weapon, 10, AttackConsts.PLAIN_MISS)
  assert.equal(target.hits, 80);
  assert.equal(Log.last, "Attacker just misses Target.");

  target.resolveDamage(attacker, weapon, 10, AttackConsts.SHIELD_MISS)
  assert.equal(target.hits, 80);
  assert.equal(Log.last, "Target's shield stops Attacker's attack.");

  target.resolveDamage(attacker, weapon, 10, AttackConsts.PLAIN_HIT)
  assert.equal(target.hits, 70);
  assert.equal(Log.last, "Target is hit by Attacker with Weapon, doing 10 hits.");

  target.armour = 4
  target.resolveDamage(attacker, weapon, 10, AttackConsts.PLAIN_HIT)
  assert.equal(target.hits, 64);
  assert.equal(Log.last, "Target is hit by Attacker with Weapon, doing 6 hits (10 before armour).");

  target.resolveDamage(attacker, weapon, 10, AttackConsts.CRITICAL_HIT)
  assert.equal(target.hits, 58);
  assert.equal(Log.last, "Target is hit by Attacker with Weapon (a critical), doing 6 hits (10 before armour).");
});


it('resolveDamageImmuneToNormal', function() {
  const weapon1 = new Attack("Weapon", {primaryDamage:4, resist:"reflex"})
  const weapon2 = new Attack("Weapon", {primaryDamage:4, resist:"reflex", special:"silver"})
  const weapon3 = new Attack("Weapon", {primaryDamage:4, resist:"reflex", special:"fire"})
  const attacker = new Char({name: "Attacker", attacks: [weapon1, weapon2, weapon3]})
  const target = new Char({name: "Target", hits:80, ignoreAttackTypes:[false, 'silver']})

  target.resolveDamage(attacker, weapon1, 10, AttackConsts.PLAIN_HIT)
  assert.equal(target.hits, 80);
  assert.equal(Log.last, "Target is hit by Attacker with Weapon, doing 10 hits. Sadly Target is not affected by attacks of that type.");

  target.resolveDamage(attacker, weapon2, 10, AttackConsts.PLAIN_HIT)
  assert.equal(target.hits, 80);
  assert.equal(Log.last, "Target is hit by Attacker with Weapon, doing 10 hits. Sadly Target is not affected by attacks of that type.");

  target.resolveDamage(attacker, weapon3, 10, AttackConsts.PLAIN_HIT)
  assert.equal(target.hits, 70);
  assert.equal(Log.last, "Target is hit by Attacker with Weapon, doing 10 hits.");
});




it('resolveDamageElemental', function() {
  const addFireDamage = function(char, hits) {
    Log.add(char.display + " is on fire.")
  }
  const weapon = new Attack("Weapon", {primaryDamage:4, resist:"reflex", onHit:addFireDamage, special:'fire'})
  const attacker = new Char({name: "Attacker", attacks: [weapon]})
  const target = new Char({name: "Target", hits:80, ignoreAttackTypes:[false, 'silver']})

  target.resolveDamage(attacker, weapon, 10, AttackConsts.PLAIN_MISS)
  assert.equal(Log.last, "Attacker just misses Target.");

  target.resolveDamage(attacker, weapon, 10, AttackConsts.PLAIN_HIT)
  assert.equal(Log.last, "Target is on fire.");
});


it('resolveDamage with additional', function() {
  const weapon = new Attack("Weapon", {primaryDamage:4, resist:"reflex", additionalDamage:6})
  const attacker = new Char({name: "Attacker", attacks: [weapon]})
  const target = new Char({name: "Target", hits:80})

  target.resolveDamage(attacker, weapon, 10, AttackConsts.PLAIN_HIT)
  assert.equal(target.hits, 70);
  assert.equal(Log.last, "Target is hit by Attacker with Weapon, doing 10 hits.");

  target.armour = 2
  target.resolveDamage(attacker, weapon, 10, AttackConsts.PLAIN_HIT)
  assert.equal(target.hits, 62);
  assert.equal(Log.last, "Target is hit by Attacker with Weapon, doing 8 hits (10 before armour).");

  target.resolveDamage(attacker, weapon, 10, AttackConsts.CRITICAL_HIT)
  assert.equal(target.hits, 54);
  assert.equal(Log.last, "Target is hit by Attacker with Weapon (a critical), doing 8 hits (10 before armour).");
});




it('adding attacks restricted', function() {
  const tester = Char.create("Tester", {
    'Warrior (sword and shield)':2,
    'Rogue (striker)':4, 
    Elementalist:3
  }, ["Warhammer", "Flail", "Dagger"])

  assert.equal(tester.weaponMax, 2)
  assert.equal(tester.attacks.length, 5)
  assert.equal(tester.warnings.length, 2)
  assert.equal(tester.warnings[0], "Additional weapon discarded")
  assert.equal(tester.warnings[1], "No weapons suitable for Sneak attack")
  assert.equal(tester.attacks[0].name, 'Warhammer')
  assert.equal(tester.attacks[4].name, 'Firedart')

})





it('adding attacks okay', function() {
  const tester = Char.create("Tester", {
    'Warrior (sword and shield)':2,
    'Rogue (striker)':4, 
    Elementalist:3
  }, ["Warhammer", "Dagger"])

  assert.equal(tester.weaponMax, 2)
  assert.equal(tester.attacks.length, 6)
  assert.equal(tester.warnings.length, 0)
  assert.equal(tester.attacks[0].name, 'Warhammer')
  assert.equal(tester.attacks[2].name, 'Sneak attack (Dagger)')
  assert.equal(tester.attacks[5].name, 'Firedart')

})

  

it('save and load', function() {
  const tester = Char.create("Tester", {
    'Warrior (sword and shield)':2,
    'Rogue (striker)':4, 
    Elementalist:3
  }, ["Warhammer", "Dagger"])


  const yaml = tester.toYaml()
  const tester2 = Char.loadYaml(yaml)[0]
  
  assert.equal(tester2.weaponMax, 2)
  assert.equal(tester2.attacks.length, 6)
  assert.equal(tester2.warnings.length, 0)
  assert.equal(tester2.attacks[0].name, 'Warhammer')
  assert.equal(tester2.attacks[2].name, 'Sneak attack (Dagger)')
  assert.equal(tester2.attacks[5].name, 'Firedart')
  
})

  

it('load yaml', function() {
  let s = `-
  name: Kyle
  charType: pc
  race: Bear
  sex: Male
  level: 3
  packages:
    -
      name: Warrior (2H)
      rank: 3
    -
      name: Barbarian (striker)
      rank: 3
  weaponNames:
    - Warhammer
    - Flail`
    
  const chars = Char.loadYaml(s);
  assert.equal(chars[0].name, 'Kyle')
  assert.equal(chars[0].points, 6)
  assert.equal(chars[0].weaponMax, 3)
  assert.equal(chars[0].charType, 'pc')
  assert.equal(chars[0].attacks.length, 4)
  assert.equal(Object.keys(chars[0].packages).length, 2)
  assert.equal(chars[0].weapons.length, 2)
  assert.equal(chars[0].weaponNames.length, 2)
  
})

})



