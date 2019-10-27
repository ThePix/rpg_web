// An attack can be against:
// one target
// multiple targets
// one primary target and multiple secondary targets
// each attack on a primary target gets its own roll
// all attacks on secondary targets use the same roll
//
// primaryMax: max number of primary targets
// secondaryNo: max number of secondary targets
// bonus: attack bonus
// primaryDamage
// secondaryDamage
// resistanceType: stamina, reflex, will, none
// primaryResolve: The primary attack success of fail
// secondaryResolve: The secondary attack success of fail
// rollForSecondary: The secondary attack requires a dice roll (and may have a bonus)



const DEFAULT_ATTACK = {
  primaryMax:1,
  secondaryMax:0,
  primaryMin:0,
  secondaryMin:0,
  bonus:0,
  primaryDamage:'d4',
  secondaryDamage:'-',
  primaryResolve:false,
  secondaryResolve:false,
  rollForSecondary:true,
  resist:'reflex'
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
    this.name = name
    for (let key in DEFAULT_ATTACK) this[key] = data[key] || DEFAULT_ATTACK[key]
  }

}


class WeaponAttack extends Attack {
  constructor(name, skill) {
    super(name, {})
    this.weapon = WEAPONS.find(el => el.name === name)
    if (this.weapon === undefined) throw "Unknown weapon: " + name
    this.primaryDamage = this.weapon.damage
    this.bonus = skill
  }

}
module.exports = [Attack, WeaponAttack]



