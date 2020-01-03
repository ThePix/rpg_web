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
  {name:"Unarmed", damage:"d4", atts:"mX", desc:"Useful when you have lost your weapons! Skill in unarmed will increase damage."},
  {name:"Dagger", damage:"d6", atts:"mF", desc:"Can be concealed"},
  {name:"Short sword", damage:"2d6", atts:"mF", desc:"Use if you want to go first; bonus to initiative"},
  {name:"Broad sword", damage:"3d6", atts:"m", desc:"Also scimitar, long sword, etc. Good for unarmed foes"},
  {name:"2H sword", damage:"3d8", atts:"m2X", desc:"Requires skill, but does good damage, especially to unarmed foes"},
  {name:"Wood axe", damage:"d8", atts:"mS", desc:"Cheap and readily available!"},
  {name:"Battle axe", damage:"d10", atts:"mS", desc:"Good against armoured foes, but slow"},
  {name:"Great axe", damage:"2d10", atts:"m2SX", desc:"Requires skill, but does good damage, especially to unarmed foes"},
  {name:"Club", damage:"2d4", atts:"m", desc:"Includes improvised weapons"},
  {name:"Mace", damage:"d10", atts:"m", desc:"Good against armed foes"},
  {name:"Morning star", damage:"2d8", atts:"m", desc:"All round weapon"},
  {name:"Flail", damage:"d12", atts:"m2XY", desc:"Requires skill, especially good against armoured foes with shields"},
  {name:"Quarterstaff", damage:"2d4", atts:"mD", desc:"Good for defense"},
  {name:"Warhammer", damage:"2d10", atts:"mS", desc:"Slow but good damage"},
  {name:"2H hammer", damage:"2d12", atts:"m2SX", desc:"Lots of damage, but slow and requires skill"},
  {name:"Spear", damage:"2d8", atts:"mRXS", desc:"Extra reach, can be used as a thorn weapon too (also javelin or trident)"},
  {name:"Polearm", damage:"3d8", atts:"mRXS", desc:"Extra reach"},
  {name:"Halberd", damage:"3d6", atts:"mRXSH", desc:"Extra reach, and can be used to hook a foe"},
  {name:"Whip", damage:"4d4", atts:"mRXS", desc:"Requires skill, but good against unarmed and extra reach"},
  {name:"Bull whip", damage:"4d4", atts:"mRRXS]", desc:"As whip, but even more reach"},
  {name:"Thrown rock", damage:"d4", atts:"r", desc:"Or anything of a decent size and weight to throw"},
  {name:"Thrown dagger", damage:"d6", atts:"rF", desc:"Can be thrown fast"},
  {name:"Thrown spear", damage:"3d6", atts:"r", desc:"Good damage, but limited to one or two a combat"},
  {name:"Sling", damage:"2d4", atts:"rM", desc:"Cheap ammo"},
  {name:"Short bow", damage:"2d6", atts:"rFX", desc:"Fast reload"},
  {name:"Long bow", damage:"3d6", atts:"rFMX", desc:"Takes a minor action to reload, but decent damage against unarmoured"},
  {name:"Light crossbow", damage:"d12", atts:"rMX", desc:"Takes a minor action to reload, but decent against armoured foes"},
  {name:"Heavy crossbow", damage:"d20", atts:"rLX", desc:"Takes a full standard action to reload, but good against armoured foes"},
  {name:"Arquebus", damage:"2d20", atts:"fLL", desc:"Very noisy. Takes two full standard actions to reload, and expensive to use, but look at all the damage!"},
]



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

    let result = this.bonus + roll + bonus
    if (result < 6) return AttackConsts.BAD_MISS
    if (result < 11) return AttackConsts.PLAIN_MISS
    result -= target[this.resist]
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


module.exports = [AttackConsts, Attack, WeaponAttack]



