'use strict';

const [Package, BonusStat, PenaltyStat, BonusSkill, PenaltySkill, BonusAttack, BonusWeaponAttack, BonusEffect] = require('../models/package.js')



/*
progression: How this bonus changes as you gain levels
notes: Array of comments
type: spell (must be cast)/ability (must be used)/attribute (default; bonus to the skill, etc.))
mode: set to max if the player only gets the highest value across packages, rather than the total


E - Expertise. Gives a permanent bonus to a skill or resistance.
C - Change. A permanent change to the character.
S - Spell.
F - Flourish. A special trick that the character can perform (if you consider it a non-magical spell, you will not be far wrong!).
R - Ritual. A ritual is a spell that takes a significant time to complete (at least ten minutes and possibly days). Normal spell rules do not apply.
A - Ability. Like a flourish, but takes a while to perform.
X - Special rules apply.
r - An on-going spell/flourish that will last one round, until the end of your next turn .
o - An on-going spell/flourish that will last a number of rounds.
e - Spell/flourish can only be used once per encounter.
m - Spell/flourish can be performed as a minor action.
f - Spell/flourish can be performed as a free action.
a - Spell/flourish can be performed as an addition to another action.
p - Spell/flourish can be performed as an opportunity attack.
l - An instant spell/flourish, but the effect is lasting, until cured (just as a weapon attack is instant, but the damage is still there until cured).
x - Special rules apply.
1 - once per encounter



*/


