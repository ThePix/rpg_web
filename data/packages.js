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




*/


const packages = [
  new Package('Warrior (sword and shield)', {
    category:'Combat',
    notes:[
      'Bonus to combat attacks (if multiple warrior packages are picked, only the maximum applies), and to hits; gives a bonus weapon at level 3. Reduces the penalty for using a shield.'
    ],
    hitsPerLevel:1,
    extraWeapon:3,
    bonuses:[
      new BonusStat('attack', {progression:'primary', mode:'max'}),
      new BonusStat('shield', {progression:[1, 3, 7, 12]}),
    ],
  }),

  new Package('Warrior (marksman)', {
    category:'Combat',
    notes:[
      'Bonus to combat attacks (if multiple warrior packages are picked, only the maximum applies), and to hits; gives a bonus weapon at level 3. Gives additional bonuses for ranged weapons.'
    ],
    hitsPerLevel:1,
    extraWeapon:3,
    bonuses:[
      new BonusStat('attack', {progression:'primary', mode:'max'}),
      new BonusStat('Ranged', {progression:[3, 9, 17]}),
    ],
  }),

  new Package('Warrior (2H)', {
    category:'Combat',
    notes:[
      'Bonus to combat attacks (if multiple warrior packages are picked, only the maximum applies), and to hits; gives a bonus weapon at level 3. Gives additional bonuses for 2H weapons.'
    ],
    hitsPerLevel:1,
    extraWeapon:3,
    bonuses:[
      new BonusStat('attack', {progression:'primary', mode:'max'}),
      new BonusStat('2H', {progression:[3, 9, 17]}),
    ],
  }),


/*

Sword and shield (+1 shield at level 1, +2 at level 3, +3 at level 7, +4 at level 12)

Marksman (additional +1 bonus to any bow OR any thrown OR any firearm at levels 3, 9, 17)

Two weapons (penalty is -2/-5 at 0, -1/-5 at 1, -1/-4 at 4, 0/-4 at 7, 0/-3 at 10, 0/-2 at 13, 0/-1 at 16, 0/0 at 19)

Unarmed (2d4 at 3, 3d4 at 6, 4d4 at 9, etc.)

2H weapon (penalty is -4 at 0, reducing by 1 each level, down to 0)

Polearm (penalty is -4 at 0, reducing by 1 each level, down to 0)

Whip (penalty is -4 at 0, reducing by 1 each level, down to 0)

Bow (penalty is -4 at 0, reducing by 1 each level, down to 0)*/


  new Package('Defender', {
    category:'Combat',
    group:'fighter-util',
    notes:[
      'A character can only be subject to one mark at a time. A mark lasts until the marker marks another or the marked is marked by another or either party is dead or unconscious. Marking a foe is a free action.'
    ],
    hitsPerLevel:2,
    extraWeapon:3,
    bonuses:[
      new BonusStat('armour', {progression:[2, 5, 14]}),
      new BonusStat('stamina', {progression:'secondary2'}),
      new BonusAttack('Mark', {progression:[1, 4, 7, 10, 13], flags:'Fof', notes:[
        'Marked foe is at -2 when an attack does not target you',
        'as Mark 1, but in addition you get an Opportunity attack if the target makes an an attack that does not target you',
        'as Mark 2, but in addition you get an Opportunity attack if the target moves or shifts under his own volition',
        'as Mark 3, but Opportunity attack stops the move if successful',
        'as Mark 4, but Opportunity Attacks due to a Mark have combat advantage',
      ]}),
      new BonusWeaponAttack('Draw in', {progression:8, flags:'F', notes:'on successful attack, you and foe move one square in your direction'}),
      new BonusWeaponAttack('Push back', {progression:8, flags:'F', notes:'on successful attack, you and foe move one square in foe\'s direction'}),
      new BonusWeaponAttack('Dance of blades', {progression:8, flags:'F', notes:'on successful attack, you and foe each move one square in any direction'}),
    ],
  }),
  
  new Package('Rogue (striker)', {
    category:'Combat',
    group:'fighter-util',
    notes:[
    ],
    hitsPerLevel:0.5,
    extraWeapon:3,
    bonuses:[
      new BonusStat('reflex', {progression:[1, 8, 17]}),
      new BonusStat('armour', {progression:[7]}),
      new BonusStat('init', {progression:'secondary3'}),
      new BonusSkill('Subterfuge', {progression:'secondary1'}),
      new BonusWeaponAttack('Sneak attack', {
        progression:[3, 9, 15, 21],
        flags:'Fa',
        notes:'Bonus 2d6 damage on a successful hit, once per turn, when you have combat advantage. Each addition rank gives an extra d6.',
        weaponCheck:function(weapon) { 
          //console.log(weapon.name + "..." + weapon.is('fast'));
          return weapon.is('fast');
        },
      }),
    ],
  }),

  new Package('Barbarian (striker)', {
    category:'Combat',
    group:'fighter-util',
    notes:[
    ],
    hitsPerLevel:0.5,
    extraWeapon:3,
    bonuses:[
      new BonusStat('armour', {progression:[4, 12]}),
      new BonusStat('stamina', {progression:'secondary3'}),
      new BonusSkill('Survival', {progression:'secondary2'}),
      new BonusSkill('Nature', {progression:'secondary1'}),
      new BonusWeaponAttack('Onslaught', {progression:[3, 9, 15, 21], flags:'Fa', notes:'+5 to damage each successive round you hit a foe (not necessarily the same one), up to a max of +5.  Each addition rank gives an extra 5 to the maximum.'}),
    ],
  }),
 





  new Package('Elementalist', {
    category:'Magic',
    notes:[
      "The elementalist taps into the raw elements of fire, frost and storm. These are relatively powerful, but you need to attune first, and can only access spells from one element at a time. Could be suitable for a mage-fighter hybrid.",
    ],
    bonuses:[
      new BonusSkill('Spell casting', {progression:'primary', mode:'max'}),
      new BonusSkill('Arcana', {progression:"secondary", flags:"undefined"}),
      new BonusStat('Initiative', {progression:[1,7,13,19], flags:"undefined"}),
      new BonusEffect('Attune', {progression:1, flags:"", notes:[
        "You become attuned to either fire, ice or storm, last about 10 minutes or until you attune again; allows you to cast either fire OR ice OR storm spells, on-going spells terminate when you re-cast Attune",
      ]}),
      new BonusEffect('Light', {progression:2, flags:""}),
      new BonusAttack('Firedart', {progression:3, flags:""}),
      new BonusAttack('Ice shard', {progression:4, flags:"", notes:[
        "Slowed",
      ]}),
      new BonusEffect('Ice armour', {progression:5, flags:"", notes:[
        "+1 armour",
      ]}),
      new BonusEffect('Resist fire/ice/storm', {progression:6, flags:""}),
      new BonusEffect('Shock dagger', {progression:7, flags:"", notes:[
        "+3 storm damage, whilst held and attuned",
      ]}),
      new BonusAttack('Fireblast', {progression:8, flags:"", notes:[
        "Burning damage",
      ]}),
      new BonusEffect('Wall of fire/ice', {progression:9, flags:""}),
      new BonusEffect('Lightning blast', {progression:10, flags:"", notes:[
        "Affect a 3x3 square adjacent to you, target can do no magic for a turn",
      ]}),
      new BonusEffect('Shock sword', {progression:11, flags:"", notes:[
        "+5 storm damage, whilst held and attuned",
      ]}),
      new BonusEffect('Flaming-cloak', {progression:12, flags:"", notes:[
        "3 fire damage to anyone within a square whilst attuned",
      ]}),
      new BonusAttack('Ice storm', {progression:13, flags:"", notes:[
        "5x5 square, slowed",
      ]}),
      new BonusAttack('Fireball', {progression:14, flags:""}),
      new BonusEffect('Superior ice armour', {progression:15, flags:"", notes:[
        "+2 armour",
      ]}),
      new BonusEffect('Protection from fire/ice', {progression:16, flags:""}),
      new BonusEffect('Shock great sword', {progression:17, flags:"", notes:[
        "+7 storm damage, whilst held and attuned",
      ]}),
      new BonusEffect('Pillar of fire/frost', {progression:18, flags:"", notes:[
        "Actually a static elemental; blocks 1 square, damages all adjacent",
      ]}),
      new BonusEffect('Summon elemental', {progression:19, flags:""}),
      new BonusEffect('Flaming blade', {progression:20, flags:""}),
    ]
  }),




  new Package('Conjuror (summoner)', {
    category:'Magic',
    notes:[
      "The conjuror is adept at spells that summon forth items and creatures.",
    ],
    bonuses:[
      new BonusSkill('Spell casting', {progression:'primary', mode:'max'}),
      new BonusAttack('Control I', {progression:2, flags:"C", notes:[
        "Gain the ability to control a single creature the caster has summoned,",
      ]}),
      new BonusAttack('Control II', {progression:5, flags:"C", notes:[
        "Gain the ability to control two creatures the caster has summoned simultaneously",
      ]}),
      new BonusAttack('Control III', {progression:8, flags:"C", notes:[
        "Gain the ability to control three creatures the caster has summoned simultaneously",
      ]}),
      new BonusAttack('Control IV', {progression:12, flags:"C", notes:[
        "Gain the ability to control four creatures the caster has summoned simultaneously",
      ]}),
      new BonusAttack('Control V', {progression:17, flags:"C", notes:[
        "Gain the ability to control five creatures the caster has summoned simultaneously",
      ]}),
      new BonusAttack('Repel undead', {progression:11, flags:""}),
      new BonusEffect('Summon spirit', {progression:1, flags:"S", notes:[
        "Spirit cannot fight (it is insubstantial), but can be used to scout.",
      ]}),
      new BonusEffect('Summon targeted spirit', {progression:4, flags:"S", notes:[
        "As Summon spirit, but caster can call the spirit of a dead person, if he knows the decease's true name and is either within 10 squares of the place of death or holding an item the deceased considered important or is holding a bone of the deceased.",
      ]}),
      new BonusEffect('Summon beast', {progression:7, flags:"S", notes:[
        "Caster can call a beast to aid him. The caster can be as general or as specific as he wants; the nearest one that fits will be called (but not a beast already aware of the caster). The beast will travel non-magically at a slow run, so it could be some time before it appears.",
      ]}),
      new BonusEffect('Summon minor elemental', {progression:3, flags:"S", notes:[
        "",
      ]}),
      new BonusEffect('Summon lesser elemental', {progression:6, flags:"S", notes:[
        "",
      ]}),
      new BonusEffect('Summon greater elemental', {progression:10, flags:"S", notes:[
        "",
      ]}),
      new BonusEffect('Summon major elemental', {progression:15, flags:"S", notes:[
        "",
      ]}),
      new BonusEffect('Summon lord elemental', {progression:20, flags:"S", notes:[
        "",
      ]}),
    ]
  }),







  new Package('Ki Adept', {
    category:'Magic',
    notes:[
      "The ki adept uses magic to enhance her own body, pushing it beyond normal human limits. This still needs some tweaking, so it is not over-powered (character can do a super-human jump every turn) or under-powered (character can jump once per encounter).",
    ],
    bonuses:[
      new BonusSkill('Spell casting', {progression:'primary', mode:'max'}),
      new BonusSkill('Acrobatics', {progression:"secondary", flags:"undefined"}),
      new BonusStat('reflex', {progression:[2,8,14,20], flags:"undefined"}),
      new BonusStat('init', {progression:[1,7,13,19], flags:"undefined"}),
      new BonusEffect('Jump ', {progression:1, flags:"S"}),
      new BonusEffect('Wallwalking ', {progression:2, flags:"So"}),
      new BonusEffect('Haste', {progression:3, flags:""}),
      new BonusEffect('Healing', {progression:4, flags:""}),
      new BonusEffect('Retaliation', {progression:5, flags:"", notes:[
        "Opportunity attack when foe makes an attack",
      ]}),
      new BonusEffect('Dodge', {progression:6, flags:""}),
      new BonusEffect('Fly', {progression:7, flags:""}),
      new BonusEffect('Water breathing', {progression:8, flags:""}),
      new BonusEffect('Aura', {progression:9, flags:""}),
      new BonusEffect('Waterwalking', {progression:10, flags:""}),
      new BonusEffect('Preservation', {progression:11, flags:""}),
      new BonusEffect('Senses', {progression:12, flags:""}),
      new BonusEffect('Disguise', {progression:13, flags:""}),
      new BonusEffect('Night vision', {progression:14, flags:""}),
      new BonusEffect('Landing', {progression:15, flags:""}),
      new BonusEffect('Teleport', {progression:16, flags:""}),
    ]
  }),



  new Package('Shadow-dancer', {
    category:'Magic',
    notes:[
    ],
    bonuses:[
      new BonusSkill('Spell casting', {progression:'primary', mode:'max'}),
      new BonusSkill('Subterfuge', {progression:"secondary", flags:"undefined"}),
      new BonusEffect('Hidden ', {progression:1, flags:"Sr"}),
      new BonusAttack('Pull ', {progression:2, flags:"S", notes:[
        "Target feels drawn towards you. moves two squares",
      ]}),
      new BonusEffect('Void', {progression:3, flags:""}),
      new BonusAttack('Shadowbolt ', {progression:4, flags:"S"}),
      new BonusEffect('Invisibility ', {progression:5, flags:"Sr"}),
      new BonusEffect('Darkness ', {progression:6, flags:"Sr"}),
      new BonusAttack('Weakness ', {progression:7, flags:"Sr", notes:[
        "Target vulnerable to elemental attacks",
      ]}),
      new BonusAttack('Sleep ', {progression:8, flags:"Sl"}),
      new BonusAttack('Dark dreams ', {progression:9, flags:"R"}),
      new BonusEffect('Shadow jaunt ', {progression:10, flags:"S"}),
      new BonusEffect('Raise undead ', {progression:11, flags:"R"}),
      new BonusEffect('Animate undead ', {progression:12, flags:"R"}),
      new BonusEffect('Summon demon ', {progression:13, flags:"R"}),
      new BonusAttack('Control demon ', {progression:14, flags:"Sr"}),
      new BonusAttack('Curses ', {progression:15, flags:"Sl"}),
    ]
  }),


  new Package('Mind-mage (single target only)', {
    category:'Magic',
    notes:[
    ],
    bonuses:[
      new BonusSkill('Spell casting', {progression:'primary', mode:'max'}),
      new BonusSkill('Persuasion', {progression:"secondary", flags:"undefined"}),
      new BonusStat('will', {progression:[2,5,8,11,14], flags:"undefined"}),
      new BonusAttack('Study ', {progression:1, flags:"A", notes:[
        "+1 to attack OR +2 to spells on this list, +2 to impersonate",
      ]}),
      new BonusAttack('Stagger ', {progression:2, flags:"S", notes:[
        "Target forced back 1 square and falls to ground",
      ]}),
      new BonusAttack('Control ', {progression:3, flags:"S", notes:[
        "Force target to move up to two squares in your turn",
      ]}),
      new BonusAttack('Mindblast ', {progression:4, flags:"S"}),
      new BonusAttack('Mindmeld ', {progression:5, flags:"So", notes:[
        "Two way communication, could be forced",
      ]}),
      new BonusAttack('Truth sense ', {progression:6, flags:"S", notes:[
        "Can tell if someone is lying",
      ]}),
      new BonusAttack('Beast master ', {progression:7, flags:"So", notes:[
        "Control a beast",
      ]}),
      new BonusAttack('Delusion ', {progression:8, flags:"Sl", notes:[
        "Target is convinced of one fact",
      ]}),
      new BonusEffect('Mind protection ', {progression:9, flags:"Sr", notes:[
        "Immune to mind magic",
      ]}),
      new BonusAttack('Paralysis ', {progression:10, flags:"Sr"}),
      new BonusAttack('Insanity ', {progression:11, flags:"Sl", notes:[
        "Can choose to give a phobia, making target vulnerable to one element",
      ]}),
      new BonusAttack('Beguile ', {progression:12, flags:"Sl"}),
    ]
  }),

  new Package('Bodyshock!', {
    category:'Magic',
    notes:[
    ],
    bonuses:[
      new BonusSkill('Spell casting', {progression:'primary', mode:'max'}),
      new BonusEffect('Prehensile tongue ', {progression:1, flags:"C", notes:[
        "Character's tongue grows to around 12 inches long, and can be used to hold and pick things up, about about the size of a can",
      ]}),
      new BonusEffect('Tentacle I ', {progression:2, flags:"Ao", notes:[
        "As a standard action, character can cause a tentacle to sprout from her belly; can be dismissed as a minor action",
      ]}),
      new BonusEffect('Tentacle II ', {progression:3, flags:"Ao", notes:[
        "Character can cause tentacles to sprout from her sides; see Tentacle I for details; can attack separately",
      ]}),
      new BonusEffect('Spider legs ', {progression:4, flags:"Ao", notes:[
        "As a standard action, character can cause eight jointed legs to sprout from her sides, belly; can be dismissed as a minor action",
      ]}),
      new BonusEffect('Also: spiny body, snake hair, claws, camouflage, tail, gills, batwings, dragon breath, poison', {progression:5, flags:""}),
    ]
  }),

  new Package('Channeller', {
    category:'Channelling',
    notes:[
      "Allows a character to create a direct channel from himself to a target. This causes the target to heal, and the character to gain some of the target's expertise. The target can choose whether to resist or not (as the target does receive healing). You can never prevent the target getting healing, healing is only up to the target's maximum hits.",
      "This can be performed as a minor action, allowing the character to grab a skill and use it in the same round.",
      "Character needs to know the target has the spell or ability (in vague terms at least) to be able to grab it. For skill bonus you can just hope it is better than your own.",
      "Target must be conscious for Channel I to VI.",
    ],
    bonuses:[
      new BonusSkill('Holy channel', {progression:'primary', mode:'max'}),
      new BonusAttack('Channel I ', {progression:1, flags:"Sm", notes:[
        "Creates a channel to the target, who must be within 1 square; the character gains a once per round ability from the target, useable until the end of their next turn. The target gains d10 hits, but is stunned one round",
      ]}),
      new BonusAttack('Channel II ', {progression:2, flags:"Sm", notes:[
        "As I but can also be used to get once per round spells",
      ]}),
      new BonusAttack('Channel III ', {progression:3, flags:"Sm", notes:[
        "As before, but can be used to get skill bonus",
      ]}),
      new BonusAttack('Channel IV ', {progression:4, flags:"Sm", notes:[
        "As before, but target gets 1/4 hits back",
      ]}),
      new BonusAttack('Channel V ', {progression:5, flags:"Sm", notes:[
        "As before, but range is 3 squares",
      ]}),
      new BonusAttack('Channel VI ', {progression:6, flags:"Sm", notes:[
        "As before, but can choose if target is stunned or dazed",
      ]}),
      new BonusAttack('Channel VII ', {progression:7, flags:"Sm", notes:[
        "As before, but also works on an unconscious - but not dead - target; target is brought back to 0 hits, then healed from there",
      ]}),
      new BonusAttack('Channel VIII ', {progression:8, flags:"Sm", notes:[
        "As before, but once per encounter can also be used to get a once per encounter ability or spell - but does not affect target's ability to use",
      ]}),
      new BonusAttack('Channel IX ', {progression:9, flags:"Sm", notes:[
        "As before, but target gets 1/2 hits back",
      ]}),
      new BonusAttack('Channel X ', {progression:10, flags:"Sm", notes:[
        "As before, but range is 5 squares",
      ]}),
      new BonusAttack('Channel XI ', {progression:11, flags:"Sm", notes:[
        "As before, but can choose if target is stunned or dazed or not",
      ]}),
      new BonusAttack('Channel XII ', {progression:12, flags:"Sm", notes:[
        "As before, but can get two once per encounter abilities/spells",
      ]}),
      new BonusAttack('Channel XIII ', {progression:13, flags:"Sm", notes:[
        "As before, but 3/4 hits are healed",
      ]}),
      new BonusAttack('Channel XIV ', {progression:14, flags:"Sm", notes:[
        "As before, but can get three once per encounter abilities/spells",
      ]}),
      new BonusAttack('Channel XV ', {progression:15, flags:"Sm", notes:[
        "As before, but target is fully healed",
      ]}),
      new BonusAttack('Take ability ', {progression:16, flags:"R", notes:[
        "Character can permanently steal an ability or spell from the target, via a ritual taking 8 hours, during which time the target must be present, within 1 square; the target permanently loses the ability or spell",
      ]}),
    ]
  }),


  new Package('Shaman (spirit mage)', {
    category:'Channelling',
    notes:[
      "The shaman and druid could both be clerics; they are the only options that have any form of healing; they both allow the character to perform certain rituals.",
    ],
    bonuses:[
      new BonusSkill('Holy channel', {progression:'primary', mode:'max'}),
      new BonusSkill('History', {progression:"secondary", flags:"undefined"}),
      new BonusSkill('Religion', {progression:"secondary", flags:"undefined"}),
      new BonusEffect('Familiar', {progression:1, flags:"", notes:[
        "Can possess your familiar",
      ]}),
      new BonusEffect('Converse with spirit', {progression:2, flags:""}),
      new BonusAttack('Life drain I', {progression:3, flags:""}),
      new BonusEffect('Summon spirit', {progression:4, flags:""}),
      new BonusEffect('Sustain', {progression:5, flags:"", notes:[
        "Target is kept alive",
      ]}),
      new BonusAttack('Necrosis', {progression:6, flags:"", notes:[
        "Target weakened to elemental attacks",
      ]}),
      new BonusEffect('Summon undead', {progression:7, flags:""}),
      new BonusAttack('Life drain II', {progression:8, flags:""}),
      new BonusAttack('Repel undead', {progression:9, flags:""}),
      new BonusEffect('Renewal', {progression:10, flags:"", notes:[
        "Second wind has double effect for you and all friends within three squares until end of your next turn",
      ]}),
      new BonusEffect('Death ward', {progression:11, flags:"", notes:[
        "Keep going after zero hits",
      ]}),
      new BonusAttack('Life drain III', {progression:12, flags:""}),
      new BonusEffect('Spirit walk', {progression:13, flags:"", notes:[
        "Limited teleport",
      ]}),
      new BonusEffect('Spirit ward', {progression:14, flags:"", notes:[
        "Protection from spirits, inc undead",
      ]}),
      new BonusAttack('Curse', {progression:15, flags:""}),
      new BonusEffect('Cheat death', {progression:16, flags:"", notes:[
        "Become a lich",
      ]}),
    ]
  }),


  new Package('Druid (nature mage)', {
    category:'Channelling',
    notes:[
      "The shaman and druid could both be clerics; they are the only options that have any form of healing; they both allow the character to perform certain rituals.",
    ],
    bonuses:[
      new BonusSkill('Holy channel', {progression:'primary', mode:'max'}),
      new BonusSkill('Nature', {progression:"secondary", flags:"undefined"}),
      new BonusSkill('Animal handling', {progression:"secondary", flags:"undefined"}),
      new BonusEffect('Light', {progression:1, flags:""}),
      new BonusEffect('Beast tongue', {progression:2, flags:""}),
      new BonusEffect('Blend', {progression:3, flags:""}),
      new BonusEffect('Tremors', {progression:4, flags:"", notes:[
        "3x3 becames difficult terrain due to movement",
      ]}),
      new BonusEffect('Hostile trees', {progression:5, flags:""}),
      new BonusEffect('Surefoot', {progression:6, flags:""}),
      new BonusAttack('Calm beast', {progression:7, flags:""}),
      new BonusEffect('Renewal', {progression:8, flags:"", notes:[
        "Second wind has double effect for you and all friends within three squares until end of your next turn",
      ]}),
      new BonusEffect('Waterwalking', {progression:9, flags:""}),
      new BonusEffect('Beastform', {progression:10, flags:""}),
      new BonusEffect('Stoneflesh', {progression:11, flags:""}),
      new BonusEffect('Beast mastery', {progression:12, flags:""}),
      new BonusAttack('Calm', {progression:13, flags:""}),
      new BonusEffect('Call rain', {progression:14, flags:""}),
      new BonusAttack('Call lightning', {progression:15, flags:"", notes:[
        "From sky only",
      ]}),
      new BonusEffect('Pathfinding', {progression:16, flags:""}),
      new BonusEffect('Protection from elements', {progression:17, flags:""}),
    ]
  }),



  new Package('Alchemist', {
    category:'NaturalMagic',
    notes:[
      "An alchemist brews potions .",
    ],
    bonuses:[
      new BonusSkill('Arcana', {progression:"secondary", flags:"undefined"}),
      new BonusSkill('Alchemy', {progression:"secondary", flags:"undefined"}),
    ]
  }),




  new Package('Shapeshifter', {
    category:'NaturalMagic',
    notes:[
      "A shapeshifter changes shape by putting on a magical cloak (but see No cloak). There is a special link between the cloak and the shift; no one else will be affected when wearing the cloak, and the shifter can only be connected to a limited number of cloaks (can unlink to a cloak at any time).",
    ],
    bonuses:[
      new BonusStat('init', {progression:[1,2,3,7,13,17,21], flags:"undefined"}),
      new BonusEffect('Change I ', {progression:1, flags:"A", notes:[
        "You don your second skin to transform into your beast form; or you take it off to become normal",
      ]}),
      new BonusEffect('Cloak I ', {progression:2, flags:"R", notes:[
        "Allows you to fashion the hide of an animal into a second skin over a week; when you put the skin on, you will take the form of that animal; must be a natural mammal, the size of a medium dog, up to the size of a horse; max stats dictated by wolf",
      ]}),
      new BonusEffect('Change II ', {progression:3, flags:"A", notes:[
        "As Change I, but your clothing transforms with you",
      ]}),
      new BonusEffect('Cloak II ', {progression:4, flags:"R", notes:[
        "Allows you to fashion a second hide; can be any natural vertebrate of suitable size; max stats dictated by eagle",
      ]}),
      new BonusEffect('Change III ', {progression:5, flags:"A", notes:[
        "As Change I, but your clothing and anything you are carrying transforms with you",
      ]}),
      new BonusEffect('Cloak III ', {progression:6, flags:"R", notes:[
        "Allows you to fashion a third hide; can be any natural vertebrate of any size",
      ]}),
      new BonusEffect('No cloak ', {progression:7, flags:"R", notes:[
        "This ritual, which takes a week, causes your cloak to become a part of you",
      ]}),
    ]
  }),





  new Package('Brawler', {
    category:'Utility',
    notes:[
    ],
    bonuses:[
      new BonusAttack('Unarmed combat', {progression:1, flags:""}),
      new BonusSkill('Athletics', {progression:"secondary", flags:"undefined"}),
    ]
  }),



  new Package('Acrobat', {
    category:'Utility',
    notes:[
    ],
    bonuses:[
      new BonusStat('init', {progression:"secondary", flags:"undefined"}),
      new BonusSkill('Acrobatics', {progression:"secondary", flags:"undefined"}),
      new BonusStat('movement', {progression:[3,9,15,19], flags:"undefined"}),
    ]
  }),



  new Package('Ranger', {
    category:'Utility',
    notes:[
    ],
    bonuses:[
      new BonusSkill('Animal handling', {progression:1, flags:""}),
      new BonusSkill('Nature', {progression:2, flags:""}),
      new BonusEffect('Special bonus to riding and tracking', {progression:3, flags:""}),
    ]
  }),



  new Package('Observer', {
    category:'Utility',
    notes:[
      "Specialist in seeing.",
    ],
    bonuses:[
      new BonusSkill('Perception I', {progression:[1, 3, 7, 11, 15, 20], flags:"", notes:[
        "Bonus to perception for vision",
      ]}),
      new BonusEffect('Shadow vision', {progression:2, flags:"", notes:[
        "Can see in poor light as though in good light",
      ]}),
      new BonusEffect('Danger perception', {progression:4, flags:"", notes:[
        "+4 bonus to sense ambush",
      ]}),
      new BonusEffect('Dark sense', {progression:6, flags:"", notes:[
        "Can see in complete darkness",
      ]}),
    ]
  }),




/*

  new Package('Olfactory master', {
    category:'Utility',
    notes:[
      "Character must specialise in one sense: vision, sound or taste/smell. Can purchase the package multiple times for multiple senses.",
    ],
    bonuses:[
      new Bonus('Perception I', {progression:1, flags:"", notes:[
        "+1 to perception for vision, +2 for other senses",
      ]}),
      new Bonus('Shadow vision', {progression:2, flags:"", notes:[
        "Vision only; can see in poor light as though in good light",
      ]}),
      new Bonus('Mimicry I', {progression:3, flags:"", notes:[
        "Sound only; can perfectly mimic any normal voice",
      ]}),
      new Bonus('Pheromones I', {progression:4, flags:"", notes:[
        "Taste/smell only; can perfectly mimic any normal pheromones",
      ]}),
      new Bonus('Perception II', {progression:5, flags:"", notes:[
        "+2 to perception for vision, +4 for other senses",
      ]}),
      new Bonus('Dark sense', {progression:6, flags:"", notes:[
        "Can see in complete darkness OR can navigate though the sense of smell or hearing",
      ]}),
      new Bonus('Perception I', {progression:7, flags:"", notes:[
        "+3 to perception for vision, +6 for other senses",
      ]}),
      new Bonus('Mimicry II', {progression:8, flags:"", notes:[
        "Sound only; can perfectly mimic any sound in the normal range of hearing",
      ]}),
      new Bonus('Pheromones II', {progression:9, flags:"", notes:[
        "Taste/smell only; can perfectly mimic any subtle smell - nothing too strong!",
      ]}),
      new Bonus('Perception I', {progression:10, flags:"", notes:[
        "+4 to perception for vision, +8 for other senses",
      ]}),
    ]
  }),

*/

  new Package('Sneak', {
    category:'Utility',
    notes:[
    ],
    bonuses:[
      new BonusSkill('Sneak', {progression:1, flags:""}),
      new BonusSkill('Pick lock', {progression:2, flags:""}),
      new BonusSkill('Subterfuge', {progression:3, flags:""}),
      //new Bonus('etc.', {progression:4, flags:""}),
    ]
  }),



  new Package('Social climber', {
    category:'Utility',
    notes:[
      "If ranks are purchased as the character goes up a level, assume her family is on the ascent, and so her position is improving.",
    ],
    bonuses:[
      new BonusSkill('Etiquette', {progression:"secondary", flags:"undefined"}),
      new BonusEffect('Wealthy I ', {progression:1, flags:"C", notes:[
        "Have own apartment in city",
      ]}),
      new BonusEffect('Wealthy II ', {progression:2, flags:"C", notes:[
        "Have tiny villa in city, one staff, one +1 weapon or item ",
      ]}),
      new BonusEffect('Noble I ', {progression:3, flags:"C", notes:[
        "Very minor noble",
      ]}),
      new BonusEffect('Wealthy II ', {progression:4, flags:"C", notes:[
        "Have modest villa, three staff, two +1 weapon or item ",
      ]}),
      new BonusEffect('Noble II ', {progression:5, flags:"C", notes:[
        "Minor noble",
      ]}),
      new BonusEffect('Wealthy II ', {progression:6, flags:"C", notes:[
        "Have sizeable villa, five staff, two +1 weapon or item ",
      ]}),
      new BonusEffect('Noble III ', {progression:7, flags:"C", notes:[
        "Major noble",
      ]}),
      new BonusEffect('Wealthy II ', {progression:8, flags:"C", notes:[
        "Have lavish villa, eight staff, two +2 weapon or item ",
      ]}),
      new BonusEffect('Noble IV ', {progression:9, flags:"C", notes:[
        "Royalty",
      ]}),
      new BonusEffect('Wealthy II ', {progression:10, flags:"C", notes:[
        "Have lavish villa, twelve staff, and country estate, twenty staff, two +2 weapon or item ",
      ]}),
    ]
  }),



  new Package('Leader', {
    category:'Utility',
    notes:[
      "Note that you are not a ally of yourself; none of these have any effect on yourself",
    ],
    bonuses:[
      new BonusSkill('Persuade', {progression:"secondary", flags:"undefined"}),
      new BonusEffect('Inspire I ', {progression:1, flags:"Am", notes:[
        "One ally within 5 squares get a +2 bonus to all rolls until your next round; ally must be capable to hearing and understanding you; this can be done as a minor action",
      ]}),
      new BonusEffect('Signal ', {progression:2, flags:"Af", notes:[
        "Can communicate a simple, pre-arranged message - such as 'attack now' - to any allies within sight, range unlimited, without foes noticing; this can be done as a free action, once per turn",
      ]}),
      new BonusAttack('Goad ', {progression:3, flags:"Am", notes:[
        "Causes a foe to attack, subject to will save",
      ]}),
      new BonusEffect('Inspire II ', {progression:4, flags:"Am", notes:[
        "As Inspire I, but applies to up to two allies",
      ]}),
      new BonusEffect('Coordinate I ', {progression:5, flags:"Ae", notes:[
        "One ally within 5 squares can move up to two squares under your direction - i.e., both you and the ally must agree to the destination; useable once per encounter",
      ]}),
      new BonusEffect('Lead by example ', {progression:6, flags:"Af", notes:[
        "+4 to any skill check for your allies who have seen you accomplish a physical task this round until your next round; free action",
      ]}),
      new BonusEffect('Inspire III ', {progression:7, flags:"Am", notes:[
        "As Inspire I, but applies to up to three allies",
      ]}),
      new BonusAttack('Incite ', {progression:8, flags:"Am", notes:[
        "Any neutral character within 10 squares will join your side; character must be capable to hearing and understanding you; powerful characters get a save against will; this can be done as a minor action; affected characters may or may not choose to continue after one turn",
      ]}),
      new BonusEffect('Coordinate II ', {progression:9, flags:"Ae", notes:[
        "As Coordinate I, but applies to up to two allies",
      ]}),
      new BonusAttack('Galvinise ', {progression:10, flags:"Am", notes:[
        "One ally within 5 squares get a +2 bonus to all rolls until your next round, and on their turn gets a second standard action; ally must be capable to hearing and understanding you; this can be done as a minor action",
      ]}),
    ]
  }),



  new Package('Meta-mage', {
    category:'Utility',
    notes:[
      "This is more suitable for mages.",
    ],
    bonuses:[
      new BonusEffect('Detect magic ', {progression:1, flags:"Fm", notes:[
        "You spend a standard or minor action to feel your surroundings, detecting any magic spells in effect, magical creatures or items, but not if invisible",
      ]}),
      new BonusEffect('Symbols ', {progression:2, flags:"A", notes:[
        "You spend five minutes creating a symbol on a solid surface, with a spell you know embedded in it; the spell can be triggered to go off at your word or when something touches or walks over the symbol; you can only have one symbol active at a time; a symbol fades after one hour",
      ]}),
      new BonusEffect('Other ', {progression:3, flags:"X", notes:[
        "Any spell you know with range 'self' can be cast on a willing target within 1 square",
      ]}),
      new BonusEffect('Discern magic I ', {progression:4, flags:"A", notes:[
        "Concentrating of an item or creature for 5 minutes, you get a good idea of the enchantments on it, including possibly traps",
      ]}),
      new BonusEffect('Repeat I ', {progression:5, flags:"X", notes:[
        "Any once per encounter spell can be cast twice per encounter",
      ]}),
      new BonusEffect('Secret casting ', {progression:6, flags:"X", notes:[
        "You can cast spells without anyone knowing you are doing it",
      ]}),
      new BonusEffect('Superior detect magic ', {progression:7, flags:"Fm", notes:[
        "As detect magic, but you get some idea of what each thing is; can detect invisible",
      ]}),
      new BonusEffect('Multi ', {progression:8, flags:"X", notes:[
        "Any spell you know with range 'self' can be cast on any number of willing targets within 1 square",
      ]}),
      new BonusEffect('Repeat II ', {progression:9, flags:"X", notes:[
        "Any once per encounter spell can be cast three times per encounter",
      ]}),
      new BonusEffect('Discern magic II ', {progression:10, flags:"A", notes:[
        "As Discern magic I, but you get an idea of who did the spell or enchanting if you know the author, or can recognise his work cf recognise a face or handwriting",
      ]}),
      new BonusEffect('Runes ', {progression:11, flags:"R", notes:[
        "You spend some days imbuing an item with runes with a spell you know embedded in it",
      ]}),
      new BonusEffect('Repeat III ', {progression:12, flags:"X", notes:[
        "Any once per encounter spell can be cast five times per encounter",
      ]}),
      new BonusEffect('Portals ', {progression:13, flags:"R", notes:[
        "You spend some days enchanting a pair of suitable structures as portals",
      ]}),
    ]
  }),



  new Package('Spell-Breaker', {
    category:'Utility',
    notes:[
      "You must have a higher level in a single mage package. A character with level 4 in Shaman and level 2 in Shadow-dancer could get this up to level 3.",
    ],
    bonuses:[
      new BonusStat('Casting spells from this list', {progression:"primary", flags:"undefined"}),
      new BonusEffect('Spell breaker I ', {progression:1, flags:"S", notes:[
        "Removes all on-going spells from the caster",
      ]}),
      new BonusEffect('Spell defense I ', {progression:2, flags:"S", notes:[
        "Caster gets +5 to saving throws against magic until the end of his next turn",
      ]}),
      new BonusEffect('Spell breaker II ', {progression:3, flags:"S", notes:[
        "Removes all on-going spells from any target within 5 squares",
      ]}),
      new BonusEffect('Spell defense II ', {progression:4, flags:"S", notes:[
        "Target within 5 squares gets +5 to saving throws against magic until the end of the caster's next turn",
      ]}),
      new BonusEffect('Spell breaker III ', {progression:5, flags:"S", notes:[
        "Removes all on-going spells from any target within 10 squares",
      ]}),
      new BonusEffect('Spell defense III ', {progression:6, flags:"S", notes:[
        "Target within 10 squares gets +5 to saving throws against magic until the end of the caster's next turn",
      ]}),
      new BonusEffect('Spell wall ', {progression:7, flags:"S", notes:[
        "Creates a 7 square by 7 square zone that must include the caster's square, lasting until the end of the caster's next turn; can be extended one round as a minor action as often as desired; anyone in the zone gets a +5 to saving throws against magic",
      ]}),
    ]
  }),


  new Package('Living stone', {
    category:'Body',
    notes:[
      "Stone skin is a permanent condition that cannot be turned off.",
      "You could re-interpret this as fire-based or demonic or whatever, but the deterioration to appearance must still apply.",
    ],
    bonuses:[
      new BonusEffect('Stone skin I ', {progression:1, flags:"C", notes:[
        "+2 armour, but -1 speed and reflex; skin looks pale and dry",
      ]}),
      new BonusEffect('Unmoveable ', {progression:2, flags:"Ar", notes:[
        "As a std action, character plants his feet in the ground; cannot be moved until he next moves",
      ]}),
      new BonusSkill('Grappling', {progression:[3, 8, 13, 16], flags:"C", notes:[]}),
      new BonusAttack('Shard burst ', {progression:4, flags:"A", notes:[
        "+2 attack vs reflex, 1d6 to all within 2 squares, once per encounter",
      ]}),
      new BonusAttack('Bash I ', {progression:5, flags:"A", notes:[
        "+0 unarmed attack, doing 2d8 damage",
      ]}),
      new BonusEffect('Stone skin II ', {progression:6, flags:"C", notes:[
        "+3 armour, but -1 speed and reflex; skin looks grey and unnatural",
      ]}),
      new BonusAttack('Smash I ', {progression:7, flags:"A", notes:[
        "Bashes the ground as a standard action, all with 1 square knocked prone",
      ]}),
      new BonusAttack('Shard blast ', {progression:9, flags:"A", notes:[
        "Blast 2, +4 attack vs reflex, once per encounter",
      ]}),
      new BonusAttack('Bash II ', {progression:10, flags:"A", notes:[
        "+1 unarmed attack, doing 3d6 damage",
      ]}),
      new BonusEffect('Stone skin III ', {progression:11, flags:"C", notes:[
        "+4 armour, but -1 speed and reflex; skin looks and feels like rock",
      ]}),
      new BonusAttack('Smash II ', {progression:12, flags:"A", notes:[
        "Bashes the ground as a standard action, all with 3 square knocked prone",
      ]}),
      new BonusAttack('Shard storm ', {progression:14, flags:"A", notes:[
        "Range 10 burst 1, +5 attack vs reflex, once per encounter",
      ]}),
      new BonusAttack('Bash ', {progression:15, flags:"A", notes:[
        "+2 unarmed attack, doing 3d8 damage",
      ]}),
    ]
  }),



  new Package('Slimer', {
    category:'Body',
    notes:[
    ], 
    bonuses:[
      new BonusEffect('Stretchy ', {progression:1, flags:"C", notes:[
        "Character can extend arms and legs up to twice their length; useful for reaching high shelves, +3 to contortions and escapology",
      ]}),
      new BonusEffect('Resistant ', {progression:2, flags:"C", notes:[
        "+5 bonus to stamina rolls against acid and poisons",
      ]}),
      new BonusEffect('Slime form ', {progression:3, flags:"C", notes:[
        "Character becomes a gelatinous mass like B.O.B. in MvA",
      ]}),
      new BonusAttack('Acid spit', {progression:4, flags:""}),
      //new Bonus('Others?', {progression:5, flags:""}),
    ]
  }),





  new Package('Winged', {
    category:'Body',
    notes:[
      "You should devise a reason for why your character has wings! They could be that of a bat, an angel, a demon, etc. as the player desires.",
    ],
    bonuses:[
      new BonusEffect('Winged 1', {progression:1, flags:"C", notes:[
        "Character has wings, but non-functional.",
      ]}),
      new BonusEffect('Winged II', {progression:3, flags:"C", notes:[
        "Character has wings, cannot fly, but can extends leaps by 10 foot vertically and 3 squares horizontally.",
      ]}),
      new BonusEffect('Winged III', {progression:5, flags:"C", notes:[
        "Character has wings, cannot fly, but can extends leaps by 15 foot vertically and 5 squares horizontally, reducing damage from falls by 20 hits.",
      ]}),
      new BonusEffect('Winged IV', {progression:8, flags:"C", notes:[
        "Character has wings, can fly at movement speed.",
      ]}),
      new BonusEffect('Winged V', {progression:10, flags:"C", notes:[
        "Character has wings, can fly at movement speed + 3.",
      ]}),
    ]
  }),



  new Package('Part-man-part-machine', {
    category:'Body',
    notes:[
      "You should devise a reason for why your character is a cyborg!",
    ],
    bonuses:[
      new BonusStat('armourBonus', {progression:[3, 7], flags:"C", notes:[
        "Character has a lot of metal metal in her body! This does mean she sinks (-5 to swimming).",
      ]}),
      new BonusStat('stamina', {progression:[2, 5, 11], flags:"C", notes:[
        "Character has iron-like stamina.",
      ]}),
      new BonusEffect('Claws I', {progression:3, flags:"C", notes:[
        "Character has spikes on her hands (or whatever) and can use them as an unarmed attack.",
      ]}),
      new PenaltySkill('Sneak', {progression:'secondary', flags:"C", notes:[
        "Character clunks around too much to sneak!",
      ]}),
    ]
  }),



  new Package('Beast', {
    category:'Body',
    notes:[
      "You should devise a reason for why your character resembles a beast!",
    ],
    bonuses:[
      new BonusStat('armourBonus', {progression:[3, 7], flags:"C", notes:[
        "Character has a tough hide.",
      ]}),
      new BonusStat('reflex', {progression:[2, 5, 11], flags:"C", notes:[
        "Character has cat-like reflexes.",
      ]}),
      new BonusEffect('Claws I', {progression:3, flags:"C", notes:[
        "Character has claws and can use them as an unarmed attack.",
      ]}),
    ]
  }),



  new Package('Aquatic', {
    category:'Body',
    notes:[
      "You should devise a reason for why your character is aquatic!",
    ],
    bonuses:[
      new BonusSkill('Swim', {progression:'primary', flags:"E", notes:[
        "Character has a natural skill at swimming.",
      ]}),
      new BonusEffect('Water vision', {progression:2, flags:"C", notes:[
        "Character has eyes that are adapted to see in murky water without a problem. They do bulge a bit though.",
      ]}),
      new PenaltyStat('appearance', {progression:'secondary', flags:"C", notes:[
        "Character looks increasingly like a fish.",
      ]}),
      new BonusEffect('Water breather', {progression:3, flags:"C", notes:[
        "Character has gills, and can breath underwater (as well as on land with lungs). The gills are visible, if the character's neck is inspected.",
      ]}),
      new BonusEffect('Superior water vision', {progression:5, flags:"C", notes:[
        "Character has eyes that are adapted to see in the darkest, murkiest water without a problem. The bulging is noticeable.",
      ]}),
      new BonusEffect('Claws I', {progression:4, flags:"C", notes:[
        "Character has claws and can use them as an unarmed attack.",
      ]}),
      new BonusStat('armourBonus', {progression:[3, 7], flags:"C", notes:[
        "Character has a tough hide that resembles fish scales.",
      ]}),
    ]
  }),

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




*/


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
      new BonusEffect('Extra Action', {progression:1, flags:"", notes:[
        "NEEDS WORK!!! Appears twice in action order.",
      ]}),
    ]
  }),

]





module.exports = packages



