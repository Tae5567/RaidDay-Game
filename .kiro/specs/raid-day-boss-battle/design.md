# Design Document

## Overview

Raid Day is a collaborative boss battle game built with Phaser.js 3.70+ for Reddit's Devvit platform. Players participate in quick 2-minute sessions attacking a singlew daily boss with shared community HP (50,000). The game emphasizes satisfying attack animations, real-time community participation, and automatic Reddit integration. The architecture focuses on simplicity: fast attack loops, shared boss HP, and immediate visual feedback.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Phaser Client │◄──►│  Express Server │◄──►│  Redis Storage  │
│   (Game Logic)  │    │  (Game State)   │    │  (Persistence)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌────▼────┐             ┌────▼────┐             ┌────▼────┐
    │ Scenes  │             │   API   │             │  Boss   │
    │ Systems │             │ Routes  │             │  Data   │
    │ Sprites │             │ Combat  │             │ Players │
    └─────────┘             └─────────┘             └─────────┘
```

### Technology Stack

- **Frontend**: Phaser.js 3.70+ (WebGL/Canvas), TypeScript
- **Backend**: Express.js, Node.js 22.2+
- **Storage**: Redis (via Devvit SDK)
- **Platform**: Devvit Web Framework
- **Build**: Vite (client + server bundles)
- **Graphics**: 2D Pixel Art (32x32 characters, 128x128 bosses)

## Components and Interfaces

### Core Game Scenes

#### 1. SplashScene (Entry Point)
```typescript
class SplashScene extends Phaser.Scene {
  private boss: BossEntity;
  private bossHPBar: HPBar;
  private fighterCount: Text;
  private fightButton: ActionButton;
  
  // Display current boss with HP and active fighter count
  // Big "FIGHT NOW" button to enter battle
}
```

**Splash Layout (800x600 canvas):**
```
┌─────────────────────────────────────────┐
│           THE LAG SPIKE                 │ ← Boss Name
│      [BOSS SPRITE - 128x128]            │ ← Animated Boss
│                                         │
│  HP: ▓▓▓▓▓▓▓▓░░ 87,432 / 50,000       │ ← Shared HP Bar
│                                         │
│        347 Fighters Active              │ ← Community Count
│                                         │
│         [FIGHT NOW!]                    │ ← Big Button
└─────────────────────────────────────────┘
```

#### 2. BattleScene (Core Gameplay)
```typescript
class BattleScene extends Phaser.Scene {
  private boss: BossEntity;
  private playerCharacter: PlayerCharacter;
  private attackButton: ActionButton;
  private sessionTimer: SessionTimer;
  private damageTracker: SessionDamageTracker;
  
  // 2-minute session with 5-10 attacks
  // Focus on attack animation loop
}
```

**Battle Layout:**
```
┌─────────────────────────────────────────┐
│  HP: ▓▓▓▓▓▓▓▓░░ 87,432 / 50,000       │ ← Boss HP
├─────────────────────────────────────────┤
│                                         │
│         [BOSS SPRITE]                   │ ← Boss (center)
│                                         │
│           [YOUR CHAR]                   │ ← Player (bottom)
│                                         │
├─────────────────────────────────────────┤
│  Session: 5 attacks left               │ ← Session Info
│  Your damage: 1,247                    │
│         [ATTACK]                        │ ← Attack Button
└─────────────────────────────────────────┘
```

#### 3. ResultsScene (Session Summary)
```typescript
class ResultsScene extends Phaser.Scene {
  private sessionSummary: SessionSummary;
  private leaderboardRank: RankDisplay;
  private shareButton: ActionButton;
  private fightAgainButton: ActionButton;
  
  // Show session results and sharing options
}
```

#### 4. Supporting Scenes
- **BootScene**: Asset loading and initialization  
- **VictoryScene**: Boss defeat celebration and Reddit post creation

### Entity System

#### BossEntity
```typescript
interface BossData {
  id: string;
  name: string;
  theme: DailyTheme;
  baseHP: number;
  level: number;
  spriteKey: string;
  animations: {
    idle: AnimationConfig;
    hit: AnimationConfig;
    phase2Trigger: number;
    phase2Animation: string;
    death: AnimationConfig;
  };
  hitEffect: {
    particles: string;
    screenShake: number;
    flashColor: number;
  };
  attackPattern: {
    frequency: number;
    animation: string;
    message: string;
  };
}

