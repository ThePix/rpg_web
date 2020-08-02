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

const folder = require('../settings.js').folder



const attNames = {
  
  // Attack type
  unarmed:{
    code:/^u/,
    attType:'attack type',
    desc:'Unarmed',
    icon:'unarmed',
  },
  melee:{
    code:/^m/,
    attType:'attack type',
    desc:'One-handed melee',
    icon:'melee',
  },
  melee2:{
    code:/^M/,
    attType:'attack type',
    desc:'Two-handed melee',
    icon:'melee',
  },
  bow:{
    code:/^b/,
    attType:'attack type',
    desc:'A bow (two hands)',
    icon:'bow',
  },
  thrown:{
    code:/^t/,
    attType:'attack type',
    desc:'Thrown projectile',
    icon:'bow',
  },
  firearm:{
    code:/^f/,
    attType:'attack type',
    desc:'Firearm (one handed)',
    icon:'firearm',
  },
  firearm2:{
    code:/^F/,
    attType:'attack type',
    desc:'Firearm (two handed)',
    icon:'firearm',
  },
  artillery:{
    code:/^a/,
    attType:'attack type',
    desc:'Artillery',
    icon:'artillery',
  },
  
  // Damage type
  bash:{
    code:/^\wb/,
    attType:'damage type',
    desc:'Bash',
  },
  cleave:{
    code:/^\wc/,
    attType:'damage type',
    desc:'Cleave',
  },
  pierce:{
    code:/^\wp/,
    attType:'damage type',
    desc:'Pierce',
  },
  slash:{
    code:/^\ws/,
    attType:'damage type',
    desc:'Slash',
  },
  
  defensive:{
    code:/\w\wD/,
    attType:'note',
    desc:' A character using a defensive weapon can choose to take a penalty, up to 4, to the attack roll, and add that amount to her reflex until the start of her next turn.',
  },
  slow:{
    code:/\w\wS/,
    attType:'note',
    desc:' A character wielding this weapon is at -4 to initiative. If a character did not take the penalty when initiative was determined, she cannot attack with this weapon this round.',
  },
  fast:{
    code:/\w\wF/,
    attType:'note',
    desc:'A character wielding this weapon at the start of combat (and no other weapon without an F) is at +4 to initiative.',
  },
  skilled:{
    code:/\w\wX/,
    attType:'note',
    desc:'This weapon is difficult to wield, and attacks are made with a -4 penalty. This can be reduced by buying levels in the "Warrior" package with the right specialisation.',
  },
  reach2:{
    code:/\w\wR2/,
    attType:'note',
    desc:'Reach 2; can attack a foe up to two squares away.',
  },
  reach3:{
    code:/\w\wR3/,
    attType:'note',
    desc:'Reach 3; can attack a foe up to three squares away.',
  },
  load1:{
    code:/\w\wL1/,
    attType:'note',
    desc:'Takes a standard action to load (so generally will take a round to load, a round to fire).',
  },
  load2:{
    code:/\w\wL2/,
    attType:'note',
    desc:'Takes two standard actions to reload. Good luck using that more than once an encounter.',
  },
  loadm:{
    code:/\w\wM/,
    attType:'note',
    desc:'Takes a minor action to load',
  },
  shield:{
    code:/\w\wY/,
    attType:'note',
    desc:'Shield bonuses are halved (round down) against this weapon',
  },
  hook:{
    code:/\w\wH/,
    attType:'note',
    desc:'On a successful hit, can optionally attempt to hook a foe, drawing him one square closer if more than a square away, or off his mount if mounted (foe gets a save vs reflex)',
  },
  throwable:{
    code:/\w\wT/,
    attType:'note',
    desc:'This melee weapon can also be thrown',
  },
}


class Weapon {
  constructor(name, data) {
    this.name = name
    for (let key in data) {
      this[key] = data[key]
    }
  }
  
  is(att) {
    //console.log('#########')
    //console.log(att)
    //console.log(attNames[att].code)
    //console.log(this.atts.match(attNames[att].code))
    return this.atts.match(attNames[att].code) !== null
  }
  
  attackType() { return this.getNotes('attack type')[0].name }
  
  damageType() { return this.getNotes('damage type')[0].name }

  group() { return 'weaponAdept_' + this.attackType() + '_' + this.damageType() }

  getNotes(attType) {
    const ary = []
    for (let h in attNames) {
      if (attNames[h].attType === attType && this.atts.match(attNames[h].code)) {
        attNames[h].name = h
        ary.push(attNames[h])
      }
    }
    return ary
  }
  
  static find(name) {
    const weapon = WEAPONS.find(el => el.name === name)
    if (weapon === undefined) throw new Error("AttackException", "Unknown weapon: " + name)
    return weapon    
  }
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


const weapon_data = require('../' + folder + '/weapons.js')

const WEAPONS = weapon_data.map(el => new Weapon(el.name, el))


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
  
  static createFromWeapon(weapon, chr, data) {
    const attack = new Attack(weapon.name, data)
    attack.weapon = weapon
    attack.primaryDamage = attack.weapon.damage
    if (typeof attack.primaryDamage === 'string') {
      attack.damageArray = attack._damageToArray(attack.primaryDamage)
    }
    if (data && data.altName) attack.name = data.altName;
    attack.bonus = chr.attack
    attack.desc += attack.weapon.desc
    attack.icon = attack.weapon.getNotes('attack type')[0].icon
    return attack
  }
}




module.exports = [AttackConsts, Attack, WEAPONS, Weapon]



