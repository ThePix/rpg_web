'use strict';

const [Message] = require('./models/message.js')
const [Char] = require('./models/char.js')
const [Package, Bonus, Penalty, BonusAttack, BonusSpell] = require('./models/package.js')
const [AttackConsts, Attack, WEAPONS, Weapon] = require('./models/attack.js')
const packages = require('./data/packages.js')


function testing(a, b) {
  console.log("Expect: " + b)
  console.log("Found : " + a)
}

console.log('------------')

  const tester = Char.create("Tester", {
    'Warrior (sword and shield)':2,
    'Rogue (striker)':4, 
    Elementalist:3
  }, ["Warhammer", "Flail", "Dagger"])

  testing(tester.weaponMax, 2)
  //console.log(tester)
  testing(tester.attacks.length, 3)
  testing(tester.warnings.length, 2)
  testing(tester.warnings[0], "Additional weapon discarded")
  testing(tester.warnings[1], "No weapons suitable for Sneak attack")
  testing(tester.attacks[0].name, 'Warhammer')
  testing(tester.attacks[2].name, 'Firedart')
  
  /*
  const yaml = tester.toYaml()
  console.log(tester.toYaml())
  const ary = Char.loadYaml(yaml)
  console.log(ary)*/


/*
  const test0 = new Char({name: "Tester1", vulnerableToFire:1})
  const test1 = new Char({name: "Tester2", hits:40})
  const test2 = new Char({name: "Tester3", shield:2})

  const s = Char.toYaml([test0, test1, test2])
  const chars = Char.loadYaml(s)
  
  console.log(test0)
  console.log(chars[0])
  console.log(test0.toYaml())
  
  testing(chars[0].elements.fire.vulnProt, 11)
  testing(chars[1].hits, 40)
  testing(chars[2].shield, 2)
  */
