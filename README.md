# Raid Day - Boss Battle Arena

**A collaborative boss battle game for Reddit built with Phaser.js**

Raid Day is a fully playable 2D boss battle game designed to bring Reddit communities together in epic daily boss fights. Built with Phaser.js 3.70+ and integrated with Reddit's Devvit platform, this game features a complete scene-based progression system with character class selection, comprehensive tutorials, and fully implemented strategic energy-based combat.

## What is Raid Day?

Raid Day is an innovative browser-based boss battle game that transforms traditional MMO raid mechanics into bite-sized, strategic combat sessions perfect for Reddit's social environment. The game centers around collaborative battles against daily rotating bosses, each themed around different aspects of internet culture - from "The Lag Spike" (Gaming) to "The Algorithm" (Internet) to "The Cringe" (Memes).

The game features a revolutionary energy-based combat system that eliminates traditional cooldown frustrations. Players receive 5 energy points that can be used immediately for burst combat, with individual 30-second cooldowns that allow for strategic timing and sustained engagement. This creates dynamic gameplay where timing and resource management are key to maximizing damage output.

**Current Implementation**: The game is fully playable with a complete 7-scene progression system, 4 unique character classes, advanced combat mechanics, and comprehensive visual effects. All game systems work with automatically generated placeholder graphics, providing the full boss battle experience while being ready for custom sprite integration.

## Game Architecture & Technical Implementation

Raid Day runs as a Phaser.js 3.70+ application at 800x600 resolution with responsive FIT scaling that adapts to any screen size while maintaining aspect ratio. The game uses WebGL rendering with Canvas fallback, pixel art optimization, and Arcade Physics for smooth 60fps gameplay across desktop and mobile devices.

### Complete Scene Flow System
The game features 7 fully implemented scenes with smooth transitions:

1. **Boot Scene**: Quick asset loading with automatic placeholder texture generation
2. **Preloader Scene**: Main asset loading with progress bar and helpful gameplay tips
3. **Splash Scene**: Main menu showing today's boss theme with navigation options
4. **HowToPlay Scene**: Comprehensive tutorial explaining all game mechanics
5. **ClassSelect Scene**: Interactive character class selection with detailed ability descriptions
6. **Battle Scene**: Full combat system with energy management, visual effects, and boss battles
7. **Victory Scene**: Animated victory sequence with physics-based loot rain, XP progression, and leaderboards

### Advanced Systems Architecture
- **EnergySystem**: 5-point energy management with individual 30-second cooldowns
- **CombatSystem**: Damage calculations with class modifiers and boss phase resistance
- **SynchronizationSystem**: Real-time boss HP sync and community DPS tracking (10-second accuracy)
- **AttackSequence**: Cinematic 1.5-second attack animations with 6 distinct phases
- **ParticleSystem**: Mobile-optimized particle effects with object pooling
- **CameraEffectsSystem**: Dynamic screen shake, hit pause, and motion trails
- **CommunityBuffSystem**: Healer's buff aura affecting next 5 community attacks

## Game Overview

Raid Day is a **fully playable collaborative boss battle experience** where Reddit users join forces to defeat powerful daily bosses. The game runs at 800x600 resolution with responsive scaling and features complete placeholder asset generation for immediate gameplay testing.

### Core Gameplay Loop

1. **Daily Boss Rotation**: Each day features a unique themed boss with distinct mechanics and personality
2. **Character Class Selection**: Choose from 4 unique classes with different playstyles and special abilities
3. **Strategic Energy Combat**: Manage 5 energy points with individual 30-second cooldowns for optimal damage
4. **Collaborative Battles**: Fight alongside other Reddit users in real-time community battles
5. **Cinematic Combat**: Every attack triggers a 1.5-second animated sequence with visual effects
6. **Victory Celebrations**: Defeat bosses to unlock rewards, XP progression, and leaderboards

## Game Overview

Raid Day is a **fully playable collaborative boss battle experience** where Reddit users join forces to defeat powerful daily bosses. The game runs at 800x600 resolution with responsive scaling and features complete placeholder asset generation for immediate gameplay testing.

### Core Gameplay Loop

