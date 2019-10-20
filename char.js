export default class Char {
  constructor(data) {
    for (let key in data) this[key] = data[key]
  }
  
  attack(target, roll, bonus) {
    
  }
  
  delay(chars) {
    const oneBefore = chars.find(el => el.next === this.name)
    const oneAfter = chars.find(el => el.name === this.next)
    oneBefore.next = oneAfter.name
    this.next = oneAfter.next
  }
}