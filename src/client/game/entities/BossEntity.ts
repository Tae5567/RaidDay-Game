import * as Phaser from 'phaser';
import { GameConstants } from '../utils/GameConstants';

/**
 * Daily boss themes and their data
 */
export enum DailyTheme {
  GAMING = 'Gaming',
  INTERNET = 'Internet', 
  SOCIAL_MEDIA = 'Social Media',
  WORK = 'Work',
  ENTERTAINMENT = 'Entertainment',
  SPORTS = 'Sports',
  MEMES = 'Memes'
}

/**
 * Animation configuration for boss sprites
 */
export interface AnimationConfig {
  frames: number;
  frameRate: number;
  repeat?: number;
}

/**
 * Boss data structure for daily rotation
 */
export interface BossData {
  id: string;
  name: string;
  theme: DailyTheme;
  baseHP: number;
  level: number;
  spriteKey: string;
  animations: {
    idle: AnimationConfig;
    hit: AnimationConfig;
    phase2: AnimationConfig;
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

/**
 * Daily boss rotation data (7 themed bosses with shared 50,000 HP)
 */
export const DAILY_BOSSES: Record<string, BossData> = {
  sunday: {
    id: 'cringe',
    name: 'The Cringe',
    theme: DailyTheme.MEMES,
    baseHP: 50000,
    level: 1,
    spriteKey: 'boss_cringe',
    animations: {
      idle: { frames: 1, frameRate: 1, repeat: -1 },
      hit: { frames: 1, frameRate: 1, repeat: 0 },
      phase2: { frames: 1, frameRate: 1, repeat: -1 },
      death: { frames: 1, frameRate: 1, repeat: 0 }
    },
    hitEffect: {
      particles: 'cringe_particles',
      screenShake: GameConstants.SHAKE_NORMAL,
      flashColor: 0xffa500
    },
    attackPattern: {
      frequency: 10000,
      animation: 'cringe_wave',
      message: 'So cringe...'
    }
  },
  monday: {
    id: 'lag_spike',
    name: 'The Lag Spike',
    theme: DailyTheme.GAMING,
    baseHP: 50000,
    level: 1,
    spriteKey: 'boss_lag_spike',
    animations: {
      idle: { frames: 1, frameRate: 1, repeat: -1 },
      hit: { frames: 1, frameRate: 1, repeat: 0 },
      phase2: { frames: 1, frameRate: 1, repeat: -1 },
      death: { frames: 1, frameRate: 1, repeat: 0 }
    },
    hitEffect: {
      particles: 'glitch_particles',
      screenShake: GameConstants.SHAKE_NORMAL,
      flashColor: 0xff0000
    },
    attackPattern: {
      frequency: 8000,
      animation: 'lag_attack',
      message: 'Connection unstable!'
    }
  },
  tuesday: {
    id: 'algorithm',
    name: 'The Algorithm',
    theme: DailyTheme.INTERNET,
    baseHP: 50000,
    level: 1,
    spriteKey: 'boss_algorithm',
    animations: {
      idle: { frames: 1, frameRate: 1, repeat: -1 },
      hit: { frames: 1, frameRate: 1, repeat: 0 },
      phase2: { frames: 1, frameRate: 1, repeat: -1 },
      death: { frames: 1, frameRate: 1, repeat: 0 }
    },
    hitEffect: {
      particles: 'code_particles',
      screenShake: GameConstants.SHAKE_NORMAL,
      flashColor: 0x00ff00
    },
    attackPattern: {
      frequency: 7000,
      animation: 'data_stream',
      message: 'Processing...'
    }
  },
  wednesday: {
    id: 'influencer',
    name: 'The Influencer',
    theme: DailyTheme.SOCIAL_MEDIA,
    baseHP: 50000,
    level: 1,
    spriteKey: 'boss_influencer',
    animations: {
      idle: { frames: 1, frameRate: 1, repeat: -1 },
      hit: { frames: 1, frameRate: 1, repeat: 0 },
      phase2: { frames: 1, frameRate: 1, repeat: -1 },
      death: { frames: 1, frameRate: 1, repeat: 0 }
    },
    hitEffect: {
      particles: 'heart_particles',
      screenShake: GameConstants.SHAKE_NORMAL,
      flashColor: 0xff69b4
    },
    attackPattern: {
      frequency: 6000,
      animation: 'selfie_flash',
      message: 'Like and subscribe!'
    }
  },
  thursday: {
    id: 'deadline',
    name: 'The Deadline',
    theme: DailyTheme.WORK,
    baseHP: 50000,
    level: 1,
    spriteKey: 'boss_deadline',
    animations: {
      idle: { frames: 1, frameRate: 1, repeat: -1 },
      hit: { frames: 1, frameRate: 1, repeat: 0 },
      phase2: { frames: 1, frameRate: 1, repeat: -1 },
      death: { frames: 1, frameRate: 1, repeat: 0 }
    },
    hitEffect: {
      particles: 'stress_particles',
      screenShake: GameConstants.SHAKE_CRITICAL,
      flashColor: 0xffff00
    },
    attackPattern: {
      frequency: 5000,
      animation: 'clock_tick',
      message: 'Time is running out!'
    }
  },
  friday: {
    id: 'spoiler',
    name: 'The Spoiler',
    theme: DailyTheme.ENTERTAINMENT,
    baseHP: 50000,
    level: 1,
    spriteKey: 'boss_spoiler',
    animations: {
      idle: { frames: 1, frameRate: 1, repeat: -1 },
      hit: { frames: 1, frameRate: 1, repeat: 0 },
      phase2: { frames: 1, frameRate: 1, repeat: -1 },
      death: { frames: 1, frameRate: 1, repeat: 0 }
    },
    hitEffect: {
      particles: 'reveal_particles',
      screenShake: GameConstants.SHAKE_NORMAL,
      flashColor: 0x800080
    },
    attackPattern: {
      frequency: 9000,
      animation: 'spoiler_reveal',
      message: 'The ending is...'
    }
  },
  saturday: {
    id: 'referee',
    name: 'The Referee',
    theme: DailyTheme.SPORTS,
    baseHP: 50000,
    level: 1,
    spriteKey: 'boss_referee',
    animations: {
      idle: { frames: 1, frameRate: 1, repeat: -1 },
      hit: { frames: 1, frameRate: 1, repeat: 0 },
      phase2: { frames: 1, frameRate: 1, repeat: -1 },
      death: { frames: 1, frameRate: 1, repeat: 0 }
    },
    hitEffect: {
      particles: 'whistle_particles',
      screenShake: GameConstants.SHAKE_BOSS_PHASE,
      flashColor: 0x000000
    },
    attackPattern: {
      frequency: 4000,
      animation: 'whistle_blow',
      message: 'FOUL!'
    }
  }
};

/**
 * BossEntity - Represents the daily rotating boss with animations and phases
 * Handles boss sprite management, HP tracking, and visual state changes
 */
export class BossEntity extends Phaser.GameObjects.Sprite {
  private currentHP: number;
  private maxHP: number;
  private phase: number = 1;
  private hitTween?: Phaser.Tweens.Tween;
  private bossData: BossData;
  private _isInPhase2: boolean = false;
  private _isDead: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, bossData: BossData) {
    super(scene, x, y, bossData.spriteKey);
    
    this.bossData = bossData;
    this.maxHP = bossData.baseHP;
    this.currentHP = this.maxHP;
    
    // Add to scene
    scene.add.existing(this);
    
    // Set initial scale for 128x128 boss sprites
    this.setScale(1);
    this.setOrigin(0.5);
    
    // Create animations if they don't exist
    this.createAnimations();
    
    // Start idle animation with breathing effect
    this.playIdleAnimation();
  }

  /**
   * Create basic animations for this boss (simplified for single-frame sprites)
   */
  private createAnimations(): void {
    const scene = this.scene;
    const spriteKey = this.bossData.spriteKey;
    
    // For now, we'll use simple static sprites with basic idle "animation"
    // This creates a simple breathing/floating effect using tweens instead of frame animation
    
    // Create idle animation (just a simple scale tween for breathing effect)
    if (!scene.anims.exists(`${spriteKey}_idle`)) {
      scene.anims.create({
        key: `${spriteKey}_idle`,
        frames: [{ key: spriteKey, frame: 0 }],
        frameRate: 1,
        repeat: -1
      });
    }

    // Create hit animation (same frame, will use tint for hit effect)
    if (!scene.anims.exists(`${spriteKey}_hit`)) {
      scene.anims.create({
        key: `${spriteKey}_hit`,
        frames: [{ key: spriteKey, frame: 0 }],
        frameRate: 1,
        repeat: 0
      });
    }

    // Create phase2 animation (same frame, will use different effects)
    if (!scene.anims.exists(`${spriteKey}_phase2`)) {
      scene.anims.create({
        key: `${spriteKey}_phase2`,
        frames: [{ key: spriteKey, frame: 0 }],
        frameRate: 1,
        repeat: -1
      });
    }

    // Create death animation (same frame, will use fade out)
    if (!scene.anims.exists(`${spriteKey}_death`)) {
      scene.anims.create({
        key: `${spriteKey}_death`,
        frames: [{ key: spriteKey, frame: 0 }],
        frameRate: 1,
        repeat: 0
      });
    }
  }

  /**
   * Play idle animation with breathing effect (phase-dependent)
   */
  public playIdleAnimation(): void {
    if (this._isDead) return;
    
    // Play the basic animation
    const animKey = this._isInPhase2 ? 
      `${this.bossData.spriteKey}_phase2` : 
      `${this.bossData.spriteKey}_idle`;
    
    this.play(animKey);
    
    // Add breathing effect with tween
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  /**
   * Handle taking damage with visual feedback
   */
  public takeDamage(amount: number): void {
    if (this._isDead) return;
    
    // Update HP
    this.currentHP = Math.max(0, this.currentHP - amount);
    
    // Play hit animation
    this.playHitAnimation();
    
    // Check for phase transition
    if (!this._isInPhase2 && this.getHPPercentage() <= GameConstants.BOSS_PHASE2_THRESHOLD) {
      this.enterPhase2();
    }
    
    // Check for death
    if (this.currentHP <= 0) {
      this._isDead = true;
    }
  }

  /**
   * Play hit animation with color flash (public method for AttackSequence)
   */
  public playHitAnimation(): void {
    // Stop any existing hit tween
    if (this.hitTween) {
      this.hitTween.destroy();
    }
    
    // Play hit animation
    this.play(`${this.bossData.spriteKey}_hit`);
    
    // Color flash effect
    this.setTint(this.bossData.hitEffect.flashColor);
    
    // Create tween to remove tint and add hit shake
    this.hitTween = this.scene.tweens.add({
      targets: this,
      x: this.x + 5,
      duration: 75,
      ease: 'Power2',
      yoyo: true,
      onComplete: () => {
        this.clearTint();
        // Return to idle animation after hit
        if (!this._isDead) {
          this.playIdleAnimation();
        }
      }
    });
  }

  /**
   * Enter phase 2 with visual transition
   */
  public enterPhase2(): void {
    if (this._isInPhase2 || this._isDead) return;
    
    this._isInPhase2 = true;
    this.phase = 2;
    
    // Play phase 2 transition effect
    this.scene.cameras.main.shake(300, GameConstants.SHAKE_BOSS_PHASE);
    
    // Switch to phase 2 idle animation
    this.playIdleAnimation();
    
    // Emit phase change event for other systems
    this.scene.events.emit('boss-phase-change', { phase: 2, boss: this });
  }

  /**
   * Play death sequence with explosion animation
   */
  public async playDeathSequence(): Promise<void> {
    if (!this._isDead) return;
    
    return new Promise((resolve) => {
      // Play death animation
      this.play(`${this.bossData.spriteKey}_death`);
      
      // Screen shake effect
      this.scene.cameras.main.shake(500, GameConstants.SHAKE_BOSS_PHASE);
      
      // Death animation with scale and rotation
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.5,
        scaleY: 1.5,
        rotation: 0.2,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          // Fade out the boss
          this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
              resolve();
            }
          });
        }
      });
    });
  }

  /**
   * Get current HP percentage (0-1)
   */
  public getHPPercentage(): number {
    return this.currentHP / this.maxHP;
  }

  /**
   * Get current HP
   */
  public getCurrentHP(): number {
    return this.currentHP;
  }

  /**
   * Get max HP
   */
  public getMaxHP(): number {
    return this.maxHP;
  }

  /**
   * Get current phase
   */
  public getPhase(): number {
    return this.phase;
  }

  /**
   * Get boss data
   */
  public getBossData(): BossData {
    return this.bossData;
  }

  /**
   * Check if boss is dead
   */
  public isDead(): boolean {
    return this._isDead;
  }

  /**
   * Check if boss is in phase 2
   */
  public isInPhase2(): boolean {
    return this._isInPhase2;
  }

  /**
   * Set HP (for server synchronization)
   */
  public setHP(hp: number): void {
    this.currentHP = Math.max(0, Math.min(hp, this.maxHP));
    
    // Check phase transition
    if (!this._isInPhase2 && this.getHPPercentage() <= GameConstants.BOSS_PHASE2_THRESHOLD) {
      this.enterPhase2();
    }
    
    // Check death
    if (this.currentHP <= 0 && !this._isDead) {
      this._isDead = true;
    }
  }
}

