import * as Phaser from 'phaser';
import { GameConstants } from '../utils/GameConstants';
import { MobileUtils } from '../utils/MobileUtils';

/**
 * ParticleSystem - Manages visual effects and particle systems
 * Handles slash effects, critical bursts, mobile optimization, and particle pooling
 */
export interface ParticlePool {
  available: Phaser.GameObjects.Particles.ParticleEmitter[];
  active: Phaser.GameObjects.Particles.ParticleEmitter[];
  maxSize: number;
}

export interface ParticleConfig {
  texture: string;
  speed: { min: number; max: number };
  scale: { start: number; end: number };
  lifespan: number;
  quantity: number;
  emitZone?: any;
  gravityY?: number;
  alpha?: { start: number; end: number };
  tint?: number[];
}

export class ParticleSystem {
  private scene: Phaser.Scene;
  private emitters: Map<string, Phaser.GameObjects.Particles.ParticleEmitter>;
  private particlePools: Map<string, ParticlePool>;
  private maxParticles: number;
  private isMobile: boolean;
  private activeParticleCount: number;

  constructor(scene: Phaser.Scene, isMobile: boolean = false, maxParticles?: number) {
    this.scene = scene;
    this.emitters = new Map();
    this.particlePools = new Map();
    this.isMobile = isMobile || MobileUtils.isMobile();
    this.activeParticleCount = 0;
    
    // Mobile optimization: limit particles
    this.maxParticles = maxParticles || (this.isMobile ? 
      GameConstants.MOBILE_MAX_PARTICLES : 
      GameConstants.DESKTOP_MAX_PARTICLES);

    this.initializeParticlePools();
    this.createPlaceholderParticleTextures();
  }

  private initializeParticlePools(): void {
    const poolTypes = ['slash', 'critical', 'explosion', 'energy', 'hit', 'special'];
    
    poolTypes.forEach(type => {
      this.particlePools.set(type, {
        available: [],
        active: [],
        maxSize: Math.ceil(this.maxParticles / poolTypes.length)
      });
    });
  }

  private createPlaceholderParticleTextures(): void {
    const graphics = this.scene.add.graphics();

    // Slash particle (small white rectangle)
    graphics.clear();
    graphics.fillStyle(0xffffff);
    graphics.fillRect(0, 0, 4, 8);
    graphics.generateTexture('slash_particle', 4, 8);

    // Critical particle (yellow star-like shape)
    graphics.clear();
    graphics.fillStyle(0xffff00);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('crit_particle', 8, 8);

    // Explosion particle (orange/red circle)
    graphics.clear();
    graphics.fillStyle(0xff6600);
    graphics.fillCircle(6, 6, 6);
    graphics.generateTexture('explosion_particle', 12, 12);

    // Energy particle (blue/cyan circle)
    graphics.clear();
    graphics.fillStyle(0x00ffff);
    graphics.fillCircle(3, 3, 3);
    graphics.generateTexture('energy_particle', 6, 6);

    // Hit particle (white flash)
    graphics.clear();
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(2, 2, 2);
    graphics.generateTexture('hit_particle', 4, 4);

    // Special particle (purple/magenta)
    graphics.clear();
    graphics.fillStyle(0xff00ff);
    graphics.fillCircle(5, 5, 5);
    graphics.generateTexture('special_particle', 10, 10);

    graphics.destroy();
  }

  private getPooledEmitter(poolType: string): Phaser.GameObjects.Particles.ParticleEmitter | null {
    const pool = this.particlePools.get(poolType);
    if (!pool) return null;

    if (pool.available.length > 0) {
      const emitter = pool.available.pop()!;
      pool.active.push(emitter);
      return emitter;
    }

    // Create new emitter if pool not at max capacity
    if (pool.active.length < pool.maxSize && this.activeParticleCount < this.maxParticles) {
      const emitter = this.scene.add.particles(0, 0, `${poolType}_particle`);
      pool.active.push(emitter);
      return emitter;
    }

    return null;
  }

  private returnToPool(emitter: Phaser.GameObjects.Particles.ParticleEmitter, poolType: string): void {
    const pool = this.particlePools.get(poolType);
    if (!pool) return;

    const activeIndex = pool.active.indexOf(emitter);
    if (activeIndex !== -1) {
      pool.active.splice(activeIndex, 1);
      pool.available.push(emitter);
      
      // Reset emitter state
      emitter.stop();
      emitter.setPosition(0, 0);
      emitter.setVisible(false);
      this.activeParticleCount = Math.max(0, this.activeParticleCount - 1);
    }
  }

