"use strict";

const PORT = 8090

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const favicon = require('serve-favicon');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const charsRouter = require('./routes/chars');
const encounterRouter = require('./routes/encounter');
const attackRouter = require('./routes/attack');

const app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const requestTime = function (req, res, next) {
  const d = new Date()
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  const s = d.getSeconds().toString().padStart(2, '0')
  req.timestamp = h + ":" + m + ":" + s
  next()
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'));
app.use(requestTime)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());






const [ Attack, WeaponAttack ] = require('./models/attack.js')

const [Char] = require('./models/char.js')

// A char may have more than one place in the list
const chars = [
  new Char({name:"Lara", hits:45, next:'Goblin1', pc:true, current:true, attacks:[
      new Attack("Fireball", {primaryMax:999}),
      new Attack("Psych-ball", {secondaryMax:999, resist:"will", secondaryDamage:'d6', notes:'Danger!'}),
  ]}),
  new Char({name:"Goblin1", hits:35, next:'Kyle', stunned:true, attacks:[
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
  new Char({name:"Serpent", next:'Jon', attacks:[
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
  new Char({name:"Serpent_redux", link:'Serpent', next:'Lara',display:'Serpent'}, []),
]

console.log("Loaded " + chars.length + " characters.")

app.set('chars', chars)
app.set('fields', Char.fields())



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



