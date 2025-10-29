# Raid Day - Boss Battle Arena

**A fast-paced collaborative boss battle game for Reddit built with Phaser.js**

Raid Day is a fully playable 2D boss battle game designed to bring Reddit communities together in intense, time-limited boss fights. Built with Phaser.js 3.70+ and integrated with Reddit's Devvit platform, this streamlined game features rapid combat sessions with simple click-to-attack mechanics and community sharing.

## What is Raid Day?

Raid Day is an action-packed browser-based boss battle game that delivers quick, engaging combat sessions perfect for Reddit's fast-paced environment. The game features a revolutionary session-based combat system where players engage in focused 2-minute battle sessions against daily rotating bosses themed around internet culture - from "The Lag Spike" (Gaming) to "The Algorithm" (Internet) to "The Cringe" (Memes).

The game combines streamlined mechanics with engaging gameplay through simplified attack mechanics and session management. Players can unleash up to 10 attacks per 2-minute session with simple click-to-attack gameplay, featuring dynamic visual effects and immediate feedback for every action.

**Current Implementation**: The game is fully playable with a complete 5-scene progression system (Boot → Splash → Battle → Results → Victory), featuring the SessionSystem for structured 2-minute combat sessions with 10-attack limits, simplified click-to-attack mechanics with 0.8-second attack cooldowns, comprehensive visual effects including dynamic screen shake and floating damage numbers, and session-based gameplay with Reddit sharing integration. The game uses FIT scaling mode to maintain aspect ratio while filling the screen, providing an optimized boss battle experience that adapts to any device size (320x240 to 1920x1080) with mobile-first responsive design. All game systems work with automatically generated placeholder graphics, providing the complete boss battle experience while being ready for custom sprite integration.

The latest update includes enhanced victory celebrations with spectacular boss death sequences featuring multiple explosion phases, enhanced screen effects with boss-themed color flashes, physics-based loot rain with different item types, and comprehensive Reddit integration for sharing victory achievements with the community.

## What Makes Raid Day Innovative and Unique

⚡ **Revolutionary Session-Based Combat**: Unlike traditional endless gameplay, Raid Day features structured 2-minute combat sessions with a maximum of 10 attacks per session. This creates intense, focused battles where every attack counts. The SessionSystem manages time limits, attack counting, and performance tracking, ensuring each session feels meaningful and complete. Players must strategically time their attacks to maximize damage output within the session constraints.

🎯 **Simplified Click-to-Attack Mechanics**: The game features streamlined combat where players click the large "ATTACK" button to deal damage to the boss. Each attack has a brief cooldown (0.8 seconds) to prevent spam clicking while maintaining fast-paced action. The system provides immediate visual feedback for every attack, making combat feel responsive and satisfying.

🎮 **Structured Session Management**: Each battle is a precisely timed 2-minute session with built-in limits:
- **Time Pressure**: 2-minute countdown creates urgency and excitement
- **Attack Limits**: Maximum 10 attacks per session prevents button mashing and creates strategic decision-making
- **Session Stats**: Track attacks used, damage dealt, and performance metrics in real-time
- **Immediate Results**: Quick transition to results screen with comprehensive session summary
- **Replayability**: Jump back into battle instantly for another focused session

⚔️ **Engaging Combat Feedback**: The game features rich visual feedback that makes every attack feel impactful:
- **Attack Button**: Large, responsive button with success/error animations and cooldown prevention
- **Screen Shake**: Dynamic camera shake scaled by attack impact (2px normal, 5px critical, 8px special)
- **Floating Damage**: Color-coded damage numbers that float upward (yellow=normal, orange=critical)
- **Boss Reactions**: Visual hit reactions with color flashes and knockback effects
- **Attack Sequences**: 0.8-second attack animations where your character runs forward, attacks, and returns

🎨 **Mobile-Optimized Visual Experience**: Every aspect is designed for maximum engagement across all devices:
- **Responsive Scaling**: FIT scaling mode maintains aspect ratio while filling the screen for optimal viewing
- **Cross-Platform Design**: Adapts seamlessly from mobile (320x240) to desktop (1920x1080) with consistent performance
- **Touch-Friendly Controls**: Large buttons (60x60px minimum) optimized for mobile touch interaction
- **Performance Optimization**: Dynamic quality adjustment with mobile-specific optimizations (limited to 10 particles on mobile)
- **Professional UI**: Clean, readable interface with real-time session tracking that scales perfectly across devices

