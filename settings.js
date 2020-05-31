'use strict';

const settings = {
  port:8091,
  refresh:5,
  maxMessages:20,
  pointsPerLevel:3,
  bonusPoints:3,
  startLevel:3,
  maxWeaponLines:2,
  logLength:20,
  packageGroups:[
    {name:'Combat', display:'Combat', comment:'Probably every character should get at least a few levels in one of these.'},
    {name:'Magic', display:'Spell casting', comment:'A character with any of these will be considered a spell-caster.'},
    {name:'Natural magic', display:'Magical prowess', comment:'Using the nature of the world around you, without actually casting spells.'},
    {name:'Utility', display:'Utility', comment:'Bonuses and specialisations.'},
    {name:'Body', display:'Body', comment:'The character\'s body is different... Players should work out a background to explain why.'},
  ],
}

module.exports = settings;