  public createSlashEffect(x: number, y: number): void {
    if (this.activeParticleCount >= this.maxParticles) return;

    const emitter = this.getPooledEmitter('slash');
    if (!emitter) return;

    const particleCount = this.isMobile ? 3 : 5;
    
    emitter.setPosition(x, y);
    emitter.setVisible(true);
    emitter.setConfig({
      speed: { min: 50, max: 100 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 300,
      quantity: particleCount,
      angle: { min: -45, max: 45 }
    });

    emitter.explode(particleCount);
    this.activeParticleCount++;

    // Return to pool after animation
    this.scene.time.delayedCall(500, () => {
      this.returnToPool(emitter, 'slash');
    });
  }

  public createCriticalBurst(x: number, y: number): void {
    if (this.activeParticleCount >= this.maxParticles) return;

    const emitter = this.getPooledEmitter('critical');
    if (!emitter) return;

    const particleCount = this.isMobile ? 6 : 10;
    
    emitter.setPosition(x, y);
    emitter.setVisible(true);
    emitter.setConfig({
      speed: { min: 100, max: 200 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      quantity: particleCount,
      emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 30), quantity: particleCount },
      tint: [0xffff00, 0xff6600, 0xff0000]
    });

    emitter.explode(particleCount);
    this.activeParticleCount++;

    // Return to pool after animation
    this.scene.time.delayedCall(700, () => {
      this.returnToPool(emitter, 'critical');
    });
  }

  public createDeathExplosion(x: number, y: number): void {
    if (this.activeParticleCount >= this.maxParticles) return;

    const emitter = this.getPooledEmitter('explosion');
    if (!emitter) return;

    const particleCount = this.isMobile ? 12 : 20;
    
    emitter.setPosition(x, y);
    emitter.setVisible(true);
    emitter.setConfig({
      speed: { min: 200, max: 400 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      quantity: particleCount,
      emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 50), quantity: particleCount },
      tint: [0xff6600, 0xff0000, 0xffff00]
    });

    emitter.explode(particleCount);
    this.activeParticleCount++;