🎆 **Spectacular Victory Celebrations**: When bosses are defeated, players experience:
- **Enhanced Boss Death Sequences**: Multi-phase explosions with 8 secondary bursts in circular patterns
- **Boss-Themed Visual Effects**: Color flashes matching each boss's theme (red for Lag Spike, green for Algorithm, etc.)
- **Physics-Based Loot Rain**: Realistic falling loot items with bounce physics and different rarities
- **Community Victory Posts**: Automatic Reddit post creation celebrating the defeat with top contributor recognition
- **Progressive Rewards**: XP gains, level progression, and unlockable content for continued engagement

🗓️ **Daily Boss Themes**: Seven unique themed bosses that reflect internet culture:
- **Sunday**: "The Cringe" (Memes) - 50,000 HP with outdated memes and cringe content
- **Monday**: "The Lag Spike" (Gaming) - 50,000 HP with connection issues and gaming frustrations
- **Tuesday**: "The Algorithm" (Internet) - 50,000 HP with data processing and internet algorithms
- **Wednesday**: "The Influencer" (Social Media) - 50,000 HP with social pressure and influence culture
- **Thursday**: "The Deadline" (Work) - 50,000 HP with time stress and work pressure
- **Friday**: "The Spoiler" (Entertainment) - 50,000 HP with plot reveals and entertainment spoilers
- **Saturday**: "The Referee" (Sports) - 50,000 HP with penalty calls and sports controversies

Each boss has balanced 50,000 HP designed for community collaboration, with thematic personalities and unique visual effects. Bosses rotate daily based on the day of the week, ensuring fresh content every day.

📱 **Mobile-First Responsive Design**: 
- **FIT Scaling Mode**: Game maintains perfect aspect ratio while filling the screen (320x240 to 1920x1080)
- **Touch-Optimized Controls**: Large buttons (60x60px minimum) with visual feedback and hover effects
- **Cross-Platform**: Works seamlessly on desktop and mobile with consistent 60fps experience
- **Performance Optimized**: WebGL rendering with Canvas fallback, pixel art optimization, and mobile-specific adjustments
- **Adaptive Quality**: Dynamic performance monitoring with automatic quality adjustments for optimal mobile experience

🌐 **Reddit Integration**: Built for seamless Reddit community engagement:
- **Session Sharing**: Share your damage totals directly to r/RaidDay with formatted posts including damage dealt, boss name, and player rank
- **Real-time Boss HP**: Shared boss HP that persists across all players and updates in real-time
- **Community Stats**: Live fighter count and community progress tracking on the splash screen
- **Victory Posts**: Automatic creation of celebration posts when bosses are defeated, featuring top contributors and full leaderboards
- **Results Screen**: Clean summary with one-click Reddit sharing and replay functionality
- **Instant Access**: One-click "FIGHT NOW!" entry from Reddit posts to immersive full-screen battle

## Game Architecture & Technical Implementation

Raid Day runs as a Phaser.js 3.70+ application with mobile-optimized FIT scaling that maintains perfect aspect ratio while adapting to any screen size (320x240 minimum to 1920x1080 maximum). The game uses WebGL rendering with Canvas fallback, pixel art optimization, and Arcade Physics for smooth 60fps gameplay across desktop and mobile devices. The FIT scaling mode ensures optimal viewing experience with consistent aspect ratio across all devices while maximizing screen usage.

### Phaser.js Configuration
- **Engine**: Phaser.js 3.70+ with AUTO renderer selection (WebGL preferred, Canvas fallback)
- **Canvas Size**: 800x600 base resolution with FIT scaling to maintain aspect ratio while maximizing screen usage
- **Physics**: Arcade Physics with zero gravity for top-down battle view
- **Rendering**: Pixel art optimized with antialiasing and round pixels enabled
- **Performance**: 60fps target with mobile-specific optimizations and dynamic quality adjustment
- **Responsive Design**: Mobile-first approach with touch-friendly controls and performance monitoring

### Complete Scene Flow System
The game features 5 fully implemented scenes with smooth transitions and state management:

