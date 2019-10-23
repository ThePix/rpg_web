const PORT = 8090

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const charsRouter = require('./routes/chars');
const encounterRouter = require('./routes/encounter');
const attackRouter = require('./routes/attack');

const app = express();

const requestTime = function (req, res, next) {
  const d = new Date()
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  const s = d.getSeconds().toString().padStart(2, '0')
  req.timestamp = h + ":" + m + ":" + s
  next()
}


const DEFAULT_CHAR = {
  turnCount:0,
  will:0,
  reflex:0,
  stamina:0,
  none:0,
  hits:20,
  shield:0,
  armour:0,
  pc:false,
  current:false,
  name:false,
  display:false,
  link:false,
  next:false,
  attacks:[],
}

// a character can be given an afterTurn5 attribute, for example, to have something happen when it gets to turn 5.
class Char {
  constructor(data, attacks) {
    for (let key in DEFAULT_CHAR) this[key] = data[key] || DEFAULT_CHAR[key]
    if (this.maxHits === undefined) this.maxHits = this.hits
  }
  
  delay(chars) {
    const oneBefore = chars.find(el => el.next === this.name)
    oneBefore.next = this.next
    console.log(oneBefore.name)

    let oneAfter
    do {
      oneAfter = chars.find(el => el.name === this.next)
    } while (oneAfter.disabled)
    oneAfter.current = true
  
    this.current = false
    this.next = oneAfter.next
  
    oneAfter.next = this.name
    console.log(oneAfter.name)
  }
  
  nextChar(chars) {
    let char
    do {
      char = chars.find(el => el.name === this.next)
      char.current = true
      this.current = false
    } while (char.disabled)
    this.turnCount++
    if (this['afterTurn' + this.turnCount]) this['afterTurn' + this.turnCount]()
  }
  
  status() {
    if (this.link) return "-"
    return "Great!"
  }
  
  alias() {
    return this.display ? this.display : this.name
  }
}

// An attack can be against:
// one target
// multiple targets
// one primary target and multiple secondary targets
// each attack on a primary target gets its own roll
// all attacks on secondary targets use the same roll
//
// primaryMax: max number of primary targets
// secondaryNo: max number of secondary targets
// bonus: attack bonus
// primaryDamage
// secondaryDamage
// resistanceType: stamina, reflex, will, none
// primaryResolve: The primary attack success of fail
// secondaryResolve: The secondary attack success of fail
// rollForSecondary: The secondary attack requires a dice roll (and may have a bonus)


const DEFAULT_ATTACK = {
  primaryMax:1,
  secondaryMax:0,
  primaryMin:0,
  secondaryMin:0,
  bonus:0,
  primaryDamage:'d4',
  secondaryDamage:'-',
  primaryResolve:false,
  secondaryResolve:false,
  rollForSecondary:true,
  resist:'reflex'
}


class Attack {
  constructor(name, data) {
    this.name = name
    for (let key in DEFAULT_ATTACK) this[key] = data[key] || DEFAULT_ATTACK[key]
  }

}

class WeaponAttack extends Attack {
  constructor(name, skill) {
    super(name, {})
    this.weapon = WEAPONS.find(el => el.name === name)
    if (this.weapon === undefined) throw "Unknown weapon: " + name
    this.primaryDamage = this.weapon.damage
    this.bonus = skill
  }

}
    

const WEAPONS = [
  {name:"Unarmed", damage:"d4", atts:"mX"},
  {name:"Broad sword", damage:"3d6", atts:"m"},
  {name:"Warhammer", damage:"2d10", atts:"mS"},
]



// A char may have more than one place in the list
const chars = [
  new Char({name:"Lara", hits:45, next:'Goblin1', pc:true, current:true, attacks:[
      new Attack("Fireball", {primaryMax:999}),
      new Attack("Psych-ball", {secondaryMax:999, resist:"will", secondaryDamage:'d6'}),
  ]}),
  new Char({name:"Goblin1", hits:35, next:'Kyle', attacks:[
      new WeaponAttack("Broad sword", 2),
      new WeaponAttack("Unarmed", 2),
  ]}),
  new Char({name:"Kyle", hits:20, next:'Ogre', pc:true, attacks:[
      new WeaponAttack("Broad sword", 2),
      new WeaponAttack("Unarmed", 2),
  ]}),
  new Char({name:"Ogre", hits:35, next:'Serpent', attacks:[
      new WeaponAttack("Warhammer", 2),
      new WeaponAttack("Unarmed", 2),
  ]}),
  new Char({name:"Serpent", link:'Kyle', next:'Jon', attacks:[
      new WeaponAttack("Unarmed", 5),
  ]}),
  new Char({name:"Jon", hits:35, next:'Goblin2', pc:true, attacks:[
      new WeaponAttack("Warhammer", 2),
      new WeaponAttack("Unarmed", 2),
  ]}),
  new Char({name:"Goblin2", hits:35, next:'Serpent_redux', disabled:true, attacks:[
      new WeaponAttack("Broad sword", 2),
      new WeaponAttack("Unarmed", 2),
  ]}),
  new Char({name:"Serpent_redux", link:'Kyle', next:'Lara',display:'Serpent'}, []),
]

console.log(chars[3])
//chars[3].delay(chars)

const fields = [
  { name:'maxHits', type:'int', display:"Hits",},
  { name:'hits', type:'int', display:"Max. hits"},
  { name:'disabled', type:'bool', display:"Not active"},
]

//chars[0].nextChar(chars)

console.log(chars.length)


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.set('chars', chars)
app.set('fields', fields)

app.use(logger('dev'));
app.use(requestTime)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/favicon.png', express.static('images/favicon.png'));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/chars', charsRouter);
app.use('/encounter', encounterRouter);
app.use('/attack', attackRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(PORT)
console.log("Listening on post " + PORT)

module.exports = app;



