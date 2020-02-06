// An attack can be against:
// one target
// multiple targets
// one primary target and multiple secondary targets
// each attack on a primary target gets its own roll
// all attacks on secondary targets use the same roll
//
// primaryMax: max number of primary targets (use 999 to indicate no limit)
// secondaryNo: max number of secondary targets
// bonus: attack bonus
// primaryDamage
// secondaryDamage
// resistanceType: stamina, reflex, will, none
// primaryResolve: The primary attack success or fail
// secondaryResolve: The secondary attack success or fail



'use strict';


const attNames = {
  defensive:'D',  // A character using a defensive weapon can choose to take a penalty, up to 4, to the attack roll, and add that amount to her reflex until the start of her next turn.
  slow:'S',       // A character wielding this weapon is at -4 to initiative. If a character did not take the penalty when initiative was determined, she cannot attack with this weapon this round.
  fast:'F',       //  A character wielding this weapon at the start of combat (and no other weapon without an F) is at +4 to initiative.
  skilled:'X',    //  This weapon is difficult to wield, and attacks are made with a -4 penalty. This can be reduced by buying levels in the "Warrior" package with the right specialisation.
  reach2:'R2',    //  Reach 2; can attack a foe up to two squares away. 'R3' indicates a reach of three.
  reach3:'R3',
  load1:'L1',     //  Takes a standard action to load (so generally will take a round to load, a round to fire).
  load2:'L2',     //  'L2' indicates it takes two standard actions to reload. Good luck using that more than once an encounter.
  loadm:'M',      //  Takes a minor action to load
  twohands:'2',   //  Two-handed weapon
  shield:'Y',     //  Shield bonuses are halved (round down) against this weapon
  hook:'H',       //  On a successful hit, can optionally attempt to hook a foe, drawing him one square closer if more than a square away, or off his mount if mounted (foe gets a save vs reflex)
  
  melee:'m',
  ranged:'r',
  firearm:'f',
  artillery:'a',
  bash:'b',
  cleave:'c',
  pierce:'p',
  slash:'s',
  whip:'w',
}


class Weapon {
  constructor(name, data) {
    this.name = name
    for (let key in data) {
      this[key] = data[key]
    }
  }
  
  is(att) { return this.atts.includes(attNames[att]) }
}  


const DEFAULT_ATTACK = {
  primaryMax:1,
  primaryMin:1,
  secondaryMax:0,
  secondaryMin:0,
  secondaryMin:0,
  bonus:0,
  primaryDamage:'d4',
  maxPrimaryDamage:false,
  secondaryDamage:'-',
  resist:'reflex',
  desc:'',
  comment:false,
  icon:'melee',
  special:false,  // or silver, ice, fire, shock, nether
  onMiss:false,
  onHit:false,
  onCritical:false,
  additionalDamage:false,
  additionalType:false,
  additionalDesc:false,
  additionalCritsMax:false,
}

const AttackConsts = {
  CRITICAL_MISS:1,
  BAD_MISS:2,
  PLAIN_MISS:3,
  SHIELD_MISS:4,
  STAT_MISS:5,
  PLAIN_HIT:6,
  GOOD_HIT:7,
  CRITICAL_HIT:8,
}

const WEAPONS = [
  new Weapon("Unarmed", {damage:"d4", atts:"mbX", desc:"Useful when you have lost your weapons! Skill in unarmed will increase damage."}),
  new Weapon("Dagger", {damage:"d6", atts:"msF", desc:"Can be concealed"}),
  new Weapon("Short sword", {damage:"2d6", atts:"msF", desc:"Use if you want to go first; bonus to initiative"}),
  new Weapon("Broad sword", {damage:"3d6", atts:"ms", desc:"Also scimitar, long sword, etc. Good for unarmed foes"}),
  new Weapon("2H sword", {damage:"3d8", atts:"ms2X", desc:"Requires skill, but does good damage, especially to unarmed foes"}),
  new Weapon("Wood axe", {damage:"d8", atts:"mcS", desc:"Cheap and readily available!"}),
  new Weapon("Battle axe", {damage:"d10", atts:"mcS", desc:"Good against armoured foes, but slow"}),
  new Weapon("Great axe", {damage:"2d10", atts:"mc2SX", desc:"Requires skill, but does good damage, especially to unarmed foes"}),
  new Weapon("Club", {damage:"2d4", atts:"mb", desc:"Includes improvised weapons"}),
  new Weapon("Mace", {damage:"d10", atts:"mb", desc:"Good against armed foes"}),
  new Weapon("Morning star", {damage:"2d8", atts:"mb", desc:"All round weapon"}),
  new Weapon("Flail", {damage:"d12", atts:"mb2XY", desc:"Requires skill, especially good against armoured foes with shields"}),
  new Weapon("Quarterstaff", {damage:"2d4", atts:"mbD", desc:"Good for defense"}),
  new Weapon("Warhammer", {damage:"2d10", atts:"mbS", desc:"Slow but good damage"}),
  new Weapon("2H hammer", {damage:"2d12", atts:"mb2SX", desc:"Lots of damage, but slow and requires skill"}),
  new Weapon("Spear", {damage:"2d8", atts:"mpR2XS", desc:"Extra reach, can be used as a thrown weapon too (also javelin or trident)"}),
  new Weapon("Polearm", {damage:"3d8", atts:"mpR2XS", desc:"Extra reach"}),
  new Weapon("Halberd", {damage:"3d6", atts:"mpR2XSH", desc:"Extra reach, and can be used to hook a foe"}),
  new Weapon("Whip", {damage:"4d4", atts:"mwR2XS", desc:"Requires skill, but good against unarmed and extra reach"}),
  new Weapon("Bull whip", {damage:"4d4", atts:"mwR3XS]", desc:"As whip, but even more reach"}),
  new Weapon("Thrown rock", {damage:"d4", atts:"rb", desc:"Or anything of a decent size and weight to throw"}),
  new Weapon("Thrown dagger", {damage:"d6", atts:"rpF", desc:"Can be thrown fast"}),
  new Weapon("Thrown spear", {damage:"3d6", atts:"rp", desc:"Good damage, but limited to one or two a combat"}),
  new Weapon("Sling", {damage:"2d4", atts:"rbM", desc:"Cheap ammo"}),
  new Weapon("Short bow", {damage:"2d6", atts:"rpFX", desc:"Fast reload"}),
  new Weapon("Long bow", {damage:"3d6", atts:"rpFMX", desc:"Takes a minor action to reload, but decent damage against unarmoured"}),
  new Weapon("Light crossbow", {damage:"d12", atts:"rpMX", desc:"Takes a minor action to reload, but decent against armoured foes"}),
  new Weapon("Heavy crossbow", {damage:"d20", atts:"rpL1X", desc:"Takes a full standard action to reload, but good against armoured foes"}),
  new Weapon("Arquebus", {damage:"2d20", atts:"fpL2", desc:"Very noisy. Takes two full standard actions to reload, and expensive to use, but look at all the damage!"}),
]


