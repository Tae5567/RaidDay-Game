import { Scene } from 'phaser';
import { MobileUtils } from '../utils/MobileUtils';

export interface DamageNumberConfig {
  x: number;
  y: number;
  damage: number;
  isCritical?: boolean;
  isSpecial?: boolean;
  isCommunity?: boolean;
  isBoosted?: boolean; // For community buff enhanced damage
  isPlayerDamage?: boolean; // For "YOUR damage: +234" styling
}

/**
 * DamageNumber - Floating damage numbers that spawn above targets and fade upward
 * Supports different styles for critical hits, special abilities, and community damage
 */
export class DamageNumber extends Phaser.GameObjects.Container {
  public override scene: Scene;
  private damageText: Phaser.GameObjects.Text;
  private shadowText: Phaser.GameObjects.Text;
  private config: DamageNumberConfig;
  
  constructor(scene: Scene, config: DamageNumberConfig) {
    super(scene, config.x, config.y);
    
    this.scene = scene;
    this.config = config;
    
    this.createDamageText();
    this.playAnimation();
    
    scene.add.existing(this);
  }

  private createDamageText(): void {
    const { damage, isCritical, isSpecial, isCommunity, isBoosted, isPlayerDamage } = this.config;
    
    // Determine styling based on damage type
    let fontSize: string;
    let color: string;
    let strokeColor: string;
    let strokeThickness: number;
    let displayText: string;
    
    if (isPlayerDamage) {
      // "YOUR damage: +234" styling as specified
      fontSize = MobileUtils.isMobile() ? '20px' : '26px';
      color = '#00ff00'; // Bright green for player damage
      strokeColor = '#000000';
      strokeThickness = 3;
      displayText = `YOUR damage: +${damage.toLocaleString()}`;
    } else if (isCritical || isSpecial) {
      fontSize = MobileUtils.isMobile() ? '24px' : '32px';
      color = isCritical ? '#ff6600' : '#ff00ff'; // Orange for crit, magenta for special
      strokeColor = '#000000';
      strokeThickness = 3;
      displayText = damage.toLocaleString();
    } else if (isCommunity) {
      fontSize = MobileUtils.isMobile() ? '14px' : '18px';
      color = isBoosted ? '#80ff80' : '#cccccc'; // Green for boosted community damage
      strokeColor = '#000000';
      strokeThickness = 2;
      displayText = damage.toLocaleString();
    } else {
      fontSize = MobileUtils.isMobile() ? '18px' : '24px';
      color = '#ffff00'; // Yellow for normal damage
      strokeColor = '#000000';
      strokeThickness = 2;
      displayText = damage.toLocaleString();
    }
    
    // Create shadow text for better readability
    this.shadowText = this.scene.add.text(2, 2, displayText, {
      fontFamily: 'Arial Black',
      fontSize: fontSize,
      color: '#000000',
    }).setOrigin(0.5);
    
    // Create main damage text
    this.damageText = this.scene.add.text(0, 0, displayText, {
      fontFamily: 'Arial Black',
      fontSize: fontSize,
      color: color,
      stroke: strokeColor,
      strokeThickness: strokeThickness,
    }).setOrigin(0.5);
    
    this.add([this.shadowText, this.damageText]);
  }

  private playAnimation(): void {
    const { isCritical, isSpecial, isPlayerDamage } = this.config;
    
    // Initial scale animation for impact - enhanced for player damage
    if (isCritical || isSpecial || isPlayerDamage) {
      this.setScale(0.5);
      this.scene.tweens.add({
        targets: this,
        scaleX: isPlayerDamage ? 1.3 : 1.2, // Slightly larger for player damage
        scaleY: isPlayerDamage ? 1.3 : 1.2,
        duration: 200,
        ease: 'Back.out',
        onComplete: () => {
          // Scale back to normal
          this.scene.tweens.add({
            targets: this,
            scaleX: 1,
            scaleY: 1,
            duration: 100,
            ease: 'Power2'
          });
        }
      });
    } else {
      this.setScale(0.8);
      this.scene.tweens.add({
        targets: this,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: 'Back.out'
      });
    }
    
    // Float upward and fade out - longer duration for player damage
    const floatDistance = MobileUtils.isMobile() ? 60 : 80;
    const duration = isPlayerDamage ? 1500 : (isCritical || isSpecial ? 1200 : 800);
    
    this.scene.tweens.add({
      targets: this,
      y: this.y - floatDistance,
      alpha: 0,
      duration: duration,
      ease: 'Power2',
      onComplete: () => {
        this.destroy();
      }
    });
    
    // Add slight horizontal drift for visual interest
    const driftAmount = Phaser.Math.Between(-20, 20);
    this.scene.tweens.add({
      targets: this,
      x: this.x + driftAmount,
      duration: duration,
      ease: 'Sine.easeOut'
    });
  }
}

