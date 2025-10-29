import { Scene } from 'phaser';
import { MobileUtils } from '../utils/MobileUtils';

export enum StatusMessageType {
  CRITICAL = 'CRITICAL!',
  SLASH = 'SLASH!',
  BOOM = 'BOOM!',
  SPECIAL = 'SPECIAL!',
  PHASE_CHANGE = 'PHASE 2!',
  VICTORY = 'VICTORY!',
  ENERGY_RESTORED = 'ENERGY RESTORED!',
  COMBO = 'COMBO!',
  COMMUNITY_BUFF = 'COMMUNITY BUFF ACTIVE!',
  BUFF_ACTIVE = 'BUFFED!',
  WARRIOR_CHARGE = 'TRIPLE STRIKE!',
  MAGE_FIREBALL = 'FIREBALL!',
  ROGUE_BACKSTAB = 'BACKSTAB!',
  HEALER_AURA = 'HEALING AURA!'
}

export interface StatusMessageConfig {
  x: number;
  y: number;
  message: StatusMessageType | string;
  color?: string;
  duration?: number;
  scale?: number;
}

/**
 * StatusMessage - Visual feedback messages for combat events
 * Provides audio-free feedback through text animations
 */
export class StatusMessage extends Phaser.GameObjects.Container {
  private messageText: Phaser.GameObjects.Text;
  private shadowText: Phaser.GameObjects.Text;
  private config: StatusMessageConfig;
  
  constructor(scene: Scene, config: StatusMessageConfig) {
    super(scene, config.x, config.y);
    
    this.config = {
      color: '#ffffff',
      duration: 1000,
      scale: 1,
      ...config
    };
    
    this.createMessageText();
    this.playAnimation();
    
    scene.add.existing(this);
  }

  private createMessageText(): void {
    const { message, color } = this.config;
    
    // Determine styling based on message type
    let fontSize: string;
    let textColor: string;
    let strokeColor: string;
    let strokeThickness: number;
    
    switch (message) {
      case StatusMessageType.CRITICAL:
        fontSize = MobileUtils.isMobile() ? '20px' : '28px';
        textColor = '#ff6600';
        strokeColor = '#000000';
        strokeThickness = 3;
        break;
        
      case StatusMessageType.SPECIAL:
        fontSize = MobileUtils.isMobile() ? '22px' : '30px';
        textColor = '#ff00ff';
        strokeColor = '#000000';
        strokeThickness = 3;
        break;
        
      case StatusMessageType.PHASE_CHANGE:
        fontSize = MobileUtils.isMobile() ? '32px' : '48px';
        textColor = '#ff0000';
        strokeColor = '#000000';
        strokeThickness = 4;
        break;
        
      case StatusMessageType.VICTORY:
        fontSize = MobileUtils.isMobile() ? '36px' : '52px';
        textColor = '#00ff00';
        strokeColor = '#000000';
        strokeThickness = 4;
        break;
        
      case StatusMessageType.ENERGY_RESTORED:
        fontSize = MobileUtils.isMobile() ? '16px' : '20px';
        textColor = '#00ff00';
        strokeColor = '#000000';
        strokeThickness = 2;
        break;
        
      case StatusMessageType.COMMUNITY_BUFF:
        fontSize = MobileUtils.isMobile() ? '18px' : '24px';
        textColor = '#80ff80';
        strokeColor = '#000000';
        strokeThickness = 2;
        break;
        
      case StatusMessageType.BUFF_ACTIVE:
        fontSize = MobileUtils.isMobile() ? '14px' : '18px';
        textColor = '#ffff80';
        strokeColor = '#000000';
        strokeThickness = 2;
        break;
        
      case StatusMessageType.WARRIOR_CHARGE:
      case StatusMessageType.MAGE_FIREBALL:
      case StatusMessageType.ROGUE_BACKSTAB:
      case StatusMessageType.HEALER_AURA:
        fontSize = MobileUtils.isMobile() ? '20px' : '26px';
        textColor = '#ff80ff';
        strokeColor = '#000000';
        strokeThickness = 3;
        break;
        
      default:
        fontSize = MobileUtils.isMobile() ? '18px' : '24px';
        textColor = color || '#ffffff';
        strokeColor = '#000000';
        strokeThickness = 2;
        break;
    }
    
    // Create shadow text for better readability
    this.shadowText = this.scene.add.text(3, 3, message, {
      fontFamily: 'Arial Black',
      fontSize: fontSize,
      color: '#000000',
    }).setOrigin(0.5);
    
    // Create main message text
    this.messageText = this.scene.add.text(0, 0, message, {
      fontFamily: 'Arial Black',
      fontSize: fontSize,
      color: textColor,
      stroke: strokeColor,
      strokeThickness: strokeThickness,
    }).setOrigin(0.5);
    
    this.add([this.shadowText, this.messageText]);
  }

