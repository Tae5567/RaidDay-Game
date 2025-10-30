# Raid Day - Boss Battle Arena

**A collaborative boss battle game for Reddit communities built with Phaser.js**

Raid Day is a 2D boss battle game that brings Reddit communities together to defeat daily themed bosses. Built with Phaser.js 3.70+ and integrated with Reddit's Devvit platform, the game features streamlined combat mechanics, character class selection, and community-driven boss battles with shared HP pools.

## What is Raid Day?

Raid Day is a community-driven boss battle game where Reddit users work together to defeat daily themed bosses. Each day features a different boss representing internet culture - from "The Lag Spike" (Gaming) to "The Algorithm" (Internet) to "The Cringe" (Memes) - with 50,000 HP that's shared across all players.

The game features streamlined combat where players select a character class (Warrior, Mage, Rogue, or Healer) and engage in battles against the daily boss. Combat uses a dual health system where players have 500 HP while fighting against bosses with 50,000 shared HP. Players attack by clicking the attack button, triggering satisfying 0.8-second animation sequences, while bosses retaliate every 8-15 seconds.

**Current Implementation**: The game is fully functional with a complete 7-scene system (Boot → Splash → CharacterSelect → HowToPlay → Battle → Results → Victory). It features responsive full-screen scaling that adapts to any device size, character class selection with balanced gameplay, click-to-attack combat mechanics with visual feedback, and Reddit integration for sharing battle results. The game uses automatically generated placeholder graphics while maintaining complete functionality.

## What Makes Raid Day Innovative and Unique

⚡ **Simple Click-to-Attack Combat**: Raid Day features intuitive one-button combat where players click the "ATTACK" button to deal damage. Each attack triggers a 0.8-second animation sequence where your character runs forward, attacks the boss, and returns to position. The system provides immediate visual feedback with screen shake, floating damage numbers, and boss hit reactions.

🎯 **Balanced Character Classes**: Choose from 4 character classes - Warrior (balanced), Mage (high damage), Rogue (critical hits), and Healer (support) - each with unique sprites and abilities. All classes deal similar damage ranges (160-240) to ensure balanced gameplay where strategy matters more than class selection.

🎮 **Dual Health System**: Experience battles where both you and the boss have health bars:
- **Your Health**: 500 HP that decreases when the boss attacks every 8-15 seconds
- **Boss Health**: 50,000 HP shared across the community
- **Strategic Combat**: Balance offense and survival as you race to deal damage before the boss defeats you
- **Session-Based**: Each battle continues until your HP reaches 0 or the boss is defeated

⚔️ **Visual Combat Feedback**: The game features satisfying visual effects:
- **Attack Animations**: 0.8-second sequences where characters run forward, attack, and return
- **Screen Shake**: Dynamic camera effects scaled by damage (normal, critical, boss phase)
- **Damage Numbers**: Floating damage indicators with "YOUR damage: +234" styling
- **Boss Reactions**: Hit flashes, knockback effects, and visual feedback
- **Particle Effects**: Attack effects and critical hit bursts (optimized for mobile)

🗓️ **Daily Boss Rotation**: Seven themed bosses representing internet culture:
- **Monday**: "The Lag Spike" (Gaming) - Connection issues and gaming frustrations
- **Tuesday**: "The Algorithm" (Internet) - Data processing and algorithms  
- **Wednesday**: "The Influencer" (Social Media) - Social pressure and influence
- **Thursday**: "The Deadline" (Work) - Time stress and work pressure
- **Friday**: "The Spoiler" (Entertainment) - Plot reveals and spoilers
- **Saturday**: "The Referee" (Sports) - Penalty calls and controversies
- **Sunday**: "The Cringe" (Memes) - Outdated memes and cringe content

📱 **Responsive Full-Screen Design**: 
- **RESIZE Scaling**: Game fills the entire browser window and adapts to any screen size
- **Mobile Optimized**: Large touch targets (60x60px minimum) with visual feedback
- **Cross-Platform**: Consistent 60fps experience on desktop and mobile
- **Performance Monitoring**: Automatic quality adjustments for optimal performance

🌐 **Reddit Community Integration**: 
- **Session Sharing**: Share battle results directly to r/RaidDay
- **Shared Boss HP**: Community progress persists across all players
- **Victory Celebrations**: Automatic posts when bosses are defeated
- **Live Stats**: Real-time fighter count and community progress

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
4. **Battle**: Engage in combat where both you and the boss have health bars
5. **Results**: View your session summary with damage totals and sharing options
6. **Victory**: If the boss is defeated, celebrate with victory animations

