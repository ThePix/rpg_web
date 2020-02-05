'use strict';

import test from 'ava';
const [Message] = require('../models/message.js')
const [Char] = require('../models/char.js')
 




test('send', t => {
  const chr1 = {name:'Tester 1'}
  const chr2 = {name:'Tester 2'}
  Message.send(chr1, chr2, 'This is a test')
  Message.send(chr2, chr1, 'This is a reply')
  t.is(Message.data.length, 2);
  t.is(Message.data[1].body, 'This is a reply');
  Message.resetMsgs()
});

test('send with bad chars', t => {
  const chr1 = {name:'Tester 1'}
  const chr2 = {name:'Tester 2'}
  Message.send(chr1, chr2, 'This% is== "a" test=.')
  Message.send(chr2, chr1, 'This [is] a) (repl+y,')
  t.is(Message.data.length, 2);
  t.is(Message.data[0].body, 'This is a test.');
  t.is(Message.data[1].body, 'This is a reply,');
  Message.resetMsgs()
});

test('messagesFor', t => {
  const chr1 = {name:'Tester 1'}
  const chr2 = {name:'Tester 2'}
  Message.send(chr1, chr2, 'This is a test')
  Message.send(chr2, chr1, 'This is a reply')
  t.is(Message.messagesFor(chr1).length, 1);
  t.is(Message.messagesFor(chr1)[0].body, 'This is a reply');
  t.is(Message.messagesFor(chr2)[0].body, 'This is a test');
  Message.resetMsgs()
});

test('messagesAsHtml', t => {
  const chr1 = new Char({name:'Tester 1'})
  const chr2 = {name:'Tester 2'}
  const chr3 = {name:'Tester 3'}
  Message.send(chr1, chr2, 'This is a test')
  Message.send(chr2, chr1, 'This is a reply')
  Message.send(chr3, chr2, 'This is not a test')
  Message.send(chr2, chr3, 'This is not a reply')
  const ary = chr1.getMessages()
  t.is(ary.length, 2);
  t.is(ary[0].type, 'sent');
  t.is(ary[1].type, 'received');
  Message.resetMsgs()
});

