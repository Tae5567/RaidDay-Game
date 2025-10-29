import { Scene } from 'phaser';
import { GameConstants } from '../utils/GameConstants';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  init() {
    const { width, height } = this.scale;
    
    // Resize camera for responsive design
    this.cameras.resize(width, height);

    // Background
    if (this.textures.exists('background')) {
      const bg = this.add.image(width / 2, height / 2, 'background');
      bg.setDisplaySize(width, height);
    } else {
      // Fallback background
      const graphics = this.add.graphics();
      graphics.fillStyle(GameConstants.COLORS.BACKGROUND);
      graphics.fillRect(0, 0, width, height);
    }

    // Loading text
    this.add.text(width / 2, height / 2 - 50, 'Loading Raid Day...', {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Progress bar outline
    const barWidth = Math.min(400, width * 0.8);
    const barHeight = 20;
    this.add.rectangle(width / 2, height / 2, barWidth, barHeight)
      .setStrokeStyle(2, 0xffffff);

    // Progress bar fill
    const progressBar = this.add.rectangle(
      width / 2 - barWidth / 2 + 2, 
      height / 2, 
      4, 
      barHeight - 4, 
      0xffffff
    ).setOrigin(0, 0.5);

    // Update progress bar
    this.load.on('progress', (progress: number) => {
      progressBar.width = 4 + (barWidth - 8) * progress;
    });

    // Loading tips
    const tips = [
      'Tip: Rogues have 30% critical hit chance!',
      'Tip: Use special abilities for 3x damage!',
      'Tip: Full energy gives 20% damage bonus!',
      'Tip: Boss enters phase 2 at 75% health!'
    ];
    
    this.add.text(width / 2, height / 2 + 50, 
      Phaser.Utils.Array.GetRandom(tips), {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#cccccc',
      align: 'center',
    }).setOrigin(0.5);
  }

  preload() {
    // Set asset path
    this.load.setPath('assets');

    // Create placeholder logo
    this.createPlaceholderLogo();

    // Load character images (single static images)
    this.load.image('warrior', 'sprites/warrior.png');
    this.load.image('mage', 'sprites/mage.png');
    this.load.image('rogue', 'sprites/rogue.png');
    this.load.image('healer', 'sprites/healer.png');

    // Load boss images (single static images)
    this.load.image('boss_lag_spike', 'sprites/boss_lag_spike.png');
    this.load.image('boss_algorithm', 'sprites/boss_algorithm.png');
    this.load.image('boss_influencer', 'sprites/boss_influencer.png');
    this.load.image('boss_deadline', 'sprites/boss_deadline.png');
    this.load.image('boss_spoiler', 'sprites/boss_spoiler.png');
    this.load.image('boss_referee', 'sprites/boss_referee.png');
    this.load.image('boss_cringe', 'sprites/boss_cringe.png');

    // Load background image
    this.load.image('battle_background', 'backgrounds/castle_arena.png');

    // Load audio files (placeholder - will be implemented in future tasks)
    // this.load.audio('attack_sound', 'sounds/attack.wav');
    // this.load.audio('critical_sound', 'sounds/critical.wav');
    // this.load.audio('boss_hit', 'sounds/boss_hit.wav');
  }

  create() {
    // Create fallback sprites for any images that failed to load
    this.createFallbackSprites();
    
    // Initialize global game systems here if needed
    
    // Create global animations that will be used across scenes
    this.createGlobalAnimations();

    // Move to Splash scene (main menu)
    this.scene.start('Splash');
  }

  private createFallbackSprites(): void {
    const graphics = this.add.graphics();

    // Character sprites - only create if image failed to load
    const characterClasses = ['warrior', 'mage', 'rogue', 'healer'];
    const characterColors = [0xff4444, 0x4444ff, 0x44ff44, 0xffff44];

    characterClasses.forEach((className, index) => {
      if (!this.textures.exists(className)) {
        console.log(`Creating fallback sprite for ${className}`);
        graphics.clear();
        graphics.fillStyle(characterColors[index] || 0xffffff);
        graphics.fillCircle(32, 32, 24);
        graphics.fillStyle(0xffffff);
        graphics.fillRect(28, 28, 8, 8);
        graphics.generateTexture(className, 64, 64);
      }
    });

    // Boss sprites - only create if image failed to load
    const bossNames = [
      'boss_lag_spike', 'boss_algorithm', 'boss_influencer', 
      'boss_deadline', 'boss_spoiler', 'boss_referee', 'boss_cringe'
    ];
    const bossColors = [0xff0000, 0x00ff00, 0xff69b4, 0xffff00, 0x800080, 0x000000, 0xffa500];

    bossNames.forEach((bossName, index) => {
      if (!this.textures.exists(bossName)) {
        console.log(`Creating fallback sprite for ${bossName}`);
        graphics.clear();
        graphics.fillStyle(bossColors[index % bossColors.length] || 0xff0000);
        graphics.fillCircle(96, 96, 80);
        graphics.fillStyle(0xffffff);
        graphics.fillRect(80, 80, 32, 32);
        graphics.generateTexture(bossName, 192, 192);
      }
    });

    // Background fallback
    if (!this.textures.exists('battle_background')) {
      console.log('Creating fallback background');
      graphics.clear();
      graphics.fillGradientStyle(0x1a1a2e, 0x4a4a8e, 0x1a1a2e, 0x4a4a8e);
      graphics.fillRect(0, 0, 800, 600);
      graphics.generateTexture('battle_background', 800, 600);
    }

    graphics.destroy();
  }

  private createPlaceholderLogo(): void {
    // Create a simple text-based logo as placeholder
    const graphics = this.add.graphics();
    graphics.fillStyle(0x4a90e2);
    graphics.fillRect(0, 0, 200, 100);
    graphics.lineStyle(4, 0xffffff);
    graphics.strokeRect(0, 0, 200, 100);
    
    const logoText = this.add.text(100, 50, 'RAID\nDAY', {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    // Generate texture from graphics
    graphics.generateTexture('logo', 200, 100);
    graphics.destroy();
    logoText.destroy();
  }



  private createGlobalAnimations(): void {
    // Global animations that might be used across multiple scenes
    // These will be expanded in future animation system tasks
    
    // Screen shake animation config
    this.anims.create({
      key: 'screen_shake',
      frames: [{ key: 'placeholder', frame: 0 }],
      frameRate: 1,
      repeat: 0
    });

    // Damage number fade animation config
    this.anims.create({
      key: 'damage_fade',
      frames: [{ key: 'placeholder', frame: 0 }],
      frameRate: 1,
      repeat: 0
    });
  }
}
