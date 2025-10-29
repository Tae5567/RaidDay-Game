import * as Phaser from 'phaser';
import { GameConstants } from '../utils/GameConstants';

export enum CharacterClass {
  WARRIOR = 'warrior',
  MAGE = 'mage',
  ROGUE = 'rogue',
  HEALER = 'healer'
}

export interface AttackResult {
  damage: number;
  isCritical: boolean;
  energyConsumed: number;
  specialEffect?: string;
}

/**
 * Character class data and configurations
 */
export interface CharacterClassData {
  name: string;
  baseDamage: number;
  critChance: number;
  spriteKey: string;
  animations: {
    idle: { frames: number; frameRate: number };
    run: { frames: number; frameRate: number };
    attack: { frames: number; frameRate: number };
    special: { frames: number; frameRate: number };
  };
  specialAbility: {
    name: string;
    description: string;
    effect: string;
    energyCost: number;
    damageMultiplier: number;
  };
}

/**
 * Character class configurations (simplified with similar damage output)
 */
export const CHARACTER_CLASSES: Record<CharacterClass, CharacterClassData> = {
  [CharacterClass.WARRIOR]: {
    name: 'Warrior',
    baseDamage: 200, // Similar damage range 180-220
    critChance: GameConstants.DEFAULT_CRIT_CHANCE,
    spriteKey: 'warrior',
    animations: {
      idle: { frames: 1, frameRate: 1 },
      run: { frames: 1, frameRate: 1 },
      attack: { frames: 1, frameRate: 1 },
      special: { frames: 1, frameRate: 1 }
    },
    specialAbility: {
      name: 'Power Strike',
      description: 'Strong melee attack',
      effect: 'power_strike',
      energyCost: 1,
      damageMultiplier: 1.1
    }
  },
  [CharacterClass.MAGE]: {
    name: 'Mage',
    baseDamage: 200, // Similar damage range 170-230
    critChance: GameConstants.DEFAULT_CRIT_CHANCE,
    spriteKey: 'mage',
    animations: {
      idle: { frames: 1, frameRate: 1 },
      run: { frames: 1, frameRate: 1 },
      attack: { frames: 1, frameRate: 1 },
      special: { frames: 1, frameRate: 1 }
    },
    specialAbility: {
      name: 'Magic Bolt',
      description: 'Magical ranged attack',
      effect: 'magic_bolt',
      energyCost: 1,
      damageMultiplier: 1.15
    }
  },
  [CharacterClass.ROGUE]: {
    name: 'Rogue',
    baseDamage: 200, // Similar damage range 160-240
    critChance: GameConstants.DEFAULT_CRIT_CHANCE,
    spriteKey: 'rogue',
    animations: {
      idle: { frames: 1, frameRate: 1 },
      run: { frames: 1, frameRate: 1 },
      attack: { frames: 1, frameRate: 1 },
      special: { frames: 1, frameRate: 1 }
    },
    specialAbility: {
      name: 'Quick Strike',
      description: 'Fast precise attack',
      effect: 'quick_strike',
      energyCost: 1,
      damageMultiplier: 1.2
    }
  },
  [CharacterClass.HEALER]: {
    name: 'Healer',
    baseDamage: 200, // Similar damage range 175-225
    critChance: GameConstants.DEFAULT_CRIT_CHANCE,
    spriteKey: 'healer',
    animations: {
      idle: { frames: 1, frameRate: 1 },
      run: { frames: 1, frameRate: 1 },
      attack: { frames: 1, frameRate: 1 },
      special: { frames: 1, frameRate: 1 }
    },
    specialAbility: {
      name: 'Holy Strike',
      description: 'Divine damage attack',
      effect: 'holy_strike',
      energyCost: 1,
      damageMultiplier: 1.05
    }
  }
};

/**
 * PlayerCharacter - Represents the user's character with class-specific abilities
 * Handles character animations, attacks, and special abilities
 */
export class PlayerCharacter extends Phaser.GameObjects.Sprite {
  private characterClass: CharacterClass;
  private level: number;
  private isAttacking: boolean = false;
  private classData: CharacterClassData;
  private originalX: number;
  private originalY: number;