1. **Boot Scene**: Quick asset loading with automatic placeholder texture generation for missing sprites
2. **Splash Scene**: Main menu showing today's boss theme, community stats, and "FIGHT NOW!" button
3. **Battle Scene**: Full combat system with energy management, combo mechanics, 2-minute timed sessions, and real-time boss battles
4. **Results Scene**: Session summary with damage totals, boss progress, player ranking, and Reddit sharing options
5. **Victory Scene**: Animated victory sequence with physics-based loot rain, progression rewards, and community celebration

### Advanced Systems Architecture
- **SessionSystem**: 2-minute timed sessions with 10-attack limits, real-time performance tracking, and automatic scene transitions
- **DamageCalculator**: Simplified damage calculations with balanced class-based ranges (160-240 damage) and 15% critical hit chance
- **ActionButton**: Responsive button system with 0.8-second cooldown prevention, success/error animations, and mobile optimization
- **Visual Effects**: Dynamic screen shake (2px normal, 5px critical, 8px boss phase), color-coded floating damage numbers, boss hit reactions, and particle effects
- **UI Systems**: Responsive HUD with real-time boss HP bars, session countdown timers, attack counters, and damage tracking
- **Animation Systems**: Precise 0.8-second attack sequences (0.3s run forward, 0.2s attack, 0.3s run back), boss phase transitions, and victory celebrations with physics-based loot rain
- **Mobile Optimization**: Touch-friendly controls with 60x60px minimum targets, responsive scaling, and performance adjustments for mobile devices

## How to Play Raid Day

### Getting Started

1. **Launch the Game**: Click the "FIGHT NOW!" button on the Reddit post to open Raid Day in full screen
2. **Boot & Loading**: The game automatically loads sprite images and creates placeholder textures for any missing assets
3. **Main Menu (Splash)**: You'll see today's boss theme with real-time HP bar, community stats, and "FIGHT NOW!" button to enter battle
4. **Battle**: Engage in fast-paced 2-minute combat sessions with simple click-to-attack mechanics
5. **Results**: View your session summary with damage totals and sharing options
6. **Victory**: If the boss is defeated, celebrate with spectacular animated victory sequences and rewards

### Step-by-Step Gameplay

#### 🚀 Scene Progression (5 Complete Scenes)
1. **Boot Scene**: Quick asset loading with automatic placeholder texture generation for missing sprites
2. **Splash Scene**: Main menu showing today's boss theme, real-time shared HP bar, community fighter count, and "FIGHT NOW!" button for instant battle entry
3. **Battle Scene**: Full combat system with session management and 2-minute timed battles
4. **Results Scene**: Session summary showing damage dealt, boss progress, and Reddit sharing options
5. **Victory Scene**: Spectacular animated victory sequence with enhanced boss death effects, physics-based loot rain, and progression rewards (when boss is defeated)

#### ⚡ Session-Based Combat System

**How Sessions Work**:
- Each battle session lasts exactly 2 minutes with a maximum of 10 attacks
- Click the large "ATTACK" button to deal damage to the boss
- Each attack has a brief 0.8-second cooldown to prevent spam clicking
- Session ends automatically when time expires OR when you use all 10 attacks
- Visual indicators show time remaining and attacks used in real-time

**Combat Actions**:
- **Normal Attack**: Click "ATTACK" button to perform attacks (counts toward 10-attack limit)
- **Attack Feedback**: Each attack triggers a 0.8-second animation sequence where your character runs forward, attacks, and returns
- **Visual Effects**: Screen shake, floating damage numbers, and boss hit reactions provide immediate feedback
- **Session Tracking**: Monitor time remaining and attacks used in the bottom-left corner

#### 🎯 Combat Mechanics

**Attack System**:
1. **Click to Attack**: Simply click the large "ATTACK" button to deal damage
2. **Damage Calculation**: Each attack deals 160-240 damage with minimal class differences (Warrior: 180-220, Mage: 170-230, Rogue: 160-240, Healer: 175-225)
3. **Critical Hits**: 15% chance for critical hits that deal 3x damage (shown in orange)
4. **Visual Feedback**: Watch your character animate forward, attack the boss, and return to position in a 0.8-second sequence
5. **Cooldown Prevention**: Button becomes temporarily disabled after each attack to prevent spam clicking

