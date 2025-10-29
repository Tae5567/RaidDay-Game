import * as Phaser from 'phaser';
import { GameConstants } from '../utils/GameConstants';

/**
 * CameraEffectsSystem - Manages camera effects including screen shake, hit pause, and motion trails
 * Provides scaled intensity effects and mobile optimization
 */
export interface TraumaConfig {
  intensity: number;
  frequency: number;
}

export interface MotionTrail {
  sprite: Phaser.GameObjects.Sprite;
  trail: Phaser.GameObjects.Graphics[];
  maxLength: number;
  fadeRate: number;
  isActive: boolean;
}

export class CameraEffectsSystem {
  private scene: Phaser.Scene;
  private camera: Phaser.Cameras.Scene2D.Camera;
  private trauma: number;
  private traumaDecay: number;
  private shakeIntensity: number;
  private isShaking: boolean;
  private shakeTween: Phaser.Tweens.Tween | undefined;
  private hitPauseTimer: Phaser.Time.TimerEvent | undefined;
  private motionTrails: Map<string, MotionTrail>;
  private isMobile: boolean;

  constructor(scene: Phaser.Scene, isMobile: boolean = false) {
    this.scene = scene;
    this.camera = scene.cameras.main;
    this.trauma = 0;
    this.traumaDecay = 0.8; // Trauma decay rate per second
    this.shakeIntensity = 1;
    this.isShaking = false;
    this.motionTrails = new Map();
    this.isMobile = isMobile;

    // Reduce effects intensity on mobile for performance
    if (this.isMobile) {
      this.traumaDecay = 1.2; // Faster decay on mobile
      this.shakeIntensity = 0.7; // Reduced intensity
    }
  }

  public addTrauma(amount: number): void {
    this.trauma = Math.min(1, this.trauma + amount);
    
    if (!this.isShaking && this.trauma > 0) {
      this.startShake();
    }
  }

  public screenShake(intensity: number): void {
    // Map intensity to trauma amount
    let traumaAmount = 0;
    
    switch (intensity) {
      case GameConstants.SHAKE_NORMAL:
        traumaAmount = 0.3;
        break;
      case GameConstants.SHAKE_CRITICAL:
        traumaAmount = 0.6;
        break;
      case GameConstants.SHAKE_BOSS_PHASE:
        traumaAmount = 1.0;
        break;
      default:
        traumaAmount = Math.min(1, intensity / GameConstants.SHAKE_BOSS_PHASE);
    }

    this.addTrauma(traumaAmount);
  }

  public hitPause(pauseDuration: number = GameConstants.HIT_PAUSE_DURATION): void {
    if (this.hitPauseTimer) {
      this.hitPauseTimer.destroy();
    }

    // Pause the scene physics and animations
    this.scene.physics?.pause();
    this.scene.anims.pauseAll();
    
    // Resume after duration
    this.hitPauseTimer = this.scene.time.delayedCall(pauseDuration, () => {
      this.scene.physics?.resume();
      this.scene.anims.resumeAll();
      this.hitPauseTimer = undefined;
    });
  }

  public createMotionTrail(
    sprite: Phaser.GameObjects.Sprite, 
    trailKey: string,
    maxLength: number = 5,
    fadeRate: number = 0.2
  ): void {
    if (this.motionTrails.has(trailKey)) {
      this.removeMotionTrail(trailKey);
    }

    // Reduce trail length on mobile for performance
    const adjustedMaxLength = this.isMobile ? Math.max(2, Math.floor(maxLength / 2)) : maxLength;

    const trail: MotionTrail = {
      sprite,
      trail: [],
      maxLength: adjustedMaxLength,
      fadeRate,
      isActive: true
    };

    // Create trail graphics objects
    for (let i = 0; i < trail.maxLength; i++) {
      const trailGraphics = this.scene.add.graphics();
      trailGraphics.setDepth(sprite.depth - 1);
      trail.trail.push(trailGraphics);
    }

    this.motionTrails.set(trailKey, trail);
  }

  public removeMotionTrail(trailKey: string): void {
    const trail = this.motionTrails.get(trailKey);
    if (trail) {
      trail.isActive = false;
      trail.trail.forEach(graphics => graphics.destroy());
      this.motionTrails.delete(trailKey);
    }
  }

