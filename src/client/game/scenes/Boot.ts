import { Scene } from 'phaser';
import { TransitionSystem } from '../systems/TransitionSystem';

export class Boot extends Scene {
  private transitionSystem?: TransitionSystem;

  constructor() {
    super('Boot');
  }

  preload() {
    // Load essential assets for the game
    this.load.image('background', 'assets/bg.png');
    
    // Load boss sprites
    this.load.image('boss_cringe', 'assets/sprites/boss_cringe.png');
    this.load.image('boss_lag_spike', 'assets/sprites/boss_lag_spike.png');
    this.load.image('boss_algorithm', 'assets/sprites/boss_algorithm.png');
    this.load.image('boss_influencer', 'assets/sprites/boss_influencer.png');
    this.load.image('boss_deadline', 'assets/sprites/boss_deadline.png');
    this.load.image('boss_spoiler', 'assets/sprites/boss_spoiler.png');
    this.load.image('boss_referee', 'assets/sprites/boss_referee.png');
    
    // Load character sprites
    this.load.image('warrior', 'assets/sprites/warrior.png');
    this.load.image('mage', 'assets/sprites/mage.png');
    this.load.image('rogue', 'assets/sprites/rogue.png');
    this.load.image('healer', 'assets/sprites/healer.png');
    
    // Load background images
    this.load.image('castle_arena', 'assets/backgrounds/castle_arena.png');
    this.load.image('mountains_bg', 'assets/backgrounds/Mountains Background.png');
    
    // Create placeholder assets as fallbacks
    this.createPlaceholderAssets();
  }

  create() {
    // Initialize transition system
    this.transitionSystem = new TransitionSystem(this);
    
    // Create a brief loading screen with smooth transition to Splash
    this.createBootScreen();
    
    // Transition to Splash scene after brief delay
    this.time.delayedCall(1000, () => {
      if (this.transitionSystem) {
        this.transitionSystem.transitionToScene('Splash', {
          type: 'fade',
          duration: 600,
          showLoadingIndicator: true,
          loadingText: 'Initializing Raid Day...'
        });
      }
    });
  }

  private createBootScreen(): void {
    const { width, height } = this.scale;
    
    // Dark background with gradient
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e);
    graphics.fillRect(0, 0, width, height);
    
    // Game logo/title
    const title = this.add.text(width / 2, height / 2 - 50, 'RAID DAY', {
      fontFamily: 'Arial Black',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);
    
    // Subtitle
    const subtitle = this.add.text(width / 2, height / 2 + 20, 'Boss Battle Arena', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#cccccc',
    }).setOrigin(0.5);
    
    // Animate title entrance
    title.setScale(0.5).setAlpha(0);
    subtitle.setScale(0.5).setAlpha(0);
    
    this.tweens.add({
      targets: [title, subtitle],
      scale: 1,
      alpha: 1,
      duration: 800,
      ease: 'Back.out',
      delay: 200
    });
  }

  private createPlaceholderAssets(): void {
    // Create placeholder textures for development
    // These will be replaced with actual sprite sheets later
    
    // Character placeholders (32x32)
    this.createColoredTexture('warrior', 32, 32, 0xff4444);
    this.createColoredTexture('mage', 32, 32, 0x4444ff);
    this.createColoredTexture('rogue', 32, 32, 0x44ff44);
    this.createColoredTexture('healer', 32, 32, 0xffff44);
    
    // Boss placeholder (128x128)
    this.createColoredTexture('boss_lag_spike', 128, 128, 0x8b0000);
    
    // Particle placeholders
    this.createColoredTexture('slash_particle', 8, 8, 0xffffff);
    this.createColoredTexture('crit_particle', 12, 12, 0xff6600);
    this.createColoredTexture('explosion_particle', 16, 16, 0xff0000);
    this.createColoredTexture('energy_particle', 6, 6, 0x00ff00);
  }

  private createColoredTexture(key: string, width: number, height: number, color: number): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(color);
    graphics.fillRect(0, 0, width, height);
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }
}
