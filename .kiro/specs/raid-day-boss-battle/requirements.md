# Requirements Document

## Introduction

Raid Day is a real-time animated boss battle game built with Phaser.js for the Devvit platform on Reddit. Players engage in collaborative combat against daily rotating bosses through an energy-based attack system, featuring 2D pixel art animations and community participation mechanics. The game emphasizes short, engaging sessions (2-5 minutes) with visual feedback and real-time community battle viewing.

## Glossary

- **Raid_Day_System**: The complete boss battle game application
- **Battle_Arena**: The main game scene where combat takes place
- **Energy_System**: Player resource management limiting attacks per session
- **Boss_Entity**: Daily rotating enemy with themed animations and phases
- **Player_Character**: User-controlled sprite with class-specific abilities
- **Community_DPS**: Real-time tracking of all player attacks against the boss
- **Attack_Animation**: Visual sequence showing character movement and combat effects
- **Special_Ability**: Class-specific powerful attack usable once per session
- **Session_Window**: 2-hour period defining energy refresh cycles
- **Victory_Sequence**: End-game animation and reward distribution

## Requirements

### Requirement 1

**User Story:** As a Reddit user, I want to engage in animated boss battles with visual feedback, so that I feel immersed in the combat experience.

#### Acceptance Criteria

1. WHEN a player enters the Battle_Arena, THE Raid_Day_System SHALL display an animated boss sprite with idle animations
2. WHEN a player taps the attack button, THE Raid_Day_System SHALL play a complete attack sequence showing character movement, combat effects, and damage numbers
3. WHEN an attack connects, THE Boss_Entity SHALL display hit animations including color flash and screen shake effects
4. WHEN the boss reaches phase thresholds, THE Boss_Entity SHALL transition to new visual states with enhanced animations
5. WHEN the boss is defeated, THE Raid_Day_System SHALL play a victory sequence with particle effects and loot distribution

### Requirement 2

**User Story:** As a player, I want an energy-based combat system that allows burst gameplay, so that I can have meaningful short sessions without waiting hours between attacks.

#### Acceptance Criteria

1. WHEN a player starts a session, THE Energy_System SHALL provide 5 energy points for immediate use
2. WHEN a player performs an attack, THE Energy_System SHALL consume 1 energy point and initiate a 30-second cooldown for that point
3. WHEN all energy points are depleted, THE Energy_System SHALL allow gradual regeneration over 2.5 minutes total
4. WHERE a player has full energy, THE Raid_Day_System SHALL apply a 20% damage bonus to the first attack
5. WHEN 2 hours pass since session start, THE Energy_System SHALL refresh all energy points server-side

### Requirement 3

**User Story:** As a player, I want to choose from different character classes with unique abilities, so that I can customize my combat style and contribute differently to battles.

#### Acceptance Criteria

1. THE Raid_Day_System SHALL provide 4 distinct character classes: Warrior, Mage, Rogue, and Healer
2. WHEN a player selects a class, THE Player_Character SHALL display class-specific sprite animations for idle, attack, and special abilities
3. WHEN a Rogue attacks, THE Raid_Day_System SHALL apply a 30% critical hit chance with 3x damage multiplier
4. WHEN a player uses a special ability, THE Raid_Day_System SHALL consume 3 energy points and deal 3x normal damage with enhanced visual effects
5. WHEN a Healer uses their special ability, THE Raid_Day_System SHALL buff the next 5 community attacks with 20% increased damage

### Requirement 4

**User Story:** As a player, I want to see other community members attacking the boss in real-time, so that I feel part of a collaborative effort even during my cooldown periods.

#### Acceptance Criteria

1. WHILE a player is in the Battle_Arena, THE Community_DPS SHALL display 4 other player characters on screen
2. WHEN community attacks occur, THE Raid_Day_System SHALL animate random player sprites performing attack sequences every 3-5 seconds
3. WHEN community damage is dealt, THE Raid_Day_System SHALL display floating damage numbers and update the boss HP bar
4. WHEN the server provides community statistics, THE Raid_Day_System SHALL synchronize the actual boss HP every 10 seconds
5. WHILE battles are active, THE Raid_Day_System SHALL display an activity feed showing recent player attacks and damage

### Requirement 5

**User Story:** As a player, I want to battle different themed bosses on different days, so that the game stays fresh and engaging over time.

#### Acceptance Criteria

1. THE Raid_Day_System SHALL rotate bosses daily with 7 unique themes (Gaming, Internet, Social Media, Work, Entertainment, Sports, Memes)
2. WHEN a new boss spawns, THE Boss_Entity SHALL display theme-appropriate sprites, animations, and attack patterns
3. WHEN a boss reaches 75% health, THE Boss_Entity SHALL enter phase 2 with modified animations and 10% damage resistance
4. WHEN a boss reaches 25% health, THE Boss_Entity SHALL enter enrage mode with screen shake effects and faster animations
5. WHEN a boss is defeated, THE Raid_Day_System SHALL display the next boss preview and countdown timer

### Requirement 6

**User Story:** As a mobile Reddit user, I want responsive touch controls and optimized performance, so that I can play effectively on my phone.

#### Acceptance Criteria

1. WHEN playing on mobile devices, THE Raid_Day_System SHALL provide touch-optimized controls with minimum 44x44 pixel tap targets
2. WHEN the screen orientation changes, THE Raid_Day_System SHALL adapt the UI layout for both portrait and landscape modes
3. WHEN running on mobile hardware, THE Raid_Day_System SHALL limit particle effects to 20 particles maximum for performance
4. WHEN touch gestures are used, THE Raid_Day_System SHALL support tap for attack and hold for special abilities
5. WHEN the game loads on mobile, THE Raid_Day_System SHALL scale the 800x600 game canvas to fit the screen while maintaining aspect ratio

### Requirement 7

**User Story:** As a player, I want clear visual feedback and polished animations, so that combat feels impactful and satisfying.

#### Acceptance Criteria

1. WHEN any attack occurs, THE Raid_Day_System SHALL apply screen shake effects scaled by attack type (2px normal, 5px critical, 8px boss phase)
2. WHEN critical hits occur, THE Raid_Day_System SHALL freeze the frame for 0.1 seconds before displaying enhanced particle effects
3. WHEN weapons are used, THE Attack_Animation SHALL display motion trails that fade over 0.2 seconds
4. WHEN attacks connect, THE Raid_Day_System SHALL display visual sound effect markers ("SLASH!", "BOOM!", "CRITICAL!")
5. WHEN the game loads, THE Raid_Day_System SHALL play entrance animations for both boss and player characters without black loading screens

### Requirement 8

**User Story:** As a player, I want to see my progress and rewards clearly, so that I understand my contribution and feel motivated to continue playing.

#### Acceptance Criteria

1. WHEN a player deals damage, THE Raid_Day_System SHALL display floating damage numbers that spawn above the boss and fade upward
2. WHEN a session is active, THE Raid_Day_System SHALL show current session damage, player rank, and active raider count
3. WHEN a boss is defeated, THE Victory_Sequence SHALL display loot rain with physics-based item drops and personal loot highlighting
4. WHEN XP is gained, THE Raid_Day_System SHALL animate the experience bar filling with appropriate visual effects
5. WHEN victory occurs, THE Raid_Day_System SHALL display leaderboard summary showing top 5 contributors