**Boss Mechanics**:
- **Shared HP**: All players attack the same boss with 50,000 HP
- **Phase Changes**: Boss enters Phase 2 at 75% HP with enhanced visual effects
- **Hit Reactions**: Boss flashes red and shakes when hit, providing satisfying feedback
- **Daily Rotation**: Different themed boss each day of the week

#### 🗓️ Daily Boss Rotation

Each day features a unique themed boss:

**Monday - "The Lag Spike" (Gaming)**
- HP: 50,000 | Theme: Gaming frustrations and connection issues

**Tuesday - "The Algorithm" (Internet)**
- HP: 50,000 | Theme: Data processing and internet algorithms

**Wednesday - "The Influencer" (Social Media)**
- HP: 50,000 | Theme: Social media pressure and influence culture

**Thursday - "The Deadline" (Work)**
- HP: 50,000 | Theme: Work stress and time pressure

**Friday - "The Spoiler" (Entertainment)**
- HP: 50,000 | Theme: Entertainment spoilers and plot reveals

**Saturday - "The Referee" (Sports)**
- HP: 50,000 | Theme: Sports penalties and referee calls

**Sunday - "The Cringe" (Memes)**
- HP: 50,000 | Theme: Outdated memes and internet cringe culture

#### 🎮 Complete Gameplay Flow

**Getting Into Battle (10 seconds)**:
1. Click "FIGHT NOW!" on the Reddit post to open the game in immersive full-screen mode
2. **Boot Scene**: Quick asset loading with automatic placeholder texture generation for all sprites
3. **Splash Scene**: See today's boss theme, real-time shared HP bar showing community progress, and click "FIGHT NOW!" to enter battle

**Combat Phase (2 minutes, 10 attacks maximum)**:
4. **Battle Scene**: Start your 2-minute session with 10 attacks available
5. Click "ATTACK" repeatedly to deal damage and watch your character animate
6. See boss HP decrease with each hit and watch for Phase 2 transition at 75% HP
7. Monitor your session progress: time remaining and attacks used (displayed in bottom-left)
8. Experience rich visual feedback: screen shake, floating damage numbers, and boss reactions
9. Session ends automatically when time expires OR when you use all 10 attacks

**Session Completion (30 seconds)**:
10. **Results Scene**: View comprehensive session summary when the session ends
11. See detailed statistics: total damage dealt, boss HP remaining, boss defeat percentage, and your current rank
12. Share your session to r/RaidDay with damage totals or click "Fight Again" for another session
13. Get immediate feedback on your contribution to the community boss battle

**Victory Celebration (if boss defeated)**:
14. **Victory Scene**: Experience spectacular boss death sequence with enhanced multi-phase explosions
15. **Enhanced Visual Effects**: Watch boss-themed color flashes and massive screen shake (15px intensity)
16. **Physics-Based Loot Rain**: See realistic falling loot items with bounce physics - coins, gems, potions, scrolls, chests, and rare stars
17. **Community Recognition**: Automatic Reddit victory post creation featuring top contributors and full leaderboard
18. **Progression Rewards**: Gain XP, level up, and unlock new content for continued engagement
19. **Next Boss Preview**: See tomorrow's boss with countdown timer and anticipation-building effects

#### 🎯 Strategy Tips

**Maximize Your Damage**:
- **Click Rapidly**: Attack as quickly as the cooldown allows (every 0.8 seconds)
- **Watch for Crits**: Orange damage numbers indicate critical hits for 3x damage
- **Time Management**: You have 2 minutes but only 10 attacks - use them wisely
- **Visual Cues**: Pay attention to attack cooldown and session timer

**Session Optimization**:
- **Consistent Attacks**: Maintain steady attack rhythm throughout your session
- **Boss Phases**: Expect increased visual effects when boss reaches Phase 2 at 75% HP
- **Attack Budget**: Plan your 10 attacks strategically across the 2-minute window

**Community Participation**:
- **Share Your Results**: Use the built-in Reddit sharing to celebrate your damage contributions
- **Track Progress**: Monitor the shared boss HP bar to see community progress
- **Victory Participation**: Be part of the community celebration when bosses are defeated

## Current Game State

Raid Day is a **fully playable and complete boss battle experience** featuring:

### ✅ Complete Implementation Status