  public updateMotionTrail(trailKey: string): void {
    const trail = this.motionTrails.get(trailKey);
    if (!trail || !trail.isActive) return;

    const sprite = trail.sprite;
    if (!sprite.active || !sprite.visible) return;

    // Shift trail positions
    for (let i = trail.trail.length - 1; i > 0; i--) {
      const current = trail.trail[i];
      const previous = trail.trail[i - 1];
      
      if (current && previous) {
        current.clear();
        // Copy previous trail graphics data manually since copyFrom doesn't exist
        current.setAlpha(previous.alpha * (1 - trail.fadeRate));
      }
    }

    // Update first trail segment with current sprite position
    const firstTrail = trail.trail[0];
    if (firstTrail) {
      firstTrail.clear();
      
      // Draw sprite silhouette
      const spriteColor = sprite.tintTopLeft || 0xffffff;
      firstTrail.fillStyle(spriteColor, 0.6);
      
      // Simple rectangle approximation of sprite
      const bounds = sprite.getBounds();
      firstTrail.fillRect(
        bounds.x - this.camera.scrollX,
        bounds.y - this.camera.scrollY,
        bounds.width,
        bounds.height
      );
    }
  }

  public weaponTrail(
    startX: number, 
    startY: number, 
    endX: number, 
    endY: number,
    color: number = 0xffffff,
    duration: number = 200
  ): void {
    const graphics = this.scene.add.graphics();
    graphics.setDepth(100); // High depth to appear above other objects
    
    // Draw weapon trail line
    graphics.lineStyle(this.isMobile ? 2 : 4, color, 0.8);
    graphics.beginPath();
    graphics.moveTo(startX, startY);
    graphics.lineTo(endX, endY);
    graphics.strokePath();

    // Add glow effect if not mobile
    if (!this.isMobile) {
      graphics.lineStyle(8, color, 0.3);
      graphics.beginPath();
      graphics.moveTo(startX, startY);
      graphics.lineTo(endX, endY);
      graphics.strokePath();
    }

    // Fade out trail
    this.scene.tweens.add({
      targets: graphics,
      alpha: 0,
      duration,
      ease: 'Power2',
      onComplete: () => {
        graphics.destroy();
      }
    });
  }

  private startShake(): void {
    if (this.isShaking) return;
    
    this.isShaking = true;
    this.updateShake();
  }

  private updateShake(): void {
    if (this.trauma <= 0) {
      this.stopShake();
      return;
    }

    // Calculate shake offset based on trauma
    const shake = this.trauma * this.trauma; // Square for more dramatic effect
    const maxOffset = 10 * this.shakeIntensity;
    
    const offsetX = (Math.random() - 0.5) * maxOffset * shake;
    const offsetY = (Math.random() - 0.5) * maxOffset * shake;

    // Apply shake to camera
    this.camera.setScroll(offsetX, offsetY);

    // Decay trauma
    this.trauma = Math.max(0, this.trauma - this.traumaDecay * (1/60)); // Assuming 60 FPS

    // Continue shaking
    this.scene.time.delayedCall(16, () => { // ~60 FPS
      this.updateShake();
    });
  }

  private stopShake(): void {
    this.isShaking = false;
    this.trauma = 0;
    
    // Reset camera position
    this.camera.setScroll(0, 0);
    
    // Stop any existing shake tween
    if (this.shakeTween) {
      this.shakeTween.stop();
      this.shakeTween = undefined;
    }
  }

  public update(): void {
    // Update all active motion trails
    this.motionTrails.forEach((trail, key) => {
      if (trail.isActive) {
        this.updateMotionTrail(key);
      }
    });
  }

  public flashScreen(color: number = 0xffffff, duration: number = 100, alpha: number = 0.5): void {
    const flash = this.scene.add.rectangle(
      this.camera.centerX,
      this.camera.centerY,
      this.camera.width,
      this.camera.height,
      color,
      alpha
    );
    
    flash.setDepth(1000); // Very high depth to appear above everything
    flash.setScrollFactor(0); // Don't scroll with camera

    // Fade out flash
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration,
      ease: 'Power2',
      onComplete: () => {
        flash.destroy();
      }
    });
  }

  public zoomPunch(scale: number = 1.1, duration: number = 150): void {
    const originalZoom = this.camera.zoom;
    
    this.scene.tweens.add({
      targets: this.camera,
      zoom: originalZoom * scale,
      duration: duration / 2,
      ease: 'Power2',
      yoyo: true,
      onComplete: () => {
        this.camera.setZoom(originalZoom);
      }
    });
  }

  public setMobileMode(isMobile: boolean): void {
    this.isMobile = isMobile;
    
    if (isMobile) {
      this.traumaDecay = 1.2;
      this.shakeIntensity = 0.7;
    } else {
      this.traumaDecay = 0.8;
      this.shakeIntensity = 1.0;
    }
  }

  public cleanup(): void {
    // Stop any active shake
    this.stopShake();
    
    // Clear hit pause timer
    if (this.hitPauseTimer) {
      this.hitPauseTimer.destroy();
      this.hitPauseTimer = undefined;
    }
    
    // Clean up motion trails
    this.motionTrails.forEach((_trail, key) => {
      this.removeMotionTrail(key);
    });
    
    // Reset camera
    this.camera.setScroll(0, 0);
    this.camera.setZoom(1);
  }
}