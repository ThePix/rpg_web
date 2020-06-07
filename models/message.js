'use strict';

//const fs = require('fs');

class Message {
  static send(sender, recipient, body) {
    const msg = new Message()
    msg.sender = typeof sender === 'string' ? sender : sender.name
    msg.recipient = typeof recipient === 'string' ? recipient : recipient.name
    msg.body = body.replace(/[^a-zA-Z0-9., ?!&\-\/]/g, '')
    this.data.push(msg)
  }
  
  static messagesFor(recipient) {
    return this.data.filter(el => el.recipient === recipient.name)
  }


  static getMessages(name) {
    const ary = []
    for (let msg of Message.data) {
      if (msg.sender === name) {
        ary.push({type:'sent', title:'To ' + msg.recipient, content:msg.body})
      }
      else if (msg.recipient === name || msg.recipient === 'All') {
        if (msg.sender === '!!!') {
          ary.push({type:'alert', title:'Alert', content:msg.body})
        }
        else {
          ary.push({type:'received', title:'From ' + msg.sender, content:msg.body})
        }
      }
    }
    return ary
  }
  
  static getData() {
    return this.data.map(el => el.sender + '|' + el.recipient + '|' + el.type + '|' + el.body).join('\n')
  }

  static putData(s) {
    this.data = []
    for (let st of s.split('\n')) {
      const bits = st.split('|')
      this.data.push({sender:bits[0], recipient:bits[1], type:bits[2], body:bits[3], })
    }
  }


  static resetMsgs() {
    this.data = []
  }

}

Message.resetMsgs()


module.exports = [Message]

/*
Message.send('GM', 'Kyle', 'Welcome...')
Message.send('GM', {name:'Lara'}, 'Welcome...')
Message.send({name:'Kyle'}, {name:'Lara'}, 'Welcome to the game')
Message.send({name:'Lara'}, {name:'Kyle'}, 'Thanks')
Message.send({name:'Kyle'}, {name:'Lara'}, 'No problem')
*/