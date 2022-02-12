'use strict';

const assert = require('assert')

const folder = require('../settings.js').folder
const settings = require('../' + folder + '/settings.js')
const weapon_data = require('../' + folder + '/weapons.js')
const package_data = require('../' + folder + '/packages.js')

function checkData(name, ary, names, result) {
  for (let d of ary) {
    if (d === undefined) {
      result.push('Null entry in ' + name + ' - check of double commas')
      continue
    }
    for (let s of names) {
      if (d[s] === undefined) result.push('Missing value for ' + s + ' in ' + name)
    }
  }
}


describe('Settings', function() {
  it('should have no warnings', function() {
    const result = []
    checkData("weapons", weapon_data, ['name', 'damage', 'atts'], result)
    checkData("packageGroups", settings.packageGroups, ['name', 'display', 'comment'], result)
    checkData("packages", package_data, ['name', 'category', 'bonuses'], result)
    checkData("skills", settings.skills, ['name', 'note'], result)
    
    const categories = settings.packageGroups.map(el => el.name)
    for (let d of package_data) {
      if (!categories.includes(d.category)) result.push('Unknown category ' + d.category + ' in packages')
    }
    
    if (result.length > 0) console.log('\n\n' + result + '\n\n')
    
    assert.equal(result.length, 0);
  })
})