class BossEntity extends Phaser.GameObjects.Sprite {
  private currentHP: number;
  private maxHP: number;
  private phase: number;
  private hitTween: Phaser.Tweens.Tween;
  
  public takeDamage(amount: number): void;
  public enterPhase2(): void;
  public playDeathSequence(): Promise<void>;
}
```

#### PlayerCharacter
```typescript
enum CharacterClass {
  WARRIOR = 'warrior',
  MAGE = 'mage', 
  ROGUE = 'rogue',
  HEALER = 'healer'
}

class PlayerCharacter extends Phaser.GameObjects.Sprite {
  private characterClass: CharacterClass;
  private level: number;
  private isAttacking: boolean;
  
  public async performAttack(): Promise<AttackResult>;
  public async performSpecialAbility(): Promise<AttackResult>;
  public playIdleAnimation(): void;
}
```

### Combat System

#### Session Management
```typescript
interface SessionState {
  timeRemaining: number;    // 120 seconds (2 minutes)
  attacksUsed: number;      // Track attacks in session
  sessionDamage: number;    // Total damage this session
  canAttack: boolean;       // Simple attack availability
}

class SessionSystem {
  private sessionState: SessionState;
  
  public startSession(): void;
  public canAttack(): boolean;
  public recordAttack(damage: number): void;
  public getTimeRemaining(): number;
  public endSession(): SessionSummary;
}
```

#### Attack Sequence Timeline (Simplified)
```typescript
interface AttackSequence {
  phases: [
    { action: 'run_forward', duration: 300 },    // 0.3s
    { action: 'attack_slash', duration: 200 },   // 0.2s  
    { action: 'damage_popup', duration: 100 },   // 0.1s
    { action: 'boss_flash', duration: 100 },     // 0.1s
    { action: 'run_back', duration: 300 }        // 0.3s
  ];
  totalDuration: 800; // 0.8 seconds total
}
```

#### Damage Calculation (Simplified)
```typescript
function calculateDamage(
  playerClass: CharacterClass,
  playerLevel: number
): number {
  // Base damage ranges by class (minimal differences)
  const baseDamageRanges = {
    warrior: [180, 220],
    mage: [170, 230], 
    rogue: [160, 240],
    healer: [175, 225]
  };
  
  const [min, max] = baseDamageRanges[playerClass];
  let damage = Phaser.Math.Between(min, max);
  
  // Simple level scaling
  damage *= (1 + playerLevel * 0.02);
  
  // Random variance ±15%
  damage *= Phaser.Math.FloatBetween(0.85, 1.15);
  
  return Math.floor(damage);
}
```

### Animation System

#### Sprite Specifications
```typescript
interface SpriteConfig {
  // Player Characters (32x32 pixels)
  warrior: {
    idle: { frames: 2, frameRate: 2 },
    run: { frames: 4, frameRate: 8 },
    attack: { frames: 3, frameRate: 10 },
    special: { frames: 4, frameRate: 8 }
  };
  
  // Boss Sprites (128x128 pixels)
  boss_lag_spike: {
    idle: { frames: 3, frameRate: 2 },
    hit: { frames: 2, frameRate: 10 },
    phase2: { frames: 3, frameRate: 4 },
    death: { frames: 8, frameRate: 5 }
  };
}
```

#### Particle Effects System
```typescript
class ParticleSystem {
  private emitters: Map<string, Phaser.GameObjects.Particles.ParticleEmitter>;
  
  public createSlashEffect(x: number, y: number): void;
  public createCriticalBurst(x: number, y: number): void;
  public createDeathExplosion(x: number, y: number): void;
  public createEnergyRestore(character: PlayerCharacter): void;
}
```

### Real-Time Community System

#### Live Activity Feed
```typescript
interface RecentAttack {
  username: string;
  damage: number;
  timestamp: number;
  timeAgo: string; // "5s ago"
}

interface CommunityStats {
  activeFighters: number;        // "347 Fighters Active"
  bossHP: number;               // Current shared HP
  recentAttacks: RecentAttack[]; // Last 10 attacks
  leaderboard: LeaderboardEntry[]; // Top 10 players
}

