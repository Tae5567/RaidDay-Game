import { Scene } from 'phaser';
import { PlayerCharacter } from '../entities/PlayerCharacter';
import { BossEntity } from '../entities/BossEntity';
import { ParticleSystem } from './ParticleSystem';
import { GameConstants } from '../utils/GameConstants';

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

  // Animation phases with timings (total: 1500ms)
  private readonly PHASE_TIMINGS = {
    RUN_FORWARD: 300,    // 0-300ms: Character runs toward boss
    ATTACK: 200,         // 300-500ms: Attack animation plays
    PARTICLES: 100,      // 500-600ms: Particle effects spawn
    DAMAGE_DISPLAY: 400, // 600-1000ms: Damage numbers and hit reaction
    HIT_PAUSE: 100,      // 1000-1100ms: Brief pause for impact
    RUN_BACK: 400        // 1100-1500ms: Character returns to position
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
    
    // Phase 2: Attack animation (300-500ms)
    await this.playAttackAnimation(attacker, isSpecial);
    
    // Phase 3: Particles and effects (500-600ms)
    await this.spawnParticles(target, isCritical, isSpecial);
    
    // Phase 4: Damage display and hit reaction (600-1000ms)
    await this.showDamageAndHitReaction(target, damage, isCritical, isSpecial);
    
    // Phase 5: Hit pause for impact (1000-1100ms)
    await this.hitPause(isCritical);
    
    // Phase 6: Run back to original position (1100-1500ms)
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

  private playAttackAnimation(attacker: PlayerCharacter, isSpecial?: boolean): Promise<void> {
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

      // Wait for attack animation duration
      this.scene.time.delayedCall(this.PHASE_TIMINGS.ATTACK, () => {
        resolve();
      });
    });
  }

  private spawnParticles(target: BossEntity, isCritical: boolean, isSpecial?: boolean): Promise<void> {
    return new Promise((resolve) => {
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

      this.scene.time.delayedCall(this.PHASE_TIMINGS.PARTICLES, () => {
        resolve();
      });
    });
  }

  private showDamageAndHitReaction(
    target: BossEntity, 
    damage: number, 
    isCritical: boolean, 
    isSpecial?: boolean
  ): Promise<void> {
    return new Promise((resolve) => {
      // Show damage number
      this.createDamageNumber(target, damage, isCritical, isSpecial);
      
      // Boss hit reaction
      this.playBossHitReaction(target, isCritical);
      
      // Screen shake (if enabled)
      if (this.screenShakeEnabled) {
        const shakeIntensity = isSpecial 
          ? GameConstants.SHAKE_BOSS_PHASE 
          : (isCritical ? GameConstants.SHAKE_CRITICAL : GameConstants.SHAKE_NORMAL);
        
        this.scene.cameras.main.shake(GameConstants.SCREEN_SHAKE_DURATION, shakeIntensity);
      }

      this.scene.time.delayedCall(this.PHASE_TIMINGS.DAMAGE_DISPLAY, () => {
        resolve();
      });
    });
  }

  private hitPause(isCritical: boolean): Promise<void> {
    return new Promise((resolve) => {
      if (isCritical) {
        // Freeze frame for critical hits
        this.scene.physics.pause();
        this.scene.anims.pauseAll();
        
        this.scene.time.delayedCall(GameConstants.HIT_PAUSE_DURATION, () => {
          this.scene.physics.resume();
          this.scene.anims.resumeAll();
          resolve();
        });
      } else {
        // No pause for normal hits
        resolve();
      }
    });
  }

  private runBack(attacker: PlayerCharacter, originalX: number, originalY: number): Promise<void> {
    return new Promise((resolve) => {
      // Play run animation
      attacker.playAnimation('run');
      
      // Tween back to original position
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
   * Get the total duration of an attack sequence
   */
  public getTotalDuration(): number {
    return Object.values(this.PHASE_TIMINGS).reduce((sum, time) => sum + time, 0);
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