# Raid Day - Boss Battle Arena

**A fast-paced collaborative boss battle game for Reddit built with Phaser.js**

Raid Day is a fully playable 2D boss battle game designed to bring Reddit communities together in intense, time-limited boss fights. Built with Phaser.js 3.70+ and integrated with Reddit's Devvit platform, this streamlined game features rapid combat sessions with simple click-to-attack mechanics and community sharing.

## What is Raid Day?

Raid Day is an action-packed browser-based boss battle game that delivers quick, engaging combat sessions perfect for Reddit's fast-paced environment. The game features a revolutionary combat system where players engage in focused battles against daily rotating bosses themed around internet culture - from "The Lag Spike" (Gaming) to "The Algorithm" (Internet) to "The Cringe" (Memes).

The game combines streamlined mechanics with engaging gameplay through simplified attack mechanics and responsive design. Players can attack bosses with simple click-to-attack gameplay, featuring dynamic visual effects and immediate feedback for every action, while their character automatically runs forward, attacks, and returns in satisfying 0.8-second sequences.

**Current Implementation**: The game is fully playable with a complete 7-scene progression system (Boot → Splash → CharacterSelect → HowToPlay → Battle → Results → Victory), featuring simplified click-to-attack mechanics with 0.8-second attack cooldowns, comprehensive visual effects including dynamic screen shake and floating damage numbers, character class selection with 4 unique classes (Warrior, Mage, Rogue, Healer), and session-based gameplay with Reddit sharing integration. The game uses responsive RESIZE scaling to fill the entire screen, providing an optimized boss battle experience that adapts to any device size (320x240 to 2560x1440) with mobile-first responsive design. All game systems work with automatically generated placeholder graphics, providing the complete boss battle experience while being ready for custom sprite integration.

The game includes enhanced victory celebrations with spectacular boss death sequences featuring multiple explosion phases, enhanced screen effects with boss-themed color flashes, physics-based loot rain with different item types, comprehensive Reddit integration for sharing victory achievements with the community, and a live leaderboard system showing real-time player rankings with enhanced styling for the current user.

## What Makes Raid Day Innovative and Unique

⚡ **Streamlined Click-to-Attack Combat**: Unlike complex RPGs, Raid Day features intuitive one-button combat where players simply click the large "ATTACK" button to deal damage to the boss. Each attack triggers a satisfying 0.8-second animation sequence where your character runs forward, attacks, and returns to position. The system provides immediate visual feedback with screen shake, floating damage numbers, and boss hit reactions, making every attack feel impactful and responsive.

🎯 **Character Class System with Balanced Gameplay**: Choose from 4 distinct character classes - Warrior (balanced high damage), Mage (very high magical damage), Rogue (30% critical hit chance), and Healer (support abilities) - each with unique visual styles and special abilities. Despite class differences, all characters deal similar damage ranges (160-240) to ensure balanced gameplay where skill and timing matter more than class selection.

🎮 **Dual Combat System - Player vs Boss**: Experience intense 1v1 battles where both you and the boss have health bars:
- **Your Health**: 500 HP that decreases when the boss attacks you every 8-15 seconds
- **Boss Health**: 50,000 HP shared across the community that persists between sessions
- **Strategic Timing**: Balance offense and survival as you race to deal damage before the boss defeats you
- **Visual Feedback**: Watch your character animate forward for each attack while monitoring both health bars
- **Immediate Consequences**: Every boss attack matters - lose all your HP and the session ends

⚔️ **Rich Visual Combat Feedback**: The game features spectacular visual effects that make every attack feel impactful:
- **Attack Sequences**: Precisely timed 0.8-second animations where your character runs forward, attacks the boss, and returns to position
- **Screen Shake**: Dynamic camera shake scaled by attack impact (2px normal, 5px critical, 8px boss phase transitions)
- **Floating Damage**: Color-coded damage numbers that float upward with "YOUR damage: +234" styling for player attacks
- **Boss Reactions**: Visual hit reactions with color flashes, knockback effects, and boss-specific hit colors
- **Particle Effects**: Slash effects, critical hit bursts, and explosion particles (optimized with 10 particles max on mobile)

🎨 **Full-Screen Responsive Experience**: Every aspect is designed for maximum engagement across all devices:
- **Full-Screen Scaling**: RESIZE scaling mode fills the entire browser window for immersive gameplay
- **Cross-Platform Design**: Adapts seamlessly from mobile (320x240) to desktop (2560x1440) with consistent 60fps performance
- **Touch-Friendly Controls**: Large buttons (60x60px minimum) optimized for mobile touch interaction with visual feedback
- **Performance Optimization**: Dynamic quality adjustment with mobile-specific optimizations (limited to 10 particles on mobile)
- **Professional UI**: Clean, readable interface with dual health bars and real-time combat feedback that scales perfectly across devices

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

