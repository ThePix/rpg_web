'use strict';

//const fs = require('fs');

class Message {
  static send(sender, recipient, body) {
    console.log("messages before=" + this.data.length)
    //if (this.data === undefined) this.data = []
    //if (this.count === undefined) this.count = 0
    const msg = new Message()
    msg.sender = typeof sender === 'string' ? sender : sender.name
    msg.recipient = typeof recipient === 'string' ? recipient : recipient.name
    msg.body = body.replace(/[^a-zA-Z0-9., ]/g, '')
    msg.count = this.count
    this.data.push(msg)
    this.count++
    console.log("messages after=" + this.data.length)
  }
  
  static messagesFor(recipient) {
    return this.data.filter(el => el.recipient === recipient.name)
  }


  static resetMsgs() {
    this.data = []
    this.count = 0
  }

}

Message.resetMsgs()


module.exports = [Message]


console.log("-------------")
Message.send({name:'Kyle'}, {name:'Lara'}, 'Welcome to the game')
Message.send({name:'Lara'}, {name:'Kyle'}, 'Thanks')
Message.send({name:'Kyle'}, {name:'Lara'}, 'No problem')
console.log(Message.data)
console.log("################")