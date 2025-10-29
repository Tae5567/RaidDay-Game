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

    // Load background images
    this.load.image('castle_arena', 'backgrounds/castle_arena.png');
    this.load.image('background', 'backgrounds/background.png');

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

    // Character sprites - create detailed fallback sprites
    const characterData = [
      { name: 'warrior', color: 0xff6666, symbol: '⚔️' },
      { name: 'mage', color: 0x6666ff, symbol: '🔮' },
      { name: 'rogue', color: 0x66ff66, symbol: '🗡️' },
      { name: 'healer', color: 0xffff66, symbol: '✚' }
    ];

    characterData.forEach((char) => {
      if (!this.textures.exists(char.name)) {
        console.log(`Creating fallback sprite for ${char.name}`);
        graphics.clear();
        
        // Body
        graphics.fillStyle(char.color);
        graphics.fillCircle(32, 32, 20);
        graphics.lineStyle(2, 0x000000);
        graphics.strokeCircle(32, 32, 20);
        
        // Class-specific details
        switch (char.name) {
          case 'warrior':
            // Sword
            graphics.lineStyle(3, 0x888888);
            graphics.lineBetween(17, 22, 7, 12);
            graphics.fillStyle(0xffaa00);
            graphics.fillCircle(7, 12, 3);
            break;
          case 'mage':
            // Staff
            graphics.lineStyle(2, 0x8B4513);
            graphics.lineBetween(47, 22, 47, 7);
            graphics.fillStyle(0x4444ff);
            graphics.fillCircle(47, 7, 4);
            break;
          case 'rogue':
            // Daggers
            graphics.lineStyle(2, 0x666666);
            graphics.lineBetween(20, 24, 14, 17);
            graphics.lineBetween(44, 24, 50, 17);
            break;
          case 'healer':
            // Cross
            graphics.lineStyle(3, 0x00ff00);
            graphics.lineBetween(32, 17, 32, 27);
            graphics.lineBetween(27, 22, 37, 22);
            break;
        }
        
        graphics.generateTexture(char.name, 64, 64);
      }
    });

    // Boss sprites - create detailed fallback sprites
    const bossData = [
      { name: 'boss_lag_spike', color: 0xff0000, size: 80 },
      { name: 'boss_algorithm', color: 0x00ff00, size: 80 },
      { name: 'boss_influencer', color: 0xff69b4, size: 80 },
      { name: 'boss_deadline', color: 0xffff00, size: 80 },
      { name: 'boss_spoiler', color: 0x800080, size: 80 },
      { name: 'boss_referee', color: 0x000000, size: 80 },
      { name: 'boss_cringe', color: 0xffa500, size: 80 }
    ];

    bossData.forEach((boss) => {
      if (!this.textures.exists(boss.name)) {
        console.log(`Creating fallback sprite for ${boss.name}`);
        graphics.clear();
        
        // Main body
        graphics.fillStyle(boss.color);
        graphics.fillCircle(96, 96, boss.size);
        graphics.lineStyle(4, 0x000000);
        graphics.strokeCircle(96, 96, boss.size);
        
        // Eyes
        graphics.fillStyle(0xff0000);
        graphics.fillCircle(80, 80, 8);
        graphics.fillCircle(112, 80, 8);
        
        // Mouth
        graphics.lineStyle(4, 0x000000);
        graphics.arc(96, 110, 20, 0, Math.PI);
        
        graphics.generateTexture(boss.name, 192, 192);
      }
    });

    // Background fallbacks
    if (!this.textures.exists('castle_arena')) {
      console.log('Creating fallback castle_arena background');
      graphics.clear();
      graphics.fillGradientStyle(0x1a1a2e, 0x4a4a8e, 0x1a1a2e, 0x4a4a8e);
      graphics.fillRect(0, 0, 800, 600);
      graphics.generateTexture('castle_arena', 800, 600);
    }
    
    if (!this.textures.exists('background')) {
      console.log('Creating fallback background');
      graphics.clear();
      graphics.fillGradientStyle(0x2a2a4e, 0x5a5a9e, 0x2a2a4e, 0x5a5a9e);
      graphics.fillRect(0, 0, 800, 600);
      graphics.generateTexture('background', 800, 600);
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
