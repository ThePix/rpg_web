'use strict';

const [Package, packages, Bonus] = require('./models/package.js')
const [Char] = require('./models/char.js')
const [AttackConsts, Attack] = require('./models/attack.js')


const getTester = function() {
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

  return tester  
}

const tester = getTester()  
console.log(tester)