console.log(WEAPONS[0].is('defensive'))
console.log(WEAPONS[12].is('defensive'))


class Attack {
  constructor(name, data) {
    if (data === undefined) data = {}
    this.name = name
    for (let key in DEFAULT_ATTACK) {
      this[key] = data[key] === undefined ? DEFAULT_ATTACK[key] : data[key]
    }
    if (typeof this.primaryDamage === 'string') {
      this.damageArray = this._damageToArray(this.primaryDamage)
    }
    if (typeof this.additionalDamage === 'string') {
      this.additionalDamageArray = this._damageToArray(this.additionalDamage)
    }
  }
  
  primaryResolve(attacker, target, roll, bonus) {
    return this.defaultResolve(attacker, target, roll, bonus, true)
  }
  
  secondaryResolve(attacker, target, roll, bonus) {
    return this.defaultResolve(attacker, target, roll, bonus, false)
  }
  

  defaultResolve(attacker, target, roll, bonus, allowCriticals) {
    if (allowCriticals && roll === 1) return AttackConsts.CRITICAL_MISS
    if (allowCriticals && roll === 20) return AttackConsts.CRITICAL_HIT

    let result = this.bonus + roll + bonus + attacker.getAttackModifier()
    if (result < 6) return AttackConsts.BAD_MISS
    if (result < 11) return AttackConsts.PLAIN_MISS
    result -= target.getDefenceModifier(this.resist)
    if (result < 11) return AttackConsts.STAT_MISS
    if (this.resist === 'reflex' && target.shield) {
      result -= target.shield
      if (result < 11) return AttackConsts.SHIELD_MISS
    }
    return (result > 15 ? AttackConsts.GOOD_HIT : AttackConsts.PLAIN_HIT)
  }
  
  _damageToArray(damageString) {
    const md = /(\d*)d(\d+)(([+-])(\d+))?/.exec(damageString)
    if (md === null) {
      console.log("Error: Failed to find match for '" + damageString + "'")
      return false;
    }
    const result = []
    result.push(md[1] ? parseInt(md[1]) : 1)
    result.push(parseInt(md[2]))
    if (md[4] === "+") {
      result.push(parseInt(md[5]))
    }
    else if (md[4] === "-") {
      result.push(-parseInt(md[5]))
    }
    else {    
      result.push(0)
    }
    return result
  }

  maxDamage() {
    if (typeof this.primaryDamage !== 'string') return this.primaryDamage
    if (this.maxPrimaryDamage) return this.maxPrimaryDamage;
    return this.damageArray[0] * this.damageArray[1] + this.damageArray[2]
  }
  
  maxAdditionalDamage() {
    if (typeof this.additionalDamage !== 'string') return this.additionalDamage
    return this.additionalDamageArray[0] * this.additionalDamageArray[1] + this.additionalDamageArray[2]
  }

  diceCount() {
    if (typeof this.primaryDamage !== 'string') return 1
    return this.damageArray[0]
  }

  _targetNote(min, max) {
    if (min === max)
      return max.toString()
    else if (max === 999)
      return min.toString()  + " or more"
    else
      return min.toString() + " to " + max.toString()
  }
      
  primaryTargetNote() {
    return this._targetNote(this.primaryMin, this.primaryMax)
  }

  secondaryTargetNote() {
    return this._targetNote(this.secondaryMin, this.secondaryMax)
  }
  
  additionalExplanation() {
    if (this.additionalDesc) return this.additionalDesc
    if (this.additionalType && this.additionalDamage) return "Special damage (" + this.additionalType + ")"
    if (this.special && this.additionalDamage) return "Special damage (" + this.special + ")"
    return false
  }
}


class WeaponAttack extends Attack {
  constructor(name, skill, data) {
    super(name, data)
    this.weapon = WEAPONS.find(el => el.name === name)
    if (this.weapon === undefined) throw new Error("AttackException", "Unknown weapon: " + name)
    this.primaryDamage = this.weapon.damage

    if (typeof this.primaryDamage === 'string') {
      this.damageArray = this._damageToArray(this.primaryDamage)
    }
    if (data && data.altName) this.name = data.altName;
    this.bonus = skill
    this.desc += this.weapon.desc
    const chr = this.weapon.atts.charAt(0)
    if (chr === "f") this.icon = "gun"
    if (chr === "r") this.icon = "bow"
    if (this.weapon.name === 'Unarmed') this.icon = "unarmed"
  }
  
}



module.exports = [AttackConsts, Attack, WeaponAttack, WEAPONS]



