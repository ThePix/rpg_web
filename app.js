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
  {name:"Unarmed", damage:"d4", atts:"mX", desc:"Useful when you have lost your weapons! Skill in unarmed will increase damage."},
  {name:"Dagger", damage:"d6", atts:"mF", desc:"Can be concealed"},
  {name:"Short sword", damage:"2d6", atts:"mF", desc:"Use if you want to go first; bonus to initiative"},
  {name:"Broad sword", damage:"3d6", atts:"m", desc:"Also scimitar, long sword, etc. Good for unarmed foes"},
  {name:"2H sword", damage:"3d8", atts:"m2X", desc:"Requires skill, but does good damage, especially to unarmed foes"},
  {name:"Wood axe", damage:"d8", atts:"mS", desc:"Cheap and readily available!"},
  {name:"Battle axe", damage:"d10", atts:"mS", desc:"Good against armoured foes, but slow"},
  {name:"Great axe", damage:"2d10", atts:"m2SX", desc:"Requires skill, but does good damage, especially to unarmed foes"},
  {name:"Club", damage:"2d4", atts:"m", desc:"Includes improvised weapons"},
  {name:"Mace", damage:"d10", atts:"m", desc:"Good against armed foes"},
  {name:"Morning star", damage:"2d8", atts:"m", desc:"All round weapon"},
  {name:"Flail", damage:"d12", atts:"m2XY", desc:"Requires skill, especially good against armoured foes with shields"},
  {name:"Quarterstaff", damage:"2d4", atts:"mD", desc:"Good for defense"},
  {name:"Warhammer", damage:"2d10", atts:"mS", desc:"Slow but good damage"},
  {name:"2H hammer", damage:"2d12", atts:"m2SX", desc:"Lots of damage, but slow and requires skill"},
  {name:"Spear", damage:"2d8", atts:"mRXS", desc:"Extra reach, can be used as a thorn weapon too (also javelin or trident)"},
  {name:"Polearm", damage:"3d8", atts:"mRXS", desc:"Extra reach"},
  {name:"Halberd", damage:"3d6", atts:"mRXSH", desc:"Extra reach, and can be used to hook a foe"},
  {name:"Whip", damage:"4d4", atts:"mRXS", desc:"Requires skill, but good against unarmed and extra reach"},
  {name:"Bull whip", damage:"4d4", atts:"mRRXS]", desc:"As whip, but even more reach"},
  {name:"Thrown rock", damage:"d4", atts:"r", desc:"Or anything of a decent size and weight to throw"},
  {name:"Thrown dagger", damage:"d6", atts:"rF", desc:"Can be thrown fast"},
  {name:"Thrown spear", damage:"3d6", atts:"r", desc:"Good damage, but limited to one or two a combat"},
  {name:"Sling", damage:"2d4", atts:"rM", desc:"Cheap ammo"},
  {name:"Short bow", damage:"2d6", atts:"rFX", desc:"Fast reload"},
  {name:"Long bow", damage:"3d6", atts:"rFMX", desc:"Takes a minor action to reload, but decent damage against unarmoured"},
  {name:"Light crossbow", damage:"d12", atts:"rMX", desc:"Takes a minor action to reload, but decent against armoured foes"},
  {name:"Heavy crossbow", damage:"d20", atts:"rLX", desc:"Takes a full standard action to reload, but good against armoured foes"},
  {name:"Arquebus", damage:"2d20", atts:"fLL", desc:"Very noisy. Takes two full standard actions to reload, and expensive to use, but look at all the damage!"},
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



