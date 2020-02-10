'use strict';

const [AttackConsts, Attack, WEAPONS, Weapon] = require('./models/attack.js')
const [Char] = require('./models/char.js')

const chars = [
  new Char({name:"Lara", hits:45, next:'Goblin1', charType:'pc', current:true, init:5, turnStarted:true, will:2, packages:{}, notes:[], attacks:[
    new Attack("Fireball", {primaryMax:999, icon:'magic', special:'fire', primaryDamage:'d6', additionalDamage:'d4',
  additionalType:'fire'}),
    new Attack("Psych-ball", {secondaryMax:999, resist:"will", secondaryDamage:'d6', desc:'Affects anyone in AoE!', primaryMin:0, primaryMax:0, icon:'magic', special:'mind' }),
  ]}),
  new Char({name:"Goblin1", hits:35, next:'Kyle', charType:'std', packages:{}, notes:[], attacks:[
    Attack.createFromWeapon(Weapon.find("Broad sword"), {attack:2}),
    Attack.createFromWeapon(Weapon.find("Unarmed"), {attack:2}),
  ]}),
  new Char({name:"Kyle", hits:50, next:'Ogre', charType:'pc', ac:1, reflex:2, packages:{}, notes:[], race:'Bear', profession:'Mercenary', attacks:[
    Attack.createFromWeapon(Weapon.find("Broad sword"), {attack:2}, {special:'silver', desc:'The silver sword of Al-Garith', additionalDamage:'2d8', additionalDesc:'If Kyle has combat advantage, he can do a sneak attack, doing additional damage.'}),
    Attack.createFromWeapon(Weapon.find("Unarmed"), {attack:2}),
  ]}),
  new Char({name:"Ogre", hits:100, next:'Serpent', reflex:2, charType:'elite', stamina:2, onBlooded:function() {
    this.alert("Ogre does Storm of rage when blooded.")
  }, packages:{}, notes:[], attacks:[
    Attack.createFromWeapon(Weapon.find("Warhammer"), {attack:2}),
    new Attack("Storm of rage", {comment:"when blooded", primaryMax:999, bonus:3, primaryDamage:'d6', desc:'Targets all foes within 1 square.'}),
    Attack.createFromWeapon(Weapon.find("Unarmed"), {attack:2}),
  ]}),
  new Char({name:"Serpent", next:'Jon', packages:{}, notes:[], attacks:[
    Attack.createFromWeapon(Weapon.find("Unarmed"), {attack:5}),
  ]}),
  new Char({name:"Jon", hits:100, next:'Goblin2', charType:'pc', ac:3, reflex:2, packages:{}, notes:[], attacks:[
    Attack.createFromWeapon(Weapon.find("Warhammer"), {attack:0}, {altName:"Swinging warhammer", secondaryMax:2, secondaryDamage:4}),
    Attack.createFromWeapon(Weapon.find("Warhammer"), {attack:2}, {additionalDamage:88, additionalDesc:'When blooded, Jon does additional damage.'}),
    Attack.createFromWeapon(Weapon.find("Unarmed"), {attack:2}),
  ]}),
  new Char({name:"Goblin2", hits:35, next:'Ghost', init:"Goblin1", charType:'std', packages:{}, notes:[], attacks:[
    Attack.createFromWeapon(Weapon.find("Broad sword"), {attack:2}),
    Attack.createFromWeapon(Weapon.find("Unarmed"), {attack:2}),
  ]}),
  new Char({name:"Ghost", hits:35, next:'Serpent_redux', init:4, charType:'std', packages:{}, notes:[], ignoreAttackTypes:[false, 'silver'], onDeath:function() {
    this.alert("Ghost does a psych-blast on death, affecting all within 5 squares.")
  }, attacks:[
    Attack.createFromWeapon(Weapon.find("Unarmed"), {attack:2}),
    new Attack("Psych-blast (on death)", {secondaryMax:999, resist:"will", secondaryDamage:'d6', desc:'Affects anyone within 5 squares!', primaryMin:0, primaryMax:0, icon:'magic', special:'mind' }),
  ]}),
  new Char({name:"Serpent_redux", link:'Serpent', next:'Lara', packages:{}, notes:[], display:'Serpent'}, []),
]
console.log("Loaded " + chars.length + " characters")


const stocks = [
  new Char({display:"Fire elemental", hits:35, next:'Serpent_redux', packages:{}, notes:[], attacks:[
    new Attack("Fire bash", {icon:'fire'}),
  ]}),
  new Char({display:"Frost elemental", hits:35, next:'Serpent_redux', packages:{}, notes:[], attacks:[
    new Attack("Ice bash", {icon:'fire'}),
  ]}),
]





module.exports = [chars, stocks];