/**
 * Get current boss data based on day of week
 */
export function getCurrentBoss(): BossData {
  const dayOfWeek = new Date().getDay();
  
  switch (dayOfWeek) {
    case 0: return DAILY_BOSSES.sunday as BossData;
    case 1: return DAILY_BOSSES.monday as BossData;
    case 2: return DAILY_BOSSES.tuesday as BossData;
    case 3: return DAILY_BOSSES.wednesday as BossData;
    case 4: return DAILY_BOSSES.thursday as BossData;
    case 5: return DAILY_BOSSES.friday as BossData;
    case 6: return DAILY_BOSSES.saturday as BossData;
    default: return DAILY_BOSSES.monday as BossData;
  }
}

/**
 * Get boss data by day name
 */
export function getBossByDay(day: string): BossData {
  const dayKey = day.toLowerCase();
  
  switch (dayKey) {
    case 'sunday': return DAILY_BOSSES.sunday as BossData;
    case 'monday': return DAILY_BOSSES.monday as BossData;
    case 'tuesday': return DAILY_BOSSES.tuesday as BossData;
    case 'wednesday': return DAILY_BOSSES.wednesday as BossData;
    case 'thursday': return DAILY_BOSSES.thursday as BossData;
    case 'friday': return DAILY_BOSSES.friday as BossData;
    case 'saturday': return DAILY_BOSSES.saturday as BossData;
    default: return DAILY_BOSSES.monday as BossData;
  }
}