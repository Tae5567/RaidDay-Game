# Raid Day - Boss Battle Arena

**A collaborative boss battle game for Reddit communities built with Phaser.js**

Raid Day is a 2D boss battle game that brings Reddit communities together to defeat daily themed bosses. Built with Phaser.js 3.70+ and integrated with Reddit's Devvit platform, the game features streamlined combat mechanics, character class selection, and community-driven boss battles with shared HP pools.

## What is Raid Day?

Raid Day is a community-driven boss battle game where Reddit users work together to defeat daily themed bosses. Each day features a different boss representing internet culture - from "The Lag Spike" (Gaming) to "The Algorithm" (Internet) to "The Cringe" (Memes) - with 50,000 HP that's shared across all players.

The game features streamlined combat where players select a character class (Warrior, Mage, Rogue, or Healer) and engage in 60-second battle sessions against the daily boss. Combat uses a dual health system where players have 500 HP while fighting against bosses with 50,000 shared HP. Players attack by clicking the attack button, triggering satisfying 0.8-second animation sequences, while bosses retaliate every 8-15 seconds dealing 50-150 damage.

**Current Implementation**: The game is fully functional with a complete 7-scene system (Boot → Splash → CharacterSelect → HowToPlay → Battle → Results → Victory). It features responsive full-screen scaling that adapts to any device size, character class selection with balanced gameplay, click-to-attack combat mechanics with visual feedback, physics-based victory celebrations, and Reddit integration for sharing battle results.

## What Makes Raid Day Innovative and Unique

⚡ **Simple Click-to-Attack Combat**: Raid Day features intuitive one-button combat where players click the "ATTACK" button to deal damage. Each attack triggers a precise 0.8-second animation sequence where your character runs forward (0.3s), attacks the boss (0.2s), and returns to position (0.3s). The system provides immediate visual feedback with screen shake, floating damage numbers, and boss hit reactions.

🎯 **Balanced Character Classes**: Choose from 4 character classes with unique critical hit chances:
- **Warrior**: Balanced damage (180-220) with 15% critical hit chance - reliable and consistent
- **Mage**: High magical damage (200-250) with 10% critical hit chance - high damage output
- **Rogue**: Variable damage (160-200) with 30% critical hit chance - high-risk/high-reward gameplay
- **Healer**: Consistent damage (140-180) with 5% critical hit chance - support-focused with steady output

🎮 **Dual Health System**: Experience intense 60-second battles where both you and the boss have health bars:
- **Your Health**: 500 HP that decreases when the boss attacks every 8-15 seconds (50-150 damage)
- **Boss Health**: 50,000 HP shared across the entire community
- **Strategic Combat**: Balance offense and survival as you race to deal damage before the boss defeats you
- **Session-Based**: Each battle lasts 60 seconds or until your HP reaches 0

⚔️ **Visual Combat Feedback**: The game features satisfying visual effects optimized for both desktop and mobile:
- **Attack Animations**: Precise 0.8-second sequences with character movement and boss reactions
- **Screen Shake**: Dynamic camera effects scaled by damage (2px normal, 5px critical, 8px boss phase)
- **Damage Numbers**: Floating damage indicators with "YOUR damage: +234" styling to distinguish your attacks
- **Boss Reactions**: Hit flashes, color effects, and visual feedback for every attack
- **Particle Effects**: Attack effects and critical hit bursts (limited to 10 particles on mobile for performance)

🗓️ **Daily Boss Rotation**: Seven themed bosses representing internet culture, each with unique attack patterns:
- **Sunday**: "The Cringe" (Memes) - Cringe wave attacks every 10 seconds
- **Monday**: "The Lag Spike" (Gaming) - Glitch attacks every 8 seconds
- **Tuesday**: "The Algorithm" (Internet) - Data stream attacks every 7 seconds
- **Wednesday**: "The Influencer" (Social Media) - Selfie flash attacks every 6 seconds
- **Thursday**: "The Deadline" (Work) - Clock tick attacks every 5 seconds (most aggressive)
- **Friday**: "The Spoiler" (Entertainment) - Spoiler reveal attacks every 9 seconds
- **Saturday**: "The Referee" (Sports) - Whistle blow attacks every 4 seconds

