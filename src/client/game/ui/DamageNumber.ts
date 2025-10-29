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
    const { damage, isCritical, isSpecial, isCommunity, isBoosted } = this.config;
    
    // Determine styling based on damage type
    let fontSize: string;
    let color: string;
    let strokeColor: string;
    let strokeThickness: number;
    
    if (isCritical || isSpecial) {
      fontSize = MobileUtils.isMobile() ? '24px' : '32px';
      color = isCritical ? '#ff6600' : '#ff00ff'; // Orange for crit, magenta for special
      strokeColor = '#000000';
      strokeThickness = 3;
    } else if (isCommunity) {
      fontSize = MobileUtils.isMobile() ? '14px' : '18px';
      color = isBoosted ? '#80ff80' : '#cccccc'; // Green for boosted community damage
      strokeColor = '#000000';
      strokeThickness = 2;
    } else {
      fontSize = MobileUtils.isMobile() ? '18px' : '24px';
      color = '#ffff00'; // Yellow for normal damage
      strokeColor = '#000000';
      strokeThickness = 2;
    }
    
    // Create shadow text for better readability
    this.shadowText = this.scene.add.text(2, 2, damage.toLocaleString(), {
      fontFamily: 'Arial Black',
      fontSize: fontSize,
      color: '#000000',
    }).setOrigin(0.5);
    
    // Create main damage text
    this.damageText = this.scene.add.text(0, 0, damage.toLocaleString(), {
      fontFamily: 'Arial Black',
      fontSize: fontSize,
      color: color,
      stroke: strokeColor,
      strokeThickness: strokeThickness,
    }).setOrigin(0.5);
    
    this.add([this.shadowText, this.damageText]);
  }

  private playAnimation(): void {
    const { isCritical, isSpecial } = this.config;
    
    // Initial scale animation for impact
    if (isCritical || isSpecial) {
      this.setScale(0.5);
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.2,
        scaleY: 1.2,
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
    
    // Float upward and fade out
    const floatDistance = MobileUtils.isMobile() ? 60 : 80;
    const duration = isCritical || isSpecial ? 1200 : 800;
    
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
  private maxActiveNumbers: number;
  
  constructor(scene: Scene) {
    this.scene = scene;
    this.maxActiveNumbers = MobileUtils.isMobile() ? 5 : 10;
  }

  public showDamage(config: DamageNumberConfig): void {
    // Remove oldest damage number if we're at the limit
    if (this.activeNumbers.length >= this.maxActiveNumbers) {
      const oldest = this.activeNumbers.shift();
      if (oldest && oldest.scene) {
        oldest.destroy();
      }
    }
    
    // Create new damage number
    const damageNumber = new DamageNumber(this.scene, config);
    this.activeNumbers.push(damageNumber);
    
    // Remove from active list when destroyed
    damageNumber.once('destroy', () => {
      const index = this.activeNumbers.indexOf(damageNumber);
      if (index !== -1) {
        this.activeNumbers.splice(index, 1);
      }
    });
  }

  public clear(): void {
    this.activeNumbers.forEach(number => {
      if (number && number.scene) {
        number.destroy();
      }
    });
    this.activeNumbers = [];
  }

  public destroy(): void {
    this.clear();
  }
}