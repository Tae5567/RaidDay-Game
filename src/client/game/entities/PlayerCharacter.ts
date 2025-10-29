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
 * Character class configurations
 */
export const CHARACTER_CLASSES: Record<CharacterClass, CharacterClassData> = {
  [CharacterClass.WARRIOR]: {
    name: 'Warrior',
    baseDamage: 120,
    critChance: GameConstants.DEFAULT_CRIT_CHANCE,
    spriteKey: 'warrior',
    animations: {
      idle: { frames: 2, frameRate: 2 },
      run: { frames: 4, frameRate: 8 },
      attack: { frames: 3, frameRate: 10 },
      special: { frames: 4, frameRate: 8 }
    },
    specialAbility: {
      name: 'Charge Attack',
      description: '3-hit combo with enhanced animations',
      effect: 'triple_hit',
      energyCost: 3,
      damageMultiplier: 3
    }
  },
  [CharacterClass.MAGE]: {
    name: 'Mage',
    baseDamage: 100,
    critChance: GameConstants.DEFAULT_CRIT_CHANCE,
    spriteKey: 'mage',
    animations: {
      idle: { frames: 2, frameRate: 2 },
      run: { frames: 4, frameRate: 8 },
      attack: { frames: 3, frameRate: 10 },
      special: { frames: 4, frameRate: 6 }
    },
    specialAbility: {
      name: 'Fireball',
      description: 'Explosive magic with screen shake',
      effect: 'fireball_explosion',
      energyCost: 3,
      damageMultiplier: 3
    }
  },
  [CharacterClass.ROGUE]: {
    name: 'Rogue',
    baseDamage: 90,
    critChance: GameConstants.ROGUE_CRIT_CHANCE, // 30% crit chance
    spriteKey: 'rogue',
    animations: {
      idle: { frames: 2, frameRate: 2 },
      run: { frames: 4, frameRate: 10 },
      attack: { frames: 3, frameRate: 12 },
      special: { frames: 3, frameRate: 15 }
    },
    specialAbility: {
      name: 'Backstab',
      description: 'Teleport attack with guaranteed critical',
      effect: 'backstab_teleport',
      energyCost: 3,
      damageMultiplier: 3
    }
  },
  [CharacterClass.HEALER]: {
    name: 'Healer',
    baseDamage: 80,
    critChance: GameConstants.DEFAULT_CRIT_CHANCE,
    spriteKey: 'healer',
    animations: {
      idle: { frames: 2, frameRate: 2 },
      run: { frames: 4, frameRate: 6 },
      attack: { frames: 3, frameRate: 8 },
      special: { frames: 4, frameRate: 5 }
    },
    specialAbility: {
      name: 'Buff Aura',
      description: 'Enhances next 5 community attacks (+20% damage)',
      effect: 'community_buff',
      energyCost: 3,
      damageMultiplier: 3
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
    super(scene, x, y, CHARACTER_CLASSES[characterClass].spriteKey);
    
    this.characterClass = characterClass;
    this.level = level;
    this.classData = CHARACTER_CLASSES[characterClass];
    this.originalX = x;
    this.originalY = y;
    
    // Add to scene
    scene.add.existing(this);
    
    // Set initial scale for character sprites (make them smaller for better layout)
    this.setScale(1.5); // Reduced from 2 to 1.5
    this.setOrigin(0.5);
    
    // Since we're using single image sprites, no animations needed for now
    // this.createAnimations();
    
    // Set initial state
    this.setVisible(true);
  }

  /**
   * Create all animations for this character class
   */
  private createAnimations(): void {
    const scene = this.scene;
    const spriteKey = this.classData.spriteKey;
    
    // Create idle animation
    if (!scene.anims.exists(`${spriteKey}_idle`)) {
      scene.anims.create({
        key: `${spriteKey}_idle`,
        frames: scene.anims.generateFrameNumbers(spriteKey, { 
          start: 0, 
          end: this.classData.animations.idle.frames - 1 
        }),
        frameRate: this.classData.animations.idle.frameRate,
        repeat: -1
      });
    }

    // Create run animation
    if (!scene.anims.exists(`${spriteKey}_run`)) {
      scene.anims.create({
        key: `${spriteKey}_run`,
        frames: scene.anims.generateFrameNumbers(spriteKey, { 
          start: this.classData.animations.idle.frames, 
          end: this.classData.animations.idle.frames + this.classData.animations.run.frames - 1 
        }),
        frameRate: this.classData.animations.run.frameRate,
        repeat: -1
      });
    }

    // Create attack animation
    if (!scene.anims.exists(`${spriteKey}_attack`)) {
      scene.anims.create({
        key: `${spriteKey}_attack`,
        frames: scene.anims.generateFrameNumbers(spriteKey, { 
          start: this.classData.animations.idle.frames + this.classData.animations.run.frames, 
          end: this.classData.animations.idle.frames + this.classData.animations.run.frames + this.classData.animations.attack.frames - 1 
        }),
        frameRate: this.classData.animations.attack.frameRate,
        repeat: 0
      });
    }

    // Create special animation
    if (!scene.anims.exists(`${spriteKey}_special`)) {
      scene.anims.create({
        key: `${spriteKey}_special`,
        frames: scene.anims.generateFrameNumbers(spriteKey, { 
          start: this.classData.animations.idle.frames + this.classData.animations.run.frames + this.classData.animations.attack.frames, 
          end: this.classData.animations.idle.frames + this.classData.animations.run.frames + this.classData.animations.attack.frames + this.classData.animations.special.frames - 1 
        }),
        frameRate: this.classData.animations.special.frameRate,
        repeat: 0
      });
    }
  }

  /**
   * Play idle animation
   */
  public playIdleAnimation(): void {
    // Animations disabled for now due to missing sprites
    // if (!this.isAttacking) {
    //   this.play(`${this.classData.spriteKey}_idle`);
    // }
  }

  /**
   * Play run animation
   */
  public playRunAnimation(): void {
    // Animations disabled for now due to missing sprites
    // this.play(`${this.classData.spriteKey}_run`);
  }

  /**
   * Play animation by name (for AttackSequence compatibility)
   */
  public playAnimation(_animationName: string): void {
    // Animations disabled for now due to missing sprites
    // const animKey = `${this.classData.spriteKey}_${animationName}`;
    // if (this.scene.anims.exists(animKey)) {
    //   this.play(animKey);
    // } else {
    //   // Fallback to idle if animation doesn't exist
    //   this.playIdleAnimation();
    // }
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
   * Perform special ability with enhanced effects
   */
  public async performSpecialAbility(): Promise<AttackResult> {
    if (this.isAttacking) {
      return { damage: 0, isCritical: false, energyConsumed: 0 };
    }

    this.isAttacking = true;

    return new Promise((resolve) => {
      // Calculate special ability damage
      const baseDamage = this.calculateDamage();
      const damage = baseDamage * this.classData.specialAbility.damageMultiplier;
      
      // Special abilities have different crit rules
      let isCritical = false;
      if (this.characterClass === CharacterClass.ROGUE) {
        // Rogue backstab is guaranteed critical
        isCritical = true;
      } else {
        isCritical = this.rollCritical();
      }

      const finalDamage = isCritical ? damage * GameConstants.CRIT_MULTIPLIER : damage;

      // Play special ability sequence
      this.playSpecialSequence().then(() => {
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
   * Play attack animation sequence (1.5 seconds total)
   */
  private async playAttackSequence(): Promise<void> {
    return new Promise((resolve) => {
      // Phase 1: Run forward (300ms)
      this.playRunAnimation();
      this.scene.tweens.add({
        targets: this,
        x: this.originalX + 50,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          // Phase 2: Attack animation (200ms) - disabled for now
          // this.play(`${this.classData.spriteKey}_attack`);
          
          this.scene.time.delayedCall(200, () => {
            // Phase 3: Particles and damage (100ms)
            this.scene.events.emit('player-attack-hit', { 
              x: this.x, 
              y: this.y, 
              class: this.characterClass 
            });
            
            this.scene.time.delayedCall(400, () => {
              // Phase 4: Run back (300ms)
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
          });
        }
      });
    });
  }

  /**
   * Play special ability animation sequence
   */
  private async playSpecialSequence(): Promise<void> {
    return new Promise((resolve) => {
      // Handle class-specific special animations
      switch (this.characterClass) {
        case CharacterClass.WARRIOR:
          this.playWarriorChargeSequence(resolve);
          break;
        case CharacterClass.MAGE:
          this.playMageFireballSequence(resolve);
          break;
        case CharacterClass.ROGUE:
          this.playRogueBackstabSequence(resolve);
          break;
        case CharacterClass.HEALER:
          this.playHealerBuffSequence(resolve);
          break;
        default:
          resolve();
      }
    });
  }

  /**
   * Warrior charge attack sequence - 3-hit combo with enhanced animations
   */
  private playWarriorChargeSequence(resolve: () => void): void {
    this.play(`${this.classData.spriteKey}_special`);
    
    // Charge forward with enhanced speed
    this.scene.tweens.add({
      targets: this,
      x: this.originalX + 80,
      duration: 200,
      ease: 'Power3',
      onComplete: () => {
        // Triple hit sequence with increasing intensity
        let hitCount = 0;
        const performHit = () => {
          hitCount++;
          
          // Screen shake increases with each hit
          const shakeIntensity = hitCount * 2;
          this.scene.cameras.main.shake(150, shakeIntensity);
          
          // Enhanced particle effects for each hit
          this.scene.events.emit('player-special-hit', { 
            x: this.x + 20, 
            y: this.y, 
            class: this.characterClass,
            hitNumber: hitCount,
            effect: 'warrior_combo'
          });
          
          // Flash effect on character
          this.setTint(0xff6600);
          this.scene.time.delayedCall(100, () => this.clearTint());
          
          if (hitCount < 3) {
            this.scene.time.delayedCall(250, performHit);
          } else {
            // Final powerful hit with extra effects
            this.scene.cameras.main.shake(300, 8);
            this.scene.time.delayedCall(400, () => {
              // Return to original position
              this.scene.tweens.add({
                targets: this,
                x: this.originalX,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                  this.playIdleAnimation();
                  resolve();
                }
              });
            });
          }
        };
        
        this.scene.time.delayedCall(100, performHit);
      }
    });
  }

  /**
   * Mage fireball sequence - Explosive magic with screen shake and effects
   */
  private playMageFireballSequence(resolve: () => void): void {
    this.play(`${this.classData.spriteKey}_special`);
    
    // Charging effect - glow and particles
    this.setTint(0x4444ff);
    
    // Create charging particles around mage
    this.scene.events.emit('player-special-charging', {
      x: this.x,
      y: this.y,
      class: this.characterClass,
      effect: 'mage_charging'
    });
    
    this.scene.time.delayedCall(600, () => {
      this.clearTint();
      
      // Create fireball projectile that travels to target
      const fireballSprite = this.scene.add.circle(this.x, this.y, 8, 0xff4400);
      fireballSprite.setStrokeStyle(2, 0xffff00);
      
      // Animate fireball to target
      this.scene.tweens.add({
        targets: fireballSprite,
        x: this.x + 120,
        y: this.y - 20,
        duration: 400,
        ease: 'Power2',
        onComplete: () => {
          // Explosion at target
          this.scene.events.emit('player-special-hit', { 
            x: fireballSprite.x, 
            y: fireballSprite.y, 
            class: this.characterClass,
            effect: 'fireball_explosion'
          });
          
          // Massive screen shake for explosion
          this.scene.cameras.main.shake(500, GameConstants.SHAKE_BOSS_PHASE);
          
          // Remove fireball sprite
          fireballSprite.destroy();
          
          this.scene.time.delayedCall(300, () => {
            this.playIdleAnimation();
            resolve();
          });
        }
      });
    });
  }

  /**
   * Rogue backstab teleport sequence - Teleport attack with guaranteed critical
   */
  private playRogueBackstabSequence(resolve: () => void): void {
    // Shadow clone effect before teleport
    const shadowClone = this.scene.add.sprite(this.x, this.y, this.classData.spriteKey);
    shadowClone.setScale(this.scaleX, this.scaleY);
    shadowClone.setTint(0x000000);
    shadowClone.setAlpha(0.5);
    
    // Fade out main character (teleport away)
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 150,
      onComplete: () => {
        // Teleport behind boss with stealth particles
        this.x = this.originalX + 110;
        this.setScale(2); // Reset scale
        this.play(`${this.classData.spriteKey}_special`);
        
        // Stealth particles at teleport location
        this.scene.events.emit('player-special-charging', {
          x: this.x,
          y: this.y,
          class: this.characterClass,
          effect: 'rogue_stealth'
        });
        
        // Fade in with enhanced speed
        this.scene.tweens.add({
          targets: this,
          alpha: 1,
          duration: 100,
          onComplete: () => {
            // Critical backstab hit with time freeze effect
            this.scene.time.timeScale = 0.1; // Slow motion effect
            
            this.scene.events.emit('player-special-hit', { 
              x: this.x, 
              y: this.y, 
              class: this.characterClass,
              effect: 'backstab_critical',
              guaranteed_critical: true
            });
            
            // Flash the screen for critical impact
            const flashOverlay = this.scene.add.rectangle(0, 0, this.scene.scale.width, this.scene.scale.height, 0xffffff, 0.8);
            flashOverlay.setOrigin(0);
            
            this.scene.time.delayedCall(100, () => {
              this.scene.time.timeScale = 1; // Resume normal time
              flashOverlay.destroy();
              
              this.scene.time.delayedCall(200, () => {
                // Teleport back with smoke effect
                this.scene.tweens.add({
                  targets: this,
                  alpha: 0,
                  duration: 150,
                  onComplete: () => {
                    this.x = this.originalX;
                    this.scene.tweens.add({
                      targets: this,
                      alpha: 1,
                      duration: 150,
                      onComplete: () => {
                        // Remove shadow clone
                        shadowClone.destroy();
                        this.playIdleAnimation();
                        resolve();
                      }
                    });
                  }
                });
              });
            });
          }
        });
      }
    });
    
    // Animate shadow clone to fade out
    this.scene.tweens.add({
      targets: shadowClone,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        if (shadowClone.active) {
          shadowClone.destroy();
        }
      }
    });
  }

  /**
   * Healer buff aura sequence - Enhances next 5 community attacks (+20% damage)
   */
  private playHealerBuffSequence(resolve: () => void): void {
    this.play(`${this.classData.spriteKey}_special`);
    
    // Pulsing healing aura effect
    const originalScale = this.scaleX;
    
    // Create expanding aura rings
    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 200, () => {
        const auraRing = this.scene.add.circle(this.x, this.y, 10, 0x00ff00, 0);
        auraRing.setStrokeStyle(3, 0x80ff80, 0.8);
        
        this.scene.tweens.add({
          targets: auraRing,
          radius: 100,
          alpha: 0,
          duration: 800,
          ease: 'Power2',
          onComplete: () => auraRing.destroy()
        });
      });
    }
    
    // Healing glow effect on character
    this.setTint(0x80ff80);
    
    // Pulsing scale effect
    this.scene.tweens.add({
      targets: this,
      scaleX: originalScale * 1.2,
      scaleY: originalScale * 1.2,
      duration: 300,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.easeInOut'
    });
    
    // Emit community buff event
    this.scene.events.emit('player-special-hit', { 
      x: this.x, 
      y: this.y, 
      class: this.characterClass,
      effect: 'community_buff_aura'
    });
    
    // Sparkle particles around healer
    this.scene.events.emit('player-special-charging', {
      x: this.x,
      y: this.y,
      class: this.characterClass,
      effect: 'healer_sparkles'
    });
    
    this.scene.time.delayedCall(1000, () => {
      this.clearTint();
      this.setScale(originalScale);
      this.playIdleAnimation();
      resolve();
    });
  }

  /**
   * Calculate base damage for this character
   */
  private calculateDamage(): number {
    const baseDamage = this.classData.baseDamage;
    const levelMultiplier = 1 + (this.level - 1) * 0.05; // 5% per level
    const variance = Phaser.Math.FloatBetween(0.9, 1.1); // ±10% variance
    
    return Math.floor(baseDamage * levelMultiplier * variance);
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
   * Reset position to original
   */
  public resetPosition(): void {
    this.x = this.originalX;
    this.y = this.originalY;
    this.setFlipX(false);
    this.setAlpha(1);
    this.clearTint();
  }
}