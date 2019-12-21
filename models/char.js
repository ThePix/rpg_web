
const defaultChar = {
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
  //shocked:false,
  frozen:false,
  burning:false,
  attacks:[],
}

// a character can be given an afterTurn5 attribute, for example, to have something happen when it gets to turn 5.
class Char {
  constructor(data, attacks) {
    for (let key in defaultChar) this[key] = data[key] || defaultChar[key]
    if (this.maxHits === undefined) this.maxHits = this.hits
  }
  
  static fields() {
    return [
      { name:'hits', type:'int', display:"Hits",},
      { name:'maxHits', type:'int', display:"Max. hits"},
      { name:'pp', type:'int', display:"Power points"},
      { name:'shield', type:'int', display:"Shield"},
      { name:'armour', type:'int', display:"Armour"},
      { name:'will', type:'int', display:"Will"},
      { name:'reflex', type:'int', display:"Reflex"},
      { name:'stamina', type:'int', display:"Stamina"},
      { name:'none', type:'int', display:"None"},
      { name:'stunned', type:'bool', display:"Stunned"},
      { name:'frozen', type:'bool', display:"Frozen"},
      { name:'burning', type:'bool', display:"Burning"},
      { name:'noMagic', type:'bool', display:"No magic"},
      { name:'dead', type:'bool', display:"Dead"},
      { name:'disabled', type:'bool', display:"Disabled"},
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
  
  alias() {
    return this.display ? this.display : this.name
  }
}



module.exports = [Char]

