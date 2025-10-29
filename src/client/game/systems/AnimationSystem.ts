import { Scene } from 'phaser';
import { MobileUtils } from '../utils/MobileUtils';

export interface EntranceConfig {
  duration: number;
  ease: string;
  delay?: number;
  fromScale?: number;
  fromAlpha?: number;
  fromY?: number;
  fromX?: number;
}

/**
 * AnimationSystem - Handles smooth entrance animations and transitions
 * Provides mobile-optimized animations for boss and player entrances
 */
export class AnimationSystem {
  private scene: Scene;
  private isMobile: boolean;
  private activeAnimations: Map<string, Phaser.Tweens.Tween[]> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
    this.isMobile = MobileUtils.isMobile();
  }

  /**
   * Create smooth entrance animation for boss (Requirements 7.2, 7.5)
   */
  public animateBossEntrance(
    bossSprite: Phaser.GameObjects.Sprite,
    config?: Partial<EntranceConfig>
  ): Promise<void> {
    const finalConfig: EntranceConfig = {
      duration: this.isMobile ? 1000 : 1200, // Slightly longer for more impact
      ease: 'Back.out',
      delay: 200, // Small delay for dramatic effect
      fromScale: 0.2,
      fromAlpha: 0,
      fromY: bossSprite.y - 150, // Drop from higher
      ...config
    };

    // Set initial state
    const originalY = bossSprite.y;
    bossSprite.setScale(finalConfig.fromScale!);
    bossSprite.setAlpha(finalConfig.fromAlpha!);
    bossSprite.setY(finalConfig.fromY!);

    return new Promise((resolve) => {
      const tweens: Phaser.Tweens.Tween[] = [];

      // Scale animation
      const scaleTween = this.scene.tweens.add({
        targets: bossSprite,
        scaleX: 1,
        scaleY: 1,
        duration: finalConfig.duration,
        ease: finalConfig.ease,
        delay: finalConfig.delay || 0
      });

      // Alpha animation
      const alphaTween = this.scene.tweens.add({
        targets: bossSprite,
        alpha: 1,
        duration: finalConfig.duration * 0.6,
        ease: 'Power2.out',
        delay: finalConfig.delay || 0
      });

      // Position animation
      const positionTween = this.scene.tweens.add({
        targets: bossSprite,
        y: originalY,
        duration: finalConfig.duration,
        ease: finalConfig.ease,
        delay: finalConfig.delay || 0,
        onComplete: () => {
          this.clearAnimations('boss-entrance');
          resolve();
        }
      });

      tweens.push(scaleTween, alphaTween, positionTween);
      this.activeAnimations.set('boss-entrance', tweens);

      // Add screen shake for dramatic effect
      this.scene.time.delayedCall(finalConfig.delay! + finalConfig.duration * 0.8, () => {
        this.scene.events.emit('camera-shake', 3);
      });
    });
  }

  /**
   * Create smooth entrance animation for player character (Requirements 7.2, 7.5)
   */
  public animatePlayerEntrance(
    playerSprite: Phaser.GameObjects.Sprite,
    config?: Partial<EntranceConfig>
  ): Promise<void> {
    const finalConfig: EntranceConfig = {
      duration: this.isMobile ? 700 : 900,
      ease: 'Back.out',
      delay: 600, // Wait for boss entrance to complete
      fromScale: 0.3,
      fromAlpha: 0,
      fromY: playerSprite.y + 80, // Rise from below
      ...config
    };

    // Set initial state
    const originalY = playerSprite.y;
    playerSprite.setScale(finalConfig.fromScale!);
    playerSprite.setAlpha(finalConfig.fromAlpha!);
    playerSprite.setY(finalConfig.fromY!);

    return new Promise((resolve) => {
      const tweens: Phaser.Tweens.Tween[] = [];

      // Scale animation with slight bounce
      const scaleTween = this.scene.tweens.add({
        targets: playerSprite,
        scaleX: 1,
        scaleY: 1,
        duration: finalConfig.duration,
        ease: 'Back.out',
        delay: finalConfig.delay || 0
      });

      // Alpha animation
      const alphaTween = this.scene.tweens.add({
        targets: playerSprite,
        alpha: 1,
        duration: finalConfig.duration * 0.7,
        ease: 'Power2.out',
        delay: finalConfig.delay || 0
      });

      // Position animation
      const positionTween = this.scene.tweens.add({
        targets: playerSprite,
        y: originalY,
        duration: finalConfig.duration,
        ease: finalConfig.ease,
        delay: finalConfig.delay || 0,
        onComplete: () => {
          this.clearAnimations('player-entrance');
          resolve();
        }
      });

      tweens.push(scaleTween, alphaTween, positionTween);
      this.activeAnimations.set('player-entrance', tweens);
    });
  }

  /**
   * Animate UI elements entrance
   */
  public animateUIEntrance(
    uiElements: Phaser.GameObjects.GameObject[],
    config?: Partial<EntranceConfig>
  ): Promise<void> {
    const finalConfig: EntranceConfig = {
      duration: this.isMobile ? 500 : 700,
      ease: 'Back.out',
      delay: 1200, // After both characters
      fromAlpha: 0,
      fromY: 30, // More pronounced slide
      ...config
    };

    return new Promise((resolve) => {
      const tweens: Phaser.Tweens.Tween[] = [];
      let completedCount = 0;

      uiElements.forEach((element, index) => {
        if ('setAlpha' in element && 'y' in element) {
          const originalY = (element as any).y;
          (element as any).setAlpha(finalConfig.fromAlpha!);
          (element as any).y = originalY - finalConfig.fromY!;

          const tween = this.scene.tweens.add({
            targets: element,
            alpha: 1,
            y: originalY,
            duration: finalConfig.duration,
            ease: finalConfig.ease,
            delay: finalConfig.delay! + (index * 100), // Stagger animations
            onComplete: () => {
              completedCount++;
              if (completedCount === uiElements.length) {
                this.clearAnimations('ui-entrance');
                resolve();
              }
            }
          });

          tweens.push(tween);
        }
      });

      this.activeAnimations.set('ui-entrance', tweens);
    });
  }

  /**
   * Create attack impact animation with enhanced visual feedback
   */
  public animateAttackImpact(
    targetSprite: Phaser.GameObjects.Sprite,
    damage: number
  ): Promise<void> {
    return new Promise((resolve) => {
      const tweens: Phaser.Tweens.Tween[] = [];

      // Hit flash effect
      const originalTint = targetSprite.tint;
      const flashTween = this.scene.tweens.add({
        targets: targetSprite,
        tint: 0xff0000, // Red flash
        duration: 100,
        yoyo: true,
        onComplete: () => {
          targetSprite.setTint(originalTint);
        }
      });

      // Scale punch effect proportional to damage
      const scaleMultiplier = Math.min(1 + (damage / 1000), 1.2); // Max 1.2x scale
      const scaleTween = this.scene.tweens.add({
        targets: targetSprite,
        scaleX: scaleMultiplier,
        scaleY: scaleMultiplier,
        duration: 150,
        ease: 'Power2.out',
        yoyo: true,
        onComplete: () => {
          this.clearAnimations('attack-impact');
          resolve();
        }
      });

      tweens.push(flashTween, scaleTween);
      this.activeAnimations.set('attack-impact', tweens);
    });
  }

  /**
   * Create button press animation with enhanced feedback
   */
  public animateButtonPress(
    button: Phaser.GameObjects.Container
  ): Promise<void> {
    return new Promise((resolve) => {
      const pressTween = this.scene.tweens.add({
        targets: button,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 100,
        ease: 'Power2.out',
        yoyo: true,
        onComplete: () => {
          resolve();
        }
      });

      this.activeAnimations.set('button-press', [pressTween]);
    });
  }

  /**
   * Create victory celebration animation
   */
  public animateVictoryCelebration(
    elements: Phaser.GameObjects.GameObject[]
  ): Promise<void> {
    return new Promise((resolve) => {
      const tweens: Phaser.Tweens.Tween[] = [];
      let completedCount = 0;

      elements.forEach((element, index) => {
        if ('setScale' in element) {
          const celebrationTween = this.scene.tweens.add({
            targets: element,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 300,
            ease: 'Back.out',
            delay: index * 100,
            yoyo: true,
            onComplete: () => {
              completedCount++;
              if (completedCount === elements.length) {
                this.clearAnimations('victory-celebration');
                resolve();
              }
            }
          });

          tweens.push(celebrationTween);
        }
      });

      this.activeAnimations.set('victory-celebration', tweens);
    });
  }

  /**
   * Create floating animation for idle elements
   */
  public animateFloating(
    sprite: Phaser.GameObjects.Sprite,
    amplitude: number = 5,
    duration: number = 2000
  ): void {
    const originalY = sprite.y;
    
    const floatTween = this.scene.tweens.add({
      targets: sprite,
      y: originalY - amplitude,
      duration: duration,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    this.activeAnimations.set(`floating-${sprite.name || 'sprite'}`, [floatTween]);
  }

  /**
   * Stop floating animation
   */
  public stopFloating(sprite: Phaser.GameObjects.Sprite): void {
    this.clearAnimations(`floating-${sprite.name || 'sprite'}`);
  }

  /**
   * Clear specific animations
   */
  private clearAnimations(key: string): void {
    const tweens = this.activeAnimations.get(key);
    if (tweens) {
      tweens.forEach(tween => {
        if (tween && tween.isActive()) {
          tween.stop();
        }
      });
      this.activeAnimations.delete(key);
    }
  }

  /**
   * Clear all active animations
   */
  public clearAllAnimations(): void {
    this.activeAnimations.forEach((_tweens, key) => {
      this.clearAnimations(key);
    });
  }

  /**
   * Set mobile mode for performance optimization
   */
  public setMobileMode(isMobile: boolean): void {
    this.isMobile = isMobile;
  }

  /**
   * Create smooth exit animation for scene elements
   */
  public animateSceneExit(
    elements: Phaser.GameObjects.GameObject[],
    config?: Partial<EntranceConfig>
  ): Promise<void> {
    const finalConfig: EntranceConfig = {
      duration: this.isMobile ? 400 : 600,
      ease: 'Power2.easeIn',
      delay: 0,
      fromAlpha: 1,
      fromScale: 1,
      ...config
    };

    return new Promise((resolve) => {
      const tweens: Phaser.Tweens.Tween[] = [];
      let completedCount = 0;

      elements.forEach((element, index) => {
        if ('setAlpha' in element && 'setScale' in element) {
          const tween = this.scene.tweens.add({
            targets: element,
            alpha: 0,
            scaleX: 0.8,
            scaleY: 0.8,
            y: (element as any).y + 20, // Slide down slightly
            duration: finalConfig.duration,
            ease: finalConfig.ease,
            delay: index * 50, // Stagger exit animations
            onComplete: () => {
              completedCount++;
              if (completedCount === elements.length) {
                this.clearAnimations('scene-exit');
                resolve();
              }
            }
          });

          tweens.push(tween);
        }
      });

      this.activeAnimations.set('scene-exit', tweens);
    });
  }

  /**
   * Create satisfying button feedback animation
   */
  public animateButtonFeedback(
    button: Phaser.GameObjects.Container,
    type: 'press' | 'hover' | 'success' | 'error' = 'press'
  ): Promise<void> {
    return new Promise((resolve) => {
      let tween: Phaser.Tweens.Tween;

      switch (type) {
        case 'press':
          tween = this.scene.tweens.add({
            targets: button,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 100,
            ease: 'Power2.out',
            yoyo: true,
            onComplete: () => resolve()
          });
          break;

        case 'hover':
          tween = this.scene.tweens.add({
            targets: button,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 200,
            ease: 'Power2.out',
            onComplete: () => resolve()
          });
          break;

        case 'success':
          tween = this.scene.tweens.add({
            targets: button,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 150,
            ease: 'Back.out',
            yoyo: true,
            onComplete: () => resolve()
          });
          break;

        case 'error':
          // Shake animation for errors
          const originalX = button.x;
          tween = this.scene.tweens.add({
            targets: button,
            x: originalX + 5,
            duration: 50,
            ease: 'Power2.out',
            yoyo: true,
            repeat: 3,
            onComplete: () => {
              button.setX(originalX);
              resolve();
            }
          });
          break;
      }

      this.activeAnimations.set('button-feedback', [tween]);
    });
  }

  /**
   * Create smooth fade transition for text changes
   */
  public animateTextChange(
    textObject: Phaser.GameObjects.Text,
    newText: string,
    duration: number = 300
  ): Promise<void> {
    return new Promise((resolve) => {
      // Fade out
      this.scene.tweens.add({
        targets: textObject,
        alpha: 0,
        duration: duration / 2,
        ease: 'Power2.easeIn',
        onComplete: () => {
          // Change text
          textObject.setText(newText);
          
          // Fade in
          this.scene.tweens.add({
            targets: textObject,
            alpha: 1,
            duration: duration / 2,
            ease: 'Power2.easeOut',
            onComplete: () => resolve()
          });
        }
      });
    });
  }

  /**
   * Destroy the animation system
   */
  public destroy(): void {
    this.clearAllAnimations();
  }
}