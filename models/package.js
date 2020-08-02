'use strict';

const [AttackConsts, Attack] = require('../models/attack.js')
//const [packages] = require('../data/packages.js')


class Package {
  constructor(name, data) {
    this.name = name.trim()
    for (let key in data) this[key] = data[key]
    if (!Array.isArray(this.bonuses)) throw new Error('No bonus array set for package ' + name)
  }
  
  // Tested with various bonus types
  apply(char) {
    const rank = char.packages[this.name]
    //console.log(this.name + '-' + rank)
    if (rank === undefined || rank === 0) return
    if (char.notes === undefined) char.notes = []
    for (let bonus of this.bonuses) {
      bonus.apply(char, rank)
    }
    if (this.hitsPerLevel) char.maxHits += Math.floor(this.hitsPerLevel * rank)
    char.points += rank
  }

  // Tested in test/char.js
  applyWeaponMax(char) {
    if (this.extraWeapon === undefined) return
    if (char.packages[this.name] === undefined) return
    if (this.extraWeapon > char.packages[this.name]) return
    char.weaponMax++
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
    const name = this.altName ? this.altName : this.name
    if (char[name] === undefined) char[name] = 0
    
    if (this.mode === 'max') {
      if (char[name] < grade) char[name] = grade 
    }
    else if (this.mode === 'penalty') {
      char[name] -= grade 
    }
    else {
      char[name] += grade
    }
    
    if (this.script) this.script(char, grade)
    
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
  
  _grade(level) {
    if (level === undefined) return 0
    
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

  // Tested
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
  
  // Tested
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

  // Tested
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





// A BonusStat boosts a basic stat
// Tested
class BonusStat extends Bonus {
  constructor(name, data) {
    super(name, data)
  }

  apply(char, level) {
    const grade = this._grade(level)
    if (grade === 0) return
    const name = this.altName ? this.altName : this.name
    if (char[name] === undefined) char[name] = 0
    
    if (this.mode === 'max') {
      if (char[name] < grade) char[name] = grade 
    }
    else if (this.mode === 'penalty') {
      char[name] -= grade 
    }
    else {
      char[name] += grade
    }
    
    if (this.script) this.script(char, grade)
    
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
}


// Tested
class PenaltyStat extends BonusStat {
  constructor(name, data) {
    super(name, data)
    this.mode = 'penalty'
  }
}


// A BonusSkill
// Tested
class BonusSkill extends Bonus {
  constructor(name, data) {
    super(name, data)
  }

  apply(char, level) {
    const grade = this._grade(level)
    if (grade === 0) return
    if (char.skills[this.name] === undefined) throw "Unknown skill '" + this.name + "'"

    if (this.mode === 'max') {
      if (char.skills[this.name] < grade) char[this.name] = grade 
    }
    else if (this.mode === 'penalty') {
      char.skills[this.name] -= grade 
    }
    else {
      char.skills[this.name] += grade
    }
  }
}

// Tested
class PenaltySkill extends BonusSkill {
  constructor(name, data) {
    super(name, data)
    this.mode = 'penalty'
  }
}


// A BonusAttack is any attack that uses a weapon
// Tested, including with weaponCheck
class BonusWeaponAttack extends Bonus {
  constructor(name, data) {
    super(name, data)
  }

  apply(char, level) {
    const grade = this._grade(level)
    if (grade === 0) return
    let flag = false
    for (let weapon of char.weapons) {
      if (this.weaponCheck && !this.weaponCheck(weapon)) continue;
      
      const attack = Attack.createFromWeapon(weapon, this)
      attack.name = this.name + " (" + weapon.name + ")"
      attack.bonus = Math.min(level, char.attack) // !!! probably needs to tail off at higher level
      if (this.bonus) attack.bonus += this.bonus
      for (let s in this) {
        if (s === 'name' || s === 'bonus') continue
        attack[s] = this[s]
      }
      if (this.dataModifier) this.dataModifier(data, char)
      char.attacks.push(attack)
      flag = true
    }
    if (!flag) char.warnings.push("No weapons suitable for " + this.name)
  }
}


// A BonusAttack is any attack (or instant effect) that does not use a weapon (or unarmed skill)
// Tested
class BonusAttack extends Bonus {
  constructor(name, data) {
    super(name, data)
  }

  apply(char, level) {
    //console.log('Here1 ' + this.secondaryDamage)
    const grade = this._grade(level)
    if (grade === 0) return
    const data = Object.assign({}, this)
    //console.log('Here2 ' + data.secondaryDamage)
    data.bonus = level // !!! probably needs to tail off at higher level
    if (this.bonus) data.bonus += this.bonus
    if (this.dataModifier) this.dataModifier(data, char, level)    
    char.attacks.push(new Attack(this.name, data))
  }
}

// A BonusEffect is a limited time effect like a buffing spell
// Still need to flesh this out...!!!
class BonusEffect extends Bonus {
  constructor(name, data) {
    super(name, data)
  }

  apply(char, level) {
    const grade = this._grade(level)
    if (grade === 0) return
    const data = Object.assign({}, this.data)
    data.bonus = level // !!! probably needs to tail off at higher level
    if (this.dataModifier) this.dataModifier(data, char)    
    // Do what???
    //char.attacks.push(new Attack(this.name, data))
  }
}





module.exports = [Package, BonusStat, PenaltyStat, BonusSkill, PenaltySkill, BonusAttack, BonusWeaponAttack, BonusEffect]