📱 **Responsive Full-Screen Design**: 
- **RESIZE Scaling**: Game fills the entire browser window and adapts to any screen size (320x240 to 2560x1440)
- **Mobile Optimized**: Large touch targets (60x60px minimum) with visual feedback and performance monitoring
- **Cross-Platform**: Consistent 60fps experience on desktop and mobile with automatic quality adjustments
- **Performance Monitoring**: Real-time FPS monitoring with automatic fallback modes for low-performance devices

🌐 **Reddit Community Integration**: 
- **Session Sharing**: Share battle results directly to r/RaidDay with damage totals and rankings
- **Shared Boss HP**: Community progress persists across all players with real-time synchronization
- **Victory Celebrations**: Physics-based loot rain, animated leaderboards, and automatic victory posts when bosses are defeated
- **Live Stats**: Real-time fighter count and community progress updates

🎉 **Victory Celebrations**: When the community defeats a boss, experience spectacular victory sequences with:
- **Physics-Based Loot Rain**: 30 different loot items fall from the sky with realistic physics and bouncing
- **Animated Leaderboards**: Top 5 contributors displayed with class indicators and damage totals
- **XP Progression**: Animated XP bars with level-up effects and progression rewards
- **Next Boss Preview**: Countdown timer and preview of tomorrow's boss challenge

## Game Architecture & Technical Implementation

Raid Day runs as a Phaser.js 3.70+ application with full-screen RESIZE scaling that fills the entire browser window and adapts to any screen size (320x240 minimum to 2560x1440 maximum). The game uses WebGL rendering with Canvas fallback, pixel art optimization, and Arcade Physics for smooth 60fps gameplay across desktop and mobile devices. The RESIZE scaling mode ensures immersive full-screen experience across all devices while maintaining optimal performance.

### Phaser.js Configuration
- **Engine**: Phaser.js 3.70+ with AUTO renderer selection (WebGL preferred, Canvas fallback)
- **Canvas Size**: 800x600 base resolution with FIT scaling to maintain aspect ratio while maximizing screen usage
- **Physics**: Arcade Physics with zero gravity for top-down battle view
- **Rendering**: Pixel art optimized with antialiasing and round pixels enabled
- **Performance**: 60fps target with mobile-specific optimizations and dynamic quality adjustment
- **Responsive Design**: Mobile-first approach with touch-friendly controls and performance monitoring

### Complete Scene Flow System
The game features 7 fully implemented scenes with smooth transitions and state management:

1. **Boot Scene**: Quick asset loading with automatic placeholder texture generation for missing sprites
2. **Splash Scene**: Main menu showing today's boss theme, community stats, and "FIGHT NOW!" button
3. **CharacterSelect Scene**: Choose from 4 character classes (Warrior, Mage, Rogue, Healer) with unique abilities
4. **HowToPlay Scene**: Tutorial and instructions explaining game mechanics and controls
5. **Battle Scene**: Full combat system with dual health bars, boss attacks, and real-time 1v1 battles
6. **Results Scene**: Session summary with damage totals, boss progress, player ranking, and Reddit sharing options
7. **Victory Scene**: Animated victory sequence with physics-based loot rain, progression rewards, and community celebration

