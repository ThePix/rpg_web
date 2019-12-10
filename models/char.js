
const DEFAULT_CHAR = {
  turnCount:0,
  will:0,
  reflex:0,
  stamina:0,
  none:0,
  hits:20,
  shield:0,
  armour:0,
  pp:0,
  pc:false,
  current:false,
  name:false,
  display:false,
  link:false,
  next:false,
  disabled:false,
  stunned:false,
  dazed:false,
  dead:false,
  noMagic:false,
  shocked:false,
  frozen:false,
  onFire:false,
  attacks:[],
}

// a character can be given an afterTurn5 attribute, for example, to have something happen when it gets to turn 5.
class Char {
  constructor(data, attacks) {
    for (let key in DEFAULT_CHAR) this[key] = data[key] || DEFAULT_CHAR[key]
    if (this.maxHits === undefined) this.maxHits = this.hits
  }
  
  static fields() {
    return [
      { name:'maxHits', type:'int', display:"Hits",},
      { name:'hits', type:'int', display:"Max. hits"},
      { name:'pp', type:'int', display:"Power points"},
      { name:'stunned', type:'bool', display:"Stunned"},
    ]
  }
  
  static statusFields() {
    return [
      'stunned',
      'dazed',
      'dead',
      'noMagic',
      'shocked',
      'frozen',
      'onFire',
      'link',
    ]
  }

  delay(chars) {
    const oneBefore = chars.find(el => el.next === this.name)
    oneBefore.next = this.next
    console.log(oneBefore.name)

    let oneAfter = this
    do {
      oneAfter = chars.find(el => el.name === oneAfter.next)
    } while (oneAfter.disabled)
    oneAfter.current = true
  
    this.current = false
    this.next = oneAfter.next
  
    oneAfter.next = this.name
    console.log(oneAfter.name)
    return oneAfter
  }
  
  nextChar(chars) {
    let char = this
    do {
      char = chars.find(el => el.name === char.next)
      char.current = true
      this.current = false
      console.log("now: " + char.name)
    } while (char.disabled)
    this.turnCount++
    if (this['afterTurn' + this.turnCount]) this['afterTurn' + this.turnCount]()
    return char 
  }
  
  status() {
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
  
  alias() {
    return this.display ? this.display : this.name
  }
}



module.exports = [Char]

