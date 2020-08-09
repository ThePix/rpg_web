'use strict';

const settings = {
  port:8091,
  refresh:5,
  maxMessages:20,
  pointsPerLevel:3,
  bonusPoints:0,
  baseHits:20,
  title:'RPG-1898',
  startLevel:5,
  movement:5,
  maxWeaponLines:2,  // maximum number of weapons will be two times this
  logLength:20,
  defaultWeapon:'Dagger',
  charFilename:'chars',
  saveFilename:'saved_data/save',
  logFilename:'saved_data/log',
  stocksFolder:'stocks',
  pdfAtts:["Hits", "Attack", "Init", "Reflex", "Stamina", "Will", "Movement"],
  packageGroups:[
    {name:'Combat', display:'Combat', comment:'Probably every character should get at least a few levels in one of these.'},
    {name:'Utility', display:'Utility', comment:'Bonuses and specialisations.'},
    {name:'Magic', display:'Spell casting', comment:'A character with any of these will be considered a spell-caster.'},
    {name:'NPC', display:'NPC Only', comment:'These are only available to NPCs.', npcOnly:true},
  ],
  skills: [
    {name: 'Acrobatics', note: 'Athletic skills that depend on agility, such as jumping, climbing.'},
    {name: 'Creativity', note: 'The ability to create art (in a general sense).'},
    {name: 'Education', note: 'How long the character was in formal education, giving skill at reading and writing; mathematics.'},
    {name: 'Etiquette', note: 'The ability to fit in, in high society. A high skill would give the character contacts in the royal court, and possibly abroad too. Also includes knowledge of high culture.'},
    {name: 'Healing', note: 'Basic first aid.'},
    {name: 'Nature', note: 'Knowledge of plants and animals, including what is safe to eat and what to avoid.'},
    {name: 'Occult', note: 'Knowledge of the occult, possibly including rituals. May also give knowledge of great artefacts, wizards and magical phenomena.'},
    {name: 'Perception', note: 'A character with a high ability has a better chance of seeing, hearing or smelling something.'},
    {name: 'Persuade', note: 'The ability to convince an NPC (includes diplomacy, intimidate and bluff).'},
    {name: 'Pick lock', note: 'The ability to pick locks.'},
    {name: 'Riding', note: 'The ability to act (for example, attack a foe, shoot an arrow) whilst riding a beast. Also, skill at driving and taming animals.'},
    {name: 'Subterfuge', note: 'Skill at chicanery (but see also Persuade, Pick lock and Sneak).'},
    {name: 'Sneak', note: 'The ability to hide and to move silently.'},
    {name: 'Streetwise', note: 'The ability to fit in, in the criminal underworld. A high skill would give the character underworld contacts.'},
    {name: 'Strength', note: 'The ability to lift and break stuff.'},
    {name: 'Swim', note: 'The ability to swim, duh.'},
    {name: 'Technology', note: 'Knowledge of steam engines, pneumatic systems, electricity.'},
  ],
}

module.exports = settings;