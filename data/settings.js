'use strict';

const settings = {
  port:8091,
  refresh:5,
  maxMessages:20,
  pointsPerLevel:3,
  bonusPoints:3,
  startLevel:3,
  maxWeaponLines:2,  // maximum number of weapons will be two times this
  logLength:20,
  defaultWeapon:'Dagger',
  charFilename:'chars',
  saveFilename:'saved_data/save',
  logFilename:'saved_data/log',
  packageGroups:[
    {name:'Combat', display:'Combat', comment:'Probably every character should get at least a few levels in one of these.'},
    {name:'Magic', display:'Spell casting', comment:'A character with any of these will be considered a spell-caster.'},
    {name:'Natural magic', display:'Magical prowess', comment:'Using the nature of the world around you, without actually casting spells.'},
    {name:'Utility', display:'Utility', comment:'Bonuses and specialisations.'},
    {name:'Body', display:'Body', comment:'The character\'s body is different... Players should work out a background to explain why.'},
    {name:'NPC', display:'NPN Only', comment:'These are only available to NPCs.', npcOnly:true},
  ],
  skills: [
    {name: 'Arcana', note: 'Knowledge of spell casting principles, including rituals. May also give knowledge of great artefacts, wizards and magical phenomena.'},
    {name: 'Acrobatics', note: 'Athletic skills that depend on agility, such as jumping, climbing.'},
    {name: 'Alchemy', note: 'Knowledge of the magic inherent in things, and how to harness that magic, in particular in the brewing of potions.'},
    {name: 'Animal handling', note: 'Skill at driving and taming animals. See also riding.'},
    {name: 'Etiquette', note: 'The ability to fit in, in high society. A high skill would give the character contacts in the royal court, and possibly abroad too.'},
    {name: 'Grappling', note: 'Grabbing and holding an opponent.'},
    {name: 'Healing', note: 'Basic first aid.'},
    {name: 'Lore', note: 'History and geography, legends and myths. A character will know more about his or her own culture.'},
    {name: 'Nature', note: 'Knowledge of plants and animals, including what is safe to eat and what to avoid.'},
    {name: 'Religion', note: 'Knowledge of religion; its history, rites, beliefs.'},
    {name: 'Perception', note: 'A character with a high ability has a better chance of seeing, hearing or smelling something.'},
    {name: 'Persuade', note: 'The ability to convince an NPC (includes diplomacy, intimidate and bluff).'},
    {name: 'Pick lock', note: 'The ability to pick locks.'},
    {name: 'Riding', note: 'The ability to act (for example, attack a foe, shoot an arrow) whilst riding a beast. All characters are assumed to have the skill to ride a horse along a road.'},
    {name: 'Subterfuge', note: 'Skill at chicanery (but see also Persuade, Pick lock and Sneak).'},
    {name: 'Survival', note: 'Skill at staying alive in hostile environments.'},
    {name: 'Sneak', note: 'The ability to hide and to move silently.'},
    {name: 'Streetwise', note: 'The ability to fit in, in the criminal underworld. A high skill would give the character underworld contacts.'},
    {name: 'Strength', note: 'The ability to lift and break stuff.'},
    {name: 'Swim', note: 'The ability to swim, duh.'},
  ],
}

module.exports = settings;