  constructor(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    characterClass: CharacterClass,
    level: number = 1
  ) {
    // Use the class sprite key (fallback will be created in Preloader)
    super(scene, x, y, CHARACTER_CLASSES[characterClass].spriteKey);
    
    this.characterClass = characterClass;
    this.level = level;
    this.classData = CHARACTER_CLASSES[characterClass];
    this.originalX = x;
    this.originalY = y;
    
    // Add to scene
    scene.add.existing(this);
    
    // Set initial scale for 32x32 character sprites
    this.setScale(2);
    this.setOrigin(0.5);
    
    // Create animations
    this.createAnimations();
    
    // Start idle animation
    this.playIdleAnimation();
    
    // Set initial state
    this.setVisible(true);
  }



  /**
   * Create basic animations for this character class (simplified for single-frame sprites)
   */
  private createAnimations(): void {
    const scene = this.scene;
    const spriteKey = this.classData.spriteKey;
    
    // Create idle animation (single frame with subtle movement)
    if (!scene.anims.exists(`${spriteKey}_idle`)) {
      scene.anims.create({
        key: `${spriteKey}_idle`,
        frames: [{ key: spriteKey, frame: 0 }],
        frameRate: 1,
        repeat: -1
      });
    }

    // Create run animation (same frame, will use movement tweens)
    if (!scene.anims.exists(`${spriteKey}_run`)) {
      scene.anims.create({
        key: `${spriteKey}_run`,
        frames: [{ key: spriteKey, frame: 0 }],
        frameRate: 1,
        repeat: -1
      });
    }

    // Create attack animation (same frame, will use effects)
    if (!scene.anims.exists(`${spriteKey}_attack`)) {
      scene.anims.create({
        key: `${spriteKey}_attack`,
        frames: [{ key: spriteKey, frame: 0 }],
        frameRate: 1,
        repeat: 0
      });
    }

    // Create special animation (same frame, will use special effects)
    if (!scene.anims.exists(`${spriteKey}_special`)) {
      scene.anims.create({
        key: `${spriteKey}_special`,
        frames: [{ key: spriteKey, frame: 0 }],
        frameRate: 1,
        repeat: 0
      });
    }
  }