const packages = [
  new Package('Fencer', {
    category:'Combat',
    notes:[
      'The fencer uses a rapier and finesse to defeat a foe.'
    ],
    hitsPerLevel:1,
    extraWeapon:3,
    bonuses:[
      new BonusStat('attack', {progression:'primary', mode:'max'}),
      new BonusWeaponAttack('Easy strike', {
        progression:5,
        flags:'Fa',
        bonus:-2,
        damage:'2d6+2',
        notes:'Bonus +2 to hit and +2 damage if the target gives CA or is immobilised.',
        weaponCheck:function(weapon) { 
          return weapon.name === 'Rapier'
        },
      }),
      new BonusWeaponAttack('Defensive stance', {
        progression:5,
        flags:'Fa',
        bonus:-2,
        // +2 to reflex
        notes:'Penalty -2 to hit, but +2 to reflex until the start of your next round.',
        weaponCheck:function(weapon) { 
          return weapon.name === 'Rapier'
        },
      }),
      new BonusWeaponAttack('Dancing blade', {
        progression:5,
        flags:'Fa',
        bonus:-3,
        // +2 to reflex
        notes:'Attack up to three targets.',
        primaryMax:3,
        weaponCheck:function(weapon) { 
          return weapon.name === 'Rapier'
        },
      }),
      new BonusWeaponAttack('Disarming strike', {
        progression:5,
        flags:'Fa',
        bonus:2,
        notes:'Reliable. Once per encounter. Target\'s weapon flies from his hands, landing d6 squares away (your choice of direction).',
        weaponCheck:function(weapon) { 
          //console.log(weapon.name + "..." + weapon.is('fast'));
          return weapon.name === 'Rapier'
        },
      }),
      new BonusWeaponAttack('Strike of finesse', {
        progression:5,
        flags:'Fa',
        damage:'3d8',
        notes:'Reliable. Once per encounter. With an elegant flourish, you impale your foe.',
        weaponCheck:function(weapon) { 
          //console.log(weapon.name + "..." + weapon.is('fast'));
          return weapon.name === 'Rapier'
        },
      }),
    ],
  }),
  



  
  

  new Package('Brawler', {
    category:'Combat',
    notes:[
      'The brawler is a tough fighter who uses a knife and unarmed attackers, getting in close to his foe. He protects his comrades by drawing foes to himself.'
    ],
    hitsPerLevel:3,
    extraWeapon:3,
    bonuses:[
      new BonusStat('attack', {progression:'primary', mode:'max'}),
      new BonusAttack('Mark', {progression:5, flags:'Fof', notes:[
        'Marked foe is at -2 when an attack does not target you, in addition you get an Opportunity attack if the target makes an an attack that does not target you or if the target moves or shifts under his own volition (opportunity attack stops the move if successful)',
      ]}),
      new BonusWeaponAttack('Draw in', {
        progression:5,
        flags:'F', 
        weaponCheck:function(weapon) { 
          return weapon.is('melee');
        },
        notes:'On successful attack, you and foe move one square in your direction',
      }),

      new BonusWeaponAttack('Attack to Distract', {
        progression:8,
        flags:'F',
        bonus:-4,
        // -3 to target
        weaponCheck:function(weapon) { 
          return weapon.is('melee');
        },
        notes:'Take a -4 penalty to your attack, but your target is at -3 to all attacks until the start of your next turn.',
      }),

      new BonusAttack('Throw off', {
        progression:8,
        flags:'F',
        weaponCheck:function(weapon) { 
          return weapon.is('melee');
        },
        notes:'Only when grappled. On success foe is thrown back one square.',
      }),
      
      
      new BonusWeaponAttack('Inner strength', {
        progression:5,
        flags:'F1',
        weaponCheck:function(weapon) { 
          return weapon.is('melee');
        },
        notes:'Once per encounter, recovery third of your total hits',
      }),
      
      new BonusWeaponAttack('Threatening rush', {
        progression:5,
        flags:'F1',
        weaponCheck:function(weapon) { 
          return weapon.is('melee');
        },
        notes:'Once per encounter, charge at least three squares. Any adjacent foe is marked and cannot have CA against you until the start of your next turn or you move, whichever is first',
      }),
    ],
  }),




  new Package('Knifer', {
    category:'Combat',
    notes:[
      'An opportunist, the knifer waits for the right moment to get maximum damage.'
    ],
    hitsPerLevel:1,
    extraWeapon:3,
    bonuses:[
      new BonusStat('attack', {progression:'primary', mode:'max'}),
      new BonusWeaponAttack('Sneak attack', {
        progression:5,
        flags:'Fa',
        damage:'3d6',
        notes:'Bonus 2d6 damage on a successful hit, once per turn, when you have combat advantage.',
        weaponCheck:function(weapon) { 
          return weapon.is('fast');
        },
      }),
      new BonusWeaponAttack('Measured strike', {
        progression:5,
        flags:'F',
        bonus:-2,
        weaponCheck:function(weapon) { 
          return weapon.is('melee');
        },
        notes:'Attack at -2 while you take the measure of your foe. Next turn you gain CA against him.',
      }),
      new BonusWeaponAttack('Fading strike', {
        progression:5,
        flags:'F',
        weaponCheck:function(weapon) { 
          return weapon.is('melee');
        },
        notes:'On a hit, you can shift two squares to a square not adjacent to an enemy',
      }),
      new BonusWeaponAttack('Spinning blade', {
        progression:5,
        flags:'F',
        primaryMax:8,
        weaponCheck:function(weapon) { 
          return weapon.is('melee');
        },
        notes:'Once per encounter. Attack all adjacent foes, then shift up to 2 squares, which can be though a foe-occupied square.',
      }),
    ],
  }),



  new Package('Wrestler', {
    category:'Combat',
    notes:[
      'An unarmed fighter, the wrestler tries to grab a foe, and once he has him held, can cause a lot of damage.'
    ],
    hitsPerLevel:2,
    extraWeapon:3,
    bonuses:[
      new BonusStat('attack', {progression:'primary', mode:'max'}),
      new BonusAttack('Grapple', {
        progression:5,
        flags:'Fa',
        notes:'Target is held on a successful hit, once per turn, when you have combat advantage.',
      }),
      new BonusAttack('Low blow', {
        progression:5,
        damage:'2d8',
        flags:'Fa',
        notes:'Target must be "normal" human; limited to once per encounter per foe. A swift knee to the groin makes the target think twice about having children.',
      }),
      new BonusAttack('Throw', {
        progression:5,
        flags:'F',
        bonus:4,
        damage:'268',
        secondaryDamage:'2d6',
        secondaryMax:2,
        notes:'Target must by held; once per encounter. Target is thrown up to three squares. Can be throw at another foe or two adjacent foes within three squares.',
      }),
      new BonusAttack('Knockdown', {
        progression:5,
        flags:'F',
        damage:'2d6',
        notes:'Target must by held. On a successful hit, target is knocked to the ground. On failure target is still held (except on natural 1).',
      }),
      new BonusAttack('Bear hug', {
        progression:5,
        damage:'2d6',
        bonus:2,
        flags:'F',
        notes:'Target must be held, and is still held at the end of the attack, whether successful or not (except on natural 1).',
      }),
    ],
  }),





  new Package('Gunslinger', {
    category:'Combat',
    notes:[
      'Using a firearm.'
    ],
    hitsPerLevel:2,
    extraWeapon:3,
    bonuses:[
      new BonusStat('attack', {progression:'primary', mode:'max'}),
      new BonusSkill('Overwatch', {
        progression:5,
        flags:'F',
        notes:'Target must be in cover, character can take no further action this turn. Until the start of your next turn, get OAon the target if he breaks cover (including taking a shot inyour direction)',
        weaponCheck:function(weapon) { 
          return weapon.is('firearm');
        },
      }),
      new BonusSkill('Aiming', {
        progression:5,
        flags:'Fa',
        notes:'Take an action to aim carefully at a target. Gain +2 to subsequent shots on that target, until you move (but can shift), make another standard action, change weapons. Not cummulative!',
        weaponCheck:function(weapon) { 
          return weapon.is('firearm');
        },
      }),
      new BonusSkill('Go for the head', {
        progression:5,
        flags:'Fa',
        bonus:-2,
        bonusDamage:'4',
        notes:'Target must not be in cover (or otherwise get a bonus to defence due to an obstruction between you). Take a -2 penalty to hit, but a +4 bonus to damage if you do.',
        weaponCheck:function(weapon) { 
          return weapon.is('firearm');
        },
      }),
    ],
  }),




]





module.exports = packages



