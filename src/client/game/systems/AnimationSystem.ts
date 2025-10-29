import * as Phaser from 'phaser';
import { GameConstants } from '../utils/GameConstants';

/**
 * AnimationSystem - Manages sprite animations and animation configs
 * Handles character and boss animation sequences with queueing and state management
 */
export interface AnimationConfig {
  key: string;
  texture: string;
  startFrame: number;
  endFrame: number;
  frameRate: number;
  repeat?: number;
  yoyo?: boolean;
}

export interface SpriteAnimationState {
  currentAnimation: string | null;
  queuedAnimations: string[];
  isPlaying: boolean;
  canInterrupt: boolean;
}

export class AnimationSystem {
  private scene: Phaser.Scene;
  private animationConfigs: Map<string, AnimationConfig>;
  private spriteStates: Map<Phaser.GameObjects.Sprite, SpriteAnimationState>;
  private loadedSpritesheets: Set<string>;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.animationConfigs = new Map();
    this.spriteStates = new Map();
    this.loadedSpritesheets = new Set();
    
    this.initializeAnimationConfigs();
  }

  private initializeAnimationConfigs(): void {
    // Character animation configurations (32x32 sprites)
    this.addAnimationConfig('warrior_idle', 'warrior', 0, 1, 2, -1);
    this.addAnimationConfig('warrior_run', 'warrior', 2, 5, 8, -1);
    this.addAnimationConfig('warrior_attack', 'warrior', 6, 8, 10, 0);
    this.addAnimationConfig('warrior_special', 'warrior', 9, 12, 8, 0);

    this.addAnimationConfig('mage_idle', 'mage', 0, 1, 2, -1);
    this.addAnimationConfig('mage_run', 'mage', 2, 5, 8, -1);
    this.addAnimationConfig('mage_attack', 'mage', 6, 8, 10, 0);
    this.addAnimationConfig('mage_special', 'mage', 9, 12, 8, 0);

    this.addAnimationConfig('rogue_idle', 'rogue', 0, 1, 2, -1);
    this.addAnimationConfig('rogue_run', 'rogue', 2, 5, 8, -1);
    this.addAnimationConfig('rogue_attack', 'rogue', 6, 8, 10, 0);
    this.addAnimationConfig('rogue_special', 'rogue', 9, 12, 8, 0);

    this.addAnimationConfig('healer_idle', 'healer', 0, 1, 2, -1);
    this.addAnimationConfig('healer_run', 'healer', 2, 5, 8, -1);
    this.addAnimationConfig('healer_attack', 'healer', 6, 8, 10, 0);
    this.addAnimationConfig('healer_special', 'healer', 9, 12, 8, 0);

    // Boss animation configurations (128x128 sprites)
    this.addAnimationConfig('boss_lag_spike_idle', 'boss_lag_spike', 0, 2, 2, -1);
    this.addAnimationConfig('boss_lag_spike_hit', 'boss_lag_spike', 3, 4, 10, 0);
    this.addAnimationConfig('boss_lag_spike_phase2', 'boss_lag_spike', 5, 7, 4, -1);
    this.addAnimationConfig('boss_lag_spike_death', 'boss_lag_spike', 8, 15, 5, 0);

    // Additional daily boss configurations
    this.addAnimationConfig('boss_algorithm_idle', 'boss_algorithm', 0, 2, 2, -1);
    this.addAnimationConfig('boss_algorithm_hit', 'boss_algorithm', 3, 4, 10, 0);
    this.addAnimationConfig('boss_algorithm_phase2', 'boss_algorithm', 5, 7, 4, -1);
    this.addAnimationConfig('boss_algorithm_death', 'boss_algorithm', 8, 15, 5, 0);

    this.addAnimationConfig('boss_influencer_idle', 'boss_influencer', 0, 2, 2, -1);
    this.addAnimationConfig('boss_influencer_hit', 'boss_influencer', 3, 4, 10, 0);
    this.addAnimationConfig('boss_influencer_phase2', 'boss_influencer', 5, 7, 4, -1);
    this.addAnimationConfig('boss_influencer_death', 'boss_influencer', 8, 15, 5, 0);

    this.addAnimationConfig('boss_deadline_idle', 'boss_deadline', 0, 2, 2, -1);
    this.addAnimationConfig('boss_deadline_hit', 'boss_deadline', 3, 4, 10, 0);
    this.addAnimationConfig('boss_deadline_phase2', 'boss_deadline', 5, 7, 4, -1);
    this.addAnimationConfig('boss_deadline_death', 'boss_deadline', 8, 15, 5, 0);

    this.addAnimationConfig('boss_spoiler_idle', 'boss_spoiler', 0, 2, 2, -1);
    this.addAnimationConfig('boss_spoiler_hit', 'boss_spoiler', 3, 4, 10, 0);
    this.addAnimationConfig('boss_spoiler_phase2', 'boss_spoiler', 5, 7, 4, -1);
    this.addAnimationConfig('boss_spoiler_death', 'boss_spoiler', 8, 15, 5, 0);

    this.addAnimationConfig('boss_referee_idle', 'boss_referee', 0, 2, 2, -1);
    this.addAnimationConfig('boss_referee_hit', 'boss_referee', 3, 4, 10, 0);
    this.addAnimationConfig('boss_referee_phase2', 'boss_referee', 5, 7, 4, -1);
    this.addAnimationConfig('boss_referee_death', 'boss_referee', 8, 15, 5, 0);

    this.addAnimationConfig('boss_cringe_idle', 'boss_cringe', 0, 2, 2, -1);
    this.addAnimationConfig('boss_cringe_hit', 'boss_cringe', 3, 4, 10, 0);
    this.addAnimationConfig('boss_cringe_phase2', 'boss_cringe', 5, 7, 4, -1);
    this.addAnimationConfig('boss_cringe_death', 'boss_cringe', 8, 15, 5, 0);
  }

  private addAnimationConfig(
    key: string,
    texture: string,
    startFrame: number,
    endFrame: number,
    frameRate: number,
    repeat: number = -1,
    yoyo: boolean = false
  ): void {
    this.animationConfigs.set(key, {
      key,
      texture,
      startFrame,
      endFrame,
      frameRate,
      repeat,
      yoyo
    });
  }

  public loadSpritesheet(key: string, path: string, frameWidth: number, frameHeight: number): void {
    if (!this.loadedSpritesheets.has(key)) {
      this.scene.load.spritesheet(key, path, { frameWidth, frameHeight });
      this.loadedSpritesheets.add(key);
    }
  }

  public createCharacterAnimations(): void {
    // Create all character animations from configs
    const characterClasses = ['warrior', 'mage', 'rogue', 'healer'];
    
    characterClasses.forEach(characterClass => {
      const animations = ['idle', 'run', 'attack', 'special'];
      animations.forEach(animType => {
        const key = `${characterClass}_${animType}`;
        this.createAnimationFromConfig(key);
      });
    });
  }

  public createBossAnimations(): void {
    // Create all boss animations from configs
    const bossTypes = [
      'boss_lag_spike', 'boss_algorithm', 'boss_influencer', 'boss_deadline',
      'boss_spoiler', 'boss_referee', 'boss_cringe'
    ];
    
    bossTypes.forEach(bossType => {
      const animations = ['idle', 'hit', 'phase2', 'death'];
      animations.forEach(animType => {
        const key = `${bossType}_${animType}`;
        this.createAnimationFromConfig(key);
      });
    });
  }

  private createAnimationFromConfig(configKey: string): void {
    const config = this.animationConfigs.get(configKey);
    if (!config) {
      console.warn(`Animation config not found: ${configKey}`);
      return;
    }

    this.createAnimation(
      config.key,
      config.texture,
      config.startFrame,
      config.endFrame,
      config.frameRate,
      config.repeat,
      config.yoyo
    );
  }

  private createAnimation(
    key: string, 
    texture: string, 
    startFrame: number, 
    endFrame: number, 
    frameRate: number,
    repeat: number = -1,
    yoyo: boolean = false
  ): void {
    if (!this.scene.anims.exists(key)) {
      this.scene.anims.create({
        key,
        frames: this.scene.anims.generateFrameNumbers(texture, {
          start: startFrame,
          end: endFrame
        }),
        frameRate,
        repeat,
        yoyo
      });
    }
  }

  public initializeSpriteState(sprite: Phaser.GameObjects.Sprite): void {
    if (!this.spriteStates.has(sprite)) {
      this.spriteStates.set(sprite, {
        currentAnimation: null,
        queuedAnimations: [],
        isPlaying: false,
        canInterrupt: true
      });

      // Listen for animation events
      sprite.on('animationcomplete', (animation: Phaser.Animations.Animation) => {
        this.onAnimationComplete(sprite, animation.key);
      });
    }
  }

  public playAnimation(
    sprite: Phaser.GameObjects.Sprite, 
    animationKey: string, 
    canInterrupt: boolean = true,
    queue: boolean = false
  ): boolean {
    if (!sprite || !this.scene.anims.exists(animationKey)) {
      console.warn(`Animation not found or sprite invalid: ${animationKey}`);
      return false;
    }

    this.initializeSpriteState(sprite);
    const state = this.spriteStates.get(sprite)!;

    // If queuing is requested, add to queue
    if (queue && state.isPlaying && !state.canInterrupt) {
      state.queuedAnimations.push(animationKey);
      return true;
    }

    // Check if we can interrupt current animation
    if (state.isPlaying && !state.canInterrupt && !canInterrupt) {
      return false;
    }

    // Play the animation
    sprite.play(animationKey);
    state.currentAnimation = animationKey;
    state.isPlaying = true;
    state.canInterrupt = canInterrupt;

    return true;
  }

  public queueAnimation(sprite: Phaser.GameObjects.Sprite, animationKey: string): void {
    this.initializeSpriteState(sprite);
    const state = this.spriteStates.get(sprite)!;
    
    if (!state.isPlaying) {
      // If not playing anything, play immediately
      this.playAnimation(sprite, animationKey);
    } else {
      // Add to queue
      state.queuedAnimations.push(animationKey);
    }
  }

  public stopAnimation(sprite: Phaser.GameObjects.Sprite, clearQueue: boolean = false): void {
    if (!sprite) return;

    sprite.stop();
    
    const state = this.spriteStates.get(sprite);
    if (state) {
      state.currentAnimation = null;
      state.isPlaying = false;
      state.canInterrupt = true;
      
      if (clearQueue) {
        state.queuedAnimations = [];
      }
    }
  }

  public isAnimationPlaying(sprite: Phaser.GameObjects.Sprite, animationKey?: string): boolean {
    const state = this.spriteStates.get(sprite);
    if (!state) return false;

    if (animationKey) {
      return state.isPlaying && state.currentAnimation === animationKey;
    }
    
    return state.isPlaying;
  }

  public getCurrentAnimation(sprite: Phaser.GameObjects.Sprite): string | null {
    const state = this.spriteStates.get(sprite);
    return state ? state.currentAnimation : null;
  }

  public clearAnimationQueue(sprite: Phaser.GameObjects.Sprite): void {
    const state = this.spriteStates.get(sprite);
    if (state) {
      state.queuedAnimations = [];
    }
  }

  private onAnimationComplete(sprite: Phaser.GameObjects.Sprite, animationKey: string): void {
    const state = this.spriteStates.get(sprite);
    if (!state) return;

    state.isPlaying = false;
    state.currentAnimation = null;
    state.canInterrupt = true;

    // Play next queued animation if any
    if (state.queuedAnimations.length > 0) {
      const nextAnimation = state.queuedAnimations.shift()!;
      this.playAnimation(sprite, nextAnimation);
    }
  }

  public createPlaceholderSprites(): void {
    // Create placeholder textures for development/testing
    const graphics = this.scene.add.graphics();

    // Character placeholders (32x32)
    const characterClasses = ['warrior', 'mage', 'rogue', 'healer'];
    const characterColors = [0xff0000, 0x0000ff, 0x00ff00, 0xffff00]; // Red, Blue, Green, Yellow

    characterClasses.forEach((className, index) => {
      graphics.clear();
      graphics.fillStyle(characterColors[index]);
      graphics.fillRect(0, 0, GameConstants.CHARACTER_SPRITE_SIZE, GameConstants.CHARACTER_SPRITE_SIZE);
      graphics.lineStyle(2, 0xffffff);
      graphics.strokeRect(0, 0, GameConstants.CHARACTER_SPRITE_SIZE, GameConstants.CHARACTER_SPRITE_SIZE);
      
      // Generate texture with multiple frames for animation
      const frameCount = 16; // Enough frames for all animations
      const spriteWidth = GameConstants.CHARACTER_SPRITE_SIZE * frameCount;
      graphics.generateTexture(className, spriteWidth, GameConstants.CHARACTER_SPRITE_SIZE);
    });

    // Boss placeholders (128x128)
    const bossTypes = [
      'boss_lag_spike', 'boss_algorithm', 'boss_influencer', 'boss_deadline',
      'boss_spoiler', 'boss_referee', 'boss_cringe'
    ];
    const bossColors = [0x800080, 0x008080, 0xff8000, 0x808000, 0x800000, 0x000080, 0x808080];

    bossTypes.forEach((bossName, index) => {
      graphics.clear();
      graphics.fillStyle(bossColors[index]);
      graphics.fillRect(0, 0, GameConstants.BOSS_SPRITE_SIZE, GameConstants.BOSS_SPRITE_SIZE);
      graphics.lineStyle(4, 0xffffff);
      graphics.strokeRect(0, 0, GameConstants.BOSS_SPRITE_SIZE, GameConstants.BOSS_SPRITE_SIZE);
      
      // Add boss identifier text
      const bossNumber = index + 1;
      graphics.fillStyle(0xffffff);
      graphics.fillCircle(GameConstants.BOSS_SPRITE_SIZE / 2, GameConstants.BOSS_SPRITE_SIZE / 2, 20);
      
      // Generate texture with multiple frames for animation
      const frameCount = 16; // Enough frames for all animations
      const spriteWidth = GameConstants.BOSS_SPRITE_SIZE * frameCount;
      graphics.generateTexture(bossName, spriteWidth, GameConstants.BOSS_SPRITE_SIZE);
    });

    graphics.destroy();
  }

  public cleanup(): void {
    // Clean up sprite states
    this.spriteStates.clear();
    this.loadedSpritesheets.clear();
  }
}