  /**
   * Play idle animation with subtle bobbing effect
   */
  public playIdleAnimation(): void {
    if (!this.isAttacking) {
      this.play(`${this.classData.spriteKey}_idle`);
      
      // Add subtle bobbing animation
      this.scene.tweens.add({
        targets: this,
        y: this.originalY - 3,
        duration: 1500,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
    }
  }

  /**
   * Play run animation with bouncing effect
   */
  public playRunAnimation(): void {
    this.play(`${this.classData.spriteKey}_run`);
    
    // Add bouncing effect while running
    this.scene.tweens.add({
      targets: this,
      y: this.y - 8,
      duration: 150,
      ease: 'Power2',
      yoyo: true,
      repeat: 1
    });
  }

  /**
   * Play animation by name (for AttackSequence compatibility)
   */
  public playAnimation(animationName: string): void {
    const animKey = `${this.classData.spriteKey}_${animationName}`;
    if (this.scene.anims.exists(animKey)) {
      this.play(animKey);
    } else {
      // Fallback to idle if animation doesn't exist
      this.playIdleAnimation();
    }
  }

  /**
   * Perform normal attack with animation sequence
   */
  public async performAttack(): Promise<AttackResult> {
    if (this.isAttacking) {
      return { damage: 0, isCritical: false, energyConsumed: 0 };
    }

    this.isAttacking = true;

    return new Promise((resolve) => {
      // Calculate damage
      const damage = this.calculateDamage();
      const isCritical = this.rollCritical();
      const finalDamage = isCritical ? damage * GameConstants.CRIT_MULTIPLIER : damage;

      // Start attack sequence
      this.playAttackSequence().then(() => {
        this.isAttacking = false;
        resolve({
          damage: finalDamage,
          isCritical,
          energyConsumed: 1
        });
      });
    });
  }

  /**
   * Perform special ability (simplified version)
   */
  public async performSpecialAbility(): Promise<AttackResult> {
    if (this.isAttacking) {
      return { damage: 0, isCritical: false, energyConsumed: 0 };
    }

    this.isAttacking = true;

    return new Promise((resolve) => {
      // Calculate special ability damage (slightly higher than normal attack)
      const baseDamage = this.calculateDamage();
      const damage = baseDamage * this.classData.specialAbility.damageMultiplier;
      const isCritical = this.rollCritical();
      const finalDamage = isCritical ? damage * GameConstants.CRIT_MULTIPLIER : damage;

      // Play simplified special sequence (same as attack but with different effects)
      this.playAttackSequence().then(() => {
        this.isAttacking = false;
        resolve({
          damage: finalDamage,
          isCritical,
          energyConsumed: this.classData.specialAbility.energyCost,
          specialEffect: this.classData.specialAbility.effect
        });
      });
    });
  }

  /**
   * Play attack animation sequence (0.8 seconds total as per requirements)
   */
  private async playAttackSequence(): Promise<void> {
    return new Promise((resolve) => {
      // Phase 1: Run forward (0.3s = 300ms)
      this.playRunAnimation();
      this.scene.tweens.add({
        targets: this,
        x: this.originalX + 60,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          // Phase 2: Attack animation (0.2s = 200ms)
          this.play(`${this.classData.spriteKey}_attack`);
          
          // Add attack flash effect
          this.setTint(0xffffff);
          this.scene.time.delayedCall(100, () => this.clearTint());
          
          // Emit attack hit event for damage numbers and effects
          this.scene.events.emit('player-attack-hit', { 
            x: this.x + 20, 
            y: this.y, 
            class: this.characterClass 
          });
          
          this.scene.time.delayedCall(200, () => {
            // Phase 3: Run back (0.3s = 300ms)
            this.playRunAnimation();
            this.setFlipX(true); // Face left when running back
            
            this.scene.tweens.add({
              targets: this,
              x: this.originalX,
              duration: 300,
              ease: 'Power2',
              onComplete: () => {
                this.setFlipX(false); // Face right again
                this.playIdleAnimation();
                resolve();
              }
            });
          });
        }
      });
    });
  }



  /**
   * Calculate damage with simplified mechanics (similar output across classes)
   */
  private calculateDamage(): number {
    // Base damage ranges by class (minimal differences as per requirements)
    const baseDamageRanges = {
      [CharacterClass.WARRIOR]: [180, 220],
      [CharacterClass.MAGE]: [170, 230], 
      [CharacterClass.ROGUE]: [160, 240],
      [CharacterClass.HEALER]: [175, 225]
    };
    
    const range = baseDamageRanges[this.characterClass] || [180, 220];
    const [min, max] = range;
    let damage = Phaser.Math.Between(min as number, max as number);
    
    // Simple level scaling (2% per level)
    damage *= (1 + ((this.level || 1) - 1) * 0.02);
    
    // Random variance ±15%
    damage *= Phaser.Math.FloatBetween(0.85, 1.15);
    
    return Math.floor(damage);
  }

  /**
   * Roll for critical hit
   */
  private rollCritical(): boolean {
    return Math.random() < this.classData.critChance;
  }

  /**
   * Get character class
   */
  public getCharacterClass(): CharacterClass {
    return this.characterClass;
  }

  /**
   * Get character level
   */
  public getLevel(): number {
    return this.level;
  }

  /**
   * Get character class data
   */
  public getClassData(): CharacterClassData {
    return this.classData;
  }

  /**
   * Check if currently attacking
   */
  public getIsAttacking(): boolean {
    return this.isAttacking;
  }

  /**
   * Set character level
   */
  public setLevel(level: number): void {
    this.level = level;
  }

  /**
   * Reset position to original and stop all tweens
   */
  public resetPosition(): void {
    // Stop all tweens on this character
    this.scene.tweens.killTweensOf(this);
    
    // Reset position and state
    this.x = this.originalX;
    this.y = this.originalY;
    this.setFlipX(false);
    this.setAlpha(1);
    this.clearTint();
    this.setScale(2);
    this.isAttacking = false;
    
    // Restart idle animation
    this.playIdleAnimation();
  }


}