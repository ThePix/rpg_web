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


class Char {
  constructor(data) {
    for (let key in data) this[key] = data[key]
    if (this.maxHits === undefined) this.maxHits = this.hits
    this.turnCount = 0
  }
  
  attack(target, roll, bonus) {
    
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
class Attack {
  constructor(data) {
    for (let key in data) this[key] = data[key]
  }

}


// A char may have moree than one place in the list
const chars = [
  new Char({
    name:"Lara", hits:45, next:'Kyle', pc:true, current:true,
    attacks:[
      new Attack({
        targets:1, bonus:0, name:'Basic sword attack',
        primary:function(attacker, target, roll, bonus) {
          target.hits -= 5
          return attacker.alias() + " attacks " + target.alias() + " for 5 damage."
        }
      }),
      new Attack({targets:'n', bonus:0, name:'Fireball'}),
    ],
  }),
  new Char({name:"Cuddly", hits:35, next:'Hugs'}),
  new Char({name:"Hugs", hits:35, next:'Woofy'}),
  new Char({name:"Kyle", hits:20, next:'Jon', pc:true,}),
  new Char({name:"Jon", hits:35, next:'Cuddly', pc:true,}),
  new Char({name:"Woofy", hits:35, next:'Arthur'}),
  new Char({name:"Arthur", hits:35, next:'Woofy2'}),
  new Char({name:"Woofy2", link:'Kyle', next:'Carmel',display:'Woofy'}),
  new Char({name:"Carmel", hits:35, next:'Sandy', disabled:true, }),
  new Char({name:"Sandy", hits:35, next:'Curly'}),
  new Char({name:"Curly", hits:35, next:'Lara'}),
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



