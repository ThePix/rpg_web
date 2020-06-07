'use strict';

const settings = require('../data/settings.js')
const chalk = require('chalk');
const fs = require('fs');

class Log {
  
  static add(a, b) {
    if (this.data === undefined) this.data = []
    if (b === undefined) {
      b = a
      a = 'msg'
    }
    const c = new Date(Date.now()).toLocaleTimeString('en-US')
    this.data.push({type:a, text:b, timestamp:c})

    if (!this.debug) {
      switch (a) {
        case 'title': console.log(''); console.log(chalk.yellowBright(b)); break;
        case 'msg': console.log(chalk.yellow(b)); break;
        case 'secret': console.log(chalk.gray(b)); break;
        case 'comment': console.log(chalk.cyanBright(b)); break;
      }
    }

    fs.appendFile('log.txt', a + '~' + b + '~' + c, function (err) {
      if (err) throw err;
    });    

    this.last = b  // useful for tests!
  }
  
  static getData(n) {
    if (n === undefined) n = this.data.length
    return this.data.slice(this.data.length - n, this.data.length).reverse()
  }
  
  /*static recover() {
    fs.readFile('log.txt', function(err, s) {
      if (err) throw err;
      const ary = String(s).split('\n')
      this.data = ary.map(function(el) {
        const vals = el.split('~')
        return {type:vals[0], text:vals[1], timestamp:vals[2]}
      })
    });  
  }*/
} 


module.exports = [Log]

