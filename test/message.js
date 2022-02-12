'use strict';

const assert = require('assert')

const [Message] = require('../models/message.js')
const [Char] = require('../models/char.js')
 


describe('Messages', function() {


  it('should send', function() {
    const chr1 = {name:'Tester 1'}
    const chr2 = {name:'Tester 2'}
    Message.send(chr1, chr2, 'This is a test')
    Message.send(chr2, chr1, 'This is a reply')
    assert.equal(Message.data.length, 2);
    assert.equal(Message.data[1].body, 'This is a reply');
    Message.resetMsgs()
  });

  it('should send with bad chars', function() {
    const chr1 = {name:'Tester 1'}
    const chr2 = {name:'Tester 2'}
    Message.send(chr1, chr2, 'This% is== "a" test=.')
    Message.send(chr2, chr1, 'This [is] a) (repl+y,')
    assert.equal(Message.data.length, 2);
    assert.equal(Message.data[0].body, 'This is a test.');
    assert.equal(Message.data[1].body, 'This is a reply,');
    Message.resetMsgs()
  });

  it('should messagesFor', function() {
    const chr1 = {name:'Tester 1'}
    const chr2 = {name:'Tester 2'}
    Message.send(chr1, chr2, 'This is a test')
    Message.send(chr2, chr1, 'This is a reply')
    assert.equal(Message.messagesFor(chr1).length, 1);
    assert.equal(Message.messagesFor(chr1)[0].body, 'This is a reply');
    assert.equal(Message.messagesFor(chr2)[0].body, 'This is a test');
    Message.resetMsgs()
  });

  it('should messagesAsHtml', function() {
    const chr1 = Char.create('Tester 1', {})
    const chr2 = {name:'Tester 2'}
    const chr3 = {name:'Tester 3'}
    Message.send(chr1, chr2, 'This is a test')
    Message.send(chr2, chr1, 'This is a reply')
    Message.send(chr3, chr2, 'This is not a test')
    Message.send(chr2, chr3, 'This is not a reply')
    const ary = chr1.getMessages()
    assert.equal(ary.length, 2);
    assert.equal(ary[0].type, 'sent');
    assert.equal(ary[1].type, 'received');
    Message.resetMsgs()
  });
  
})

