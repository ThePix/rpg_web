'use strict';

//const mongo = require('mongodb'); 

const [AttackConsts] = require('../models/attack.js')
const [Log] = require('../models/log.js')

const MongoClient = require('mongodb').MongoClient
const mongoOpts = { useNewUrlParser: true, useUnifiedTopology: true }
const mongoUrl = 'mongodb://localhost:27017/rpg';


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
    
    this.saveToDb()
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
      { name:'name', type:'string', display:false, disableSave:true},
      { name:'display', type:'string', display:false, disableSave:true},
      { name:'link', type:'string', display:false, disableSave:true},
      { name:'next', type:'string', display:false},

      { name:'turnCount', type:'int', display:false},
      { name:'hits', type:'int', display:"Hits", default:20},
      { name:'maxHits', type:'int', display:"Max. hits"},
      { name:'pp', type:'int', display:"Power points"},
      
      { name:'ice', type:'element', display:'Ice'},
      { name:'fire', type:'element', display:'Fire'},
      { name:'shock', type:'element', display:'Shock'},
      { name:'nether', type:'element', display:'Nether'},

      { name:'pc', type:'bool', display:false, disableSave:true},
      { name:'current', type:'bool', display:false},
      { name:'stunned', type:'bool', display:"Stunned"},
      { name:'blooded', type:'bool', display:"Blooded"},
      { name:'dead', type:'bool', display:"Dead"},
      { name:'disabled', type:'bool', display:"Disabled"},
      { name:'alerts', type:'bool', display:false},  // debugging only

      { name:'shield', type:'int', display:"Shield"},
      { name:'armour', type:'int', display:"Armour"},
      { name:'will', type:'int', display:"Will"},
      { name:'reflex', type:'int', display:"Reflex"},
      { name:'stamina', type:'int', display:"Stamina"},
      { name:'none', type:'int', display:"None"},
      { name:'init', type:'int', display:false, default:0},
      { name:'size', type:'int', display:false, default:-1},
      
      { name:'applyDamage', type:'function' },
      { name:'onDeath', type:'function' },
      { name:'onBlooded', type:'function' },
      { name:'onDone75', type:'function' },
      { name:'onDone25', type:'function' },
      { name:'ignoreAttackTypes', type:'function' },
      { name:'attacks', type:'function' },
      { name:'elementalThreshold', type:'function' },
      { name:'elements', type:'function' },
    ]
  }
  
  static statusFields() {
    return [
      'stunned',
      'frozen',
      'burning',
      'noMagic',
      'dead',
      'blooded',
      'disabled',
    ]
  }
  
  static loadData(chars, s) {
    const regexp = /character~(\w+)\[([\s\S]*?)\]/
    const ary = s.split('\n\n')
    ary.pop() // last is blank!
    for (let el of ary) {
      const md = el.match(regexp)
      const char = chars.find(el => el.name === md[1])
      if (!char) throw new Error("CharacterLoadException", "Unknown character: " + md[1])
      const data = md[2].split('\n')
      data.shift()
      data.pop()
      for (let datum of data) {
        const regexp = /  (\w+)~(.*)$/
        const md = datum.match(regexp)
        const field = Char.fields().find(el => el.name === md[1])
        if (!field) throw new Error("CharacterLoadException", "Unknown field: " + md[1])
        if (field.type === 'bool') char[field.name] = (md[2] === 'true')
        if (field.type === 'int') char[field.name] = parseInt(md[2])
        if (field.type === 'string') char[field.name] = md[2]
        if (field.type === 'element') char.elements[field.name].load(md[2])
      }
    }
  }

  static saveData(chars) {
    let s = ''
    for (let char of chars) {
      s += char._getSaveData()
    }
    return s
  }

  _getSaveData() {
    let s = 'character~' + this.name + '[\n'
    for (let field of Char.fields()) {
      if (field.disableSave || field.type === 'function') continue
      if (field.type === 'element') {
        s += '  ' + field.name + '~' + this.elements[field.name].save() + '\n'
      }
      else {
        s += '  ' + field.name + '~' + this[field.name] + '\n'
      }
    }
    return s + ']\n\n'
  }
    
  fieldsInclude(s) {
    const res = Char.fields().find(el => el.name.toLowerCase() === s.toLowerCase())
    return (res !== undefined)
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
      this.done75 = true
      this.blooded = true
      this.done25 = true
      if (this.onDeath) {
        this.alert("On death event triggered")
        this.onDeath()
      }
    }
    if (!this.done75 && this.hits < (this.maxHits / 4)) {
      this.done25 = true
      this.done75 = true
      this.blooded = true
      if (this.onDone75) {
        this.alert("On Done75 event triggered")
        this.onDone75()
      }
    }
    if (!this.blooded && this.hits < (this.maxHits / 2)) {
      this.done25 = true
      this.blooded = true
      if (this.onBlooded) {
        this.alert("On blooded event triggered")
        this.onBlooded()
      }
    }
    if (!this.done25 && this.hits < (this.maxHits / 4)) {
      this.done25 = true
      if (this.onDone25) {
        this.alert("On Done25 event triggered")
        this.onDone75()
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
    if (result >= AttackConsts.PLAIN_HIT) {
      let hits = damage
      let s = this.display + " is hit by " + attacker.display + " with " + attack.name
      if (result === AttackConsts.CRITICAL_HIT) s += " (a critical)"
      if (attack.resist === "reflex" && !attack.ignoreArmour && this.armour) {
        hits -= this.armour * attack.diceCount()
        if (hits < 1) hits = 1
        s += ", doing " + hits + " hits (" + damage + " before armour)"
      }
      else {
        s += ", doing " + hits + " hits"
      }
      if (this.elements.ice.condition) {
        hits *= 2
        s += " doubled while frozen"
      }
      s += "."
      this.applyDamage(hits, s, attack, result)
      return
    }
    
    if (result === AttackConsts.CRITICAL_MISS) {
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
    if (attack.onMiss) attack.onMiss(this)
    this.statusCheck()
  
  }
  
  // Separated so characters can override if necessary
  applyDamage(hits, s, attack, result) {
    if (this.ignoreAttackTypes && this.ignoreAttackTypes.includes(attack.special)) {
      s += " Sadly " + this.display + " is not affected by attacks of that type."
      Log.add(s)
    }
    else {
      this.hits -= hits
      Log.add(s)
      if (result === AttackConsts.CRITICAL_HIT) {
        if (attack.onCritical) attack.onCritical(this, hits)
      }
      else {
        if (attack.onHit) {
          attack.onHit(this, hits)
        }
      }
      this.statusCheck()
    }
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

  getAttackModifier() {
    return -Math.floor(4 * (this.maxHits - this.hits) / this.maxHits)
  }

  getDefenceModifier(resist) {
    return this[resist]
  }
  
  saveToDb() {
    const data = {name:this.name, data:stringify(this)}
/*    for (let key in this) {
      if (Array.isArray(this[key])) {
        for (let subkey of this[key]) {
          data[key + '_' + subkey] = this[key][subkey]
        }
      }
      else if (typeof this[key] === 'object') {
        console.log(key)
        data[key] = this[key].name
      }
      else {
        data[key] = this[key]
      }
    }*/
    MongoClient.connect(mongoUrl, mongoOpts, (err, client) => {
      if (err) throw err;

      const db = client.db("rpg");
      db.collection("chars").insertOne(data, function(err, res) {
        if (err) throw err
        console.log("1 document inserted")
      })
      client.close();
    });
  }  
  
  static clearDb() {
    MongoClient.connect(mongoUrl, mongoOpts, (err, client) => {
      if (err) throw err;

      const db = client.db("rpg");
      db.collection("chars").deleteMany({}, function(err, res) {
        if (err) throw err
        console.log(res.result.n + " document(s) deleted");
      })
      client.close();
    });
  }  

  static loadFromDb(chars) {
    MongoClient.connect(mongoUrl, mongoOpts, (err, client) => {
      if (err) throw err;

      const db = client.db("rpg");
      db.collection("chars").find({}).toArray(function(err, res) {
        if (err) throw err
        console.log(res.length + " document(s) found");
        chars.length = 0
        for (let data of res) {
          const c = new Char(data)
          chars.pop(c)
        }
      })
      client.close();
    });
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
  
  save() {
    return this.count + '~' + this.condition + '~' + this.vulnProt
  }
  
  load(s) {
    const ary = s.split('~')
    this.count = parseInt(ary[0])
    this.condition = (ary[1] === 'true')
    this.vulnProt = parseInt(ary[2])
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

