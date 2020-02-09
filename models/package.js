'use strict';

const [AttackConsts, Attack, WeaponAttack] = require('../models/attack.js')


class Package {
  constructor(name, data) {
    this.name = name.trim()
    for (let key in data) this[key] = data[key]
    if (!Array.isArray(this.bonuses)) throw new Error('No bonus array set for package ' + name)
  }
  
  setBonuses(char) {
    if (char.notes === undefined) char.notes = []
    if (!char.packages[this.name]) return
    
    for (let bonus of this.bonuses) {
      bonus.apply(char, char.packages[this.name])
    }
    if (this.hitsPerLevel) char.maxHits += Math.floor(this.hitsPerLevel * char.packages[this.name])
  }

  setAttacks(char, weapons) {
    //console.log(weapons)
    // Basic attacks
    for (let attack of weapons) {
      
    }
    // Special attacks
    for (let bonus of this.bonuses) {
      bonus.applyAttacks(char, weapons, char.packages[this.name])
    }
  }

  getBonuses(level) {
    let result = []
    for (let bonus of this.bonuses) {
      const n = bonus.applies(level)
      if (n === 1) result.push("Gain:  " + bonus.name)
      if (n === 2) result.push("+1 to: " + bonus.name)
    }
    return result
  }

/*  getBonusesAsHtml(level) {
    const ary = getBonuses(level)
    if (ary.length === 0) return ''
    return ary.*/
    

  to_js() {
    let s = "    new Package('" + this.name + "', {notes:[\n"
    for (let note of this.notes) {
      s += "      \"" + note + "\",\n"
    }
    s += "    ], bonuses:[\n"
    for (let bonus of this.bonuses) {
      s += bonus.to_js()
    }
    return s + "    ]}),\n"
  }
    
  to_wiki() {
    let s = "### " + this.name + "\n\n"
    for (let note of this.notes) {
      s += "_" + note + "_\n"
    }
    s += "\n"
    for (let bonus of this.bonuses) {
      s += bonus.to_wiki()
    }
    return s + "\n\n"
  }
  
  static setBonuses(packages, char) {
    for (let p of packages) {
      p.setBonuses(char)
    }
  }
  
  static setAttacks(packages, c, weapons) {
    for (let p of packages) {
      p.setAttacks(c, weapons)
    }
  }
}




class Bonus {
  constructor(name, data) {
    if (data === undefined) data = {}
    for (let key in data) this[key] = data[key]
    this.name = name.trim()
  }
  
  title(level) {
    
  }

  description(level) {
    
  }
  
  to_js() {
    let s = "      new Bonus('" + this.name + "', {progression:" + this.progression + ", flags:\"" + this.flags + "\""
    if (this.notes && this.notes.length > 0) {
      s += ", notes:[\n"
      for (let note of this.notes) {
        s += "        \"" + note + "\",\n"
      }
      s += "      ]"
    }
    return s + "}),\n"
  }

  // return 1 if the skill is gained at this level, 2 if it is improved, 0 otherwise
  applies(level) {
    if (Array.isArray(this.progression)) {
      if (this.progression[0] === level) return 1
      return this.progression.includes(level) ? 2 : 0
    }
    if (this.progression === 'primary') {
      return this._appliesPrimary(level)
    }
    if (typeof this.progression === 'number') {
      return level === this.progression ? 1 : 0
    }
    if (this.progression.match(/^secondary/)) {
      return this._appliesSecondary(level)
    }
  }

  apply(char, level) {
    if (this.attack) return
    const grade = this._grade(level)
    if (grade === 0) return
    const name = this.altName ? this.altName : this.name
    if (char[name] === undefined) char[name] = 0
    
    char[name] += grade
    
    if (this.script) this.script(char)
    
    if (this.notes) {
      if (typeof this.notes === "string") {
        char.notes.push(this.notes)
      }
      else if (typeof this.notes === "function") {
        char.notes.push(this.notes(grade))
      }
      else if (Array.isArray(this.notes)) {
        char.notes.push(this.notes[grade - 1])
      }
    }
  }
  
  applyAttacks(char, weapons, level) {
  }
  
  _grade(level) {
    if (Array.isArray(this.progression)) {
      return this._gradeByArray(level)
    }
    if (this.progression === 'primary') {
      return this._gradePrimary(level)
    }
    if (typeof this.progression === 'number') {
      return level >= this.progression ? 1 : 0
    }
    if (this.progression.match(/^secondary/)) {
      return this._gradeSecondary(level)
    }
  }

  _gradeByArray(level) {
    for (let i = 0; i < this.progression.length; i++) {
      if (level < this.progression[i]) return i
    }
    return this.progression.length
  }
  
  _gradePrimary(level) {
    let result = 0
    let stage = 1
    while (true) {
      if (level < stage * 5) {
        return result + Math.floor(level / stage)
      }
      else {
        result += 5
        level -= stage * 5
        stage++
      }
    }
  }
  
  _appliesPrimary(level) {
    if (level < 1) return 0
    if (level === 1) return 1
    
    if (level <= 5) return 2
    if (level <= 15) return level % 2 === 1 ? 2 : 0
    if (level <= 30) return level % 3 === 0 ? 2 : 0
    if (level <= 50) return level % 4 === 2 ? 2 : 0
    return level % 5 === 0 ? 2 : 0
  }
  
  _gradeSecondary(level) {
    if (this.secondaryOffset === undefined) {
      if (this.progression.match(/^secondary\d$/)) {
        this.secondaryOffset = parseInt(this.progression.replace('secondary', ''))
      }
      else {
        this.secondaryOffset = 1
      }
    }
    return Math.floor((level + 3 - this.secondaryOffset) / 3)
  }

  _appliesSecondary(level) {
    if (this.secondaryOffset === undefined) {
      if (this.progression.match(/^secondary\d$/)) {
        this.secondaryOffset = parseInt(this.progression.replace('secondary', ''))
      }
      else {
        this.secondaryOffset = 1
      }
    }
    return (level - this.secondaryOffset) % 3 === 0 ? (level < 4 ? 1 : 2) : 0
  }
}



// A BonusAttack is any attack that uses a weapon
class BonusAttack extends Bonus {
  constructor(name, data) {
    super(name, data)
  }

  apply(char, level) {
  }
  
  applyAttacks(char, weapons, level) {
    const grade = this._grade(level)
    if (grade === 0) return
    let flag = false
    console.log(weapons.map(el => el.name).join(','))
    for (let weapon of weapons) {
      console.log("About to check " + weapon.name)
      if (this.weaponCheck && !this.weaponCheck(weapon)) continue;
      const data = Object.assign({}, this.data, weapon)
      data.bonus = Math.min(level, char.attack) // !!! probably needs to tail off at higher level
      if (this.dataModifier) this.dataModifier(data, char)
      char.attacks.push(new Attack(this.name + " (" + weapon.name + ")", data))
      flag = true
    }
    if (!flag) char.warnings.push("No weapons suitable for " + this.name)
  }
}


