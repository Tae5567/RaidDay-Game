import { Scene } from 'phaser';
import { GameConstants } from '../utils/GameConstants';
import { MobileUtils } from '../utils/MobileUtils';

export enum ButtonState {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  COOLDOWN = 'cooldown',
  USED = 'used' // For once-per-session special abilities
}

export interface ActionButtonConfig {
  x: number;
  y: number;
  width?: number;
  height?: number;
  text: string;
  callback: () => void;
  enabledColor?: number;
  disabledColor?: number;
  glowColor?: number;
}

/**
 * ActionButton - Interactive button with visual feedback and state management
 * Supports touch controls with minimum 44x44 pixel targets for mobile
 */
export class ActionButton extends Phaser.GameObjects.Container {
  public override scene: Scene;
  private config: ActionButtonConfig;
  
  // Visual elements
  private background: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;
  private glowEffect: Phaser.GameObjects.Graphics;
  private cooldownOverlay: Phaser.GameObjects.Graphics;
  private cooldownText: Phaser.GameObjects.Text;
  
  // State management
  private currentState: ButtonState = ButtonState.ENABLED;
  private cooldownTimer: number = 0;
  private maxCooldown: number = 0;
  
  // Animation tweens
  private glowTween?: Phaser.Tweens.Tween;
  private pressTween?: Phaser.Tweens.Tween;
  
  constructor(scene: Scene, config: ActionButtonConfig) {
    super(scene, config.x, config.y);
    
    this.scene = scene;
    this.config = {
      width: MobileUtils.isMobile() ? Math.max(config.width || 80, GameConstants.MOBILE_TOUCH_TARGET_SIZE) : config.width || 120,
      height: MobileUtils.isMobile() ? Math.max(config.height || 44, GameConstants.MOBILE_TOUCH_TARGET_SIZE) : config.height || 40,
      enabledColor: config.enabledColor || GameConstants.COLORS.BUTTON_ENABLED,
      disabledColor: config.disabledColor || GameConstants.COLORS.BUTTON_DISABLED,
      glowColor: config.glowColor || 0xffffff,
      ...config
    };
    
    try {
      this.createElements();
      this.setupInteractivity();
      scene.add.existing(this);
    } catch (error) {
      console.error('Error creating ActionButton:', error);
      throw error;
    }
  }

