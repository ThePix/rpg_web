'use strict';

const assert = require('assert')


/*const folder = require('../settings.js').folder
const settings = require('../' + folder + '/settings.js')
const weapon_data = require('../' + folder + '/weapons.js')
const package_data = require('../' + folder + '/packages.js')*/

const sqlite3 = require('sqlite3')


 
describe('DB', function() {
  it('testDB is being tested', function(done) {
    let result = 'not set'
    const db = new sqlite3.Database('./db/chinook.db', (err) => {
      if (err) {
        console.error(err.message)
        result = err.message
      }
      else {
        result = 'Good'
      }
      console.log('Connected to the chinook database.')

      db.close((err) => {
        if (err) {
          console.error(err.message);
        }
        console.log('Close the database connection.')
      })
      assert.equal(result, 'Good')
      done()
    })
  })
})
