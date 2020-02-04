'use strict';

//const fs = require('fs');

class Message {
  static send(sender, recipient, body) {
    if (this.data === undefined) this.data = []
    if (this.count === undefined) this.count = 0
    const msg = new Message()
    msg.sender = sender.name
    msg.recipient = recipient.name
    msg.body = body.replace(/[^a-zA-Z0-9., ]/g, '')
    msg.count = this.count
    this.data.push(msg)
    this.count++
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

