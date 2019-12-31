'use strict';

const chalk = require('chalk');

class Log {
  
  static add(a, b) {
    if (this.data === undefined) this.data = []
    if (b === undefined) {
      b = a
      a = 'msg'
    }
    this.data.push({type:a, text:b, timestamp:new Date(Date.now()).toLocaleTimeString('en-US')})
    switch (a) {
      case 'title': console.log(''); console.log(chalk.yellowBright(b)); break;
      case 'msg': console.log(chalk.yellow(b)); break;
      case 'secret': console.log(chalk.gray(b)); break;
      case 'comment': console.log(chalk.cyanBright(b)); break;
    }
  }
  
  static getData(n) {
    if (n === undefined) n = this.data.length
    return this.data.slice(this.data.length - n, this.data.length).reverse()
  }
} 


module.exports = [Log]

