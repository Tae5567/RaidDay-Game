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
 * Daily boss rotation data (7 themed bosses)
 */
export const DAILY_BOSSES: Record<string, BossData> = {
  monday: {
    id: 'lag_spike',
    name: 'The Lag Spike',
    theme: DailyTheme.GAMING,
    baseHP: 80000,
    level: 45,
    spriteKey: 'boss_lag_spike',
    animations: {
      idle: { frames: 3, frameRate: 2, repeat: -1 },
      hit: { frames: 2, frameRate: 10, repeat: 0 },
      phase2: { frames: 3, frameRate: 4, repeat: -1 },
      death: { frames: 8, frameRate: 5, repeat: 0 }
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
    baseHP: 85000,
    level: 47,
    spriteKey: 'boss_algorithm',
    animations: {
      idle: { frames: 4, frameRate: 3, repeat: -1 },
      hit: { frames: 2, frameRate: 12, repeat: 0 },
      phase2: { frames: 4, frameRate: 5, repeat: -1 },
      death: { frames: 6, frameRate: 6, repeat: 0 }
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
    baseHP: 75000,
    level: 42,
    spriteKey: 'boss_influencer',
    animations: {
      idle: { frames: 3, frameRate: 2, repeat: -1 },
      hit: { frames: 3, frameRate: 8, repeat: 0 },
      phase2: { frames: 4, frameRate: 4, repeat: -1 },
      death: { frames: 7, frameRate: 4, repeat: 0 }
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
    baseHP: 90000,
    level: 50,
    spriteKey: 'boss_deadline',
    animations: {
      idle: { frames: 2, frameRate: 1, repeat: -1 },
      hit: { frames: 2, frameRate: 15, repeat: 0 },
      phase2: { frames: 3, frameRate: 6, repeat: -1 },
      death: { frames: 5, frameRate: 3, repeat: 0 }
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
    baseHP: 70000,
    level: 40,
    spriteKey: 'boss_spoiler',
    animations: {
      idle: { frames: 3, frameRate: 2, repeat: -1 },
      hit: { frames: 2, frameRate: 10, repeat: 0 },
      phase2: { frames: 3, frameRate: 3, repeat: -1 },
      death: { frames: 6, frameRate: 4, repeat: 0 }
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
    baseHP: 95000,
    level: 52,
    spriteKey: 'boss_referee',
    animations: {
      idle: { frames: 2, frameRate: 2, repeat: -1 },
      hit: { frames: 3, frameRate: 12, repeat: 0 },
      phase2: { frames: 2, frameRate: 4, repeat: -1 },
      death: { frames: 4, frameRate: 5, repeat: 0 }
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
  },
  sunday: {
    id: 'cringe',
    name: 'The Cringe',
    theme: DailyTheme.MEMES,
    baseHP: 65000,
    level: 38,
    spriteKey: 'boss_cringe',
    animations: {
      idle: { frames: 4, frameRate: 1, repeat: -1 },
      hit: { frames: 3, frameRate: 6, repeat: 0 },
      phase2: { frames: 4, frameRate: 2, repeat: -1 },
      death: { frames: 10, frameRate: 8, repeat: 0 }
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
    
    // Start idle animation (disabled for now due to missing sprites)
    // this.playIdleAnimation();
  }

  /**
   * Create all animations for this boss
   */
  private createAnimations(): void {
    const scene = this.scene;
    const spriteKey = this.bossData.spriteKey;
    
    // Create idle animation
    if (!scene.anims.exists(`${spriteKey}_idle`)) {
      scene.anims.create({
        key: `${spriteKey}_idle`,
        frames: scene.anims.generateFrameNumbers(spriteKey, { 
          start: 0, 
          end: this.bossData.animations.idle.frames - 1 
        }),
        frameRate: this.bossData.animations.idle.frameRate,
        repeat: this.bossData.animations.idle.repeat || -1
      });
    }

    // Create hit animation
    if (!scene.anims.exists(`${spriteKey}_hit`)) {
      scene.anims.create({
        key: `${spriteKey}_hit`,
        frames: scene.anims.generateFrameNumbers(spriteKey, { 
          start: this.bossData.animations.idle.frames, 
          end: this.bossData.animations.idle.frames + this.bossData.animations.hit.frames - 1 
        }),
        frameRate: this.bossData.animations.hit.frameRate,
        repeat: this.bossData.animations.hit.repeat || 0
      });
    }

    // Create phase2 animation
    if (!scene.anims.exists(`${spriteKey}_phase2`)) {
      scene.anims.create({
        key: `${spriteKey}_phase2`,
        frames: scene.anims.generateFrameNumbers(spriteKey, { 
          start: this.bossData.animations.idle.frames + this.bossData.animations.hit.frames, 
          end: this.bossData.animations.idle.frames + this.bossData.animations.hit.frames + this.bossData.animations.phase2.frames - 1 
        }),
        frameRate: this.bossData.animations.phase2.frameRate,
        repeat: this.bossData.animations.phase2.repeat || -1
      });
    }

    // Create death animation
    if (!scene.anims.exists(`${spriteKey}_death`)) {
      scene.anims.create({
        key: `${spriteKey}_death`,
        frames: scene.anims.generateFrameNumbers(spriteKey, { 
          start: this.bossData.animations.idle.frames + this.bossData.animations.hit.frames + this.bossData.animations.phase2.frames, 
          end: this.bossData.animations.idle.frames + this.bossData.animations.hit.frames + this.bossData.animations.phase2.frames + this.bossData.animations.death.frames - 1 
        }),
        frameRate: this.bossData.animations.death.frameRate,
        repeat: this.bossData.animations.death.repeat || 0
      });
    }
  }

  /**
   * Play idle animation (phase-dependent)
   */
  public playIdleAnimation(): void {
    if (this._isDead) return;
    
    // Animations disabled for now due to missing sprites
    // const animKey = this._isInPhase2 ? 
    //   `${this.bossData.spriteKey}_phase2` : 
    //   `${this.bossData.spriteKey}_idle`;
    // 
    // this.play(animKey);
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
    
    // Play hit animation (disabled for now)
    // this.play(`${this.bossData.spriteKey}_hit`);
    
    // Color flash effect
    this.setTint(this.bossData.hitEffect.flashColor);
    
    // Create tween to remove tint
    this.hitTween = this.scene.tweens.add({
      targets: this,
      duration: 150,
      ease: 'Power2',
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
      // Play death animation (disabled for now)
      // this.play(`${this.bossData.spriteKey}_death`);
      
      // Screen shake effect
      this.scene.cameras.main.shake(500, GameConstants.SHAKE_BOSS_PHASE);
      
      // Simulate animation complete after delay
      this.scene.time.delayedCall(1000, () => {
        // Fade out the boss
        this.scene.tweens.add({
          targets: this,
          alpha: 0,
          duration: 1000,
          ease: 'Power2',
          onComplete: () => {
            resolve();
          }
        });
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