  private createElements(): void {
    // Glow effect (behind button)
    this.glowEffect = this.scene.add.graphics();
    this.add(this.glowEffect);
    
    // Button background
    this.background = this.scene.add.rectangle(
      0, 0,
      this.config.width!,
      this.config.height!,
      this.config.enabledColor
    );
    this.background.setStrokeStyle(2, 0xffffff);
    this.add(this.background);
    
    // Button label
    this.label = this.scene.add.text(0, 0, this.config.text, {
      fontFamily: 'Arial Black',
      fontSize: MobileUtils.isMobile() ? '12px' : '14px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.add(this.label);
    
    // Cooldown overlay (initially hidden)
    this.cooldownOverlay = this.scene.add.graphics();
    this.cooldownOverlay.setVisible(false);
    this.add(this.cooldownOverlay);
    
    // Cooldown text (initially hidden)
    this.cooldownText = this.scene.add.text(0, 0, '', {
      fontFamily: 'Arial Black',
      fontSize: MobileUtils.isMobile() ? '10px' : '12px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0.5).setVisible(false);
    this.add(this.cooldownText);
    
    this.updateVisualState();
  }

  private setupInteractivity(): void {
    // Make the background interactive
    this.background.setInteractive({ useHandCursor: true });
    
    // Hover effects (desktop only)
    if (!MobileUtils.isMobile()) {
      this.background.on('pointerover', () => this.onHoverStart());
      this.background.on('pointerout', () => this.onHoverEnd());
    }
    
    // Press effects
    this.background.on('pointerdown', () => this.onPress());
    this.background.on('pointerup', () => this.onRelease());
    
    // Click handler
    this.background.on('pointerup', () => {
      if (this.currentState === ButtonState.ENABLED) {
        this.config.callback();
      }
    });
  }

  private onHoverStart(): void {
    if (this.currentState !== ButtonState.ENABLED) return;
    
    // Subtle glow effect on hover
    this.startGlowEffect(0.3);
    
    // Slight color change
    this.background.setFillStyle(GameConstants.COLORS.UI_SECONDARY);
  }

  private onHoverEnd(): void {
    if (this.currentState !== ButtonState.ENABLED) return;
    
    this.stopGlowEffect();
    this.background.setFillStyle(this.config.enabledColor!);
  }

  private onPress(): void {
    if (this.currentState !== ButtonState.ENABLED) return;
    
    // Press animation - scale down slightly
    this.pressTween = this.scene.tweens.add({
      targets: this,
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 100,
      ease: 'Power2'
    });
    
    // Bright glow on press
    this.startGlowEffect(0.8);
  }

  private onRelease(): void {
    if (this.currentState !== ButtonState.ENABLED) return;
    
    // Release animation - scale back to normal
    if (this.pressTween) {
      this.pressTween.stop();
    }
    
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 100,
      ease: 'Back.out'
    });
    
    // Reduce glow after press
    if (!MobileUtils.isMobile()) {
      this.startGlowEffect(0.3); // Keep hover glow
    } else {
      this.stopGlowEffect();
    }
  }

  private startGlowEffect(intensity: number = 0.5): void {
    this.stopGlowEffect();
    
    const glowSize = Math.max(this.config.width!, this.config.height!) + 10;
    
    this.glowEffect.clear();
    this.glowEffect.fillStyle(this.config.glowColor!, intensity);
    this.glowEffect.fillCircle(0, 0, glowSize / 2);
    
    // Pulsing glow animation
    this.glowTween = this.scene.tweens.add({
      targets: this.glowEffect,
      alpha: intensity * 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private stopGlowEffect(): void {
    if (this.glowTween) {
      this.glowTween.stop();
      this.glowTween = undefined!;
    }
    this.glowEffect.clear();
  }

  private updateVisualState(): void {
    switch (this.currentState) {
      case ButtonState.ENABLED:
        this.background.setFillStyle(this.config.enabledColor!);
        this.background.setInteractive();
        this.label.setAlpha(1);
        this.cooldownOverlay.setVisible(false);
        this.cooldownText.setVisible(false);
        break;
        
      case ButtonState.DISABLED:
        this.background.setFillStyle(this.config.disabledColor!);
        this.background.disableInteractive();
        this.label.setAlpha(0.5);
        this.cooldownOverlay.setVisible(false);
        this.cooldownText.setVisible(false);
        this.stopGlowEffect();
        break;
        
      case ButtonState.COOLDOWN:
        this.background.setFillStyle(this.config.disabledColor!);
        this.background.disableInteractive();
        this.label.setAlpha(0.3);
        this.cooldownOverlay.setVisible(true);
        this.cooldownText.setVisible(true);
        this.stopGlowEffect();
        this.updateCooldownVisual();
        break;
        
      case ButtonState.USED:
        this.background.setFillStyle(0x444444); // Dark gray for used state
        this.background.disableInteractive();
        this.label.setAlpha(0.4);
        this.label.setText('USED');
        this.cooldownOverlay.setVisible(false);
        this.cooldownText.setVisible(false);
        this.stopGlowEffect();
        break;
    }
  }

  private updateCooldownVisual(): void {
    if (this.currentState !== ButtonState.COOLDOWN) return;
    
    const progress = 1 - (this.cooldownTimer / this.maxCooldown);
    const width = this.config.width!;
    const height = this.config.height!;
    
    // Draw cooldown overlay
    this.cooldownOverlay.clear();
    this.cooldownOverlay.fillStyle(0x000000, 0.6);
    this.cooldownOverlay.fillRect(-width / 2, -height / 2, width * progress, height);
    
    // Update cooldown text
    const secondsLeft = Math.ceil(this.cooldownTimer / 1000);
    this.cooldownText.setText(secondsLeft.toString());
  }

  // Public methods
  public setButtonState(state: ButtonState): void {
    this.currentState = state;
    this.updateVisualState();
  }

  public getState(): ButtonState {
    return this.currentState;
  }

  public startCooldown(durationMs: number): void {
    this.cooldownTimer = durationMs;
    this.maxCooldown = durationMs;
    this.setButtonState(ButtonState.COOLDOWN);
    
    // Update cooldown every 100ms
    const cooldownEvent = this.scene.time.addEvent({
      delay: 100,
      callback: () => {
        this.cooldownTimer -= 100;
        
        if (this.cooldownTimer <= 0) {
          this.setButtonState(ButtonState.ENABLED);
          cooldownEvent.destroy();
        } else {
          this.updateCooldownVisual();
        }
      },
      loop: true
    });
  }

  public setText(text: string): void {
    this.config.text = text;
    this.label.setText(text);
  }

  public setCallback(callback: () => void): void {
    this.config.callback = callback;
  }

  public playSuccessAnimation(): void {
    // Green flash effect on successful action
    const successFlash = this.scene.add.graphics();
    successFlash.fillStyle(0x00ff00, 0.5);
    successFlash.fillRect(-this.config.width! / 2, -this.config.height! / 2, this.config.width!, this.config.height!);
    this.add(successFlash);
    
    this.scene.tweens.add({
      targets: successFlash,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        successFlash.destroy();
      }
    });
    
    // Slight bounce effect
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 150,
      yoyo: true,
      ease: 'Back.out'
    });
  }

  public playErrorAnimation(): void {
    // Red flash effect on error/disabled action
    const errorFlash = this.scene.add.graphics();
    errorFlash.fillStyle(0xff0000, 0.5);
    errorFlash.fillRect(-this.config.width! / 2, -this.config.height! / 2, this.config.width!, this.config.height!);
    this.add(errorFlash);
    
    this.scene.tweens.add({
      targets: errorFlash,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        errorFlash.destroy();
      }
    });
    
    // Shake effect
    this.scene.tweens.add({
      targets: this,
      x: this.x - 5,
      duration: 50,
      yoyo: true,
      repeat: 3,
      ease: 'Power2'
    });
  }

  override destroy(): void {
    this.stopGlowEffect();
    if (this.pressTween) {
      this.pressTween.stop();
    }
    super.destroy();
  }
}