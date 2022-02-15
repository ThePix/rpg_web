'use strict';

const assert = require('assert')

const folder = require('../settings.js').folder
/*const settings = require('../' + folder + '/settings.js')
const weapon_data = require('../' + folder + '/weapons.js')
const package_data = require('../' + folder + '/packages.js')*/

const [db] = require('../models/db.js')

const [Message] = require('../models/message.js')





 
describe('DB', function() {
  /*it('testDB is being tested', function(done) {
    db.getData(2, 'playlists', './db/chinook.db', function (result){
      console.log(result)
      assert.equal(result.Name, 'Movies')
      assert.equal(result.PlaylistId, 2)
      done()
    })
  })*/

  it('testDB is being tested', function(done) {
    db.getData(2, 'playlists', './db/chinook.db').then(function(result) {
      console.log('here3');
      console.log(result)
      assert.equal(result.Name, 'Movies')
      assert.equal(result.PlaylistId, 2)
      done()
    })
  })

  it('testDB is being tested 2', function(done) {
    db.run('SELECT * FROM playlists', './db/chinook.db')
    done()
  })

  it('testDB is being tested with messages', function(done) {
    Message.send("From one person", "To another", "with some text")
    done()
  })
})