/**
 * DamageNumberPool - Manages creation and pooling of damage numbers
 * Prevents performance issues from creating too many damage numbers
 */
export class DamageNumberPool {
  private scene: Scene;
  private activeNumbers: DamageNumber[] = [];
  private availableNumbers: DamageNumber[] = [];
  private maxActiveNumbers: number;
  private maxPoolSize: number;
  
  constructor(scene: Scene) {
    this.scene = scene;
    this.maxActiveNumbers = MobileUtils.isMobile() ? 5 : 10;
    this.maxPoolSize = MobileUtils.isMobile() ? 8 : 15; // Pool size for object reuse
    
    // Pre-create some damage numbers for the pool
    this.initializePool();
  }

  private initializePool(): void {
    // Pre-create a few damage numbers to avoid allocation during gameplay
    for (let i = 0; i < Math.min(3, this.maxPoolSize); i++) {
      const damageNumber = new DamageNumber(this.scene, { x: 0, y: 0, damage: 0 });
      damageNumber.setVisible(false);
      damageNumber.setActive(false);
      this.availableNumbers.push(damageNumber);
    }
  }

  public showDamage(config: DamageNumberConfig): void {
    // Remove oldest damage number if we're at the limit
    if (this.activeNumbers.length >= this.maxActiveNumbers) {
      const oldest = this.activeNumbers.shift();
      if (oldest) {
        this.returnToPool(oldest);
      }
    }
    
    // Get damage number from pool or create new one
    let damageNumber = this.getFromPool();
    if (!damageNumber) {
      damageNumber = new DamageNumber(this.scene, config);
    } else {
      // Reuse existing damage number
      this.resetDamageNumber(damageNumber, config);
    }
    
    this.activeNumbers.push(damageNumber);
    
    // Return to pool when animation completes
    damageNumber.once('destroy', () => {
      const index = this.activeNumbers.indexOf(damageNumber);
      if (index !== -1) {
        this.activeNumbers.splice(index, 1);
      }
      this.returnToPool(damageNumber);
    });
  }

  private getFromPool(): DamageNumber | null {
    if (this.availableNumbers.length > 0) {
      const damageNumber = this.availableNumbers.pop()!;
      damageNumber.setVisible(true);
      damageNumber.setActive(true);
      return damageNumber;
    }
    return null;
  }

  private returnToPool(damageNumber: DamageNumber): void {
    if (this.availableNumbers.length < this.maxPoolSize) {
      // Reset state for reuse
      damageNumber.setVisible(false);
      damageNumber.setActive(false);
      damageNumber.setPosition(0, 0);
      damageNumber.setScale(1);
      damageNumber.setAlpha(1);
      
      // Stop any active tweens
      this.scene.tweens.killTweensOf(damageNumber);
      
      this.availableNumbers.push(damageNumber);
    } else {
      // Pool is full, actually destroy the object
      if (damageNumber.scene) {
        damageNumber.destroy();
      }
    }
  }

  private resetDamageNumber(damageNumber: DamageNumber, config: DamageNumberConfig): void {
    // Reset position and config
    damageNumber.setPosition(config.x, config.y);
    damageNumber.setScale(1);
    damageNumber.setAlpha(1);
    
    // Update the damage number with new config
    // Note: This would require modifying DamageNumber class to support config updates
    // For now, we'll create a new one if pooled object can't be easily reconfigured
  }

  public getActiveCount(): number {
    return this.activeNumbers.length;
  }

  public getPoolSize(): number {
    return this.availableNumbers.length;
  }

  public clear(): void {
    // Clear active numbers
    this.activeNumbers.forEach(number => {
      if (number && number.scene) {
        this.scene.tweens.killTweensOf(number);
        number.destroy();
      }
    });
    this.activeNumbers = [];
    
    // Clear pool
    this.availableNumbers.forEach(number => {
      if (number && number.scene) {
        number.destroy();
      }
    });
    this.availableNumbers = [];
  }

  public destroy(): void {
    this.clear();
  }
}