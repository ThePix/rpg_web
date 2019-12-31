'use strict';

const [AttackConsts] = require('../models/attack.js')
const [Log] = require('../models/log.js')


class Char {
  constructor(data) {
    for (let field of Char.fields()) {
      if (data[field.name]) {
        this[field.name] = data[field.name]
      }
      else if (field.default) {
        this[field.name] = field.default
      }
      else if (field.type === 'bool') {
        this[field.name] = false
      }
      else if (field.type === 'int') {
        this[field.name] = 0
      }
    }
    
    if (this.maxHits === undefined || this.maxHits == 0) this.maxHits = this.hits
    if (this.display === undefined || this.display == '') this.display = this.name
    this.attacks = data.attacks
    if (this.size === -1) {
      this.size = 3
    }
    if (typeof this.size === "string") this.size = Char.sizes().findIndex(el => el === this.size.toLowerCase())
    this.elementalThreshold = 1 << this.size
    
    this.elements = {
      ice:new IceElement(this, data),
      fire:new FireElement(this, data),
      shock:new ShockElement(this, data),
      nether:new NetherElement(this, data),
    }
  }
  
  static sizes() {
    return [
      "microscopic",  // literally
      "tiny",         // eg wasp or rat, can swarm
      "small",        // eg cat, can have four in a square
      "normal",
      "large",        // occupies 4 squares
      "huge"          // occupies over 4 squares
    ]
  }

  static fields() {
    return [
      { name:'name', type:'string', display:false},
      { name:'display', type:'string', display:false},
      { name:'link', type:'string', display:false},
      { name:'next', type:'string', display:false},

      { name:'turnCount', type:'int', display:false},
      { name:'hits', type:'int', display:"Hits", default:20},
      { name:'maxHits', type:'int', display:"Max. hits"},
      { name:'pp', type:'int', display:"Power points"},
      
      { name:'ice', type:'element', display:'Ice'},
      { name:'fire', type:'element', display:'Fire'},
      { name:'shock', type:'element', display:'Shock'},
      { name:'nether', type:'element', display:'Nether'},

      { name:'pc', type:'bool', display:false},
      { name:'current', type:'bool', display:false},
      { name:'stunned', type:'bool', display:"Stunned"},
      { name:'dead', type:'bool', display:"Dead"},
      { name:'disabled', type:'bool', display:"Disabled"},
      { name:'alerts', type:'bool', display:false},  // debugging only

      { name:'shield', type:'int', display:"Shield"},
      { name:'armour', type:'int', display:"Armour"},
      { name:'will', type:'int', display:"Will"},
      { name:'reflex', type:'int', display:"Reflex"},
      { name:'stamina', type:'int', display:"Stamina"},
      { name:'none', type:'int', display:"None"},
      { name:'init', type:'int', display:false},
      { name:'size', type:'int', display:false, default:-1},
    ]
  }
  
  static statusFields() {
    return [
      'stunned',
      'frozen',
      'burning',
      'noMagic',
      'dead',
      'disabled',
    ]
  }
  
  startTurn() {
    if (this.turnStarted) return
    Log.add("secret", this.display + ": Start turn")
    this.turnStarted = true
  }
  
  endTurn() {
    Log.add("secret", this.display + ": End turn")
    this.turnStarted = false
    this.turnCount++
    if (this['afterTurn' + this.turnCount]) this['afterTurn' + this.turnCount]()
    for (let el in this.elements) {
      //console.log(el)
      this.elements[el].endTurn()
    }
  }

  delay(chars) {
    const oneBefore = chars.find(el => el.next === this.name)
    oneBefore.next = this.next

    let oneAfter = this
    do {
      oneAfter = chars.find(el => el.name === oneAfter.next)
    } while (oneAfter.disabled)
    oneAfter.current = true
  
    this.current = false
    this.next = oneAfter.next
  
    oneAfter.next = this.name
    oneAfter.startTurn()
    return oneAfter
  }
  
  nextChar(chars) {
    this.endTurn()
    let char = this
    do {
      char = chars.find(el => el.name === char.next)
      char.current = true
      this.current = false
    } while (char.disabled)
    char.startTurn()
    return char 
  }
  
  statusIcons() {
    //console.log(this.name)
    //console.log(Char.statusFields().length)
    let s = ''
    for (let i = 0; i < Char.statusFields().length; i++) {
      //console.log(Char.statusFields()[i])
      //console.log(this[Char.statusFields()[i]])
      if (this[Char.statusFields()[i]]) {
        //console.log("yes")
        s += '<img src="images/' + Char.statusFields()[i] + '.png" width="32" height="32" />'
      }
    }
    return s
  }
  
  statusReport() {
    const l = []
    for (let i = 0; i < Char.statusFields().length; i++) {
      if (this[Char.statusFields()[i]]) {
        l.push(Char.statusFields()[i])
      }
    }
    return l.join("; ")
  }
  
  statusCheck() {
    if (!this.dead && this.hits < 0) {
      this.dead = true
      if (this.onDeath) {
        this.alert("On death event triggered")
        this.onDeath()
      }
    }
    if (!this.dead && !this.bloodied && this.hits < (this.maxHits / 2)) {
      this.bloodied = true
      if (this.onBloodied) {
        this.alert("On bloodied event triggered")
        this.onBloodied()
      }
    }
  }
  
  alert(s) {
    if (this.alerts === undefined) this.alerts = []
    this.alerts.push(s)
  }
  
  cancelAlerts() {
    delete this.alerts
  }
  
  clone() {
    const c = new Char({});
    for (let field of Char.fields()) {
      if (this[field.name]) c[field.name] = this[field.name];
    }
    c.name = "clone" + Math.random();
    return c;
  }
  