// A BonusSpell is any attack that does not use a weapon (or unarmed skill)
class BonusSpell extends Bonus {
  constructor(name, data) {
    super(name, data)
  }

  apply(char, level) {
  }
  
  applyAttacks(char, weapons, level) {
    const grade = this._grade(level)
    if (grade === 0) return
    const data = Object.assign({}, this.data)
    data.bonus = level // !!! probably needs to tail off at higher level
    if (this.dataModifier) this.dataModifier(data, char)
    
    char.attacks.push(new Attack(this.name, data))
  }
}


/*
progression: How this bonus changes as you gain levels
notes: Array of comments
type: spell (must be cast)/ability (must be used)/attribute (default; bonus to the skill, etc.))


E - Expertise. Gives a permanent bonus to a skill or resistance.
C - Change. A permanent change to the character.
S - Spell.
F - Flourish. A special trick that the character can perform (if you consider it a non-magical spell, you will not be far wrong!).
R - Ritual. A ritual is a spell that takes a significant time to complete (at least ten minutes and possibly days). Normal spell rules do not apply.
A - Ability. Like a flourish, but takes a while to perform.
X - Special rules apply.
r - An on-going spell/flourish that will last one round, until the end of your next turn .
o - An on-going spell/flourish that will last a number of rounds.
e - Spell/flourish can only be used once per encounter.
m - Spell/flourish can be performed as a minor action.
f - Spell/flourish can be performed as a free action.
a - Spell/flourish can be performed as an addition to another action.
p - Spell/flourish can be performed as an opportunity attack.
l - An instant spell/flourish, but the effect is lasting, until cured (just as a weapon attack is instant, but the damage is still there until cured).
x - Special rules apply.

*/


