'use strict';

const [db] = require('../models/db.js')

class Message {
  static ALERT = 0
  static SENT = 1
  static RECEIVED = 2
  
  
  static send(sender, recipient, body) {
    const msg = new Message()
    msg.sender = typeof sender === 'string' ? sender : sender.name
    msg.recipient = typeof recipient === 'string' ? recipient : recipient.name
    msg.body = body.replace(/[^a-zA-Z0-9., ?!&\-\/]/g, '')
    msg.message_type = this.SENT
    this.insert(msg)
  }
  
  static messagesFor(recipient) {
    return this.data.filter(el => el.recipient === recipient.name)
  }


  static getMessages(name) {
    const ary = []
    for (let msg of Message.data) {
      if (msg.sender === name) {
        ary.push({message_type:this.SENT, title:'To ' + msg.recipient, content:msg.body})
      }
      else if (msg.recipient === name || msg.recipient === 'All') {
        if (msg.sender === '!!!') {
          ary.push({message_type:this.ALERT, title:'Alert', content:msg.body})
        }
        else {
          ary.push({message_type:this.RECEIVED, title:'From ' + msg.sender, content:msg.body})
        }
      }
    }
    return ary
  }
  
  static getData() {
    return this.data.map(el => el.sender + '|' + el.recipient + '|' + el.message_type + '|' + el.body).join('\n')
  }

  static putData(s) {
    this.data = []
    for (let st of s.split('\n')) {
      const bits = st.split('|')
      this.insert({sender:bits[0], recipient:bits[1], message_type:bits[2], body:bits[3], })
    }
  }


  static insert(msg) {
    db.insert(msg, 'messages', './db/rpg.db')
  }

  static resetMsgs() {
    this.data = []
  }
  
  

}

Message.resetMsgs()


module.exports = [Message]

