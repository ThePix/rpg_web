'use strict';

const [Message] = require('./models/message.js')
 



  const chr1 = {name:'Tester 1'}
  const chr2 = {name:'Tester 2'}
  Message.send(chr1, chr2, 'This is a test')
  Message.send(chr2, chr1, 'This is a reply')
//  t.is(Message.messagesFor(chr2)[0].body, 'This is a reply');
//  t.is(Message.messagesFor(chr1)[0].body, 'This is a test');



console.log(Message.data)
console.log(Message.messagesFor(chr1))
console.log(Message.messagesFor(chr1).length)