### Advanced Systems Architecture
- **Dual Health System**: Player (500 HP) vs Boss (50,000 HP) with real-time health tracking and visual feedback
- **Boss Attack System**: Bosses attack players every 8-15 seconds dealing 50-150 damage, creating survival pressure
- **DamageCalculator**: Balanced damage calculations with class-based ranges (160-240 damage) and 15% critical hit chance (30% for Rogue)
- **ActionButton**: Responsive button system with 0.8-second cooldown prevention, success/error animations, and mobile optimization
- **Visual Effects**: Dynamic screen shake (2px normal, 5px critical, 8px boss phase), color-coded floating damage numbers, boss hit reactions, and particle effects
- **Character Classes**: 4 unique classes with balanced gameplay - Warrior, Mage, Rogue, and Healer with distinct visual styles
- **Animation Systems**: Precise 0.8-second attack sequences (0.3s run forward, 0.2s attack, 0.3s run back), boss phase transitions, and victory celebrations with physics-based loot rain
- **Mobile Optimization**: Touch-friendly controls with 60x60px minimum targets, full-screen scaling, and performance adjustments for mobile devices

## How to Play Raid Day

### Getting Started

1. **Launch the Game**: Click "Play" on the Reddit post to open Raid Day in full screen
2. **Main Menu (Splash)**: View today's boss with HP bar, community stats, and "SELECT CLASS" button
3. **Character Selection**: Choose from 4 character classes (Warrior, Mage, Rogue, Healer)
4. **Battle**: Engage in 60-second combat sessions where both you and the boss have health bars
5. **Results**: View your session summary with damage totals and sharing options
6. **Victory**: If the boss is defeated, celebrate with victory animations and loot rain

### Step-by-Step Gameplay

#### 🚀 Complete Game Flow (7 Scenes)
1. **Boot Scene**: Asset loading with automatic placeholder generation for missing sprites
2. **Splash Scene**: Main menu showing today's boss, shared HP bar (with percentage), and community fighter count
3. **CharacterSelect Scene**: Choose from 4 character classes with unique abilities and critical hit chances
4. **HowToPlay Scene**: Tutorial explaining game mechanics, controls, and objectives (optional)
5. **Battle Scene**: 60-second combat sessions with dual health bars and boss counter-attacks
6. **Results Scene**: Session summary with damage dealt, player ranking, and Reddit sharing options
7. **Victory Scene**: Celebration sequence with physics-based loot rain, leaderboards, and next boss preview

#### ⚡ Combat System

**How Combat Works**:
- **Session Timer**: Each battle lasts exactly 60 seconds (displayed at top-right)
- **Your Health**: Start with 500 HP (displayed at bottom-left with color-coded bar)
- **Boss Health**: Boss has 50,000 HP (displayed at top, shared across all players, updates in real-time)
- **Attack**: Click "ATTACK" button to deal class-based damage with 0.8-second cooldown
- **Special Abilities**: Each class has a unique special ability with 30-second cooldown
- **Boss Counter-Attacks**: Boss automatically attacks you every 8-15 seconds dealing 50-150 damage
- **Battle End**: When session timer reaches 0, your HP reaches 0, or boss HP reaches 0 (community wins)

#### 🎯 Character Classes (Balanced for Strategic Choice)

1. **Warrior**: Balanced damage (180-220) with 15% critical hit chance - reliable and consistent
   - **Special Ability**: RAGE - Next attacks deal double damage with enhanced visual effects
2. **Mage**: High magical damage (200-250) with 10% critical hit chance - high damage output  
   - **Special Ability**: FIREBALL - High damage area attack with particle burst effects
3. **Rogue**: Variable damage (160-200) with 30% critical hit chance - high-risk/high-reward gameplay
   - **Special Ability**: STEALTH - Guaranteed critical hit on next attack with 3x damage
4. **Healer**: Consistent damage (140-180) with 5% critical hit chance - support-focused with steady output
   - **Special Ability**: HEAL - Restore 150 HP while dealing damage to the boss

#### 🗓️ Daily Boss Schedule (Different Boss Each Day)

- **Sunday**: "The Cringe" (Memes theme) - Cringe wave attacks every 10 seconds
- **Monday**: "The Lag Spike" (Gaming theme) - Glitch attacks every 8 seconds
- **Tuesday**: "The Algorithm" (Internet theme) - Data stream attacks every 7 seconds
- **Wednesday**: "The Influencer" (Social Media theme) - Selfie flash attacks every 6 seconds
- **Thursday**: "The Deadline" (Work theme) - Clock tick attacks every 5 seconds (most aggressive)
- **Friday**: "The Spoiler" (Entertainment theme) - Spoiler reveal attacks every 9 seconds
- **Saturday**: "The Referee" (Sports theme) - Whistle blow attacks every 4 seconds