  private playAnimation(): void {
    const { message, duration } = this.config;
    
    // Different animations based on message type
    switch (message) {
      case StatusMessageType.CRITICAL:
        this.playCriticalAnimation(duration!);
        break;
        
      case StatusMessageType.SPECIAL:
        this.playSpecialAnimation(duration!);
        break;
        
      case StatusMessageType.PHASE_CHANGE:
        this.playPhaseChangeAnimation(duration!);
        break;
        
      case StatusMessageType.VICTORY:
        this.playVictoryAnimation(duration!);
        break;
        
      default:
        this.playDefaultAnimation(duration!);
        break;
    }
  }

  private playCriticalAnimation(duration: number): void {
    // Explosive entrance
    this.setScale(0.2);
    this.setRotation(Phaser.Math.DegToRad(-15));
    
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 1.3,
      rotation: Phaser.Math.DegToRad(5),
      duration: 200,
      ease: 'Back.out',
      onComplete: () => {
        // Settle and fade
        this.scene.tweens.add({
          targets: this,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          alpha: 0,
          duration: duration - 200,
          ease: 'Power2',
          onComplete: () => this.destroy()
        });
      }
    });
  }

  private playSpecialAnimation(duration: number): void {
    // Magical sparkle effect
    this.setScale(0.5);
    this.setAlpha(0);
    
    // Fade in with sparkle
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        // Pulse effect
        this.scene.tweens.add({
          targets: this,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 200,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            // Fade out
            this.scene.tweens.add({
              targets: this,
              alpha: 0,
              duration: duration - 700,
              onComplete: () => this.destroy()
            });
          }
        });
      }
    });
  }

  private playPhaseChangeAnimation(duration: number): void {
    // Screen-shaking dramatic entrance
    this.setScale(0.1);
    this.setAlpha(0);
    
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 1,
      duration: 400,
      ease: 'Back.out',
      onComplete: () => {
        // Hold for a moment
        this.scene.time.delayedCall(800, () => {
          this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: duration - 1200,
            onComplete: () => this.destroy()
          });
        });
      }
    });
    
    // Add screen shake effect
    this.scene.cameras.main.shake(400, 8);
  }

  private playVictoryAnimation(duration: number): void {
    // Triumphant celebration
    this.setScale(0.3);
    this.setY(this.y + 50);
    
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 1.3,
      y: this.y - 50,
      duration: 500,
      ease: 'Back.out',
      onComplete: () => {
        // Bounce effect
        this.scene.tweens.add({
          targets: this,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 300,
          yoyo: true,
          repeat: 2,
          onComplete: () => {
            this.scene.tweens.add({
              targets: this,
              alpha: 0,
              duration: duration - 1100,
              onComplete: () => this.destroy()
            });
          }
        });
      }
    });
  }

  private playDefaultAnimation(duration: number): void {
    // Simple pop-in and fade
    this.setScale(0.5);
    
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.out',
      onComplete: () => {
        this.scene.tweens.add({
          targets: this,
          alpha: 0,
          duration: duration - 200,
          onComplete: () => this.destroy()
        });
      }
    });
  }
}

/**
 * StatusMessageQueue - Manages display of status messages to prevent overlap
 * Queues messages and displays them in sequence
 */
export class StatusMessageQueue {
  private scene: Scene;
  private messageQueue: StatusMessageConfig[] = [];
  private isDisplaying: boolean = false;
  private defaultX: number;
  private defaultY: number;
  
  constructor(scene: Scene, defaultX: number, defaultY: number) {
    this.scene = scene;
    this.defaultX = defaultX;
    this.defaultY = defaultY;
  }

  public showMessage(config: Partial<StatusMessageConfig> & { message: StatusMessageType | string }): void {
    const fullConfig: StatusMessageConfig = {
      x: this.defaultX,
      y: this.defaultY,
      ...config
    };
    
    this.messageQueue.push(fullConfig);
    this.processQueue();
  }

  private processQueue(): void {
    if (this.isDisplaying || this.messageQueue.length === 0) {
      return;
    }
    
    this.isDisplaying = true;
    const config = this.messageQueue.shift()!;
    
    new StatusMessage(this.scene, config);
    
    // Wait for message to complete before showing next
    const duration = config.duration || 1000;
    this.scene.time.delayedCall(duration, () => {
      this.isDisplaying = false;
      this.processQueue();
    });
  }

  public clear(): void {
    this.messageQueue = [];
    this.isDisplaying = false;
  }

  public setDefaultPosition(x: number, y: number): void {
    this.defaultX = x;
    this.defaultY = y;
  }
}