1. **Daily Boss Rotation**: Each day features a unique themed boss with distinct mechanics and personality
2. **Character Class Selection**: Choose from 4 unique classes with different playstyles and special abilities
3. **Strategic Energy Combat**: Manage 5 energy points with individual 30-second cooldowns for optimal damage
4. **Collaborative Battles**: Fight alongside other Reddit users in real-time community battles
5. **Cinematic Combat**: Every attack triggers a 1.5-second animated sequence with visual effects
6. **Victory Celebrations**: Defeat bosses to unlock rewards, XP progression, and leaderboards

## Complete Game Architecture

Raid Day is built as a sophisticated Phaser.js 3.70+ application with a comprehensive scene-based architecture:

### Scene Flow System
- **Boot Scene**: Quick asset loading with automatic placeholder texture generation
- **Preloader Scene**: Main asset loading with progress bar and helpful gameplay tips
- **Splash Scene**: Main menu showing today's boss theme with navigation options
- **HowToPlay Scene**: Comprehensive tutorial explaining all game mechanics
- **ClassSelect Scene**: Interactive character class selection with detailed ability descriptions
- **Battle Scene**: Full combat system with energy management, visual effects, and boss battles
- **Victory Scene**: Animated victory sequence with physics-based loot rain, XP progression, and leaderboards

### Advanced Systems Architecture
- **EnergySystem**: 5-point energy management with individual 30-second cooldowns
- **CombatSystem**: Damage calculations with class modifiers and boss phase resistance
- **AnimationSystem**: Advanced sprite management with animation queueing and state tracking
- **ParticleSystem**: Mobile-optimized particle effects with object pooling (20 particles mobile, 50 desktop)
- **AttackSequence**: Cinematic 1.5-second attack animations with 6 distinct phases
- **CameraEffectsSystem**: Dynamic screen shake, hit pause, and motion trails
- **CommunityBuffSystem**: Healer's buff aura affecting next 5 community attacks

### Comprehensive UI Framework
- **BattleHUD**: Responsive battle interface with boss HP, energy indicators, and session stats
- **ActionButton**: Interactive buttons with hover effects, press animations, and state management
- **DamageNumber**: Color-coded floating damage numbers with pooling system
- **StatusMessage**: Combat feedback messages with animation queuing

## Current Game State

Raid Day is a **fully playable and complete boss battle experience** featuring:

### ✅ Complete Implementation Status

**Fully Functional Game Systems:**
- **Complete 7-Scene Progression**: Boot → Preloader → Splash → HowToPlay → ClassSelect → Battle → Victory
- **4 Unique Character Classes**: Warrior, Mage, Rogue, and Healer with distinct abilities and playstyles
- **Advanced Combat System**: Real-time battles with cinematic 1.5-second attack sequences
- **Strategic Energy Management**: 5-point energy system with individual cooldowns and full-energy bonuses
- **Comprehensive Visual Effects**: Particle systems, screen shake, floating damage numbers, and status messages
- **Mobile-Optimized Design**: Responsive 800x600 canvas with touch controls and performance optimization
- **Daily Boss Rotation**: 7 themed bosses representing different aspects of internet culture
- **Victory Celebrations**: Physics-based loot rain, animated XP progression, and leaderboards

**Advanced Technical Features:**
- **Smart Asset Loading**: Loads static sprite images with automatic fallback to generated placeholder textures
- **Responsive Canvas Scaling**: Maintains 800x600 aspect ratio across all devices with FIT scaling mode
- **Performance Optimization**: Dynamic particle limits (20 mobile, 50 desktop) and mobile-specific optimizations
- **Error Handling**: Graceful fallbacks for missing assets with automatic placeholder generation
- **Cross-Platform Compatibility**: WebGL/Canvas fallback with consistent 60fps experience

**Ready for Production:**
- All core gameplay mechanics are fully implemented and tested
- Complete UI system with responsive design and accessibility features
- Comprehensive animation system with state management and queueing
- Advanced particle effects with object pooling for optimal performance
- Full mobile support with touch controls and haptic feedback

### 🔄 Server Integration Ready

