const assert = require('assert')

const [Char] = require('../models/char.js')
const [AttackConsts, Attack] = require('../models/attack.js')
const [Log] = require('../models/log.js')
const [damagePostFun] = require('../routes/damage');

Log.debug = true

const mockAttacker = new Char({name:"Tester0", protectedFromFire:2})
mockAttacker.update()
mockAttacker.attacks = [new Attack("Weapon", {primaryDamage:4})]
const mockTarget1 = new Char({name:"Tester1", protectedFromFire:2})
const mockTarget2 = new Char({name:"Tester2", protectedFromFire:2})
const mockTarget3 = new Char({name:"Tester3", protectedFromFire:2})
mockTarget1.hits = 20
mockTarget2.hits = 20
mockTarget3.hits = 20

const mockChars = [mockAttacker, mockTarget1, mockTarget2, mockTarget3]

const mockApp = {
  get:function(s) {
    if (s === 'chars') return this.chars;
    throw new Error("MockAppException", "Unknown request: " + s)
  },
  chars:mockChars,
}

const mockNext = function() {}


describe('Damage routes', function() {


it('two plain hits', function() {
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
  
  assert.equal(res.destination, '/encounter')
  assert.equal(mockTarget1.hits, 16)
  assert.equal(mockTarget2.hits, 20)
  assert.equal(mockTarget3.hits, 15)
});

it('one plain hit one secondary', function() {
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
  
  assert.equal(res.destination, '/encounter')
  assert.equal(mockTarget1.hits, 12)
  assert.equal(mockTarget2.hits, 18)
  assert.equal(mockTarget3.hits, 15)

});


})