📱 **Full-Screen Responsive Design**: 
- **RESIZE Scaling Mode**: Game fills the entire browser window and adapts to any screen size (320x240 to 2560x1440)
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

1. **Launch the Game**: Click the "FIGHT NOW!" button on the Reddit post to open Raid Day in full screen
2. **Boot & Loading**: The game automatically loads sprite images and creates placeholder textures for any missing assets
3. **Main Menu (Splash)**: You'll see today's boss theme with real-time HP bar, community stats, and "FIGHT NOW!" button
4. **Character Selection**: Choose your character class from 4 unique options (Warrior, Mage, Rogue, Healer)
5. **Battle**: Engage in intense 1v1 combat where both you and the boss have health bars
6. **Results**: View your session summary with damage totals and sharing options
7. **Victory**: If the boss is defeated, celebrate with spectacular animated victory sequences and rewards

### Step-by-Step Gameplay

#### 🚀 Scene Progression (7 Complete Scenes)
1. **Boot Scene**: Quick asset loading with automatic placeholder texture generation for missing sprites
2. **Splash Scene**: Main menu showing today's boss theme, real-time shared HP bar, community fighter count, and "FIGHT NOW!" button for instant battle entry
3. **CharacterSelect Scene**: Choose from 4 character classes with unique abilities and visual styles
4. **HowToPlay Scene**: Optional tutorial explaining game mechanics and controls
5. **Battle Scene**: Full combat system with dual health bars and real-time boss battles
6. **Results Scene**: Session summary showing damage dealt, boss progress, and Reddit sharing options
7. **Victory Scene**: Spectacular animated victory sequence with enhanced boss death effects, physics-based loot rain, and progression rewards (when boss is defeated)

#### ⚡ Dual Health Combat System

**How Combat Works**:
- **Your Health**: You start with 500 HP displayed at the bottom of the screen
- **Boss Health**: The boss has 50,000 HP displayed at the top, shared across all players
- **Attack to Win**: Click the large "ATTACK" button to deal damage to the boss
- **Survive Boss Attacks**: The boss attacks you every 8-15 seconds dealing 50-150 damage
- **Battle Ends**: When either your HP reaches 0 (you lose) or boss HP reaches 0 (community wins)

**Combat Actions**:
- **Normal Attack**: Click "ATTACK" button to deal 160-240 damage to the boss
- **Attack Animation**: Each attack triggers a 0.8-second sequence where your character runs forward, attacks, and returns
- **Boss Retaliation**: Boss automatically attacks you periodically - watch your health bar!
- **Visual Effects**: Screen shake, floating damage numbers, and boss hit reactions provide immediate feedback

#### 🎯 Combat Mechanics

**Character Classes**:
1. **Warrior**: Balanced high damage (180-220) with strong melee attacks
2. **Mage**: Very high magical damage (170-230) with spell-based attacks  
3. **Rogue**: Variable damage (160-240) with 30% critical hit chance
4. **Healer**: Consistent damage (175-225) with support abilities

**Attack System**:
1. **Click to Attack**: Simply click the large "ATTACK" button to deal damage
2. **Critical Hits**: 15% base chance (30% for Rogue) for critical hits that deal 3x damage (shown in orange)
3. **Visual Feedback**: Watch your character animate forward, attack the boss, and return to position in a 0.8-second sequence
4. **Cooldown Prevention**: Button becomes temporarily disabled after each attack to prevent spam clicking

**Boss Mechanics**:
- **Shared HP**: All players attack the same boss with 50,000 HP that persists between sessions
- **Boss Attacks**: Boss retaliates every 8-15 seconds dealing 50-150 damage to your 500 HP
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

**Getting Into Battle (30 seconds)**:
1. Click "FIGHT NOW!" on the Reddit post to open the game in immersive full-screen mode
2. **Boot Scene**: Quick asset loading with automatic placeholder texture generation for all sprites
3. **Splash Scene**: See today's boss theme, real-time shared HP bar showing community progress, and click "FIGHT NOW!"
4. **CharacterSelect Scene**: Choose your character class from 4 options (Warrior, Mage, Rogue, Healer) and click "FIGHT NOW!"

**Combat Phase (Until you or boss dies)**:
5. **Battle Scene**: Enter 1v1 combat with dual health bars - yours (500 HP) and boss (50,000 HP)
6. Click "ATTACK" repeatedly to deal 160-240 damage and watch your character animate forward and back
7. **Survive Boss Attacks**: Boss attacks you every 8-15 seconds dealing 50-150 damage - monitor your health!
8. Watch for Phase 2 transition at 75% boss HP with enhanced visual effects
9. Experience rich visual feedback: screen shake, floating damage numbers with "YOUR damage: +234" styling, and boss reactions
10. Battle continues until either your HP reaches 0 (you lose) or boss HP reaches 0 (community wins)