The client-side game is complete and ready for server integration:
- Real-time boss HP synchronization across all players
- Community damage tracking and live activity feeds
- Player progression persistence and cross-session statistics
- Leaderboards with real Reddit usernames and rankings

## What Makes Raid Day Innovative and Unique

🎯 **Revolutionary Energy System**: Unlike traditional cooldown-based games, Raid Day features a fully implemented 5-point energy system where each attack consumes 1 energy point with individual 30-second cooldowns. This eliminates the frustration of waiting for a single long cooldown - instead, you can unleash 5 attacks immediately, then watch as energy points regenerate individually. Full energy (5/5) provides a 20% damage bonus to your first attack, rewarding strategic timing and patience. The system is visualized with live cooldown timers on each energy indicator, making resource management intuitive and engaging.

⚔️ **Cinematic Combat System**: Every attack triggers a fully animated 1.5-second sequence that makes combat feel impactful and satisfying. Unlike typical browser games with instant damage numbers, Raid Day creates movie-like combat sequences:
- **Phase 1**: Your character runs toward the boss (300ms)
- **Phase 2**: Attack animation with weapon motion and screen shake (200ms)
- **Phase 3**: Particle effects spawn at impact point (100ms)
- **Phase 4**: Floating damage numbers with boss hit reaction and color flash (400ms)
- **Phase 5**: Critical hit pause for dramatic impact (100ms for crits only)
- **Phase 6**: Character returns to starting position (400ms)

This system transforms simple clicking into engaging, cinematic combat that feels satisfying every time.

🎨 **Four Distinct Character Classes**: Each class offers unique combat mechanics and playstyles:
- **Warrior** (120 base damage): Balanced high-damage fighter with devastating triple-hit "Charge Attack" special ability
- **Mage** (100 base damage): Magical attacks with explosive "Fireball" special abilities and enhanced screen shake effects  
- **Rogue** (90 base damage): 30% critical hit chance with 3x damage multipliers and teleporting "Backstab" abilities
- **Healer** (80 base damage): Support-focused with "Buff Aura" that enhances the next 5 community attacks by 20%

🗓️ **Daily Boss Rotation System**: Seven unique themed bosses that reflect internet culture and daily experiences:
- **Monday**: "The Lag Spike" (Gaming) - 80,000 HP with glitchy effects and "Connection unstable!" attacks
- **Tuesday**: "The Algorithm" (Internet) - 85,000 HP with data stream effects and "Processing..." messages
- **Wednesday**: "The Influencer" (Social Media) - 75,000 HP with selfie flash attacks and "Like and subscribe!" requests
- **Thursday**: "The Deadline" (Work) - 90,000 HP with stress-inducing effects and "Time is running out!" pressure
- **Friday**: "The Spoiler" (Entertainment) - 70,000 HP with plot-revealing "The ending is..." attacks
- **Saturday**: "The Referee" (Sports) - 95,000 HP with whistle penalties and "FOUL!" calls
- **Sunday**: "The Cringe" (Memes) - 65,000 HP with embarrassing "So cringe..." outdated meme attacks

Each boss has unique HP values, attack patterns, and thematic messages that make every day feel fresh and relevant.

✨ **Advanced Visual Effects Framework**: 
- **CameraEffectsSystem**: Dynamic screen shake scaled by attack type (2px normal, 5px critical, 8px special)
- **ParticleSystem**: Mobile-optimized particle effects (20 particles mobile, 50 desktop) with object pooling
- **DamageNumber System**: Color-coded floating damage numbers (yellow=normal, orange=critical, purple=special)
- **StatusMessage System**: Combat feedback messages like "CRITICAL!", "SLASH!", "PHASE 2!"
- **ActionButton System**: Interactive UI with hover effects, press animations, and state management
- **BattleHUD System**: Responsive battle interface with boss HP, energy indicators, and session stats

📱 **Mobile-First Design**: 
- **Responsive Canvas**: 800x600 game scales automatically to any screen size while maintaining aspect ratio
- **Touch Controls**: 44x44px minimum button sizes meeting accessibility standards with haptic feedback
- **Performance Optimization**: Dynamic particle limits (20 mobile vs 50 desktop), automatic quality adjustment
- **Cross-Platform**: Works seamlessly on desktop browsers, mobile browsers, and Reddit's mobile app

