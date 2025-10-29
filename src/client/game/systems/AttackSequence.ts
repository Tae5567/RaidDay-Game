import { Scene } from 'phaser';
import { PlayerCharacter } from '../entities/PlayerCharacter';
import { BossEntity } from '../entities/BossEntity';
import { ParticleSystem } from './ParticleSystem';

/**
 * AttackSequence - Manages the 1.5-second attack animation timeline
 * Handles: run forward → attack → particles → run back sequence
 */
export interface AttackSequenceConfig {
  attacker: PlayerCharacter;
  target: BossEntity;
  damage: number;
  isCritical: boolean;
  isSpecial?: boolean;
}

export class AttackSequence {
  private scene: Scene;
  private particleSystem: ParticleSystem | undefined;
  private isPlaying: boolean = false;
  private screenShakeEnabled: boolean = true;

  // Animation phases with timings (total: 800ms per requirements 1.2, 1.3, 7.1, 7.2)
  private readonly PHASE_TIMINGS = {
    RUN_FORWARD: 300,    // 0-300ms: Character runs toward boss
    ATTACK: 200,         // 300-500ms: Attack animation and damage popup
    RUN_BACK: 300        // 500-800ms: Character returns to position
  };

  constructor(scene: Scene, particleSystem?: ParticleSystem) {
    this.scene = scene;
    this.particleSystem = particleSystem;
  }

  /**
   * Execute the complete attack sequence
   */
  public async executeAttack(config: AttackSequenceConfig): Promise<void> {
    if (this.isPlaying) {
      return; // Prevent overlapping attacks
    }

    this.isPlaying = true;

    try {
      await this.playAttackSequence(config);
    } finally {
      this.isPlaying = false;
    }
  }

  private async playAttackSequence(config: AttackSequenceConfig): Promise<void> {
    const { attacker, target, damage, isCritical, isSpecial } = config;
    
    // Store original position
    const originalX = attacker.x;
    const originalY = attacker.y;
    
    // Calculate attack position (closer to boss)
    const attackX = target.x + (originalX < target.x ? -80 : 80);
    const attackY = target.y + 20;

    // Phase 1: Run forward (0-300ms)
    await this.runForward(attacker, attackX, attackY);
    
    // Phase 2: Attack animation with immediate effects (300-500ms)
    await this.playAttackWithEffects(attacker, target, damage, isCritical, isSpecial);
    
    // Phase 3: Run back to original position (500-800ms)
    await this.runBack(attacker, originalX, originalY);
  }

  private runForward(attacker: PlayerCharacter, targetX: number, targetY: number): Promise<void> {
    return new Promise((resolve) => {
      // Play run animation
      attacker.playAnimation('run');
      
      // Tween to attack position
      this.scene.tweens.add({
        targets: attacker,
        x: targetX,
        y: targetY,
        duration: this.PHASE_TIMINGS.RUN_FORWARD,
        ease: 'Power2.Out',
        onComplete: () => {
          attacker.playAnimation('idle');
          resolve();
        }
      });
    });
  }

  private playAttackWithEffects(
    attacker: PlayerCharacter, 
    target: BossEntity, 
    damage: number, 
    isCritical: boolean, 
    isSpecial?: boolean
  ): Promise<void> {
    return new Promise((resolve) => {
      // Play appropriate attack animation
      const animationKey = isSpecial ? 'special' : 'attack';
      attacker.playAnimation(animationKey);
      
      // Add attack motion (slight forward lunge)
      this.scene.tweens.add({
        targets: attacker,
        x: attacker.x + (attacker.flipX ? -20 : 20),
        duration: this.PHASE_TIMINGS.ATTACK / 2,
        yoyo: true,
        ease: 'Power2.InOut'
      });

      // Trigger all effects at 100ms into attack (when hit connects)
      this.scene.time.delayedCall(100, () => {
        // Spawn particles
        this.spawnParticlesImmediate(target, isCritical, isSpecial);
        
        // Show damage and boss hit reaction
        this.showDamageAndHitReactionImmediate(target, damage, isCritical, isSpecial);
      });

      // Wait for full attack duration
      this.scene.time.delayedCall(this.PHASE_TIMINGS.ATTACK, () => {
        resolve();
      });
    });
  }

