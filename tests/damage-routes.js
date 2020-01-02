import test from 'ava';

const [Char] = require('../models/char.js')
const [AttackConsts, Attack] = require('../models/attack.js')
const [Log] = require('../models/log.js')
const [damagePostFun] = require('../routes/damage');

Log.debug = true

const mockAttacker = new Char({name: "Tester0", protectedFromFire:2, attacks:[
  new Attack("Weapon", {primaryDamage:4}),
]})
const mockTarget1 = new Char({name: "Tester1", protectedFromFire:2})
const mockTarget2 = new Char({name: "Tester2", protectedFromFire:2})
const mockTarget3 = new Char({name: "Tester3", protectedFromFire:2})

const mockChars = [mockAttacker, mockTarget1, mockTarget2, mockTarget3]

const mockApp = {
  get:function(s) {
    if (s === 'chars') return this.chars;
    throw new Error("MockAppException", "Unknown request: " + s)
  },
  chars:mockChars,
}

const mockNext = function() {}


test('two plain hits', t => {
  const req = {
    app:mockApp,
    body:{
      name:"Tester0",
      attack:"Weapon",
      Tester1_primary:AttackConsts.PLAIN_HIT,
      Tester1_damage:4,
      Tester3_primary:AttackConsts.PLAIN_HIT,
      Tester3_damage:5,
    },
  }
  const res = { 
    destination:false,
    redirect:function(s) { this.destination = s; },
  }
  damagePostFun(req, res, mockNext)
  
  t.is(res.destination, '/encounter')
  t.is(mockTarget1.hits, 16)
  t.is(mockTarget2.hits, 20)
  t.is(mockTarget3.hits, 15)
});

test('one plain hit one secondary', t => {
  const req = {
    app:mockApp,
    body:{
      name:"Tester0",
      attack:"Weapon",
      secondary_damage:2,
      Tester1_primary:AttackConsts.PLAIN_HIT,
      Tester1_damage:4,
      Tester2_secondary:AttackConsts.PLAIN_HIT,
    },
  }
  const res = { 
    destination:false,
    redirect:function(s) { this.destination = s; },
  }
  damagePostFun(req, res, mockNext)
  
  t.is(res.destination, '/encounter')
  t.is(mockTarget1.hits, 12)
  t.is(mockTarget2.hits, 18)
  t.is(mockTarget3.hits, 15)

});