**Fully Functional Game Systems:**
- **Complete 5-Scene Progression**: Boot → Splash → Battle → Results → Victory with smooth transitions
- **Session-Based Combat**: 2-minute focused sessions with 10-attack limits and immediate results
- **Click-to-Attack Mechanics**: Simple, responsive combat with 0.8-second attack sequences and cooldown prevention
- **Comprehensive Visual Effects**: Screen shake, floating damage numbers, boss hit reactions, and attack animations
- **Mobile-Optimized Responsive Design**: FIT scaling mode maintains aspect ratio while maximizing screen usage across all devices (320x240 to 1920x1080)
- **Daily Boss Rotation**: 7 themed bosses representing different aspects of internet culture
- **Reddit Integration**: Session sharing and community engagement features

**Advanced Technical Features:**
- **Smart Asset Loading**: Loads static sprite images with automatic fallback to generated placeholder textures (32x32 characters, 128x128 bosses)
- **Mobile-Optimized Responsive Scaling**: Uses FIT scaling mode to maintain aspect ratio while maximizing screen usage with responsive design
- **Performance Optimization**: 60fps targeting with mobile-specific optimizations and dynamic quality adjustment
- **Error Handling**: Graceful fallbacks for missing assets with automatic placeholder generation
- **Cross-Platform Compatibility**: WebGL/Canvas fallback with consistent experience across desktop and mobile browsers
- **Touch Controls**: Mobile-optimized with large touch targets (60x60px minimum) and visual feedback

**Ready for Production:**
- All core gameplay mechanics are fully implemented and tested
- Complete UI system with mobile-first responsive design and session tracking
- Simplified combat system that's easy to learn and immediately engaging
- Advanced visual effects with optimized performance for all devices
- Full mobile support with touch-friendly controls (60x60px minimum targets) and responsive design
- Performance monitoring system with automatic quality adjustments for optimal mobile experience

### What You'll Experience

**Immediate Gameplay**: The game is fully functional right now with all systems working. While it uses automatically generated placeholder graphics for sprites (32x32 characters, 128x128 bosses), every mechanic from session management to attack systems to boss battles is complete and playable.

**Mobile-Optimized Responsive Experience**: The game uses FIT scaling mode to maintain perfect aspect ratio while maximizing screen usage, providing an optimal boss battle experience that adapts to any device size from mobile phones (320x240) to large desktop monitors (1920x1080) with consistent 60fps performance and mobile-first design principles.

**Simple Yet Engaging Combat**: Experience streamlined click-to-attack combat with satisfying visual feedback, dynamic screen shake effects (2px-8px intensity), color-coded floating damage numbers (yellow=normal, orange=critical), boss hit reactions with color flashes, and immediate response to every action through precisely timed 0.8-second attack sequences.

## Technology Stack

- **[Devvit](https://developers.reddit.com/)**: Reddit's developer platform for seamless community integration and hosting
- **[Phaser.js 3.70+](https://phaser.io/)**: Advanced 2D WebGL/Canvas game engine with pixel art rendering, Arcade Physics, and comprehensive animation systems
- **[Vite](https://vite.dev/)**: Lightning-fast build tool for optimized client and server compilation with hot reloading and TypeScript support
- **[Express](https://expressjs.com/)**: Robust Node.js backend framework for API endpoints and Reddit integration
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe development with strict checking across client/server/shared code and comprehensive type definitions
- **[Redis](https://redis.io/)**: High-performance data persistence via Devvit SDK for boss HP, player stats, session data, and community tracking

## Architecture

- **Client-Side Game Engine**: Phaser.js 3.70+ handles all game logic, animations, visual effects, and physics simulation
- **Modular Systems**: Separate systems for energy management, combat calculations, combo tracking, session management (SessionSystem), visual effects, and UI components
- **Scene-Based Architecture**: 5 distinct scenes (Boot, Splash, Battle, Results, Victory) with smooth transitions and comprehensive state management
- **Mobile-First Design**: Responsive 800x600 canvas with FIT scaling, touch controls, and performance optimization for mobile devices
- **Structured Session Gameplay**: Precisely timed 2-minute sessions with 10-attack limits, comprehensive session tracking, and immediate results
- **Mobile-Optimized Experience**: FIT scaling mode provides optimal gameplay that maintains aspect ratio while adapting to any device size (320x240 to 1920x1080)