**Session Completion (30 seconds)**:
11. **Results Scene**: View comprehensive battle summary when your health reaches 0
12. See detailed statistics: total damage dealt, boss HP remaining, boss defeat percentage, and your current rank
13. Share your session to r/RaidDay with damage totals or click "Fight Again" for another battle
14. Get immediate feedback on your contribution to the community boss battle

**Victory Celebration (if boss defeated)**:
15. **Victory Scene**: Experience spectacular boss death sequence with enhanced multi-phase explosions
16. **Enhanced Visual Effects**: Watch boss-themed color flashes and massive screen shake (8px intensity)
17. **Physics-Based Loot Rain**: See realistic falling loot items with bounce physics - coins, gems, potions, scrolls, chests, and rare stars
18. **Community Recognition**: Automatic Reddit victory post creation featuring top contributors and full leaderboard
19. **Progression Rewards**: Gain XP, level up, and unlock new content for continued engagement
20. **Next Boss Preview**: See tomorrow's boss with countdown timer and anticipation-building effects

#### 🎯 Strategy Tips

**Maximize Your Damage**:
- **Click Rapidly**: Attack as quickly as the cooldown allows (every 0.8 seconds)
- **Watch for Crits**: Orange damage numbers indicate critical hits for 3x damage (30% chance for Rogue!)
- **Choose Your Class**: Rogue has highest crit chance, Mage has highest damage potential, Warrior is balanced, Healer has support abilities
- **Visual Cues**: Pay attention to attack cooldown and both health bars

**Survival Strategy**:
- **Monitor Your Health**: You only have 500 HP - watch the bottom health bar carefully
- **Boss Attack Timing**: Boss attacks every 8-15 seconds - be ready for 50-150 damage hits
- **Health Management**: Each boss attack brings you closer to defeat - make every attack count
- **Risk vs Reward**: Push for more damage but know when to retreat and try again

**Community Participation**:
- **Share Your Results**: Use the built-in Reddit sharing to celebrate your damage contributions
- **Track Progress**: Monitor the shared boss HP bar to see community progress toward the 50,000 HP goal
- **Victory Participation**: Be part of the community celebration when bosses are defeated
- **Class Diversity**: Try different classes to find your preferred playstyle and contribute uniquely to the community effort

## Current Game State

Raid Day is a **fully playable and complete boss battle experience** featuring:

### ✅ Complete Implementation Status

**Fully Functional Game Systems:**
- **Complete 7-Scene Progression**: Boot → Splash → CharacterSelect → HowToPlay → Battle → Results → Victory with smooth transitions
- **Dual Health Combat**: Player (500 HP) vs Boss (50,000 HP) with real-time boss attacks every 8-15 seconds
- **Character Class System**: 4 unique classes (Warrior, Mage, Rogue, Healer) with balanced gameplay and distinct visual styles
- **Click-to-Attack Mechanics**: Simple, responsive combat with 0.8-second attack sequences and cooldown prevention
- **Comprehensive Visual Effects**: Screen shake, floating damage numbers with "YOUR damage: +234" styling, boss hit reactions, and attack animations
- **Full-Screen Responsive Design**: RESIZE scaling mode fills entire browser window and adapts to all devices (320x240 to 2560x1440)
- **Daily Boss Rotation**: 7 themed bosses representing different aspects of internet culture
- **Reddit Integration**: Session sharing and community engagement features

**Advanced Technical Features:**
- **Smart Asset Loading**: Loads static sprite images with automatic fallback to generated placeholder textures (64x64 characters, 128x128 bosses)
- **Full-Screen Responsive Scaling**: Uses RESIZE scaling mode to fill entire browser window with responsive design
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

**Immediate Gameplay**: The game is fully functional right now with all systems working. While it uses automatically generated placeholder graphics for sprites (64x64 characters, 128x128 bosses), every mechanic from character selection to dual-health combat to boss battles is complete and playable.

**Full-Screen Responsive Experience**: The game uses RESIZE scaling mode to fill the entire browser window, providing an immersive boss battle experience that adapts to any device size from mobile phones (320x240) to large desktop monitors (2560x1440) with consistent 60fps performance and mobile-first design principles.

**Engaging Dual-Health Combat**: Experience streamlined click-to-attack combat with dual health bars (your 500 HP vs boss 50,000 HP), satisfying visual feedback, dynamic screen shake effects (2px-8px intensity), color-coded floating damage numbers with "YOUR damage: +234" styling, boss hit reactions with color flashes, and immediate response to every action through precisely timed 0.8-second attack sequences where your character runs forward, attacks, and returns.

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
- **Full-Screen Experience**: RESIZE scaling mode provides immersive gameplay that fills the entire browser window and adapts to any device size (320x240 to 2560x1440)