// a character can be given an afterTurn5 attribute, for example, to have something happen when it gets to turn 5.
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
  }
  
  static fields() {
    return [
      { name:'name', type:'string', display:false},
      { name:'display', type:'string', display:"Display name",},
      { name:'link', type:'string', display:false,},
      { name:'next', type:'string', display:false,},

      { name:'turnCount', type:'int', display:false,},
      { name:'hits', type:'int', display:"Hits", default:20},
      { name:'maxHits', type:'int', display:"Max. hits", default:20},
      { name:'pp', type:'int', display:"Power points"},
      { name:'shield', type:'int', display:"Shield"},
      { name:'armour', type:'int', display:"Armour"},
      { name:'will', type:'int', display:"Will"},
      { name:'reflex', type:'int', display:"Reflex"},
      { name:'stamina', type:'int', display:"Stamina"},
      { name:'none', type:'int', display:"None"},
      { name:'init', type:'int', display:false},
      
      { name:'pc', type:'bool', display:false},
      { name:'current', type:'bool', display:false},
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
    ]
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
    return oneAfter
  }
  
  nextChar(chars) {
    let char = this
    do {
      char = chars.find(el => el.name === char.next)
      char.current = true
      this.current = false
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

