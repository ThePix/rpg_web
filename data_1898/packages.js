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
l - An instant spell/flourish, but the effect is lasting, until cured (just as a weapon attack is instant, but the primaryDamage is still there until cured).
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
      new BonusStat('reflex', {progression:[1, 8, 17]}),
      new BonusStat('will', {progression:[1, 8, 17]}),
      new BonusStat('attack', {progression:'primary', mode:'max'}),
      new BonusWeaponAttack('Easy strike', {
        progression:5,
        flags:'Fa',
        bonus:-2,
        primaryDamage:'2d6+2',
        notes:'Bonus +2 to hit and +2 primaryDamage if the target gives CA or is immobilised.',
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
        primaryDamage:'4d8',
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
      new BonusStat('stamina', {progression:[1, 2, 3]}),
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
      
      
      new BonusAttack('Inner strength', {
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
      'An opportunist, the knifer waits for the right moment to get maximum primaryDamage.'
    ],
    hitsPerLevel:1,
    extraWeapon:3,
    bonuses:[
      new BonusStat('reflex', {progression:[1, 5]}),
      new BonusStat('attack', {progression:'primary', mode:'max'}),
      new BonusWeaponAttack('Sneak attack', {
        progression:5,
        flags:'Fa',
        primaryDamage:'3d6',
        notes:'Bonus 2d6 primaryDamage on a successful hit, once per turn, when you have combat advantage.',
      }),
      new BonusWeaponAttack('Measured strike', {
        progression:5,
        flags:'F',
        bonus:-2,
        notes:'Attack at -2 while you take the measure of your foe. Next turn you gain CA against him.',
      }),
      new BonusWeaponAttack('Fading strike', {
        progression:5,
        flags:'F',
        notes:'On a hit, you can shift two squares to a square not adjacent to an enemy',
      }),
      new BonusWeaponAttack('Spinning blade', {
        progression:5,
        flags:'F',
        primaryMax:8,
        notes:'Once per encounter. Attack all adjacent foes, then shift up to 2 squares, which can be though a foe-occupied square.',
      }),
    ],
  }),



  new Package('Wrestler', {
    category:'Combat',
    notes:[
      'An unarmed fighter, the wrestler tries to grab a foe, and once he has him held, can cause a lot of primaryDamage.'
    ],
    hitsPerLevel:2,
    extraWeapon:3,
    bonuses:[
      new BonusStat('reflex', {progression:[1, 8, 17]}),
      new BonusStat('stamina', {progression:[1, 8, 17]}),
      new BonusStat('attack', {progression:'primary', mode:'max'}),
      new BonusWeaponAttack('Grapple', {
        progression:5,
        flags:'Fa',
        notes:'Target is held on a successful hit, once per turn, when you have combat advantage.',
      }),
      new BonusWeaponAttack('Low blow', {
        progression:5,
        primaryDamage:'2d8',
        flags:'Fa',
        notes:'Target must be "normal" human; limited to once per encounter per foe. A swift knee to the groin makes the target think twice about having children.',
      }),
      new BonusWeaponAttack('Throw', {
        progression:5,
        flags:'F',
        bonus:4,
        primaryDamage:'2d8',
        secondaryDamage:'2d6',
        secondaryMax:2,
        notes:'Target must by held; once per encounter. Target is thrown up to three squares. Can be throw at another foe or two adjacent foes within three squares.',
      }),
      new BonusWeaponAttack('Throw down', {
        progression:5,
        flags:'F',
        primaryDamage:'2d6',
        notes:'Target must by held. On a successful hit, target is knocked to the ground. On failure target is still held (except on natural 1).',
      }),
      new BonusWeaponAttack('Bear hug', {
        progression:5,
        primaryDamage:'2d6',
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
      new BonusEffect('Overwatch', {
        progression:5,
        flags:'F',
        notes:'Target must be in cover, character can take no further action this turn. Until the start of your next turn, get OA on the target if he breaks cover (including taking a shot in your direction)',
        weaponCheck:function(weapon) { 
          return weapon.is('firearm');
        },
      }),
      new BonusEffect('Aiming', {
        progression:5,
        flags:'Fa',
        notes:'Take an action to aim carefully at a target. Gain +2 to subsequent shots on that target, until you move (but can shift), make another standard action, change weapons. Not cummulative!',
        weaponCheck:function(weapon) { 
          return weapon.is('firearm');
        },
      }),
      new BonusWeaponAttack('Go for the head', {
        progression:5,
        flags:'Fa',
        bonus:-2,
        bonusDamage:'4',
        notes:'Target must not be in cover (or otherwise get a bonus to defence due to an obstruction between you). Take a -2 penalty to hit, but a +4 bonus to primaryDamage if you do.',
        weaponCheck:function(weapon) { 
          return weapon.is('firearm');
        },
      }),
    ],
  }),


  new Package('Athletic aristocrat', {
    category:'Utility',
    notes:[
      'The character is from the upper classes.'
    ],
    bonuses:[
      new BonusStat('movement', {progression:1}),
      new BonusStat('init', {progression:[1,2,3]}),
      new BonusSkill('Acrobatics', {progression:'primary'}),
      new BonusSkill('Education', {progression:'primary'}),
      new BonusSkill('Etiquette', {progression:'primary'}),
      new BonusSkill('Occult', {progression:[2, 5, 8]}),
      new BonusSkill('Persuade', {progression:'secondary'}),
      new BonusSkill('Sneak', {progression:'secondary'}),
    ],
  }),

  new Package('Investigator', {
    category:'Utility',
    notes:[
      ''
    ],
    bonuses:[
      new BonusSkill('Education', {progression:'primary'}),
      new BonusSkill('Pick lock', {progression:'primary'}),
      new BonusSkill('Sneak', {progression:'primary'}),
      new BonusSkill('Streetwise', {progression:'primary'}),
      new BonusSkill('Perception', {progression:'primary'}),
    ],
  }),

  new Package('Old soldier', {
    category:'Utility',
    notes:[
      ''
    ],
    extraWeapon:3,
    bonuses:[
      new PenaltyStat('movement', {progression:[1, 3]}),
      new BonusSkill('Riding', {progression:'primary'}),
      new BonusSkill('Strength', {progression:'primary'}),
      new BonusSkill('Perception', {progression:'secondary'}),
      new BonusSkill('Healing', {progression:'secondary'}),
      new BonusSkill('Sneak', {progression:'secondary'}),
    ],
  }),

  new Package('Artist of the occult', {
    category:'Utility',
    notes:[
      ''
    ],
    bonuses:[
      new BonusSkill('Education', {progression:'secondary'}),
      new BonusSkill('Occult', {progression:'secondary'}),
      new BonusSkill('Perception', {progression:'primary'}),
      new BonusSkill('Creativity', {progression:'primary'}),
      new BonusSkill('Sneak', {progression:'secondary'}),
      new BonusSkill('Nature', {progression:'secondary'}),
    ],
  }),






  new Package('Non-corporeal Undead', {
    category:'NPC',
    excludes:['pc'],
    notes:[
    ],
    bonuses:[
      new BonusEffect('Ghost 1', {progression:1, flags:"C", notes:[
        "Character has wings, either like a demon or angel, but non-functional.",
      ]}),
    ]
  }),

  new Package('Serpent', {
    category:'NPC',
    excludes:['pc'],
    notes:[
    ],
    bonuses:[
      new BonusEffect('Serpent 1', {progression:1, flags:"C", notes:[
        "Character has wings, either like a demon or angel, but non-functional.",
      ]}),
    ]
  }),

  new Package('Beast', {
    category:'NPC',
    excludes:['pc'],
    notes:[
    ],
    hitsPerLevel:2,
    bonuses:[
      new PenaltyStat('armour', {progression:1}),
      new BonusStat('init', {progression:[1,2,3,5]}),
      new BonusAttack('Bite', {progression:1, flags:"", primaryDamage:'2d6', notes:[
        "If adjacent to a foe at the start of its turn, the beast will try to bite.",
      ]}),
      new BonusAttack('Maul', {progression:1, flags:"", primaryDamage:'2d4', notes:[
        "If not adjacent to a foe, a beast will move up to five squares to a foe and maul him.",
      ]}),
      new BonusEffect('Pack hunter', {progression:1, flags:"", notes:[
        "+2 to reflex if adjacent to a friend, +3 if adjacent to two or more.",
      ]}),
    ]
  }),

  new Package('Witch', {
    category:'NPC',
    excludes:['pc'],
    notes:[
    ],
    hitsPerLevel:12,
    bonuses:[
      new BonusStat('init', {progression:[1,2,3]}),
      new BonusStat('movement', {progression:[1,2]}),
      new BonusAttack('Mindblast', {progression:1, flags:"", resist:'will', primaryDamage:'2d6', primaryMax:10, notes:[
        'Once per encounter - in fact, the first thing she does! Range 12.'
      ]}),
      new BonusAttack('Shocking touch', {progression:1, flags:"", resist:'will', primaryDamage:'3d4', notes:[
      ]}),
      new BonusAttack('Mind horrors', {progression:1, flags:"", resist:'will', primaryDamage:'d4', onHit:function(char, hits) {
        console.log(char.display + " is stunned.")
        char.stunned = true
      }, notes:[
        'Range 8. The target feels a sudden horror at how fragile human life is at the onslaught of the immense cosmos, and is stunned one round (*).',
      ]}),
      new BonusEffect('Switch', {progression:1, flags:"", notes:[
        'Minor action, regained on a d6 (*). The witch swaps places with a rat within 10 squares.'
      ]}),
      new BonusEffect('Summon rats', {progression:1, flags:"", notes:[
        'Minor action, regained on a d6 (*). The witch summon a further 2d4 rats.'
      ]}),
      new BonusEffect('Misdirection', {progression:1, resist:'will', flags:"", notes:[
        'OA, once per encounter, the first time a foe targets the witch from with 5 squares. If the target fails a  will roll (*), he momentarily confuses the witch and his friend; targets his nearest friend, (must use the same weapon, but a standard attack if possible).'
      ]}),
    ]
  }),

  new Package('Shambler', {
    category:'NPC',
    excludes:['pc'],
    notes:[],
    hitsPerLevel:12,
    bonuses:[
      new PenaltyStat('init', {progression:[1,2,3,5]}),
      new PenaltyStat('movement', {progression:[1,2]}),
      new PenaltyStat('armour', {progression:1}),
      new BonusEffect('Bullet sponge', {progression:1, flags:"", notes:[
        'Netherbeasts take half damage from firearms (currently requires manual application).',
      ]}),
      new BonusAttack('Strike', {progression:1, flags:"", primaryDamage:'2d6', notes:[
      ]}),
      new BonusAttack('Smash', {progression:1, flags:"", primaryDamage:'d6', resist:'stamina', primaryMax:99, notes:[
        'Once per encounter, when surrounded by three foes in the first few rounds or just two in later rounds. Affects all within two squares except the witch. On a successful hit, the target is thrown back one square and knocked to the ground.'
      ]}),
    ]
  }),

  new Package('Ogre', {
    category:'NPC',
    excludes:['pc'],
    notes:[
    ],
    bonuses:[
      new BonusWeaponAttack('Storm of rage', {progression:1, flags:"", notes:[
        "NEEDS WORK!!! Target all foes within 1 square upon bloodied.",
      ]}),
    ]
  }),

  new Package('Boss', {
    category:'NPC',
    excludes:['pc', 'npc', 'std', 'minion', 'elite'],
    notes:[
    ],
    bonuses:[
      new BonusStat('turnsPerRound', {progression:[1,2,3], flags:"", notes:[
        "Each rank gives an extra turn in every round.",
      ]}),
    ]
  }),
  
  new Package('Swarm', {
    category:'NPC',
    excludes:['pc', 'npc', 'std', 'boss', 'elite'],
    notes:[
    ],
    bonuses:[
      new BonusEffect('One hit wonder', {progression:1, flags:"", notes:[
        "One hit only!",
      ]}),
      new BonusAttack('Bite', {progression:1, flags:"", primaryDamage:'1d4', notes:[
      ]}),
    ],
  }),
]





module.exports = packages



