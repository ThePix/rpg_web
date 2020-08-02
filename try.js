'use strict';

/*
This file is just for debugging. If a test fails, paste the body of the failing
function in here, and type "try" at the command line. It will tell you what is
expected and what was found. You can add output in the code to identify the issue
(Ava does some "clever" output that makes debugging very difficult).
*/

const folder = require('./settings.js').folder
const [Message] = require('./models/message.js')
const [Char] = require('./models/char.js')
const [Package, BonusStat, PenaltyStat, BonusSkill, PenaltySkill, BonusAttack, BonusWeaponAttack, BonusEffect] = require('./models/package.js')
const [AttackConsts, Attack, WEAPONS, Weapon] = require('./models/attack.js')
const packages = require('./' + folder + '/packages.js')

const t = {
  is:function(a, b) {
    console.log("\nExpect: " + b)
    console.log("Found : " + a)
  },
}



/*
// This bit is also needed when testing routes

const [damagePostFun] = require('./routes/damage');
const [attackGetFun, attackPostFun] = require('./routes/attack');

const mockAttacker = new Char({name:"Tester0", protectedFromFire:2, })
mockAttacker.update()
mockAttacker.attacks = [new Attack("Weapon", {primaryDamage:4})]
const mockTarget1 = new Char({name:"Tester1", protectedFromFire:2})
const mockTarget2 = new Char({name:"Tester2", protectedFromFire:2})
const mockTarget3 = new Char({name:"Tester3", protectedFromFire:2})
mockTarget1.hits = 20
mockTarget2.hits = 20
mockTarget3.hits = 20

const mockChars = [mockAttacker, mockTarget1, mockTarget2, mockTarget3]

const mockApp = {
  get:function(s) {
    if (s === 'chars') return this.chars;
    throw new Error("MockAppException", "Unknown request: " + s)
  },
  chars:mockChars,
}

const mockNext = function() {}

*/




  const test = new Package('Package', { hitsPerLevel:0.5, bonuses:[
    new BonusWeaponAttack('Backstab', {progression:2, secondaryDamage:'2', bonus:2}),
    new BonusWeaponAttack('Greater backstab', {progression:7}),
  ]})

  const char = Char.create('tester', {'Warrior (sword and shield)':3})
  console.log(char)
  char.packages.Package = 4
  char.weaponMax = 2
  char.updateWeapons(['Dagger', 'Flail'])

  t.is(char.attacks.length, 2)
  test.apply(char)
  t.is(char.attacks.length, 4)
  t.is(char.attacks[2].name, 'Backstab (Dagger)')
  t.is(char.attacks[3].name, 'Backstab (Flail)')
  t.is(char.attacks[2].secondaryDamage, '2')
  t.is(char.attacks[2].bonus, '5')

  //console.log(char)
