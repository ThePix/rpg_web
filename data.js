const [ Attack, WeaponAttack ] = require('./models/attack.js')

const [Char] = require('./models/char.js')


// A char may have more than one place in the list
const chars = [
  new Char({name:"Lara", hits:45, next:'Goblin1', pc:true, current:true, init:5, attacks:[
    new Attack("Fireball", {primaryMax:999, icon:'magic'}),
    new Attack("Psych-ball", {secondaryMax:999, resist:"will", secondaryDamage:'d6', notes:'Danger!', primaryMin:0, primaryMax:0, rollForSecondary:true, icon:'magic' }),
  ]}),
  new Char({name:"Goblin1", hits:35, next:'Kyle', stunned:true, attacks:[
    new WeaponAttack("Broad sword", 2),
    new WeaponAttack("Unarmed", 2),
  ]}),
  new Char({name:"Kyle", hits:20, next:'Ogre', pc:true, attacks:[
    new WeaponAttack("Broad sword", 2),
    new WeaponAttack("Unarmed", 2),
  ]}),
  new Char({name:"Ogre", hits:35, next:'Serpent', attacks:[
    new WeaponAttack("Warhammer", 2),
    new WeaponAttack("Unarmed", 2),
  ]}),
  new Char({name:"Serpent", next:'Jon', attacks:[
    new WeaponAttack("Unarmed", 5),
  ]}),
  new Char({name:"Jon", hits:35, next:'Goblin2', pc:true, attacks:[
    new WeaponAttack("Warhammer", 2),
    new WeaponAttack("Unarmed", 2),
  ]}),
  new Char({name:"Goblin2", hits:35, next:'Serpent_redux', init:"Goblin1", attacks:[
    new WeaponAttack("Broad sword", 2),
    new WeaponAttack("Unarmed", 2),
  ]}),
  new Char({name:"Serpent_redux", link:'Serpent', next:'Lara',display:'Serpent'}, []),
]


const stocks = [
  new Char({display:"Fire elemental", hits:35, next:'Serpent_redux', attacks:[
    new Attack("Fire bash", {icon:'fire'}),
  ]}),
  new Char({display:"Frost elemental", hits:35, next:'Serpent_redux', attacks:[
    new Attack("Ice bash", {icon:'fire'}),
  ]}),
]


module.exports = [chars, stocks];