  resolveDamage(attacker, attack, damage, result) {
    //console.log('In resolveDamage')
    //console.log(damage)
    //console.log(attacker.name)
    //console.log(attack.name)
    //console.log(result)
    if (result >= AttackConsts.PLAIN_HIT) {
      let hits = damage
      let s = this.display + " is hit by " + attacker.display + " with " + attack.name
      if (result === AttackConsts.CRITICAL_HIT) s += " (a critical)"
      if (attack.resist === "reflex" && !attack.ignoreArmour && this.armour) {
        hits -= this.armour * attack.diceCount()
        if (hits < 1) hits = 1
        s += ", doing " + hits + " hits (" + damage + " before armour)."
      }
      else {
        s += ", doing " + hits + " hits."
      }
      Log.add(s)
      //console.log(hits)
      // what if frozen? etc.? !!!
      this.hits -= hits
      // check if bloodied or dead
    }
    else if (result === AttackConsts.CRITICAL_MISS) {
      Log.add(attacker.display + " misses " + this.display + " by a mile.")
    }
    else if (result === AttackConsts.BAD_MISS) {
      Log.add(attacker.display + " badly misses " + this.display + ".")
    }
    else if (result === AttackConsts.SHIELD_MISS) {
      Log.add(this.display + "'s shield stops " + attacker.display + "'s attack.")
    }
    else if (result === AttackConsts.STAT_MISS) {
      Log.add(this.display + "'s superior " + attack.resist + " stops " + attacker.display + "'s attack.")
    }
    else {
      Log.add(attacker.display + " just misses " + this.display + ".")
    }
  }
  
  damage(hits, msg) {
    this.hits -= hits
    // other stuff!!!
  }

  elementalDamage(amount, elementName, msg) {
    const element = this.elements[elementName]
    const opposed = this.elements[element.getOpposed()]
    if (opposed.condition) return "No elemental effect (character is " + opposed.getConditionName() + ")"
    if (opposed.count > amount * (1 < 10)) {
      opposed.count -= amount * (1 < 10)
      Log.add("No elemental effect, but " + opposed.getName() + " is reduced by " + amount)
      return
    }
    if (opposed.count > 0) {
      amount -= opposed.count / (1 < 10)
      element.increase(amount)
      Log.add("The " + opposed.getName() + " is reduced to zero; " + this.getName() + " increased by " + amount)
      return
    }
    
    element.count += element.modifyAmount(amount)
    if (!element.condition && element.count >= element.elementalThreshold * (1 << 10)) {
      element.condition = true
      conditionStartFunc()
    }
      


  }
}










class ElementalEffect {
  constructor(owner, data) {
    this.owner = owner
    this.conditionStartFunc = function() {}
    this.conditionOngoingFunc = function() {}
    this.conditionEndFunc = function() {}
    this.count = 0
    this.condition = false
    this.vulnProt = 10
    if (data["protectedFrom" + this.getName()]) {
      this.vulnProt = 10 - data["protectedFrom" + this.getName()]
    }
    if (data["vulnerableTo" + this.getName()]) {
      this.vulnProt = data["vulnerableTo" + this.getName()] + 10
    }
  }
  
  startTurn() {
    if (this.condition && this.elementTurnStart) {
      this.elementTurnStart()
    }
  }
  
  endTurn() {
    this.count -= this.modifyAmount(1, true);
    if (this.count <= 0) {
      this.count = 0;
      if (this.condition) {
        this.condition = false
        if (this.elementTurnEnd) {
          this.elementTurnEnd()
        }
      }
    }
  }
  
  /*
  increase wants to be 1024 * amount * n
  where n is 1 when vulnProt is 10
  2   11
  3   12
  1/2 9
  1/3 8
  
  
  reverse if protection should make the number bigger
  
  11 -> 9
  */
  modifyAmount(amount, reverse) {
    const vulnProt = reverse ? 20 - this.vulnProt : this.vulnProt
    const n = amount * (1 << 10)
    if (vulnProt === 10) return n
    if (vulnProt > 10) return n * (vulnProt - 9)
    return Math.round(n / (11 - vulnProt))
  }

  toString(def) {
    if (this.count === 0) return (def === undefined ? false : def)
    let s = this.getName() + ": " + (this.count / (1 << 10))
    if (this.condition) s += ", " + this.conditionName
    if (this.vulnProt > 10) s += ", +" + (this.vulnProt - 10) + " vulnerability"
    if (this.vulnProt < 10) s += ", +" + (10 - this.vulnProt) + " protection"
    return s
  }
}


class FireElement extends ElementalEffect {
  constructor(owner, data) {
    super(owner, data)
    this.elementTurnStart = function() { owner.damage(4, "On-going fire damage") }
  }
  
  getName() { return "Fire" }
  getOpposed() { return "ice" }
  getConditionName() { return "Burning" }
  
}

class IceElement extends ElementalEffect {
  constructor(owner, data) {
    super(owner, data)
    this.conditionOngoingFunc = function() {  }
  }
  
  getName() { return "Frost" }
  getOpposed() { return "fire" }
  getConditionName() { return "Frozen" }
  
}

class ShockElement extends ElementalEffect {
  constructor(owner, data) {
    super(owner, data)
    this.conditionOngoingFunc = function() {  }
  }
  
  getName() { return "Shock" }
  getOpposed() { return "nether" }
  getConditionName() { return "Stunned" }
  
}

class NetherElement extends ElementalEffect {
  constructor(owner, data) {
    super(owner, data)
    this.conditionOngoingFunc = function() {  }
  }
  
  getName() { return "Nether" }
  getOpposed() { return "shock" }
  getConditionName() { return "Null magic" }
  
}

module.exports = [Char]

