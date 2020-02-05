'use strict';

const [Message] = require('./models/message.js')
const [Char] = require('./models/char.js')
 



  const test = new Char({name: "Tester", protectedFromFire:2})
  Message.send(test, {name:'Lara'}, 'Welcome to the game')

console.log(Message.data)

console.log(test.toHash())

console.log(Message.messagesFor({name:'Lara'}))
