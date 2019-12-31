"use strict";

const PORT = 8091
const REFRESH = 10

//const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const favicon = require('serve-favicon');
//const webpush = require('web-push');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const charsRouter = require('./routes/chars');
const encounterRouter = require('./routes/encounter');
const attackRouter = require('./routes/attack');
const damageRouter = require('./routes/damage');
const chalk = require('chalk');
const [Log] = require('./models/log.js')
//const log = new Log()

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

//app.set('log', log)

const [AttackConsts, Attack, WeaponAttack] = require('./models/attack.js')
const [Char] = require('./models/char.js')
const [chars, stocks] = require('./data.js')


app.set('refresh', REFRESH)
app.set('chars', chars)
app.set('stocks', stocks)
app.set('fields', Char.fields())



app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/chars', charsRouter);
app.use('/encounter', encounterRouter);
app.use('/attack', attackRouter);
app.use('/damage', damageRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log("Error!!!")
  next(createError(req, res));
});

const createError = function(req, res) {
  res.render('404', {});
}

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
const ip = require("ip");
Log.add("secret", "Loaded " + chars.length + " characters")
Log.add('secret', 'Refresh is ' + REFRESH + ' seconds')
Log.add("title", "Go to " + ip.address() + ":" + PORT + " to access the web site")

module.exports = app;



