# Design Document

## Overview

Raid Day is a 2D pixel art boss battle game built with Phaser.js 3.70+ and integrated with Reddit's Devvit platform. The game features real-time collaborative combat where players attack daily rotating bosses through an energy-based system, with rich animations and community participation mechanics. The architecture follows a client-server model with Phaser handling all visual elements and animations while the server manages game state, boss data, and player progression.

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

#### 1. BattleScene (Primary Scene)
```typescript
class BattleScene extends Phaser.Scene {
  // Core entities
  private boss: BossEntity;
  private playerCharacter: PlayerCharacter;
  private communityPlayers: PlayerCharacter[];
  
  // Systems
  private combatSystem: CombatSystem;
  private energySystem: EnergySystem;
  private animationSystem: AnimationSystem;
  private particleSystem: ParticleSystem;
  private uiSystem: UISystem;
  
  // Game state
  private gameState: BattleState;
  private communityDPS: CommunityDPSTracker;
}
```

**Layout Design (800x600 canvas):**
```
┌─────────────────────────────────────────┐
│  Boss HP: ▓▓▓▓▓▓░░░░ 64,240/80,000     │ ← Top HUD
│  The Lag Spike • Level 45               │
├─────────────────────────────────────────┤
│                                         │
│         [BOSS SPRITE - 128x128]         │ ← Main Battle Area
│            (animated idle)              │   (400px height)
│                                         │
│    [P1] [P2] [P3] [P4]  ← Community     │
│         [YOUR CHAR]     ← Player        │
│                                         │
├─────────────────────────────────────────┤
│  Energy: ●●●●○ (4/5)                   │ ← Bottom HUD
│  [ATTACK] [SPECIAL: READY]              │   (100px height)
└─────────────────────────────────────────┘
```

#### 2. Supporting Scenes
- **BootScene**: Asset loading and initialization
- **SplashScene**: Main menu with boss preview
- **ClassSelectScene**: Character class selection
- **VictoryScene**: Boss defeat celebration and rewards

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

#### Energy Management
```typescript
interface EnergyState {
  current: number;        // 0-5 energy points
  max: number;           // Always 5
  cooldowns: number[];   // Per-point cooldown timers (30s each)
  lastRefresh: number;   // Server-side 2-hour gate
  sessionStart: number;  // Track session duration
}

class EnergySystem {
  private energyState: EnergyState;
  
  public canAttack(): boolean;
  public consumeEnergy(): boolean;
  public getNextRefreshTime(): number;
  public updateCooldowns(deltaTime: number): void;
}
```

#### Attack Sequence Timeline
```typescript
interface AttackSequence {
  phases: [
    { action: 'run_forward', duration: 300 },
    { action: 'attack_animation', duration: 200 },
    { action: 'spawn_particles', duration: 100 },
    { action: 'damage_number', duration: 400 },
    { action: 'boss_hit_reaction', duration: 200 },
    { action: 'run_back', duration: 300 }
  ];
  totalDuration: 1500; // 1.5 seconds total
}
```

#### Damage Calculation
```typescript
function calculateDamage(
  playerClass: CharacterClass,
  playerLevel: number,
  energyRemaining: number,
  bossPhase: number,
  isCritical: boolean = false
): number {
  const baseDamage = getClassBaseDamage(playerClass);
  let damage = baseDamage * (1 + playerLevel * 0.05);
  
  // Full energy bonus (first attack)
  if (energyRemaining === 5) {
    damage *= 1.2;
  }
  
  // Boss phase resistance
  if (bossPhase === 2) {
    damage *= 0.9;
  }
  
  // Critical hit (Rogue specialty: 30% chance)
  if (isCritical) {
    damage *= 3;
  }
  
  // RNG variance ±10%
  damage *= Phaser.Math.FloatBetween(0.9, 1.1);
  
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

#### Community DPS Tracking
```typescript
interface CommunityStats {
  attacksPerMinute: number;
  averageDamage: number;
  activePlayers: number;
  topDamageDealer: string;
  recentAttacks: AttackEvent[];
}

class CommunityDPSTracker {
  private stats: CommunityStats;
  private simulationTimer: Phaser.Time.TimerEvent;
  
  public simulateAttack(): void; // Visual simulation every 3-5s
  public syncRealHP(): Promise<void>; // Server sync every 10s
  public updateActivityFeed(attack: AttackEvent): void;
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

### Boss Rotation System
```typescript
interface DailyBoss {
  monday: BossData;    // "The Lag Spike" (Gaming theme)
  tuesday: BossData;   // "The Algorithm" (Internet theme)
  wednesday: BossData; // "The Influencer" (Social Media theme)
  thursday: BossData;  // "The Deadline" (Work theme)
  friday: BossData;    // "The Spoiler" (Entertainment theme)
  saturday: BossData;  // "The Referee" (Sports theme)
  sunday: BossData;    // "The Cringe" (Memes theme)
}

function getCurrentBoss(): BossData {
  const dayOfWeek = new Date().getDay();
  return DAILY_BOSSES[Object.keys(DAILY_BOSSES)[dayOfWeek]];
}
```

### Player Progression
```typescript
interface PlayerData {
  userId: string;
  characterClass: CharacterClass;
  level: number;
  experience: number;
  sessionDamage: number;
  totalDamage: number;
  lastEnergyRefresh: number;
  energyState: EnergyState;
  specialAbilityUsed: boolean;
}
```

### Server API Endpoints
```typescript
// Combat endpoints
POST /api/attack
POST /api/special-ability
GET  /api/boss-status
GET  /api/player-stats

// Community endpoints  
GET  /api/community-dps
GET  /api/leaderboard
GET  /api/activity-feed

// Game state endpoints
GET  /api/current-boss
POST /api/select-class
GET  /api/player-energy
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

## Mobile Optimization Strategy

### Responsive Design
- **Portrait Mode**: Vertical UI stack, larger touch targets
- **Landscape Mode**: Horizontal layout, optimized for thumbs
- **Dynamic Scaling**: Maintain 800x600 aspect ratio, scale to fit

### Performance Optimizations
- **Particle Limits**: 20 particles max on mobile (vs 50 desktop)
- **Sprite Batching**: Group similar sprites for efficient rendering
- **Object Pooling**: Reuse damage numbers, particles, UI elements
- **Texture Compression**: Optimize sprite sheets for mobile GPUs

### Touch Controls
- **Gesture Support**: Tap (attack), hold (special), swipe (UI navigation)
- **Haptic Feedback**: Visual indicators for touch responses
- **Minimum Target Size**: 44x44 pixels for accessibility compliance