#### 🎮 Detailed Gameplay Instructions

**Combat Mechanics**:
1. Click "ATTACK" to deal damage to the boss (0.8-second animation sequence)
2. Watch your character run forward (0.3s) → attack (0.2s) → run back (0.3s)
3. Use your class-specific special ability for enhanced damage and effects
4. Monitor both health bars - yours changes color based on HP percentage (green → yellow → red)
5. Survive boss counter-attacks that occur automatically at different intervals per boss
6. Continue until session timer reaches 0, your HP reaches 0, or the community defeats the boss

**Visual Feedback System**:
- **Screen Shake**: 2px for normal attacks, 5px for critical hits, 8px for boss phase changes
- **Damage Numbers**: Floating numbers with "YOUR damage: +234" styling to distinguish your attacks
- **Boss Reactions**: Color flashes and hit effects for every successful attack
- **Critical Hits**: Enhanced damage numbers with special effects and 3x damage multiplier
- **Attack Cooldown**: Button disabled for 0.8 seconds to prevent spam clicking
- **Special Effects**: Class-specific visual effects for special abilities (screen flashes, particles)

**Victory Celebrations**:
When the community defeats a boss, experience spectacular celebrations:
- **Physics-Based Loot Rain**: 30 different loot items (coins, gems, potions, scrolls, chests, stars) fall with realistic physics
- **Animated Leaderboards**: Top 5 contributors with class indicators, levels, and damage totals
- **XP Progression**: Animated XP bars with level-up effects and progression rewards
- **Next Boss Preview**: Countdown timer and preview of tomorrow's boss challenge
- **Victory Posts**: Automatic Reddit posts celebrating the community victory with top contributors

**Advanced Strategy**:
- **Timing**: Attack as quickly as cooldown allows (every 0.8 seconds)
- **Health Management**: Monitor your health carefully - different bosses attack at different frequencies
- **Class Selection**: Choose Rogue for maximum critical hit potential (30% chance vs 10-15% for others)
- **Special Abilities**: Use special abilities strategically - they have 30-second cooldowns
- **Session Planning**: Make the most of your 60-second sessions by attacking continuously
- **Boss Phases**: Bosses become more aggressive at 75% HP and enter enrage mode at 25% HP

## Current Game State

Raid Day is **fully functional and playable** with all core systems implemented and battle-tested:

### ✅ Complete Implementation

**Core Game Systems:**
- **7-Scene Progression**: Boot → Splash → CharacterSelect → HowToPlay → Battle → Results → Victory
- **60-Second Combat Sessions**: Player (500 HP) vs Boss (50,000 HP) with boss counter-attacks every 8-15 seconds
- **Character Classes**: 4 balanced classes with unique critical hit chances (Warrior 15%, Mage 10%, Rogue 30%, Healer 5%)
- **Precise Combat Timing**: 0.8-second attack sequences with 0.3s run forward, 0.2s attack, 0.3s run back
- **Advanced Visual Effects**: Screen shake (2px/5px/8px), floating damage numbers, boss hit reactions, particle effects
- **Responsive Design**: RESIZE scaling that fills entire browser window and adapts to all device sizes (320x240 to 2560x1440)
- **Daily Boss Rotation**: 7 themed bosses with unique attack patterns and frequencies
- **Reddit Integration**: Session sharing, victory posts, and community progress tracking

**Advanced Features:**
- **Session-Based Gameplay**: Timed 60-second battles with attack counters and session summaries
- **Real-Time Synchronization**: Boss HP updates every 10 seconds, community stats tracking
- **Performance Monitoring**: Automatic FPS monitoring with quality adjustments and fallback modes
- **Mobile Optimization**: Touch-friendly controls (60x60px minimum), particle limits (10 on mobile, 50 on desktop)
- **Victory Celebrations**: Physics-based loot rain with 30 different items, animated leaderboards, XP progression
- **Asset Management**: Automatic placeholder generation for missing sprites with proper scaling