class LiveActivityFeed {
  private recentAttacks: RecentAttack[];
  private updateTimer: Phaser.Time.TimerEvent;
  
  public addAttack(attack: RecentAttack): void;
  public updateFeed(): void; // Every 5 seconds
  public displayTicker(): void; // Scrolling bottom ticker
}
```

#### Live Leaderboard
```typescript
interface LeaderboardEntry {
  rank: number;
  username: string;
  totalDamage: number;
  isCurrentPlayer: boolean;
}

class LiveLeaderboard {
  private entries: LeaderboardEntry[];
  private updateTimer: Phaser.Time.TimerEvent;
  
  public updateLeaderboard(): Promise<void>; // Every 10 seconds
  public showTop10(): void;
  public highlightPlayerRank(username: string): void;
}
```

### UI System Architecture

#### HUD Components
```typescript
class BattleHUD extends Phaser.GameObjects.Container {
  // Top bar components
  private bossNameText: Phaser.GameObjects.Text;
  private bossHPBar: HPBar;
  private bossLevelBadge: Phaser.GameObjects.Image;
  
  // Bottom bar components
  private energyIndicators: EnergyDot[];
  private attackButton: ActionButton;
  private specialButton: ActionButton;
  
  // Side panel
  private statsPanel: StatsPanel;
  
  // Floating elements
  private damageNumbers: DamageNumberPool;
  private statusMessages: StatusMessageQueue;
}

class ActionButton extends Phaser.GameObjects.Container {
  private button: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;
  private glowEffect: Phaser.GameObjects.Graphics;
  
  public setEnabled(enabled: boolean): void;
  public playPressAnimation(): void;
}
```

## Data Models

### Redis Data Structure (Simple)
```typescript
// Current boss state
interface BossState {
  hp: number;           // 87432 (current HP)
  maxHP: number;        // 50000 (always 50k)
  name: string;         // "The Lag Spike"
  defeatedAt: number | null; // timestamp or null
}

// Player data
interface PlayerData {
  userId: string;
  class: CharacterClass;
  level: number;
  totalDamage: number;
  lastSession: number; // timestamp
}

// Recent attacks feed (list, max 100)
interface AttackEvent {
  username: string;
  damage: number;
  timestamp: number;
}

// Daily leaderboard (sorted set by damage)
// Key: leaderboard:daily
// Value: userId -> totalDamage
```

### Boss Rotation System
```typescript
const DAILY_BOSSES = {
  0: { name: "The Cringe", theme: "memes", sprite: "boss_cringe.png" },      // Sunday
  1: { name: "The Lag Spike", theme: "gaming", sprite: "boss_lag_spike.png" },  // Monday  
  2: { name: "The Algorithm", theme: "internet", sprite: "boss_algorithm.png" }, // Tuesday
  3: { name: "The Influencer", theme: "social", sprite: "boss_influencer.png" },  // Wednesday
  4: { name: "The Deadline", theme: "work", sprite: "boss_deadline.png" },      // Thursday
  5: { name: "The Spoiler", theme: "entertainment", sprite: "boss_spoiler.png" }, // Friday
  6: { name: "The Referee", theme: "sports", sprite: "boss_referee.png" }     // Saturday
};

function getCurrentBoss(): BossData {
  const dayOfWeek = new Date().getDay();
  return DAILY_BOSSES[dayOfWeek];
}
```

### Asset Configuration
```typescript
// Available backgrounds
const BACKGROUNDS = {
  main: "backgrounds/background.png",
  arena: "backgrounds/castle_arena.png", 
  mountains: "backgrounds/Mountains Background.png"
};

// Character class sprites
const CHARACTER_SPRITES = {
  warrior: "sprites/warrior.png",
  mage: "sprites/mage.png",
  rogue: "sprites/rogue.png",
  healer: "sprites/healer.png"
};

// Boss sprites (all available)
const BOSS_SPRITES = {
  boss_cringe: "sprites/boss_cringe.png",
  boss_lag_spike: "sprites/boss_lag_spike.png",
  boss_algorithm: "sprites/boss_algorithm.png",
  boss_influencer: "sprites/boss_influencer.png",
  boss_deadline: "sprites/boss_deadline.png",
  boss_spoiler: "sprites/boss_spoiler.png",
  boss_referee: "sprites/boss_referee.png"
};
```

### Server API Endpoints (Simplified)
```typescript
// Core gameplay
POST /api/attack          // Process attack, return damage & new HP
GET  /api/gameState       // Boss HP, your stats, leaderboard
POST /api/shareSession    // Create Reddit comment

