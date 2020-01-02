import test from 'ava';

const [Char] = require('../models/char.js')
const [AttackConsts, Attack] = require('../models/attack.js')
const [Log] = require('../models/log.js')
const [attackGetFun, attackPostFun] = require('../routes/attack');

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


test('one primary target', t => {
  const req = {
    app:mockApp,
    body:{
      name:"Tester0",
      attack:"Weapon",
      Tester1_pri:'yes',
      Tester1_roll:4,
      Tester1_bonus:2,
    },
  }
  const res = { 
    name:false,
    data:false,
    render:function(name, data) { this.data = data; this.name = name; },
  }
  attackPostFun(req, res, mockNext)
  
  t.is(res.name, 'damage')
  t.is(res.data.primary.length, 1)
  t.is(res.data.primary[0].name, "Tester1")
  t.is(res.data.primary[0].tmp_roll, 4)
  t.is(res.data.primary[0].tmp_bonus, 2)
  t.is(res.data.primary[0].tmp_primary, AttackConsts.PLAIN_MISS)
  t.is(res.data.secondary.length, 0)
});


test('two secondary targets', t => {
  const req = {
    app:mockApp,
    body:{
      name:"Tester0",
      attack:"Weapon",
      Tester2_sec:'yes',
      Tester3_sec:'yes',
      roll:10,
      bonus:3,
    },
  }
  const res = { 
    name:false,
    data:false,
    render:function(name, data) { this.data = data; this.name = name; },
  }
  attackPostFun(req, res, mockNext)
  
  t.is(res.name, 'damage')
  t.is(res.data.primary.length, 0)
  t.is(res.data.secondary.length, 2)
  t.is(res.data.secondary[0].name, "Tester2")
  t.is(res.data.secondary[0].tmp_secondary, AttackConsts.PLAIN_HIT)
});