### Step-by-Step Gameplay

#### 🚀 Game Flow (7 Scenes)
1. **Boot Scene**: Asset loading with automatic placeholder generation for missing sprites
2. **Splash Scene**: Main menu showing today's boss, shared HP bar, and community stats
3. **CharacterSelect Scene**: Choose from 4 character classes with unique abilities
4. **HowToPlay Scene**: Tutorial explaining game mechanics (optional)
5. **Battle Scene**: Combat system with dual health bars
6. **Results Scene**: Session summary with damage dealt and Reddit sharing
7. **Victory Scene**: Celebration sequence when boss is defeated

#### ⚡ Combat System

**How Combat Works**:
- **Your Health**: Start with 500 HP (displayed at bottom)
- **Boss Health**: Boss has 50,000 HP (displayed at top, shared across all players)
- **Attack**: Click "ATTACK" button to deal 160-240 damage
- **Boss Attacks**: Boss attacks you every 8-15 seconds dealing 50-150 damage
- **Battle End**: When your HP reaches 0 (you lose) or boss HP reaches 0 (community wins)

#### 🎯 Character Classes

1. **Warrior**: Balanced damage (180-220) with strong melee attacks
2. **Mage**: High magical damage (170-230) with spell-based attacks  
3. **Rogue**: Variable damage (160-240) with 30% critical hit chance
4. **Healer**: Consistent damage (175-225) with support abilities

#### 🗓️ Daily Boss Schedule

- **Monday**: "The Lag Spike" (Gaming theme)
- **Tuesday**: "The Algorithm" (Internet theme)
- **Wednesday**: "The Influencer" (Social Media theme)
- **Thursday**: "The Deadline" (Work theme)
- **Friday**: "The Spoiler" (Entertainment theme)
- **Saturday**: "The Referee" (Sports theme)
- **Sunday**: "The Cringe" (Memes theme)

#### 🎮 Gameplay Instructions

**Basic Combat**:
1. Click "ATTACK" to deal damage to the boss
2. Watch your character run forward, attack, and return (0.8 seconds)
3. Monitor both health bars - yours (500 HP) and boss (50,000 HP)
4. Survive boss attacks that occur every 8-15 seconds
5. Continue until your HP reaches 0 or boss is defeated

**Visual Feedback**:
- Screen shake effects scaled by damage dealt
- Floating damage numbers with "YOUR damage: +234" styling
- Boss hit reactions with color flashes
- Critical hits shown in orange (3x damage)
- Attack cooldown prevents spam clicking

**Strategy Tips**:
- Attack as quickly as cooldown allows (every 0.8 seconds)
- Monitor your health carefully - you only have 500 HP
- Choose Rogue for 30% critical hit chance
- Share results to contribute to community progress

## Current Game State

Raid Day is **fully functional and playable** with all core systems implemented:

### ✅ Complete Implementation

**Core Game Systems:**
- **7-Scene Progression**: Boot → Splash → CharacterSelect → HowToPlay → Battle → Results → Victory
- **Dual Health Combat**: Player (500 HP) vs Boss (50,000 HP) with boss attacks every 8-15 seconds
- **Character Classes**: 4 balanced classes (Warrior, Mage, Rogue, Healer) with unique abilities
- **Click-to-Attack**: Simple combat with 0.8-second attack sequences and cooldown prevention
- **Visual Effects**: Screen shake, floating damage numbers, boss hit reactions, and attack animations
- **Responsive Design**: Full-screen scaling that adapts to all device sizes (320x240 to 2560x1440)
- **Daily Boss Rotation**: 7 themed bosses representing internet culture
- **Reddit Integration**: Session sharing and community features

**Technical Features:**
- **Asset Loading**: Automatic placeholder generation for missing sprites (characters: 64x64, bosses: 128x128)
- **Performance**: 60fps targeting with mobile optimizations and quality adjustment
- **Cross-Platform**: WebGL/Canvas fallback with consistent desktop and mobile experience
- **Touch Controls**: Large touch targets (60x60px minimum) optimized for mobile
- **Error Handling**: Graceful fallbacks and automatic placeholder generation

### What You'll Experience

**Complete Gameplay**: All systems are functional with placeholder graphics. Character selection, dual-health combat, boss battles, visual effects, and Reddit sharing all work as designed.

**Responsive Experience**: Full-screen scaling provides immersive gameplay that adapts to any device size with consistent 60fps performance.

**Engaging Combat**: Click-to-attack mechanics with dual health bars, visual feedback, screen shake effects, floating damage numbers, and 0.8-second attack sequences create satisfying combat.

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
