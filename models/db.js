'use strict';

/*
Handle database connectons here so we can easily swap to another database later if desired.

Tables:
chars - the details for a character that could change as the character levels, but not during an encounter
encounter_chars - the details that change during an encounter; may have more than one encounter on the go
encounter

messages


*/

const sqlite3 = require('sqlite3')

const Db = {}

Db._getData = function(id, table, database, messages, callback) {
  const db = new sqlite3.Database(database, (err) => {
    if (err) {
      console.log(err.message)
      return
    }
    if (messages) console.log('Connected to the database.')
    
    const sql = 'SELECT * FROM ' + table + ' WHERE PlaylistId  = ' + id

    db.get(sql, [], (err, row) => {
      if (err) {
        callback(err)
        
      }
      if (messages) console.log(row)
      callback(row)
    });

    db.close((err) => {
      if (err) {
        console.error(err.message)
        console.error('SQL command was:')
        console.error(sql)
      }
      if (messages) console.log('Close the database connection.')
    })
  })
}

Db.getData =  async function(id, table, database, messages = true) {
  let promise = new Promise(function(res, rej) {
    Db._getData(id, table, database, messages, function (result){
      console.log(result)
      res(result)
    })
  });

  // wait until the promise returns us a value
  let result = await promise; 

  // "Now it's done!"
  console.log('here1');
  console.log(result);
  return result
}



Db.run = function(sql, database, messages) {
  const db = new sqlite3.Database(database, (err) => {
    if (err) {
      console.log(err.message)
      return
    }
    if (messages) console.log('Connected to the database.')
    db.run(sql, [], (err) => {
      if (err) {
        console.log('ERROR!', err)
        console.error('SQL command was:')
        console.error(sql)
      }
    })
    db.close((err) => {
      if (err) {
        console.error(err.message)
      }
      if (messages) console.log('Close the database connection.')
    })
  })
}


Db.insert = function(data, table, database, messages) {
  const columns = []
  const values = []
  for (const key in data) {
    columns.push(key)
    const value = data[key]
    values.push(typeof value === 'string' ? "'" + value + "'" : value.toString())
  }
  const sql = "INSERT INTO " + table + " (" + columns.join(',') + ") VALUES (" + values.join(',') + ");"
  
  Db.run(sql, database, messages)
}


module.exports = [Db]
