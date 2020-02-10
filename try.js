'use strict';

const [Message] = require('./models/message.js')
const [Char] = require('./models/char.js')
const [Package, packages, Bonus, BonusAttack, BonusSpell] = require('./models/package.js')
const [AttackConsts, Attack, WEAPONS, Weapon] = require('./models/attack.js')





console.log('------------')

/*
  const test1 = new Package('Package1', { hitsPerLevel:0.5, bonuses:[
    new Bonus('nature', {progression:'secondary2', notes:"Good at nature skill"}),
    new Bonus('shield', {progression:[3, 7, 11], notes:["Small shield", "Medium shield", "Large shield"]}),
    new Bonus('armour', {progression:2, notes:function(grade) { return "Armour " + grade }}),
    new Bonus('weapons', {progression:3}),
    new Bonus('attack', {progression:'primary', notes:"Good at fighting"}),
  ]})
  const test2 = new Package('Package2', { bonuses:[
    new Bonus('shield', {progression:2}),
    new BonusAttack('Sneak', {progression:3, weaponCheck:function(weapon) { 
      console.log(weapon.name + "..." + weapon.is('fast'));
      return weapon.is('fast');
    }}),
  ]})
  const test3 = new Package('Package3', { bonuses:[
    new BonusSpell('Ice blast', {progression:3}),
    new Bonus('weapons', {progression:3}),
  ]})
  const tester = Char.create("Tester", [test1, test2, test3], {Package1:10, Package2:4, Package3:6}, ["Dagger", "Warhammer", "Flail"])


//console.log(tester.nature)  // 3
console.log(tester.weapons) // 40
console.log(tester.attacks.length)
console.log(tester.warnings[0])
for (let a of tester.attacks) {
  console.log(a.name + ": " + a.bonus)
}
*/

  const weapon = new Weapon("Short bow", {damage:"2d6", atts:"bpFX", desc:"Fast reload"})

  console.log(weapon.is('skilled'));
  console.log(weapon.is('bow'));
  console.log(weapon.is('melee'));
  console.log(weapon.is('throwable'));
  console.log(weapon.attackType());
  console.log(weapon.damageType());
  console.log(weapon.group());