'use strict';



class Package {
  constructor(name, data) {
    this.name = name.trim()
    for (let key in data) this[key] = data[key]
    if (!Array.isArray(this.bonuses)) throw new Error('No bonus array set for package ' + name)
  }
  
  setBonuses(char, level) {
    for (let bonus of this.bonuses) {
      bonus.apply(char, level)
    }
    if (this.hitsPerLevel) char.maxHits += Math.floor(this.hitsPerLevel * level)
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
    const grade = this._grade(level)
    if (grade === 0) return
    if (char[this.name] === undefined) char[this.name] = 0
    char[this.name] += grade
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





const packages = [
  new Package('Warrior (sword and shield)', {
    notes:[
      'You can select up to THREE weapons to specialise in (recommend at least one melee and one ranged). Bonuses from this package apply only to those three weapons.'
    ],
    hitsPerLevel:1,
    bonuses:[
      new Bonus('Attack', {progression:'primary'}),
      new Bonus('Shield', {progression:[1, 3, 7, 12]}),
    ],
  }),
  new Package('Warrior (marksman)', {
    notes:[
      'You can select up to THREE weapons to specialise in (recommend at least one melee and one ranged). Bonuses from this package apply only to those three weapons.'
    ],
    hitsPerLevel:1,
    bonuses:[
      new Bonus('Attack', {progression:'primary'}),
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
  new Package('Defender', {
    notes:[
      'A character can only be subject to one mark at a time. A mark lasts until the marker marks another or the marked is marked by another or either party is dead or unconscious. Marking a foe is a free action.'
    ],
    hitsPerLevel:2,
    bonuses:[
      new Bonus('Armour', {progression:[2, 5, 14]}),
      new Bonus('Fortitude', {progression:'secondary2'}),
      new Bonus('Mark', {progression:[1, 4, 7, 10, 13], flags:'Fof', note:[
        'Marked foe is at -2 when an attack does not target you',
        'as Mark 1, but in addition you get an Opportunity Attack if the target makes an an attack that does not target you',
        'as Mark 2, but in addition you get an Opportunity Attack if the target moves or shifts under his own volition',
        'as Mark 3, but Opportunity Attack stops the move if successful',
        'as Mark 4, but Opportunity Attacks due to a Mark have combat advantage',
      ]}),
      new Bonus('Draw in', {progression:8, flags:'F', note:'on successful attack, you and foe move one square in your direction'}),
      new Bonus('Push back', {progression:8, flags:'F', note:'on successful attack, you and foe move one square in foe\'s direction'}),
      new Bonus('Dance of blades', {progression:8, flags:'F', note:'on successful attack, you and foe each move one square in any direction'}),
    ],
  }),
  
  new Package('Rogue (striker)', {
    notes:[
    ],
    hitsPerLevel:0.5,
    bonuses:[
      new Bonus('Reflex', {progression:[1, 8, 17]}),
      new Bonus('Armour', {progression:[7]}),
      new Bonus('Init', {progression:'secondary3'}),
      new Bonus('Subterfuge', {progression:'secondary1'}),
      new Bonus('Sneak attack', {progression:[3, 9, 15, 21], flags:'Fa', note:'Bonus 2d6 damage on a successful hit, once per turn, when you have combat advantage. Each addition rank gives an extra d6.'}),
    ],
  }),

  new Package('Barbarian (striker)', {
    notes:[
    ],
    hitsPerLevel:0.5,
    bonuses:[
      new Bonus('Armour', {progression:[4, 12]}),
      new Bonus('Fortitude', {progression:'secondary3'}),
      new Bonus('Survival', {progression:'secondary2'}),
      new Bonus('Nature', {progression:'secondary1'}),
      new Bonus('Onslaught', {progression:[3, 9, 15, 21], flags:'Fa', note:'+5 to damage each successive round you hit a foe (not necessarily the same one), up to a max of +5.  Each addition rank gives an extra 5 to the maximum.'}),
    ],
  }),
 


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







]





module.exports = [Package, packages, Bonus]