// Real-time data  
GET  /api/recentAttacks   // Last 10 attacks for activity feed
GET  /api/leaderboard     // Top 10 + your rank

// Boss management
POST /api/defeatBoss      // Handle victory, create Reddit post
GET  /api/nextBoss        // Preview tomorrow's boss
```

## Error Handling

### Client-Side Error Recovery
```typescript
class ErrorHandler {
  // Network failures
  public handleAPITimeout(): void {
    // Show "Connection lost" message
    // Queue attacks for retry
    // Switch to offline mode simulation
  }
  
  // Animation failures
  public handleSpriteLoadError(): void {
    // Fall back to colored rectangles
    // Log error for debugging
    // Continue gameplay
  }
  
  // Performance issues
  public handleLowFramerate(): void {
    // Reduce particle count
    // Lower animation quality
    // Disable screen shake
  }
}
```

### Server-Side Validation
```typescript
// Attack validation
function validateAttack(playerId: string, attackData: AttackRequest): boolean {
  // Check energy availability
  // Verify cooldown timers
  // Validate damage calculations
  // Prevent cheating attempts
}

// Boss state consistency
function validateBossHP(reportedHP: number): number {
  // Cross-check with community damage
  // Prevent negative HP
  // Handle race conditions
}
```

## Testing Strategy

### Unit Testing Focus Areas
1. **Combat Math**: Damage calculations, critical hits, energy management
2. **Animation Timing**: Sequence durations, frame rates, transitions
3. **API Integration**: Request/response handling, error scenarios
4. **Boss Rotation**: Daily theme switching, HP scaling

### Integration Testing
1. **Client-Server Sync**: Real-time HP updates, community DPS tracking
2. **Multi-Player Scenarios**: Concurrent attacks, leaderboard updates
3. **Session Management**: Energy refresh cycles, special ability cooldowns

### Performance Testing
1. **Mobile Optimization**: Frame rate on low-end devices, touch responsiveness
2. **Particle Systems**: Performance with multiple effects, memory usage
3. **Network Resilience**: Offline mode, reconnection handling

### Visual Testing
1. **Animation Quality**: Smooth transitions, proper timing
2. **UI Responsiveness**: Layout adaptation, button feedback
3. **Accessibility**: Color contrast, text readability, touch targets

## Reddit Integration Strategy

### Victory Post Creation
```typescript
interface VictoryPost {
  title: string; // "🎉 r/RaidDay defeated The Lag Spike!"
  content: string; // Victory message with stats
  topPlayers: string[]; // Tag top 3 contributors
  leaderboard: LeaderboardEntry[]; // Full leaderboard in comments
}

function createVictoryPost(bossName: string, stats: BossStats): void {
  // Auto-create post when boss HP reaches 0
  // Tag top contributors in post
  // Add full leaderboard as comment
}
```

### Session Sharing
```typescript
interface SessionShare {
  damage: number;
  characterClass: string;
  rank: number;
  bossName: string;
}

function shareSession(sessionData: SessionShare): string {
  return `I dealt ${sessionData.damage} damage as a ${sessionData.characterClass}! ⚔️ 
  Current rank: #${sessionData.rank} vs ${sessionData.bossName}`;
}
```

## Mobile Optimization Strategy

### Responsive Design
- **Single Layout**: Focus on portrait mode for mobile Reddit users
- **Large Buttons**: Attack button minimum 60x60 pixels for easy tapping
- **Dynamic Scaling**: Scale 800x600 canvas to fit screen, maintain aspect ratio

### Performance Optimizations  
- **Simple Particles**: Limit to 10 particles max on mobile
- **Efficient Animations**: Use tweens instead of complex sprite animations
- **Object Pooling**: Reuse damage numbers and UI elements
- **Minimal Effects**: Reduce screen shake and flash effects on low-end devices

### Touch Controls
- **Tap to Attack**: Single tap for attack, no complex gestures needed
- **Visual Feedback**: Button press animations and immediate response
- **Accessibility**: High contrast damage numbers, clear UI elements