🌐 **Real-Time Synchronization**: Built with advanced server integration for live multiplayer experience:
- **10-Second Boss HP Sync**: Real-time boss health updates across all players with sub-10-second accuracy
- **Live Activity Feed**: See recent attacks from other Reddit users with usernames and damage dealt
- **Community DPS Tracking**: Real-time statistics showing attacks per minute and active player count
- **Live Leaderboards**: Swipe-up overlay showing Top 20 players with real-time ranking updates
- **Reddit User Integration**: Displays actual Reddit usernames, avatars, and user data in-game

🎮 **Complete Scene-Based Experience**: 
- **Tutorial System**: Comprehensive HowToPlay scene explaining all game mechanics and strategies
- **Class Selection**: Interactive character selection with detailed ability descriptions and visual previews
- **Victory Celebrations**: Physics-based loot rain, animated XP progression, and community leaderboards
- **Responsive UI Framework**: Complete BattleHUD system with energy indicators, boss HP, and session stats

## Technology Stack

- **[Devvit](https://developers.reddit.com/)**: Reddit's developer platform for seamless community integration
- **[Phaser.js 3.70+](https://phaser.io/)**: Advanced 2D WebGL/Canvas game engine with pixel art rendering, physics, and animation systems
- **[Vite](https://vite.dev/)**: Lightning-fast build tool for optimized client and server compilation with hot reloading
- **[Express](https://expressjs.com/)**: Robust Node.js backend framework for API endpoints and Reddit integration
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe development with strict checking across client/server/shared code
- **[Redis](https://redis.io/)**: High-performance data persistence via Devvit SDK for boss HP, player stats, and leaderboards

## Architecture

- **Client-Side Game Engine**: Phaser.js handles all game logic, animations, and visual effects
- **Modular Systems**: Separate systems for energy management, combat, animations, particles, and UI
- **Scene-Based Architecture**: 7 distinct scenes with smooth transitions and state management
- **Mobile-First Design**: Responsive canvas with touch controls and performance optimization
- **Component-Based UI**: Reusable UI components with state management and visual feedback

## How to Play Raid Day

### Getting Started

1. **Launch the Game**: Click the "Play" button on the Reddit post to open Raid Day in full screen
2. **Boot & Loading**: The game automatically loads sprite images and creates placeholder textures for any missing assets
3. **Main Menu (Splash)**: You'll see today's boss theme with two options:
   - **"ENTER BATTLE"**: Jump directly into class selection and battle
   - **"HOW TO PLAY"**: Access the comprehensive tutorial system explaining all mechanics
4. **Tutorial (Recommended)**: Learn about combat mechanics, energy system, class abilities, and strategies
5. **Class Selection**: Choose your character class from four unique options with distinct playstyles and special abilities
6. **Battle**: Engage in cinematic combat with energy management and visual effects
7. **Victory**: Celebrate with physics-based loot rain and progression rewards

### What You'll Experience

**Immediate Gameplay**: The game is fully functional right now with all systems working. While it uses placeholder graphics for sprites, every mechanic from energy management to boss battles to victory celebrations is complete and playable.

**Visual Polish**: The game features a dark battle atmosphere theme, responsive UI scaling, and comprehensive visual effects including particle systems, screen shake, floating damage numbers, and animated status messages.

**Real-Time Multiplayer**: Experience live synchronization with other Reddit users through the SynchronizationSystem, which provides 10-second boss HP updates, live activity feeds showing recent attacks, and real-time leaderboards accessible via swipe gestures.

### Complete Game Flow

#### 🚀 Scene Progression (7 Complete Scenes)
1. **Boot Scene**: Quick asset loading with automatic placeholder texture generation for missing sprites
2. **Preloader Scene**: Main asset loading with progress bar and helpful gameplay tips (randomly selected)
3. **Splash Scene**: Main menu showing today's boss theme with "ENTER BATTLE" and "HOW TO PLAY" options
4. **HowToPlay Scene**: Comprehensive tutorial explaining all game mechanics, controls, and strategies
5. **ClassSelect Scene**: Interactive character class selection with detailed ability descriptions and visual previews
6. **Battle Scene**: Full combat system with energy management, cinematic attack sequences, and boss battles
7. **Victory Scene**: Animated victory sequence with physics-based loot rain, XP progression, and community leaderboards

Each scene is fully responsive and optimized for both mobile and desktop play, with smooth transitions and state management between scenes.

#### ⚔️ Character Classes (Choose Your Playstyle)

**🛡️ Warrior** (120 Base Damage)
- **Playstyle**: Balanced high-damage fighter with reliable combat effectiveness
- **Special Ability**: "Charge Attack" - Triple-hit combo with escalating screen shake effects
- **Animation**: Charges forward with enhanced speed, performs 3 hits with increasing intensity
- **Best For**: Players who want consistent, straightforward damage output

**🔮 Mage** (100 Base Damage)  
- **Playstyle**: Magical attacks with spectacular explosive visual effects
- **Special Ability**: "Fireball" - Projectile attack with massive explosion and screen shake
- **Animation**: Charges up with blue glow, launches fireball projectile, creates massive explosion
- **Best For**: Players who enjoy visually impressive spell-based combat

**🗡️ Rogue** (90 Base Damage)
- **Playstyle**: High-risk, high-reward with 30% critical hit chance (3x damage)
- **Special Ability**: "Backstab" - Teleport behind boss with guaranteed critical hit and time-freeze effects
- **Animation**: Creates shadow clone, teleports behind boss, triggers slow-motion critical strike
- **Best For**: Risk/reward players who love unpredictable high damage spikes

**💚 Healer** (80 Base Damage)
- **Playstyle**: Support-focused with unique community benefits
- **Special Ability**: "Buff Aura" - Enhances the next 5 community attacks by 20% damage
- **Animation**: Creates expanding aura rings, glows with healing light, sparkle particles
- **Best For**: Team players who want to support the community effort

#### ⚡ Revolutionary Energy System

**How It Works**:
- Start each session with 5 full energy points (displayed as green circles in the HUD)
- Each attack consumes 1 energy point with a 30-second individual cooldown
- Attack with full energy (5/5) for a 20% damage bonus on your first strike
- Energy points regenerate individually - no need to wait for all 5 to recharge
- Visual indicators show live cooldown timers on each energy point

**Combat Actions**:
- **Normal Attack**: Click "ATTACK" button or press SPACEBAR to perform a cinematic 1.5-second sequence
- **Special Ability**: Click "SPECIAL" button or press SHIFT for enhanced damage (costs 3 energy, usable once per session)
- **Critical Hits**: Rogues have 30% chance, others have 10% (all crits deal 3x damage with hit pause effects)

#### 🎬 Cinematic Attack Sequence (1.5 seconds total)
1. **Run Forward** (300ms): Character runs toward the boss with scaling animation
2. **Attack Animation** (200ms): Class-specific attack with weapon motion and screen shake
3. **Particle Effects** (100ms): Particle effects spawn at impact point with pooled system
4. **Damage Display** (400ms): Color-coded floating damage numbers with boss hit reaction
5. **Hit Pause** (100ms): Critical hit pause with time-freeze for dramatic impact
6. **Run Back** (400ms): Character returns to starting position

#### 🐉 Daily Boss Rotation

Each day features a unique themed boss with distinct mechanics:

**Monday - "The Lag Spike" (Gaming)**
- HP: 80,000 | Level: 45 | Attack: "Connection unstable!" every 8 seconds

**Tuesday - "The Algorithm" (Internet)**
- HP: 85,000 | Level: 47 | Attack: "Processing..." every 7 seconds

**Wednesday - "The Influencer" (Social Media)**
- HP: 75,000 | Level: 42 | Attack: "Like and subscribe!" every 6 seconds

**Thursday - "The Deadline" (Work)**
- HP: 90,000 | Level: 50 | Attack: "Time is running out!" every 5 seconds

**Friday - "The Spoiler" (Entertainment)**
- HP: 70,000 | Level: 40 | Attack: "The ending is..." every 9 seconds

**Saturday - "The Referee" (Sports)**
- HP: 95,000 | Level: 52 | Attack: "FOUL!" every 4 seconds

**Sunday - "The Cringe" (Memes)**
- HP: 65,000 | Level: 38 | Attack: "So cringe..." every 10 seconds

#### 🎮 Step-by-Step Gameplay

**Getting Into Battle (30 seconds)**:
1. Click "Play" on the Reddit post to open the game in full screen
2. **Boot Scene**: Quick asset loading with automatic placeholder texture generation
3. **Preloader Scene**: Watch the progress bar as the game loads (shows helpful tips like "Rogues have 30% critical hit chance!")
4. **Splash Scene**: See today's boss theme and choose "ENTER BATTLE" or "HOW TO PLAY"

**Character Selection (30 seconds)**:
5. **ClassSelect Scene**: Select from 4 unique character classes with different abilities and descriptions
6. Click "START BATTLE" to enter combat with your chosen class

**Combat Phase (2-5 minutes)**:
7. **Battle Scene**: Start with 5 energy points (green circles in the HUD)
8. Click "ATTACK" or press SPACEBAR to fight with cinematic 1.5-second sequences
9. Use "SPECIAL" or press SHIFT for powerful abilities (once per session, costs 3 energy)
10. Watch boss phases change at 75% HP with enhanced effects and "PHASE 2!" message
11. See other players' community attacks appear as visual effects through real-time synchronization
12. Monitor your session damage, rank, and active raiders in the side panel
13. Access live leaderboards by swiping up (mobile) or clicking the leaderboard button
14. View recent attacks from other Reddit users in the live activity feed

**Victory Celebration (1-2 minutes)**:
15. **Victory Scene**: Enjoy explosive boss death animation with massive screen shake
16. Watch physics-based loot rain fall from the sky with different item types
17. See character level up with animated XP progression and experience bars
18. Check leaderboards and rankings against other players (Top 5 contributors)
19. Preview tomorrow's boss with countdown timer and theme information
20. Share your session damage to Reddit or return to the main menu

#### 🎯 Battle Interface

**Top HUD**: Boss name, level, HP bar with real-time updates
**Bottom HUD**: Energy indicators with live cooldown timers, ATTACK/SPECIAL buttons
**Side Panel**: Session damage stats, player ranking, active community raiders

#### 🎨 Visual Feedback System

**Damage Numbers**: Yellow (normal), Orange (critical), Purple (special), Gray (community)
**Status Messages**: "CRITICAL!", "SLASH!", "PHASE 2!", "VICTORY!" with unique animations
**Screen Effects**: 2px (normal), 5px (critical), 8px (special/phase change) camera shake
**Particle Effects**: Mobile-optimized with object pooling (20 mobile, 50 desktop particles)

#### 🎮 Controls

**Desktop**: Mouse clicks for UI, SPACEBAR (attack), SHIFT (special ability)
**Mobile**: Touch controls with 44x44px minimum button sizes, haptic feedback, responsive layout

### Advanced Strategy Tips

**Energy Optimization**: Always start battles with full energy for the 20% damage bonus
**Class Strategies**: Warrior for consistent damage, Mage for visual spectacle, Rogue for high crits, Healer for team support
**Boss Phases**: Focus on consistent damage in Phase 1, expect 10% resistance in Phase 2
**Community Coordination**: Healers can buff community attacks, coordinate for maximum effect

## Development

### Setup
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Deploy
```bash
npm run deploy
```

### Current Asset Status

The game runs at 800x600 resolution with responsive scaling and features:
- **Smart Asset Loading**: Attempts to load character and boss sprites from `/assets/sprites/` directory
- **Automatic Fallback**: Creates colored placeholder textures when sprite files are missing
- **Complete Functionality**: All game systems work regardless of asset availability
- **Ready for Art**: Simply add PNG files to the assets directory to replace placeholders
- **Placeholder Generation**: Boot and Preloader scenes automatically create colored shapes for all missing sprites
- **Visual Consistency**: Each character class and boss has distinct colors for easy identification

### Asset Structure Expected
```
src/client/public/assets/
├── sprites/
│   ├── warrior.png          # Red placeholder (32x32 recommended)
│   ├── mage.png             # Blue placeholder (32x32 recommended)
│   ├── rogue.png            # Green placeholder (32x32 recommended)
│   ├── healer.png           # Yellow placeholder (32x32 recommended)
│   ├── boss_lag_spike.png   # Dark red placeholder (128x128 recommended)
│   ├── boss_algorithm.png   # Green placeholder (128x128 recommended)
│   ├── boss_influencer.png  # Pink placeholder (128x128 recommended)
│   ├── boss_deadline.png    # Yellow placeholder (128x128 recommended)
│   ├── boss_spoiler.png     # Purple placeholder (128x128 recommended)
│   ├── boss_referee.png     # Black placeholder (128x128 recommended)
│   └── boss_cringe.png      # Orange placeholder (128x128 recommended)
├── backgrounds/
│   ├── castle_arena.png     # Battle background
│   └── bg.png               # General background
└── logo.png                 # Game logo
```

The game is fully playable with or without these assets thanks to intelligent placeholder generation in the Boot and Preloader scenes.

## Current Technical Implementation

### Fully Implemented Systems

**🎮 Complete Scene Architecture**:
- **7 Scenes**: Boot → Preloader → Splash → HowToPlay → ClassSelect → Battle → Victory
- **Responsive Design**: 800x600 canvas with FIT scaling mode for all screen sizes
- **Mobile Optimization**: Touch controls, haptic feedback, and performance adjustments
- **Smart Asset Loading**: Attempts to load real sprites, creates colored placeholders for missing assets

**⚔️ Advanced Combat System**:
- **EnergySystem**: 5-point energy with individual 30-second cooldowns and 2-hour session refresh
- **CombatSystem**: Damage calculations with class modifiers, critical hits, and boss phase resistance
- **AttackSequence**: Cinematic 1.5-second attack animations with 6 distinct phases
- **CommunityBuffSystem**: Healer's buff aura affecting next 5 community attacks by 20%
- **DamageCalculator**: Centralized damage formulas with class-specific base damage and modifiers

**🎨 Comprehensive Visual Effects**:
- **ParticleSystem**: Mobile-optimized with object pooling (20 mobile/50 desktop particles)
- **CameraEffectsSystem**: Dynamic screen shake, hit pause, motion trails, and weapon trails
- **DamageNumberPool**: Color-coded floating damage numbers with pooling system
- **StatusMessageQueue**: Combat feedback messages with animation queueing and unique effects
- **ResponsiveLayoutSystem**: Dynamic layout management for portrait/landscape orientations

**🖥️ Complete UI Framework**:
- **BattleHUD**: Responsive battle interface with boss HP, energy indicators, session stats
- **ActionButton**: Interactive buttons with hover effects, press animations, state management
- **LiveActivityFeed**: Shows recent real player attacks with Reddit usernames and avatars
- **LiveLeaderboard**: Swipe-up overlay showing Top 20 players with real-time updates
- **StatusMessage**: Combat feedback with unique animations for different message types

**🏗️ Robust Architecture**:
- **TypeScript**: Strict type checking across all systems with shared types
- **Modular Design**: Separate systems for energy, combat, animations, particles, UI, and mobile optimization
- **Error Handling**: Graceful fallbacks for missing assets with automatic placeholder generation
- **Performance Optimization**: Mobile-specific optimizations, dynamic quality adjustment, and performance monitoring

### Fully Implemented Real-Time Features

**🌐 Live Synchronization System**:
- **SynchronizationSystem**: 10-second boss HP sync with sub-10-second accuracy across all players
- **LiveActivityFeed**: Shows recent attacks from other Reddit users with usernames and damage dealt
- **LiveLeaderboard**: Swipe-up overlay displaying Top 20 players with real-time ranking updates
- **Community DPS Tracking**: Real-time statistics showing attacks per minute and active player count
- **Reddit User Integration**: Displays actual Reddit usernames, avatars, and user data in-game

**📱 Platform Features**:
- Devvit integration for Reddit posts with automatic post creation
- Responsive design for mobile and desktop with FIT scaling
- Touch controls with 44x44px minimum button sizes meeting accessibility standards
- Cross-platform compatibility across all modern browsers and Reddit's mobile app