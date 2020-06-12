'use strict';

//const mongo = require('mongodb'); 

const yaml = require('js-yaml');

const [AttackConsts, Attack, WEAPONS] = require('../models/attack.js')
const [Log] = require('../models/log.js')
const [Message] = require('../models/message.js')
const [Package, Bonus] = require('../models/package.js')
const settings = require('../data/settings.js')
const packages = require('../data/packages.js')

//const MongoClient = require('mongodb').MongoClient
//const mongoOpts = { useNewUrlParser: true, useUnifiedTopology: true }
//const mongoUrl = 'mongodb://localhost:27017/rpg';

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
    this.warnings = []
    this.attacks = data.attacks ? data.attacks : []
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
    this.skills = []
    this.notes = []
  }
  
  

  static create(name, data, weaponNames) {
    const c = new Char({name:name})
    c.update(data, weaponNames)
    return c
  }
  
  
  updateWeapons(weaponNames) {
    this.weapons = []
    this.weaponNames = []
    if (weaponNames.length < this.weaponMax) this.warnings.push("You can choose an additional weapon")
    if (weaponNames.length > this.weaponMax) {
      weaponNames.length = this.weaponMax
      this.warnings.push("Additional weapon discarded")
    }
    for (let s of weaponNames) {
      const w = WEAPONS.find(el => el.name === s)
      this.weapons.push(w)
      this.weaponNames.push(s)
      this.attacks.push(Attack.createFromWeapon(w, this)) // !!! Other skills might affect this
    }
  }
  
  update(data, weaponNames) {
    if (data !== undefined) this.packages = data
    
    this.weaponMax = 1
    for (let p of packages) {
      p.applyWeaponMax(this)
    }
    
    if (weaponNames) this.updateWeapons(weaponNames)

    this.points = 0
    this.maxHits = 0
    for (let skill of settings.skills.map(el => el.name)) {
      this.skills[skill] = 0
    }
    // other resets????
    for (let p of packages) {
      p.apply(this)
    }
    this.hits = this.maxHits



    //console.log(this.attacks.length)
    //console.log(this.attacks[0])
    //console.log(this.attack)
    //console.log('-----')
    //console.log(this.attacks.length)

    for (let att of this.attacks) {
      if (att.weapon) {
        if (att.weapon.is('skilled')) {
          //console.log(att.weapon.name + " is skilled")
          // need to have already set the reduction amount in the character
          // need an identifier weaponAdept_
          //const string = 
          //console.log(chr.packages)
        }
      }
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
      { name:'name', type:'string', display:false, disableSave:true},
      { name:'display', type:'string', display:false, disableSave:true},
      { name:'link', type:'string', display:false, disableSave:true},
      { name:'next', type:'string', display:false},
      { name:'charType', type:'string', display:false},
      { name:'profession', type:'string', display:false},
      { name:'race', type:'string', display:false},
      { name:'sex', type:'string', display:false},

      { name:'turnCount', type:'int', display:false, derived:true},
      { name:'maxHits', type:'int', display:"Max. hits", disableSave:true},
      { name:'hits', type:'int', display:"Hits", default:20, derived:true},
      { name:'pp', type:'int', display:false, derived:true},
      { name:'weaponMax', type:'int', display:false, disableSave:true},
      { name:'attack', type:'int', display:false},
      { name:'spellCasting', type:'int', display:false},
      { name:'level', type:'int', display:false},
      { name:'penalty', type:'int', display:'Penalty', derived:true},

      { name:'ice', type:'element', display:'Ice', derived:true},
      { name:'fire', type:'element', display:'Fire', derived:true},
      { name:'shock', type:'element', display:'Shock', derived:true},
      { name:'nether', type:'element', display:'Nether', derived:true},

      { name:'current', type:'bool', display:false, derived:true},
      { name:'stunned', type:'bool', display:"Stunned", derived:true},
      { name:'blooded', type:'bool', display:"Blooded", derived:true},
      { name:'dead', type:'bool', display:"Dead", derived:true},
      { name:'disabled', type:'bool', display:"Disabled", derived:true},
      { name:'alerts', type:'bool', display:false},  // debugging only

      { name:'shield', type:'int', display:"Shield", derived:true},
      { name:'armour', type:'int', display:"Armour", derived:true},
      { name:'armourBonus', type:'int', display:"Armour Bonus", derived:true},  // inate bonus due to tough skin
      { name:'will', type:'int', display:"Will", derived:true},
      { name:'reflex', type:'int', display:"Reflex", derived:true},
      { name:'stamina', type:'int', display:"Stamina", derived:true},
      { name:'none', type:'int', display:"None", disableSave:true},
      { name:'init', type:'int', display:false, default:0, derived:true},
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
      { name:'packages', type:'function' },
      { name:'skills', type:'function' },
      { name:'notes', type:'function' },
      { name:'weaponNames', type:'function' },
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


  // restoreState should be true if this is part way through an encounter and
  // you want saved values to override the derived values; otherwise, these values will
  // be ignored as they could hasve changed in a rules update
  static loadYaml(s, restoreState) {
    const data = yaml.safeLoad(s);
    const chars = []
    for (let h of data) {
      const ps = []
      for (let p of h.packages) {
        ps[p.name] = p.rank
      }
      const c = Char.create(h.name, ps, h.weaponNames)
      for (let field of Char.fields()) {
        if (field.disableSave || field.type === 'function') continue
        if (h[field.name] === undefined) continue
        if (field.derived && !restoreState) continue
        if (field.type === 'element') {
          c.elements[field.name].load(h[field.name])
        }
        else {
          c[field.name] = h[field.name]
        }
      }
      chars.push(c)
    }
    return chars
  }
  


  static toYaml(chars) {
    let s = '---\n'
    for (let char of chars) {
      s += char.toYaml()
    }
    return s
  }
  
  toYaml() {
    let s = '-\n  name: ' + this.name + '\n'
    for (let field of Char.fields()) {
      if (field.disableSave || field.type === 'function') continue
      if (field.type === 'element') {
        s += '  ' + field.name + ': ' + this.elements[field.name].save() + '\n'
      }
      else if (this[field.name] === undefined) {
        continue
      }
      else {
        s += '  ' + field.name + ': ' + this[field.name] + '\n'
      }
    }
    s += '  packages:\n'
    for (let key in this.packages) {
        s += '    -\n      name: ' + key + '\n      rank: ' + this.packages[key] + '\n'
    }
    s += '  weaponNames:\n'
    for (let w of this.weaponNames) {
        s += '    - ' + w + '\n'
    }
    return s + '\n'
  }
    
  toHash() {
    const h = {}
    for (let field of Char.fields()) {
      if (field.display && this[field.name]) {
        h[field.name] = this[field.name].toString()
      }
    }
    return h
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
  
  getMaxPoints() {
    return this.level * settings.pointsPerLevel + settings.bonusPoints
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
    if (!this.done75 && this.hits <= (this.maxHits / 4)) {
      this.done25 = true
      this.done75 = true
      this.blooded = true
      if (this.onDone75) {
        this.alert("On Done75 event triggered")
        this.onDone75()
      }
    }
    if (!this.blooded && this.hits <= (this.maxHits / 2)) {
      this.done25 = true
      this.blooded = true
      if (this.onBlooded) {
        this.alert("On blooded event triggered")
        this.onBlooded()
      }
    }
    if (!this.done25 && this.hits <= (this.maxHits / 4)) {
      this.done25 = true
      if (this.onDone25) {
        this.alert("On Done25 event triggered")
        this.onDone75()
      }
    }
  }
  
  getMessages() {
    return Message.getMessages(this.name)
  }
  
  alert(s) {
    if (this.alerts === undefined || this.alerts === false) this.alerts = []
    this.alerts.push(s)
    Message.send('!!!', 'GM', s)
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
      if (attack.resist === "reflex" && !attack.ignoreArmour) {
        hits -= (this.armour + this.armourBonus) * attack.diceCount()
        if (hits < 1) hits = 1
        s += ", doing " + hits + " hits"
        if (damage !== hits) s += " (" + damage + " before armour)"
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
  
/*  async saveToDb() {
    const data = {name:this.name, data:this.toYaml()}
    const query = {name:this.name}
    const client = await MongoClient.connect(mongoUrl, mongoOpts).catch(err => { console.log("\n\n" + err + "\n\n"); })
    const db = client.db("rpg");
    const res = await db.collection("chars").findOneAndReplace(query, data, {upsert:true}).catch(err => { console.log(err); })
    console.log("1 document inserted (" + this.name + ")")
    client.close();
  }  
  
  static async clearDb() {
    const client = await MongoClient.connect(mongoUrl, mongoOpts).catch(err => { console.log(err); })
    const db = client.db("rpg");
    const res = await db.collection("chars").deleteMany({}).catch(err => { console.log(err); })
    console.log(res.result.n + " document(s) deleted");
    client.close();
  }  

  static async saveToDb(chars) {
    for (let char of chars) {
      if (char.name) char.saveToDb()
    }
  }

  static async loadFromDb(chars) {
    const client = await MongoClient.connect(mongoUrl, mongoOpts).catch(err => { console.log(err); })
    const db = client.db("rpg");
    const res = await db.collection("chars").find({}).catch(err => { console.log(err); })
    console.log(res.length + " document(s) found");
    chars.length = 0
    for (let data of res) {
      chars.pop(Char.unflatten(data))
    }
    client.close();
    console.log("Done");
  }  */
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

