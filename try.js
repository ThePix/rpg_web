'use strict';

const [Message] = require('./models/message.js')
const [Char] = require('./models/char.js')
const [Package, packages, Bonus] = require('./models/package.js')








const getTester = function(level) {
  const test = new Package('Package', { hitsPerLevel:0.5, bonuses:[
    new Bonus('nature', {progression:'secondary2', notes:"Good at nature skill"}),
    new Bonus('shield', {progression:[3, 7, 11], notes:["Small shield", "Medium shield", "Large shield"]}),
    new Bonus('armour', {progression:2, notes:function(grade) { return "Armour " + grade }}),
  ]})
  const tester = Char.create("Tester", [test], {Package:level}, [])

  return tester  
}


console.log(getTester().maxHits)
