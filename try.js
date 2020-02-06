'use strict';

const [Message] = require('./models/message.js')
const [Char] = require('./models/char.js')
const [Package, packages, Bonus] = require('./models/package.js')
const [AttackConsts, Attack, WeaponAttack] = require('./models/attack.js')








  const test1 = new Package('Package1', { hitsPerLevel:0.5, bonuses:[
    new Bonus('nature', {progression:'secondary2', notes:"Good at nature skill"}),
    new Bonus('shield', {progression:[3, 7, 11], notes:["Small shield", "Medium shield", "Large shield"]}),
    new Bonus('armour', {progression:2, notes:function(grade) { return "Armour " + grade }}),
  ]})
  const test2 = new Package('Package2', { bonuses:[
    new Bonus('talking', {progression:'primary', notes:"Good at talking"}),
    new Bonus('shield', {progression:2}),
  ]})
  const tester = Char.create("Tester", [test1, test2], {Package1:10, Package2:4}, [])


console.log(tester.nature)  // 3
console.log(tester.maxHits) // 40