  private spawnParticlesImmediate(target: BossEntity, isCritical: boolean, isSpecial?: boolean): void {
    if (this.particleSystem) {
      if (isSpecial) {
        // Special abilities get enhanced particle effects
        this.particleSystem.createCriticalBurst(target.x, target.y);
        this.particleSystem.createSlashEffect(target.x, target.y);
      } else if (isCritical) {
        this.particleSystem.createCriticalBurst(target.x, target.y);
      } else {
        this.particleSystem.createSlashEffect(target.x, target.y);
      }
    }
  }

  private showDamageAndHitReactionImmediate(
    target: BossEntity, 
    damage: number, 
    isCritical: boolean, 
    isSpecial?: boolean
  ): void {
    // Show damage number
    this.createDamageNumber(target, damage, isCritical, isSpecial);
    
    // Boss hit reaction
    this.playBossHitReaction(target, isCritical);
    
    // Screen shake (if enabled) - reduced duration for faster sequence
    if (this.screenShakeEnabled) {
      const shakeIntensity = isSpecial 
        ? 8 // Boss phase shake
        : (isCritical ? 5 : 2); // Critical or normal shake
      
      this.scene.cameras.main.shake(150, shakeIntensity); // Shorter shake for 0.8s sequence
    }
  }

  private runBack(attacker: PlayerCharacter, originalX: number, originalY: number): Promise<void> {
    return new Promise((resolve) => {
      // Play run animation
      attacker.playAnimation('run');
      
      // Tween back to original position (300ms for 0.8s total sequence)
      this.scene.tweens.add({
        targets: attacker,
        x: originalX,
        y: originalY,
        duration: this.PHASE_TIMINGS.RUN_BACK,
        ease: 'Power2.In',
        onComplete: () => {
          attacker.playAnimation('idle');
          resolve();
        }
      });
    });
  }

  private createDamageNumber(
    target: BossEntity, 
    damage: number, 
    isCritical: boolean, 
    isSpecial?: boolean
  ): void {
    const color = isSpecial ? '#ff00ff' : (isCritical ? '#ff6600' : '#ffff00');
    const fontSize = isSpecial ? '32px' : (isCritical ? '28px' : '24px');
    const text = isSpecial ? `${damage}!` : (isCritical ? `${damage}!` : damage.toString());

    const damageText = this.scene.add.text(target.x, target.y - 50, text, {
      fontFamily: 'Arial Black',
      fontSize,
      color,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Add status text for special effects
    if (isCritical && !isSpecial) {
      const statusText = this.scene.add.text(target.x, target.y - 80, 'CRITICAL!', {
        fontFamily: 'Arial Black',
        fontSize: '16px',
        color: '#ff6600',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);

      this.scene.tweens.add({
        targets: statusText,
        y: statusText.y - 60,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => statusText.destroy()
      });
    }

    if (isSpecial) {
      const statusText = this.scene.add.text(target.x, target.y - 80, 'SPECIAL!', {
        fontFamily: 'Arial Black',
        fontSize: '18px',
        color: '#ff00ff',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);

      this.scene.tweens.add({
        targets: statusText,
        y: statusText.y - 60,
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => statusText.destroy()
      });
    }

    // Animate damage number
    this.scene.tweens.add({
      targets: damageText,
      y: damageText.y - 100,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => damageText.destroy()
    });
  }

  private playBossHitReaction(target: BossEntity, isCritical: boolean): void {
    // Color flash effect
    const originalTint = target.tint;
    target.setTint(0xff0000); // Red flash
    
    this.scene.time.delayedCall(100, () => {
      target.setTint(originalTint);
    });

    // Hit animation (slight knockback)
    const knockbackDistance = isCritical ? 15 : 8;
    this.scene.tweens.add({
      targets: target,
      x: target.x + knockbackDistance,
      duration: 100,
      yoyo: true,
      ease: 'Power2.Out'
    });

    // Play boss hit animation if available
    target.playHitAnimation();
  }

  /**
   * Check if an attack sequence is currently playing
   */
  public isSequencePlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get the total duration of an attack sequence (0.8 seconds)
   */
  public getTotalDuration(): number {
    return 800; // 0.8 seconds total (300ms + 200ms + 300ms)
  }

  /**
   * Enable or disable screen shake effects for performance
   */
  public setScreenShakeEnabled(enabled: boolean): void {
    this.screenShakeEnabled = enabled;
  }

  /**
   * Check if screen shake is enabled
   */
  public isScreenShakeEnabled(): boolean {
    return this.screenShakeEnabled;
  }


}