    // Return to pool after animation
    this.scene.time.delayedCall(1200, () => {
      this.returnToPool(emitter, 'explosion');
    });
  }

  public createEnergyRestore(x: number, y: number): void {
    if (this.activeParticleCount >= this.maxParticles) return;

    const emitter = this.getPooledEmitter('energy');
    if (!emitter) return;

    const particleCount = this.isMobile ? 5 : 8;
    
    emitter.setPosition(x, y);
    emitter.setVisible(true);
    emitter.setConfig({
      speed: { min: 30, max: 60 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 800,
      quantity: particleCount,
      gravityY: -50,
      tint: [0x00ffff, 0x0080ff, 0x00ff80]
    });

    emitter.explode(particleCount);
    this.activeParticleCount++;

    // Return to pool after animation
    this.scene.time.delayedCall(1000, () => {
      this.returnToPool(emitter, 'energy');
    });
  }

  public createHitEffect(x: number, y: number): void {
    if (this.activeParticleCount >= this.maxParticles) return;

    const emitter = this.getPooledEmitter('hit');
    if (!emitter) return;

    const particleCount = this.isMobile ? 2 : 4;
    
    emitter.setPosition(x, y);
    emitter.setVisible(true);
    emitter.setConfig({
      speed: { min: 20, max: 50 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 200,
      quantity: particleCount,
      angle: { min: 0, max: 360 }
    });

    emitter.explode(particleCount);
    this.activeParticleCount++;

    // Return to pool after animation
    this.scene.time.delayedCall(400, () => {
      this.returnToPool(emitter, 'hit');
    });
  }

  public createSpecialEffect(x: number, y: number, effectType: string = 'default'): void {
    if (this.activeParticleCount >= this.maxParticles) return;

    const emitter = this.getPooledEmitter('special');
    if (!emitter) return;

    const particleCount = this.isMobile ? 8 : 15;
    let config: any = {
      speed: { min: 80, max: 150 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: particleCount
    };

    // Customize based on effect type
    switch (effectType) {
      case 'warrior_combo':
        config.tint = [0xff0000, 0xff6600, 0xffff00];
        config.emitZone = { type: 'edge', source: new Phaser.Geom.Rectangle(-30, -15, 60, 30) };
        config.speed = { min: 100, max: 200 };
        config.scale = { start: 1.5, end: 0 };
        break;
      case 'mage_charging':
        config.tint = [0x0000ff, 0x4444ff, 0x8888ff];
        config.emitZone = { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 20) };
        config.speed = { min: 20, max: 40 };
        config.gravityY = -20;
        break;
      case 'fireball_explosion':
        config.tint = [0xff4400, 0xff6600, 0xffff00];
        config.emitZone = { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 40) };
        config.speed = { min: 150, max: 300 };
        config.scale = { start: 2, end: 0 };
        config.quantity = this.isMobile ? 15 : 25;
        break;
      case 'rogue_stealth':
        config.tint = [0x000000, 0x333333, 0x666666];
        config.speed = { min: 50, max: 100 };
        config.alpha = { start: 0.8, end: 0 };
        break;
      case 'backstab_critical':
        config.tint = [0x00ff00, 0x80ff00, 0xffff00];
        config.speed = { min: 200, max: 400 };
        config.scale = { start: 2, end: 0 };
        config.emitZone = { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 30) };
        break;
      case 'community_buff_aura':
        config.tint = [0x80ff80, 0x00ff00, 0xffff80];
        config.speed = { min: 30, max: 60 };
        config.gravityY = -40;
        config.scale = { start: 1, end: 0 };
        config.lifespan = 1000;
        break;
      case 'healer_sparkles':
        config.tint = [0xffff00, 0x80ff80, 0x00ffff];
        config.speed = { min: 10, max: 30 };
        config.gravityY = -10;
        config.scale = { start: 0.5, end: 0 };
        config.lifespan = 1200;
        break;
      case 'warrior':
        config.tint = [0xff0000, 0xff6600];
        config.emitZone = { type: 'edge', source: new Phaser.Geom.Rectangle(-20, -10, 40, 20) };
        break;
      case 'mage':
        config.tint = [0x0000ff, 0x8000ff];
        config.emitZone = { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 25) };
        break;
      case 'rogue':
        config.tint = [0x00ff00, 0x80ff00];
        config.speed = { min: 150, max: 250 };
        break;
      case 'healer':
        config.tint = [0xffff00, 0x80ff80];
        config.gravityY = -30;
        break;
      default:
        config.tint = [0xff00ff, 0x8000ff];
    }
    
    emitter.setPosition(x, y);
    emitter.setVisible(true);
    emitter.setConfig(config);

    emitter.explode(config.quantity || particleCount);
    this.activeParticleCount++;

    // Return to pool after animation
    const duration = config.lifespan ? config.lifespan + 200 : 800;
    this.scene.time.delayedCall(duration, () => {
      this.returnToPool(emitter, 'special');
    });
  }

  public getActiveParticleCount(): number {
    return this.activeParticleCount;
  }

  public getMaxParticles(): number {
    return this.maxParticles;
  }

  public setMobileMode(isMobile: boolean): void {
    this.isMobile = isMobile;
    this.maxParticles = isMobile ? 
      GameConstants.MOBILE_MAX_PARTICLES : 
      GameConstants.DESKTOP_MAX_PARTICLES;
  }

  /**
   * Set maximum particle count for performance optimization
   */
  public setMaxParticles(maxParticles: number): void {
    this.maxParticles = maxParticles;
    
    // Update pool sizes proportionally
    const poolTypes = Array.from(this.particlePools.keys());
    const poolSize = Math.ceil(maxParticles / poolTypes.length);
    
    this.particlePools.forEach(pool => {
      pool.maxSize = poolSize;
    });
  }

  /**
   * Enable or disable particle effects for performance
   */
  public setEffectsEnabled(enabled: boolean): void {
    if (!enabled) {
      // Stop all active emitters
      this.particlePools.forEach(pool => {
        pool.active.forEach(emitter => {
          emitter.stop();
          emitter.setVisible(false);
        });
      });
    }
  }

  /**
   * Get performance statistics
   */
  public getPerformanceStats(): {
    activeParticles: number;
    maxParticles: number;
    poolUtilization: number;
    activeEmitters: number;
  } {
    let totalActiveEmitters = 0;
    this.particlePools.forEach(pool => {
      totalActiveEmitters += pool.active.length;
    });

    return {
      activeParticles: this.activeParticleCount,
      maxParticles: this.maxParticles,
      poolUtilization: this.activeParticleCount / this.maxParticles,
      activeEmitters: totalActiveEmitters
    };
  }

  public cleanup(): void {
    // Clean up all active emitters
    this.emitters.forEach(emitter => {
      if (emitter && emitter.active) {
        emitter.destroy();
      }
    });
    this.emitters.clear();

    // Clean up particle pools
    this.particlePools.forEach(pool => {
      [...pool.active, ...pool.available].forEach(emitter => {
        if (emitter && emitter.active) {
          emitter.destroy();
        }
      });
    });
    this.particlePools.clear();
    
    this.activeParticleCount = 0;
  }
}