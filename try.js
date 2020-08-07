'use strict';

/*
This file is just for debugging. If a test fails, paste the body of the failing
function in here, and type "try" at the command line. It will tell you what is
expected and what was found. You can add output in the code to identify the issue
(Ava does some "clever" output that makes debugging very difficult).
*/

const fs = require('fs');
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



fs.readFile(folder + '/chars.yaml', function(err, s) {
  if (err) throw err;
  const chars = Char.loadYaml(String(s));
  console.log(chars[1])
});  


