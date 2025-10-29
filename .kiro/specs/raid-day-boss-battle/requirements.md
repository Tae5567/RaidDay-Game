# Requirements Document

## Introduction

Raid Day is a collaborative boss battle game built with Phaser.js for the Devvit platform on Reddit. Players participate in 2-minute attack sessions against a single daily boss with shared community HP (50,000). The game emphasizes quick, satisfying combat with immediate visual feedback, real-time community participation, and automatic Reddit post generation for victories.

## Glossary

- **Raid_Day_System**: The complete boss battle game application
- **Battle_Session**: 2-minute gameplay period where players perform 5-10 attacks
- **Shared_Boss_HP**: Community-wide boss health pool that all players attack together
- **Boss_Entity**: Single daily boss with 50,000 HP shared across all players
- **Player_Character**: User-controlled sprite that performs attack animations
- **Attack_Animation**: 0.8-second sequence showing character attack and damage
- **Community_Feed**: Real-time display of other players' attacks and damage
- **Victory_Post**: Automatic Reddit post created when boss is defeated
- **Session_Summary**: End-of-session damage report and sharing options
- **Live_Leaderboard**: Real-time ranking of top damage dealers

## Requirements

### Requirement 1

**User Story:** As a Reddit user, I want to participate in 2-minute boss attack sessions with satisfying animations, so that I can quickly contribute to the community battle.

#### Acceptance Criteria

1. WHEN a player starts a Battle_Session, THE Raid_Day_System SHALL provide exactly 2 minutes for 5-10 attacks
2. WHEN a player taps attack, THE Raid_Day_System SHALL play a 0.8-second attack sequence with character movement and damage numbers
3. WHEN an attack connects, THE Boss_Entity SHALL flash red and display screen shake effects
4. WHEN a session ends, THE Raid_Day_System SHALL show session summary with total damage dealt
5. WHEN the boss is defeated, THE Raid_Day_System SHALL play victory animation and create automatic Reddit post

### Requirement 2

**User Story:** As a player, I want to attack a shared community boss with 50,000 HP, so that I feel part of a collaborative effort to defeat it together.

#### Acceptance Criteria

1. THE Raid_Day_System SHALL display one daily boss with exactly 50,000 shared HP
2. WHEN any player attacks, THE Shared_Boss_HP SHALL decrease for all players simultaneously
3. WHEN the boss HP reaches 0, THE Raid_Day_System SHALL trigger victory for all players
4. WHEN players view the boss, THE Raid_Day_System SHALL show current HP remaining (e.g., "87,432 / 50,000")
5. WHEN the boss is defeated, THE Raid_Day_System SHALL spawn a new boss the next day at 8 AM

### Requirement 3

**User Story:** As a player, I want to see real-time community activity and leaderboards, so that I can track my progress against other players.

#### Acceptance Criteria

1. THE Raid_Day_System SHALL display a live leaderboard showing top 10 damage dealers updated every 10 seconds
2. WHEN other players attack, THE Community_Feed SHALL show "u/Player1 dealt 234 damage (5s ago)" in a scrolling ticker
3. WHEN viewing the splash screen, THE Raid_Day_System SHALL show "347 Fighters Active" count
4. WHEN a player completes a session, THE Raid_Day_System SHALL show their current rank (e.g., "Your rank: #23")
5. THE Live_Leaderboard SHALL highlight the current player's rank with special styling

### Requirement 4

**User Story:** As a player, I want to share my battle results to the subreddit, so that I can celebrate my contributions with the community.

#### Acceptance Criteria

1. WHEN a session ends, THE Raid_Day_System SHALL provide a "Share to r/RaidDay" button
2. WHEN sharing is selected, THE Raid_Day_System SHALL create a Reddit comment with session damage
3. WHEN the boss is defeated, THE Raid_Day_System SHALL automatically create a victory post tagging top contributors
4. WHEN victory occurs, THE Victory_Post SHALL include full leaderboard in comments
5. THE Raid_Day_System SHALL enable community members to upvote and reply to shared results

### Requirement 5

**User Story:** As a player, I want simple character classes without complex mechanics, so that I can focus on the core attack gameplay.

#### Acceptance Criteria

1. THE Raid_Day_System SHALL provide 4 character classes with similar damage output
2. WHEN a player selects a class, THE Player_Character SHALL display class-specific sprites and animations
3. WHEN any class attacks, THE Raid_Day_System SHALL deal base damage with minor class variations (±10%)
4. THE Raid_Day_System SHALL NOT require complex energy management or long cooldowns
5. WHEN players attack, THE Raid_Day_System SHALL focus on satisfying animations over mechanical complexity

### Requirement 6

**User Story:** As a mobile Reddit user, I want responsive controls and smooth performance, so that I can play effectively on my phone.

#### Acceptance Criteria

1. WHEN playing on mobile, THE Raid_Day_System SHALL provide large, responsive attack buttons
2. WHEN the screen orientation changes, THE Raid_Day_System SHALL maintain playable layout
3. WHEN running on mobile hardware, THE Raid_Day_System SHALL maintain 30+ FPS performance
4. WHEN using touch controls, THE Raid_Day_System SHALL provide immediate visual feedback for taps
5. THE Raid_Day_System SHALL scale the game canvas to fit mobile screens while maintaining aspect ratio

### Requirement 7

**User Story:** As a player, I want polished visual effects and animations, so that combat feels impactful and satisfying.

#### Acceptance Criteria

1. WHEN attacks occur, THE Raid_Day_System SHALL apply screen shake effects proportional to damage
2. WHEN damage is dealt, THE Raid_Day_System SHALL display large, colorful damage numbers that pop and fade
3. WHEN the player character attacks, THE Attack_Animation SHALL show the character running toward boss, attacking, and returning
4. WHEN critical hits occur, THE Raid_Day_System SHALL display enhanced particle effects and screen flash
5. WHEN the game loads, THE Raid_Day_System SHALL show smooth entrance animations without loading screens

### Requirement 8

**User Story:** As a player, I want clear progress tracking and victory celebrations, so that I understand my impact and feel rewarded for participation.

#### Acceptance Criteria

1. WHEN dealing damage, THE Raid_Day_System SHALL show "YOUR damage: +234" with distinct styling
2. WHEN a session is active, THE Raid_Day_System SHALL display session counter (e.g., "5 attacks left")
3. WHEN a session ends, THE Session_Summary SHALL show total damage dealt and current rank
4. WHEN the boss is defeated, THE Raid_Day_System SHALL display victory celebration with rewards distribution
5. WHEN victory occurs, THE Raid_Day_System SHALL show next boss preview and countdown timer