const packages = [
  new Package('Warrior (sword and shield)', {
    group:'warrior',
    notes:[
      'You can select up to THREE weapons to specialise in (recommend at least one melee and one ranged). Bonuses from this package apply only to those three weapons.'
    ],
    hitsPerLevel:1,
    bonuses:[
      new Bonus('weapons', {progression:3}),
      new Bonus('attack', {progression:'primary'}),
      new Bonus('shield', {progression:[1, 3, 7, 12]}),
    ],
  }),
  new Package('Warrior (marksman)', {
    group:'warrior',
    notes:[
      'You can select up to THREE weapons to specialise in (recommend at least one melee and one ranged). Bonuses from this package apply only to those three weapons.'
    ],
    hitsPerLevel:1,
    bonuses:[
      new Bonus('weapons', {progression:3}),
      new Bonus('attack', {progression:'primary'}),
      new Bonus('Ranged', {progression:[3, 9, 17]}),
    ],
  }),


/*

Sword and shield (+1 shield at level 1, +2 at level 3, +3 at level 7, +4 at level 12)

Marksman (additional +1 bonus to any bow OR any thrown OR any firearm at levels 3, 9, 17)

Two weapons (penalty is -2/-5 at 0, -1/-5 at 1, -1/-4 at 4, 0/-4 at 7, 0/-3 at 10, 0/-2 at 13, 0/-1 at 16, 0/0 at 19)

Unarmed (2d4 at 3, 3d4 at 6, 4d4 at 9, etc.)

2H weapon (penalty is -4 at 0, reducing by 1 each level, down to 0)

Polearm (penalty is -4 at 0, reducing by 1 each level, down to 0)

Whip (penalty is -4 at 0, reducing by 1 each level, down to 0)

Bow (penalty is -4 at 0, reducing by 1 each level, down to 0)*/


  new Package('Defender', {
    notes:[
      'A character can only be subject to one mark at a time. A mark lasts until the marker marks another or the marked is marked by another or either party is dead or unconscious. Marking a foe is a free action.'
    ],
    hitsPerLevel:2,
    bonuses:[
      new Bonus('weapons', {progression:3}),
      new Bonus('armour', {progression:[2, 5, 14]}),
      new Bonus('stamina', {progression:'secondary2'}),
      new Bonus('Mark', {progression:[1, 4, 7, 10, 13], flags:'Fof', notes:[
        'Marked foe is at -2 when an attack does not target you',
        'as Mark 1, but in addition you get an Opportunity attack if the target makes an an attack that does not target you',
        'as Mark 2, but in addition you get an Opportunity attack if the target moves or shifts under his own volition',
        'as Mark 3, but Opportunity attack stops the move if successful',
        'as Mark 4, but Opportunity Attacks due to a Mark have combat advantage',
      ]}),
      new Bonus('Draw in', {progression:8, flags:'F', notes:'on successful attack, you and foe move one square in your direction'}),
      new Bonus('Push back', {progression:8, flags:'F', notes:'on successful attack, you and foe move one square in foe\'s direction'}),
      new Bonus('Dance of blades', {progression:8, flags:'F', notes:'on successful attack, you and foe each move one square in any direction'}),
    ],
  }),
  
  new Package('Rogue (striker)', {
    group:'striker',
    notes:[
    ],
    hitsPerLevel:0.5,
    bonuses:[
      new Bonus('weapons', {progression:3}),
      new Bonus('reflex', {progression:[1, 8, 17]}),
      new Bonus('armour', {progression:[7]}),
      new Bonus('init', {progression:'secondary3'}),
      new Bonus('Subterfuge', {progression:'secondary1'}),
      new Bonus('Sneak attack', {progression:[3, 9, 15, 21], flags:'Fa', notes:'Bonus 2d6 damage on a successful hit, once per turn, when you have combat advantage. Each addition rank gives an extra d6.'}),
    ],
  }),

  new Package('Barbarian (striker)', {
    group:'striker',
    notes:[
    ],
    hitsPerLevel:0.5,
    bonuses:[
      new Bonus('weapons', {progression:3}),
      new Bonus('armour', {progression:[4, 12]}),
      new Bonus('stamina', {progression:'secondary3'}),
      new Bonus('Survival', {progression:'secondary2'}),
      new Bonus('Nature', {progression:'secondary1'}),
      new Bonus('Onslaught', {progression:[3, 9, 15, 21], flags:'Fa', notes:'+5 to damage each successive round you hit a foe (not necessarily the same one), up to a max of +5.  Each addition rank gives an extra 5 to the maximum.'}),
    ],
  }),
 

/*
  new Package('Elementalist', {
    notes:[
      'The elementalist taps into the raw elements of fire, frost and storm. These are relatively powerful, but you need to attune first, and can only access spells from one element at a time. Could be suitable for a mage-fighter hybrid.'
    ],
    hitsPerLevel:0,
    bonuses:[
      new Bonus('Casting', {progression:'primary', notes:['Casting spells from this list']}),
      new Bonus('Arcana', {progression:'secondary2'}),
      new Bonus('Attune', {progression:1, flags:'Fo', notes:['you become attuned to either fire, ice or storm, last about 15 minutes or until you attune again; allows you to cast either fire OR ice OR storm spells, on-going spells terminate when you re-cast Attune']}),
      new Bonus('Light', {progression:1, flags:'So', notes:['']}),
      new Bonus('Firedart', {progression:1, flags:'S', notes:['']}),
      new Bonus('Ice shard', {progression:1, flags:'S', notes:['']}),
    ],
  }),
*/

/*

Attune (you become attuned to either fire, ice or storm, last about 15 minutes or until you attune again; allows you to cast either fire OR ice OR storm spells, on-going spells terminate when you re-cast Attune)
Light
Firedart
Ice shard (slowed)
Ice armour (+1 armour)
Resist fire/ice/storm
Shock dagger (+3 storm damage, whilst held and attuned)
Fireblast (burning damage)
Wall of fire/ice
Lightning blast (affect a 3x3 square adjacent to you, target can do no magic for a turn)
Shock sword (+5 storm damage, whilst held and attuned)
Flaming-cloak (3 fire damage to anyone within a square whilst attuned)
Ice storm (5x5 square, slowed)
Fireball
Superior ice armour (+2 armour)
Protection from fire/ice
Shock great sword (+7 storm damage, whilst held and attuned)
Pillar of fire/frost (actually a static elemental; blocks 1 square, damages all adjacent)
Summon elemental
Flaming blade*/





  new Package('Shaman', {
    notes:[
      'The shaman and druid could both be clerics; they are the only options that have any form of healing; they both allow the character to perform rituals (for the shaman familiar joining, exorcism, create undead, vision quest).'
    ],
    hitsPerLevel:0,
    bonuses:[
      new Bonus('Casting', {progression:'primary', notes:['Casting spells from this list']}),
      new Bonus('History', {progression:'secondary2'}),
      new Bonus('Religion', {progression:'secondary1'}),
      
      new Bonus('Familiar', {progression:1, flags:'So', notes:['Can possess your familiar']}),
      new Bonus('Converse with spirit', {progression:1, flags:'So', notes:['']}),
      new Bonus('Life drain', {progression:[3, 7, 12, 18], flags:'S', notes:['']}),
      new Bonus('Summon spirit', {progression:1, flags:'So', notes:['']}),
      new Bonus('Sustain', {progression:1, flags:'So', notes:['target is kept alive']}),
      new Bonus('Necrosis', {progression:1, flags:'S', notes:['target weakened to elemental attacks']}),
      new Bonus('Summon undead', {progression:[5, 9, 15, 20], flags:'S', notes:['summons non-corporeal undead that may well do the caster\'s bidding']}),
      new Bonus('Repel undead', {progression:[4, 8, 14, 19], flags:'So', notes:['']}),
      new Bonus('Death ward', {progression:1, flags:'Soe', notes:['']}),
      new Bonus('Spirit walk', {progression:[7, 13, 16], flags:'Soe', notes:['limited teleport']}),
      new Bonus('Spirit ward', {progression:1, flags:'So', notes:['']}),
      new Bonus('Curse', {progression:1, flags:'S', notes:['']}),
      new Bonus('Cheat death', {progression:25, flags:'Se', notes:['cast as you die, and you become a lich; requires a lot of preparation before hand; not completely reliable...']}),
    ],
  }),




  new Package('Druid', {
    notes:[
      'The shaman and druid could both be clerics; they are the only options that have any form of healing; they both allow the character to perform rituals (for the druid disease, cleansing, fertility, alter weather, fertility).'
    ],
    hitsPerLevel:0,
    bonuses:[
      new Bonus('Casting', {progression:'primary', notes:['Casting spells from this list']}),
      new Bonus('Nature', {progression:'secondary2'}),
      new Bonus('Religion', {progression:'secondary1'}),
      
      new Bonus('Light', {progression:1, flags:'So', notes:['']}),
      new Bonus('Beast tongue', {progression:1, flags:'So', notes:['']}),
      new Bonus('Tremors', {progression:1, flags:'So', notes:['']}),
      new Bonus('Hostile trees', {progression:1, flags:'So', notes:['']}),
      new Bonus('Surefoot', {progression:1, flags:'So', notes:['']}),
      new Bonus('Calm beast', {progression:1, flags:'S', notes:['']}),
      new Bonus('Renewal', {progression:1, flags:'Sr', notes:['second wind has double effect for you and all friends within three squares until end of your next turn']}),
      new Bonus('Waterwalking', {progression:1, flags:'So', notes:['']}),
      new Bonus('Beastform', {progression:1, flags:'So', notes:['']}),
      new Bonus('Stoneflesh', {progression:1, flags:'So', notes:['']}),
      new Bonus('Beast mastery', {progression:1, flags:'So', notes:['']}),
      new Bonus('Calm', {progression:1, flags:'S', notes:['']}),
      new Bonus('Call lightning', {progression:1, flags:'S', notes:['from sky only']}),
      new Bonus('Protection from elements', {progression:1, flags:'So', notes:['']}),
    ],
  }),




    new Package('Elementalist', {notes:[
      "The elementalist taps into the raw elements of fire, frost and storm. These are relatively powerful, but you need to attune first, and can only access spells from one element at a time. Could be suitable for a mage-fighter hybrid.",
    ], bonuses:[
      new Bonus('Casting spells from this list', {progression:"primary", flags:"undefined"}),
      new Bonus('Arcana', {progression:"secondary", flags:"undefined"}),
      new Bonus('Initiative', {progression:[1,7,13,19], flags:"undefined"}),
      new Bonus('Attune', {progression:1, flags:"", notes:[
        "You become attuned to either fire, ice or storm, last about 10 minutes or until you attune again; allows you to cast either fire OR ice OR storm spells, on-going spells terminate when you re-cast Attune",
      ]}),
      new Bonus('Light', {progression:2, flags:""}),
      new Bonus('Firedart', {progression:3, flags:""}),
      new Bonus('Ice shard', {progression:4, flags:"", notes:[
        "Slowed",
      ]}),
      new Bonus('Ice armour', {progression:5, flags:"", notes:[
        "+1 armour",
      ]}),
      new Bonus('Resist fire/ice/storm', {progression:6, flags:""}),
      new Bonus('Shock dagger', {progression:7, flags:"", notes:[
        "+3 storm damage, whilst held and attuned",
      ]}),
      new Bonus('Fireblast', {progression:8, flags:"", notes:[
        "Burning damage",
      ]}),
      new Bonus('Wall of fire/ice', {progression:9, flags:""}),
      new Bonus('Lightning blast', {progression:10, flags:"", notes:[
        "Affect a 3x3 square adjacent to you, target can do no magic for a turn",
      ]}),
      new Bonus('Shock sword', {progression:11, flags:"", notes:[
        "+5 storm damage, whilst held and attuned",
      ]}),
      new Bonus('Flaming-cloak', {progression:12, flags:"", notes:[
        "3 fire damage to anyone within a square whilst attuned",
      ]}),
      new Bonus('Ice storm', {progression:13, flags:"", notes:[
        "5x5 square, slowed",
      ]}),
      new Bonus('Fireball', {progression:14, flags:""}),
      new Bonus('Superior ice armour', {progression:15, flags:"", notes:[
        "+2 armour",
      ]}),
      new Bonus('Protection from fire/ice', {progression:16, flags:""}),
      new Bonus('Shock great sword', {progression:17, flags:"", notes:[
        "+7 storm damage, whilst held and attuned",
      ]}),
      new Bonus('Pillar of fire/frost', {progression:18, flags:"", notes:[
        "Actually a static elemental; blocks 1 square, damages all adjacent",
      ]}),
      new Bonus('Summon elemental', {progression:19, flags:""}),
      new Bonus('Flaming blade', {progression:20, flags:""}),
    ]}),



    new Package('Shaman (spirits)', {notes:[
      "The shaman and druid could both be clerics; they are the only options that have any form of healing; they both allow the character to perform certain rituals.",
    ], bonuses:[
      new Bonus('Casting spells from this list', {progression:"primary", flags:"undefined"}),
      new Bonus('History', {progression:"secondary", flags:"undefined"}),
      new Bonus('Religion', {progression:"secondary", flags:"undefined"}),
      new Bonus('Familiar', {progression:1, flags:"", notes:[
        "Can possess your familiar",
      ]}),
      new Bonus('Converse with spirit', {progression:2, flags:""}),
      new Bonus('Life drain I', {progression:3, flags:""}),
      new Bonus('Summon spirit', {progression:4, flags:""}),
      new Bonus('Sustain', {progression:5, flags:"", notes:[
        "Target is kept alive",
      ]}),
      new Bonus('Necrosis', {progression:6, flags:"", notes:[
        "Target weakened to elemental attacks",
      ]}),
      new Bonus('Summon undead', {progression:7, flags:""}),
      new Bonus('Life drain II', {progression:8, flags:""}),
      new Bonus('Repel undead', {progression:9, flags:""}),
      new Bonus('Renewal', {progression:10, flags:"", notes:[
        "Second wind has double effect for you and all friends within three squares until end of your next turn",
      ]}),
      new Bonus('Death ward', {progression:11, flags:"", notes:[
        "Keep going after zero hits",
      ]}),
      new Bonus('Life drain III', {progression:12, flags:""}),
      new Bonus('Spirit walk', {progression:13, flags:"", notes:[
        "Limited teleport",
      ]}),
      new Bonus('Spirit ward', {progression:14, flags:"", notes:[
        "Protection from spirits, inc undead",
      ]}),
      new Bonus('Curse', {progression:15, flags:""}),
      new Bonus('Cheat death', {progression:16, flags:"", notes:[
        "Become a lich",
      ]}),
    ]}),



    new Package('Druid (nature)', {notes:[
      "The shaman and druid could both be clerics; they are the only options that have any form of healing; they both allow the character to perform certain rituals.",
    ], bonuses:[
      new Bonus('Casting spells from this list', {progression:"primary", flags:"undefined"}),
      new Bonus('Nature', {progression:"secondary", flags:"undefined"}),
      new Bonus('Religion OR animal handling', {progression:"secondary", flags:"undefined"}),
      new Bonus('Light', {progression:1, flags:""}),
      new Bonus('Beast tongue', {progression:2, flags:""}),
      new Bonus('Blend', {progression:3, flags:""}),
      new Bonus('Tremors', {progression:4, flags:"", notes:[
        "3x3 becames difficult terrain due to movement",
      ]}),
      new Bonus('Hostile trees', {progression:5, flags:""}),
      new Bonus('Surefoot', {progression:6, flags:""}),
      new Bonus('Calm beast', {progression:7, flags:""}),
      new Bonus('Renewal', {progression:8, flags:"", notes:[
        "Second wind has double effect for you and all friends within three squares until end of your next turn",
      ]}),
      new Bonus('Waterwalking', {progression:9, flags:""}),
      new Bonus('Beastform', {progression:10, flags:""}),
      new Bonus('Stoneflesh', {progression:11, flags:""}),
      new Bonus('Beast mastery', {progression:12, flags:""}),
      new Bonus('Calm', {progression:13, flags:""}),
      new Bonus('Call rain', {progression:14, flags:""}),
      new Bonus('Call lightning', {progression:15, flags:"", notes:[
        "From sky only",
      ]}),
      new Bonus('Pathfinding', {progression:16, flags:""}),
      new Bonus('Protection from elements', {progression:17, flags:""}),
    ]}),



    new Package('Ki Adept', {notes:[
      "The ki adept uses magic to enhance her own body, pushing it beyond normal human limits. This still needs some tweaking, so it is not over-powered (character can do a super-human jump every turn) or under-powered (character can jump once per encounter).",
    ], bonuses:[
      new Bonus('Casting spells from this list', {progression:"primary", flags:"undefined"}),
      new Bonus('Athletics', {progression:"secondary", flags:"undefined"}),
      new Bonus('reflex', {progression:[2,8,14,20], flags:"undefined"}),
      new Bonus('init', {progression:[1,7,13,19], flags:"undefined"}),
      new Bonus('Jump ', {progression:1, flags:"S"}),
      new Bonus('Wallwalking ', {progression:2, flags:"So"}),
      new Bonus('Haste', {progression:3, flags:""}),
      new Bonus('Healing', {progression:4, flags:""}),
      new Bonus('Retaliation', {progression:5, flags:"", notes:[
        "Opportunity attack when foe makes an attack",
      ]}),
      new Bonus('Dodge', {progression:6, flags:""}),
      new Bonus('Fly', {progression:7, flags:""}),
      new Bonus('Water breathing', {progression:8, flags:""}),
      new Bonus('Aura', {progression:9, flags:""}),
      new Bonus('Waterwalking', {progression:10, flags:""}),
      new Bonus('Preservation', {progression:11, flags:""}),
      new Bonus('Senses', {progression:12, flags:""}),
      new Bonus('Disguise', {progression:13, flags:""}),
      new Bonus('Night vision', {progression:14, flags:""}),
      new Bonus('Landing', {progression:15, flags:""}),
      new Bonus('Teleport', {progression:16, flags:""}),
    ]}),



    new Package('Shadow-dancer', {notes:[
    ], bonuses:[
      new Bonus('Casting spells from this list', {progression:"primary", flags:"undefined"}),
      new Bonus('Subterfuge', {progression:"secondary", flags:"undefined"}),
      new Bonus('Hidden ', {progression:1, flags:"Sr"}),
      new Bonus('Pull ', {progression:2, flags:"S", notes:[
        "Target feels drawn towards you. moves two squares",
      ]}),
      new Bonus('Void', {progression:3, flags:""}),
      new Bonus('Shadowbolt ', {progression:4, flags:"S"}),
      new Bonus('Invisibility ', {progression:5, flags:"Sr"}),
      new Bonus('Darkness ', {progression:6, flags:"Sr"}),
      new Bonus('Weakness ', {progression:7, flags:"Sr", notes:[
        "Target vulnerable to elemental attacks",
      ]}),
      new Bonus('Sleep ', {progression:8, flags:"Sl"}),
      new Bonus('Dark dreams ', {progression:9, flags:"R"}),
      new Bonus('Shadow jaunt ', {progression:10, flags:"S"}),
      new Bonus('Raise undead ', {progression:11, flags:"R"}),
      new Bonus('Animate undead ', {progression:12, flags:"R"}),
      new Bonus('Summon demon ', {progression:13, flags:"R"}),
      new Bonus('Control demon ', {progression:14, flags:"Sr"}),
      new Bonus('Curses ', {progression:15, flags:"Sl"}),
    ]}),



    new Package('Channeller', {notes:[
      "Allows a character to create a direct channel from himself to a target. This causes the target to heal, and the character to gain some of the target's expertise. The target can choose whether to resist or not (as the target does receive healing). You can never prevent the target getting healing, healing is only up to the target's maximum hits.",
      "This can be performed as a minor action, allowing the character to grab a skill and use it in the same round.",
      "Character needs to know the target has the spell or ability (in vague terms at least) to be able to grab it. For skill bonus you can just hope it is better than your own.",
      "Target must be conscious for Channel I to VI.",
    ], bonuses:[
      new Bonus('Casting spells from this list', {progression:"primary", flags:"undefined"}),
      new Bonus('Channel I ', {progression:1, flags:"Sm", notes:[
        "Creates a channel to the target, who must be within 1 square; the character gains a once per round ability from the target, useable until the end of their next turn. The target gains d10 hits, but is stunned one round",
      ]}),
      new Bonus('Channel II ', {progression:2, flags:"Sm", notes:[
        "As I but can also be used to get once per round spells",
      ]}),
      new Bonus('Channel III ', {progression:3, flags:"Sm", notes:[
        "As before, but can be used to get skill bonus",
      ]}),
      new Bonus('Channel IV ', {progression:4, flags:"Sm", notes:[
        "As before, but target gets 1/4 hits back",
      ]}),
      new Bonus('Channel V ', {progression:5, flags:"Sm", notes:[
        "As before, but range is 3 squares",
      ]}),
      new Bonus('Channel VI ', {progression:6, flags:"Sm", notes:[
        "As before, but can choose if target is stunned or dazed",
      ]}),
      new Bonus('Channel VII ', {progression:7, flags:"Sm", notes:[
        "As before, but also works on an unconscious - but not dead - target; target is brought back to 0 hits, then healed from there",
      ]}),
      new Bonus('Channel VIII ', {progression:8, flags:"Sm", notes:[
        "As before, but once per encounter can also be used to get a once per encounter ability or spell - but does not affect target's ability to use",
      ]}),
      new Bonus('Channel IX ', {progression:9, flags:"Sm", notes:[
        "As before, but target gets 1/2 hits back",
      ]}),
      new Bonus('Channel X ', {progression:10, flags:"Sm", notes:[
        "As before, but range is 5 squares",
      ]}),
      new Bonus('Channel XI ', {progression:11, flags:"Sm", notes:[
        "As before, but can choose if target is stunned or dazed or not",
      ]}),
      new Bonus('Channel XII ', {progression:12, flags:"Sm", notes:[
        "As before, but can get two once per encounter abilities/spells",
      ]}),
      new Bonus('Channel XIII ', {progression:13, flags:"Sm", notes:[
        "As before, but 3/4 hits are healed",
      ]}),
      new Bonus('Channel XIV ', {progression:14, flags:"Sm", notes:[
        "As before, but can get three once per encounter abilities/spells",
      ]}),
      new Bonus('Channel XV ', {progression:15, flags:"Sm", notes:[
        "As before, but target is fully healed",
      ]}),
      new Bonus('Take ability ', {progression:16, flags:"R", notes:[
        "Character can permanently steal an ability or spell from the target, via a ritual taking 8 hours, during which time the target must be present, within 1 square; the target permanently loses the ability or spell",
      ]}),
    ]}),



    new Package('Mind-mage (single target only)', {notes:[
    ], bonuses:[
      new Bonus('Casting spells from this list', {progression:"primary", flags:"undefined"}),
      new Bonus('Either intimidation OR bluff OR diplomacy', {progression:"secondary", flags:"undefined"}),
      new Bonus('will', {progression:[2,5,8,11,14], flags:"undefined"}),
      new Bonus('Study ', {progression:1, flags:"A", notes:[
        "+1 to attack OR +2 to spells on this list, +2 to impersonate",
      ]}),
      new Bonus('Stagger ', {progression:2, flags:"S", notes:[
        "Target forced back 1 square and falls to ground",
      ]}),
      new Bonus('Control ', {progression:3, flags:"S", notes:[
        "Force target to move up to two squares in your turn",
      ]}),
      new Bonus('Mindblast ', {progression:4, flags:"S"}),
      new Bonus('Mindmeld ', {progression:5, flags:"So", notes:[
        "Two way communication, could be forced",
      ]}),
      new Bonus('Truth sense ', {progression:6, flags:"S", notes:[
        "Can tell if someone is lying",
      ]}),
      new Bonus('Beast master ', {progression:7, flags:"So", notes:[
        "Control a beast",
      ]}),
      new Bonus('Delusion ', {progression:8, flags:"Sl", notes:[
        "Target is convinced of one fact",
      ]}),
      new Bonus('Mind protection ', {progression:9, flags:"Sr", notes:[
        "Immune to mind magic",
      ]}),
      new Bonus('Paralysis ', {progression:10, flags:"Sr"}),
      new Bonus('Insanity ', {progression:11, flags:"Sl", notes:[
        "Can choose to give a phobia, making target vulnerable to one element",
      ]}),
      new Bonus('Beguile ', {progression:12, flags:"Sl"}),
    ]}),



    new Package('Shapeshifter', {notes:[
      "A shapeshifter changes shape by putting on a magical cloak (but see No cloak). There is a special link between the cloak and the shift; no one else will be affected when wearing the cloak, and the shifter can only be connected to a limited number of cloaks (can unlink to a cloak at any time).",
    ], bonuses:[
      new Bonus('init', {progression:[1,2,3,7,13,17,21], flags:"undefined"}),
      new Bonus('Change I ', {progression:1, flags:"A", notes:[
        "You don your second skin to transform into your beast form; or you take it off to become normal",
      ]}),
      new Bonus('Cloak I ', {progression:2, flags:"R", notes:[
        "Allows you to fashion the hide of an animal into a second skin over a week; when you put the skin on, you will take the form of that animal; must be a natural mammal, the size of a medium dog, up to the size of a horse; max stats dictated by wolf",
      ]}),
      new Bonus('Change II ', {progression:3, flags:"A", notes:[
        "As Change I, but your clothing transforms with you",
      ]}),
      new Bonus('Cloak II ', {progression:4, flags:"R", notes:[
        "Allows you to fashion a second hide; can be any natural vertebrate of suitable size; max stats dictated by eagle",
      ]}),
      new Bonus('Change III ', {progression:5, flags:"A", notes:[
        "As Change I, but your clothing and anything you are carrying transforms with you",
      ]}),
      new Bonus('Cloak III ', {progression:6, flags:"R", notes:[
        "Allows you to fashion a third hide; can be any natural vertebrate of any size",
      ]}),
      new Bonus('No cloak ', {progression:7, flags:"R", notes:[
        "This ritual, which takes a week, causes your cloak to become a part of you",
      ]}),
    ]}),



    new Package('Living stone', {notes:[
      "Stone skin is a permanent condition that cannot be turned off.",
      "You could re-interpret this as fire-based or demonic or whatever, but the deterioration to appearance must still apply.",
    ], bonuses:[
      new Bonus('Stone skin I ', {progression:1, flags:"C", notes:[
        "+2 armour, but -1 speed and reflex; skin looks pale and dry",
      ]}),
      new Bonus('Unmoveable ', {progression:2, flags:"Ar", notes:[
        "As a std action, character plants his feet in the ground; cannot be moved until he next moves",
      ]}),
      new Bonus('Grappling I ', {progression:3, flags:"C", notes:[
        "+1 to grappling rolls",
      ]}),
      new Bonus('Shard burst ', {progression:4, flags:"A", notes:[
        "+2 attack vs reflex, 1d6 to all within 2 squares, once per encounter",
      ]}),
      new Bonus('Bash I ', {progression:5, flags:"A", notes:[
        "+0 unarmed attack, doing 2d8 damage",
      ]}),
      new Bonus('Stone skin II ', {progression:6, flags:"C", notes:[
        "+3 armour, but -1 speed and reflex; skin looks grey and unnatural",
      ]}),
      new Bonus('Smash I ', {progression:7, flags:"A", notes:[
        "Bashes the ground as a standard action, all with 1 square knocked prone",
      ]}),
      new Bonus('Grappling II ', {progression:8, flags:"C", notes:[
        "+2 to grappling rolls",
      ]}),
      new Bonus('Shard blast ', {progression:9, flags:"A", notes:[
        "Blast 2, +4 attack vs reflex, once per encounter",
      ]}),
      new Bonus('Bash II ', {progression:10, flags:"A", notes:[
        "+1 unarmed attack, doing 3d6 damage",
      ]}),
      new Bonus('Stone skin III ', {progression:11, flags:"C", notes:[
        "+4 armour, but -1 speed and reflex; skin looks and feels like rock",
      ]}),
      new Bonus('Smash II ', {progression:12, flags:"A", notes:[
        "Bashes the ground as a standard action, all with 3 square knocked prone",
      ]}),
      new Bonus('Grappling III ', {progression:13, flags:"C", notes:[
        "+3 to grappling rolls",
      ]}),
      new Bonus('Shard storm ', {progression:14, flags:"A", notes:[
        "Range 10 burst 1, +5 attack vs reflex, once per encounter",
      ]}),
      new Bonus('Bash ', {progression:15, flags:"A", notes:[
        "+2 unarmed attack, doing 3d8 damage",
      ]}),
      new Bonus('Grappling IV ', {progression:16, flags:"C", notes:[
        "+4 to grappling rolls",
      ]}),
    ]}),



    new Package('Slimelord', {notes:[
    ], bonuses:[
      new Bonus('Stretchy ', {progression:1, flags:"C", notes:[
        "Character can extend arms and legs up to twice their length; useful for reaching high shelves, +3 to contortions and escapology",
      ]}),
      new Bonus('Resistant ', {progression:2, flags:"C", notes:[
        "+5 bonus to stamina rolls against acid and poisons",
      ]}),
      new Bonus('Slime form ', {progression:3, flags:"C", notes:[
        "Character becomes a gelatinous mass like B.O.B. in MvA",
      ]}),
      new Bonus('Acid spit', {progression:4, flags:""}),
      new Bonus('Others?', {progression:5, flags:""}),
    ]}),



    new Package('Bodyshock!', {notes:[
    ], bonuses:[
      new Bonus('Prehensile tongue ', {progression:1, flags:"C", notes:[
        "Character's tongue grows to around 12 inches long, and can be used to hold and pick things up, about about the size of a can",
      ]}),
      new Bonus('Tentacle I ', {progression:2, flags:"Ao", notes:[
        "As a standard action, character can cause a tentacle to sprout from her belly; can be dismissed as a minor action",
      ]}),
      new Bonus('Tentacle II ', {progression:3, flags:"Ao", notes:[
        "Character can cause tentacles to sprout from her sides; see Tentacle I for details; can attack separately",
      ]}),
      new Bonus('Spider legs ', {progression:4, flags:"Ao", notes:[
        "As a standard action, character can cause eight jointed legs to sprout from her sides, belly; can be dismissed as a minor action",
      ]}),
      new Bonus('Also: spiny body, snake hair, claws, camouflage, tail, gills, batwings, dragon breath, poison', {progression:5, flags:""}),
    ]}),



    new Package('Brawler', {notes:[
    ], bonuses:[
      new Bonus('Unarmed combat', {progression:1, flags:""}),
      new Bonus('Athletics', {progression:"secondary", flags:"undefined"}),
    ]}),



    new Package('Acrobat', {notes:[
    ], bonuses:[
      new Bonus('init', {progression:"secondary", flags:"undefined"}),
      new Bonus('Acrobatics', {progression:"secondary", flags:"undefined"}),
      new Bonus('Movement', {progression:[3,9,15,19], flags:"undefined"}),
    ]}),



    new Package('Ranger', {notes:[
    ], bonuses:[
      new Bonus('Animal handling', {progression:1, flags:""}),
      new Bonus('Nature', {progression:2, flags:""}),
      new Bonus('Special bonus to riding and tracking', {progression:3, flags:""}),
    ]}),



    new Package('Observer', {notes:[
      "Specialist in seeing.",
    ], bonuses:[
      new Bonus('Perception I', {progression:[1, 3, 7, 11, 15, 20], flags:"", notes:[
        "Bonus to perception for vision",
      ]}),
      new Bonus('Shadow vision', {progression:2, flags:"", notes:[
        "Can see in poor light as though in good light",
      ]}),
      new Bonus('Danger perception', {progression:4, flags:"", notes:[
        "+4 bonus to sense ambush",
      ]}),
      new Bonus('Dark sense', {progression:6, flags:"", notes:[
        "Can see in complete darkness",
      ]}),
    ]}),






    new Package('Olfactory master', {notes:[
      "Character must specialise in one sense: vision, sound or taste/smell. Can purchase the package multiple times for multiple senses.",
    ], bonuses:[
      new Bonus('Perception I', {progression:1, flags:"", notes:[
        "+1 to perception for vision, +2 for other senses",
      ]}),
      new Bonus('Shadow vision', {progression:2, flags:"", notes:[
        "Vision only; can see in poor light as though in good light",
      ]}),
      new Bonus('Mimicry I', {progression:3, flags:"", notes:[
        "Sound only; can perfectly mimic any normal voice",
      ]}),
      new Bonus('Pheromones I', {progression:4, flags:"", notes:[
        "Taste/smell only; can perfectly mimic any normal pheromones",
      ]}),
      new Bonus('Perception II', {progression:5, flags:"", notes:[
        "+2 to perception for vision, +4 for other senses",
      ]}),
      new Bonus('Dark sense', {progression:6, flags:"", notes:[
        "Can see in complete darkness OR can navigate though the sense of smell or hearing",
      ]}),
      new Bonus('Perception I', {progression:7, flags:"", notes:[
        "+3 to perception for vision, +6 for other senses",
      ]}),
      new Bonus('Mimicry II', {progression:8, flags:"", notes:[
        "Sound only; can perfectly mimic any sound in the normal range of hearing",
      ]}),
      new Bonus('Pheromones II', {progression:9, flags:"", notes:[
        "Taste/smell only; can perfectly mimic any subtle smell - nothing too strong!",
      ]}),
      new Bonus('Perception I', {progression:10, flags:"", notes:[
        "+4 to perception for vision, +8 for other senses",
      ]}),
    ]}),



    new Package('Sneak', {notes:[
    ], bonuses:[
      new Bonus('+1 to sneak', {progression:1, flags:""}),
      new Bonus('+1 to pick locks', {progression:2, flags:""}),
      new Bonus('+1 to disguise', {progression:3, flags:""}),
      new Bonus('etc.', {progression:4, flags:""}),
    ]}),



    new Package('Social climber', {notes:[
      "If ranks are purchased as the character goes up a level, assume her family is on the ascent, and so her position is improving.",
    ], bonuses:[
      new Bonus('Wealthy I ', {progression:1, flags:"C", notes:[
        "Have own apartment in city",
      ]}),
      new Bonus('Wealthy II ', {progression:2, flags:"C", notes:[
        "Have tiny villa in city, one staff, one +1 weapon or item ",
      ]}),
      new Bonus('Noble I ', {progression:3, flags:"C", notes:[
        "Very minor noble",
      ]}),
      new Bonus('Wealthy II ', {progression:4, flags:"C", notes:[
        "Have modest villa, three staff, two +1 weapon or item ",
      ]}),
      new Bonus('Noble II ', {progression:5, flags:"C", notes:[
        "Minor noble",
      ]}),
      new Bonus('Wealthy II ', {progression:6, flags:"C", notes:[
        "Have sizeable villa, five staff, two +1 weapon or item ",
      ]}),
      new Bonus('Noble III ', {progression:7, flags:"C", notes:[
        "Major noble",
      ]}),
      new Bonus('Wealthy II ', {progression:8, flags:"C", notes:[
        "Have lavish villa, eight staff, two +2 weapon or item ",
      ]}),
      new Bonus('Noble IV ', {progression:9, flags:"C", notes:[
        "Royalty",
      ]}),
      new Bonus('Wealthy II ', {progression:10, flags:"C", notes:[
        "Have lavish villa, twelve staff, and country estate, twenty staff, two +2 weapon or item ",
      ]}),
    ]}),



    new Package('Leader', {notes:[
      "Note that you are not a ally of yourself; none of these have any effect on yourself",
    ], bonuses:[
      new Bonus('persuade', {progression:"secondary", flags:"undefined"}),
      new Bonus('diplomacy', {progression:"secondary", flags:"undefined"}),
      new Bonus('Inspire I ', {progression:1, flags:"Am", notes:[
        "One ally within 5 squares get a +2 bonus to all rolls until your next round; ally must be capable to hearing and understanding you; this can be done as a minor action",
      ]}),
      new Bonus('Signal ', {progression:2, flags:"Af", notes:[
        "Can communicate a simple, pre-arranged message - such as 'attack now' - to any allies within sight, range unlimited, without foes noticing; this can be done as a free action, once per turn",
      ]}),
      new Bonus('Goad ', {progression:3, flags:"Am", notes:[
        "Causes a foe to attack, subject to will save",
      ]}),
      new Bonus('Inspire II ', {progression:4, flags:"Am", notes:[
        "As Inspire I, but applies to up to two allies",
      ]}),
      new Bonus('Coordinate I ', {progression:5, flags:"Ae", notes:[
        "One ally within 5 squares can move up to two squares under your direction - i.e., both you and the ally must agree to the destination; useable once per encounter",
      ]}),
      new Bonus('Lead by example ', {progression:6, flags:"Af", notes:[
        "+4 to any skill check for your allies who have seen you accomplish a physical task this round until your next round; free action",
      ]}),
      new Bonus('Inspire III ', {progression:7, flags:"Am", notes:[
        "As Inspire I, but applies to up to three allies",
      ]}),
      new Bonus('Incite ', {progression:8, flags:"Am", notes:[
        "Any neutral character within 10 squares will join your side; character must be capable to hearing and understanding you; powerful characters get a save against will; this can be done as a minor action; affected characters may or may not choose to continue after one turn",
      ]}),
      new Bonus('Coordinate II ', {progression:9, flags:"Ae", notes:[
        "As Coordinate I, but applies to up to two allies",
      ]}),
      new Bonus('Galvinise ', {progression:10, flags:"Am", notes:[
        "One ally within 5 squares get a +2 bonus to all rolls until your next round, and on their turn gets a second standard action; ally must be capable to hearing and understanding you; this can be done as a minor action",
      ]}),
    ]}),



    new Package('Meta-mage', {notes:[
      "This is more suitable for mages.",
    ], bonuses:[
      new Bonus('Detect magic ', {progression:1, flags:"Fm", notes:[
        "You spend a standard or minor action to feel your surroundings, detecting any magic spells in effect, magical creatures or items, but not if invisible",
      ]}),
      new Bonus('Symbols ', {progression:2, flags:"A", notes:[
        "You spend five minutes creating a symbol on a solid surface, with a spell you know embedded in it; the spell can be triggered to go off at your word or when something touches or walks over the symbol; you can only have one symbol active at a time; a symbol fades after one hour",
      ]}),
      new Bonus('Other ', {progression:3, flags:"X", notes:[
        "Any spell you know with range 'self' can be cast on a willing target within 1 square",
      ]}),
      new Bonus('Discern magic I ', {progression:4, flags:"A", notes:[
        "Concentrating of an item or creature for 5 minutes, you get a good idea of the enchantments on it, including possibly traps",
      ]}),
      new Bonus('Repeat I ', {progression:5, flags:"X", notes:[
        "Any once per encounter spell can be cast twice per encounter",
      ]}),
      new Bonus('Secret casting ', {progression:6, flags:"X", notes:[
        "You can cast spells without anyone knowing you are doing it",
      ]}),
      new Bonus('Superior detect magic ', {progression:7, flags:"Fm", notes:[
        "As detect magic, but you get some idea of what each thing is; can detect invisible",
      ]}),
      new Bonus('Multi ', {progression:8, flags:"X", notes:[
        "Any spell you know with range 'self' can be cast on any number of willing targets within 1 square",
      ]}),
      new Bonus('Repeat II ', {progression:9, flags:"X", notes:[
        "Any once per encounter spell can be cast three times per encounter",
      ]}),
      new Bonus('Discern magic II ', {progression:10, flags:"A", notes:[
        "As Discern magic I, but you get an idea of who did the spell or enchanting if you know the author, or can recognise his work cf recognise a face or handwriting",
      ]}),
      new Bonus('Runes ', {progression:11, flags:"R", notes:[
        "You spend some days imbuing an item with runes with a spell you know embedded in it",
      ]}),
      new Bonus('Repeat III ', {progression:12, flags:"X", notes:[
        "Any once per encounter spell can be cast five times per encounter",
      ]}),
      new Bonus('Portals ', {progression:13, flags:"R", notes:[
        "You spend some days enchanting a pair of suitable structures as portals",
      ]}),
    ]}),



    new Package('Spell-Breaker', {notes:[
      "You must have a higher level in a single mage package. A character with level 4 in Shaman and level 2 in Shadow-dancer could get this up to level 3.",
    ], bonuses:[
      new Bonus('Casting spells from this list', {progression:"primary", flags:"undefined"}),
      new Bonus('Spell breaker I ', {progression:1, flags:"S", notes:[
        "Removes all on-going spells from the caster",
      ]}),
      new Bonus('Spell defense I ', {progression:2, flags:"S", notes:[
        "Caster gets +5 to saving throws against magic until the end of his next turn",
      ]}),
      new Bonus('Spell breaker II ', {progression:3, flags:"S", notes:[
        "Removes all on-going spells from any target within 5 squares",
      ]}),
      new Bonus('Spell defense II ', {progression:4, flags:"S", notes:[
        "Target within 5 squares gets +5 to saving throws against magic until the end of the caster's next turn",
      ]}),
      new Bonus('Spell breaker III ', {progression:5, flags:"S", notes:[
        "Removes all on-going spells from any target within 10 squares",
      ]}),
      new Bonus('Spell defense III ', {progression:6, flags:"S", notes:[
        "Target within 10 squares gets +5 to saving throws against magic until the end of the caster's next turn",
      ]}),
      new Bonus('Spell wall ', {progression:7, flags:"S", notes:[
        "Creates a 7 square by 7 square zone that must include the caster's square, lasting until the end of the caster's next turn; can be extended one round as a minor action as often as desired; anyone in the zone gets a +5 to saving throws against magic",
      ]}),
    ]}),



    new Package('Winged', {notes:[
      "You should devise a reason for why your character has wings!",
    ], bonuses:[
      new Bonus('Winged 1', {progression:1, flags:"C", notes:[
        "Character has wings, either like a demon or angel, but non-functional.",
      ]}),
      new Bonus('Winged II', {progression:3, flags:"C", notes:[
        "Character has wings, either like a demon or angel, cannot fly, can extends leaps by 10 foot vertically and 3 squares horizontally.",
      ]}),
      new Bonus('Winged III', {progression:5, flags:"C", notes:[
        "Character has wings, either like a demon or angel, cannot fly, can extends leaps by 15 foot vertically and 5 squares horizontally, reducing damage from falls by 20 hits.",
      ]}),
      new Bonus('Winged IV', {progression:8, flags:"C", notes:[
        "Character has wings, either like a demon or angel; can fly at movement speed.",
      ]}),
      new Bonus('Winged IV', {progression:10, flags:"C", notes:[
        "Character has wings, either like a demon or angel; can fly at movement speed + 3.",
      ]}),
    ]}),

    new Package('Non-corporeal Undead', { excludes:['pc'], notes:[
      "You should devise a reason for why your character has wings!",
    ], bonuses:[
      new Bonus('Ghost 1', {progression:1, flags:"C", notes:[
        "Character has wings, either like a demon or angel, but non-functional.",
      ]}),
      new Bonus('Ghost II', {progression:3, flags:"C", notes:[
        "Character has wings, either like a demon or angel, cannot fly, can extends leaps by 10 foot vertically and 3 squares horizontally.",
      ]}),
      new Bonus('Ghost III', {progression:5, flags:"C", notes:[
        "Character has wings, either like a demon or angel, cannot fly, can extends leaps by 15 foot vertically and 5 squares horizontally, reducing damage from falls by 20 hits.",
      ]}),
      new Bonus('Ghost IV', {progression:8, flags:"C", notes:[
        "Character has wings, either like a demon or angel; can fly at movement speed.",
      ]}),
      new Bonus('Ghost IV', {progression:10, flags:"C", notes:[
        "Character has wings, either like a demon or angel; can fly at movement speed + 3.",
      ]}),
    ]}),


]





module.exports = [Package, packages, Bonus, BonusAttack, BonusSpell]



