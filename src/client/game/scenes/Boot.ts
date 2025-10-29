import { Scene } from 'phaser';
import { TransitionSystem } from '../systems/TransitionSystem';

export class Boot extends Scene {
  private transitionSystem?: TransitionSystem;

  constructor() {
    super('Boot');
  }

  preload() {
    // Set up error handling for missing assets
    this.load.on('filecomplete', (key: string) => {
      console.log(`Loaded: ${key}`);
    });
    
    this.load.on('loaderror', (file: any) => {
      console.warn(`Failed to load: ${file.key} from ${file.url}`);
    });

    // Try to load actual assets first
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
  }

  create() {
    // Initialize transition system
    this.transitionSystem = new TransitionSystem(this);
    
    // Create placeholder assets for any missing textures
    this.createPlaceholderAssets();
    
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
    
    // Game logo/title with enhanced styling
    const title = this.add.text(width / 2, height / 2 - 50, 'RAID DAY', {
      fontFamily: 'Arial Black',
      fontSize: '48px',
      color: '#ffff00',
      stroke: '#ff0000',
      strokeThickness: 6,
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: '#000000',
        blur: 5,
        fill: true
      }
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
    // Only create placeholders for textures that don't exist
    const assetsToCheck = [
      { key: 'warrior', width: 64, height: 64, color: 0xff4444 },
      { key: 'mage', width: 64, height: 64, color: 0x4444ff },
      { key: 'rogue', width: 64, height: 64, color: 0x44ff44 },
      { key: 'healer', width: 64, height: 64, color: 0xffff44 },
      { key: 'boss_lag_spike', width: 128, height: 128, color: 0x8b0000 },
      { key: 'boss_cringe', width: 128, height: 128, color: 0xff8800 },
      { key: 'boss_algorithm', width: 128, height: 128, color: 0x00ff00 },
      { key: 'boss_influencer', width: 128, height: 128, color: 0xff69b4 },
      { key: 'boss_deadline', width: 128, height: 128, color: 0xffff00 },
      { key: 'boss_spoiler', width: 128, height: 128, color: 0x800080 },
      { key: 'boss_referee', width: 128, height: 128, color: 0x000000 },
      { key: 'background', width: 800, height: 600, color: 0x1a1a2e },
      { key: 'castle_arena', width: 800, height: 600, color: 0x2a4a6e }
    ];

    assetsToCheck.forEach(asset => {
      if (!this.textures.exists(asset.key)) {
        console.log(`Creating placeholder for missing asset: ${asset.key}`);
        this.createColoredTexture(asset.key, asset.width, asset.height, asset.color);
      }
    });
    
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