**Victory System:**
- **Physics-Based Loot Rain**: 30 different loot types (coins, gems, potions, scrolls, chests, stars) with realistic physics
- **Animated Leaderboards**: Top 5 contributors with class indicators, levels, and damage totals
- **XP Progression**: Animated XP bars with level-up effects and progression rewards
- **Next Boss Preview**: Countdown timer and preview of tomorrow's boss challenge
- **Celebration Effects**: Fireworks, confetti, screen flashes, and particle bursts

**Technical Excellence:**
- **Cross-Platform**: WebGL/Canvas fallback with consistent 60fps performance on desktop and mobile
- **Error Handling**: Graceful degradation, network failure recovery, and automatic fallbacks
- **Memory Management**: Object pooling for damage numbers and particles, automatic cleanup systems
- **API Integration**: RESTful endpoints for attack processing, leaderboards, and community data

### What You'll Experience

**Complete Gameplay Loop**: All systems are fully functional from character selection through victory celebrations. The game provides complete 60-second battle sessions with meaningful progression and community interaction.

**Immersive Combat**: Precise 0.8-second attack animations, dual health management with color-coded bars, boss counter-attacks at varying frequencies, and class-based strategy create engaging moment-to-moment gameplay.

**Community Experience**: Real-time shared boss HP, live fighter counts, spectacular victory celebrations with physics-based loot rain, animated leaderboards, and automatic Reddit integration for sharing achievements.

**Performance Excellence**: Consistent 60fps performance across all devices with automatic quality adjustments, mobile optimizations, and graceful fallback systems for low-performance devices.

## Technical Architecture

### Phaser.js Configuration
- **Engine**: Phaser.js 3.70+ with AUTO renderer (WebGL preferred, Canvas fallback)
- **Scaling**: RESIZE mode fills entire browser window, adapts to any screen size (320x240 to 2560x1440)
- **Physics**: Arcade Physics with zero gravity for battle view
- **Rendering**: Pixel art optimized with antialiasing and round pixels
- **Performance**: 60fps target with mobile optimizations and quality adjustment

### Scene System (7 Scenes)
1. **Boot**: Asset loading with automatic placeholder generation
2. **Splash**: Main menu with boss preview and community stats
3. **CharacterSelect**: Choose from 4 character classes
4. **HowToPlay**: Tutorial and game instructions
5. **Battle**: Combat system with dual health bars
6. **Results**: Session summary and Reddit sharing
7. **Victory**: Celebration sequence when boss defeated

### Core Systems
- **Dual Health**: Player (500 HP) vs Boss (50,000 HP) with real-time tracking
- **Boss Attacks**: Automatic boss attacks every 8-15 seconds dealing 50-150 damage
- **Damage Calculator**: Balanced calculations with class-based ranges (160-240 damage)
- **Action Button**: 0.8-second cooldown prevention with visual feedback
- **Visual Effects**: Screen shake, floating damage numbers, boss reactions, particles
- **Character Classes**: 4 balanced classes with unique abilities and sprites
- **Attack Animations**: 0.8-second sequences (0.3s forward, 0.2s attack, 0.3s back)
- **Mobile Optimization**: Touch controls with 60x60px minimum targets

## Technology Stack

- **[Devvit](https://developers.reddit.com/)**: Reddit's developer platform for community integration
- **[Phaser.js 3.70+](https://phaser.io/)**: 2D WebGL/Canvas game engine with pixel art rendering
- **[Vite](https://vite.dev/)**: Build tool for client and server compilation with TypeScript
- **[Express](https://expressjs.com/)**: Node.js backend framework for API endpoints
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe development across client/server/shared code
- **[Redis](https://redis.io/)**: Data persistence via Devvit SDK for boss HP and player stats
