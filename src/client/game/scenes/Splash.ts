import { Scene } from 'phaser';
import { GameConstants } from '../utils/GameConstants';

/**
 * Splash - Main menu scene with boss preview and game entry
 * Replaces the old MainMenu scene with boss battle theming
 */
export class Splash extends Scene {
  private background?: Phaser.GameObjects.Image;
  private title?: Phaser.GameObjects.Text;
  private playButton?: Phaser.GameObjects.Container;
  private howToPlayButton?: Phaser.GameObjects.Container;
  private bossPreview?: Phaser.GameObjects.Text;

  constructor() {
    super('Splash');
  }

  init(): void {
    // Reset cached references - no need to explicitly set to undefined
  }

  create(): void {
    this.createBackground();
    this.createTitle();
    this.createBossPreview();
    this.createPlayButton();
    this.createHowToPlayButton();
    
    this.refreshLayout();

    // Re-calculate positions on resize
    this.scale.on('resize', () => this.refreshLayout());
  }

  private createBackground(): void {
    const { width, height } = this.scale;
    
    // Dark gradient background for battle atmosphere
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(
      GameConstants.COLORS.BACKGROUND, 
      GameConstants.COLORS.BACKGROUND,
      GameConstants.COLORS.UI_PRIMARY,
      GameConstants.COLORS.UI_PRIMARY
    );
    graphics.fillRect(0, 0, width, height);

    // Optional: Add background image if available
    if (this.textures.exists('background')) {
      this.background = this.add.image(0, 0, 'background').setOrigin(0);
    }
  }

  private createTitle(): void {
    this.title = this.add.text(0, 0, 'RAID DAY', {
      fontFamily: 'Arial Black',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
    }).setOrigin(0.5);

    // Add subtitle
    this.add.text(0, 0, 'Boss Battle Arena', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#cccccc',
      align: 'center',
    }).setOrigin(0.5);
  }

  private createBossPreview(): void {
    // Show today's boss preview
    const today = new Date().getDay();
    const todayTheme = GameConstants.DAILY_THEMES[today];
    
    this.bossPreview = this.add.text(0, 0, `Today's Boss: ${todayTheme} Theme`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffff00',
      align: 'center',
    }).setOrigin(0.5);
  }

  private createPlayButton(): void {
    const buttonContainer = this.add.container(0, 0);

    // Button background
    const buttonBg = this.add.rectangle(0, 0, 200, 60, GameConstants.COLORS.BUTTON_ENABLED)
      .setStrokeStyle(3, GameConstants.COLORS.TEXT_PRIMARY);

    // Button text
    const buttonText = this.add.text(0, 0, 'ENTER BATTLE', {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);

    buttonContainer.add([buttonBg, buttonText]);

    // Make interactive
    buttonBg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        buttonBg.setFillStyle(GameConstants.COLORS.UI_SECONDARY);
        buttonContainer.setScale(1.05);
      })
      .on('pointerout', () => {
        buttonBg.setFillStyle(GameConstants.COLORS.BUTTON_ENABLED);
        buttonContainer.setScale(1);
      })
      .on('pointerdown', () => {
        this.scene.start('ClassSelect');
      });

    this.playButton = buttonContainer;
  }

  private createHowToPlayButton(): void {
    const buttonContainer = this.add.container(0, 0);

    // Button background - smaller than main play button
    const buttonBg = this.add.rectangle(0, 0, 160, 45, GameConstants.COLORS.UI_SECONDARY)
      .setStrokeStyle(2, GameConstants.COLORS.TEXT_SECONDARY);

    // Button text
    const buttonText = this.add.text(0, 0, 'HOW TO PLAY', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);

    buttonContainer.add([buttonBg, buttonText]);

    // Make interactive
    buttonBg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        buttonBg.setFillStyle(GameConstants.COLORS.UI_PRIMARY);
        buttonContainer.setScale(1.05);
      })
      .on('pointerout', () => {
        buttonBg.setFillStyle(GameConstants.COLORS.UI_SECONDARY);
        buttonContainer.setScale(1);
      })
      .on('pointerdown', () => {
        this.scene.start('HowToPlay');
      });

    this.howToPlayButton = buttonContainer;
  }

  private refreshLayout(): void {
    const { width, height } = this.scale;

    // Resize camera to prevent black bars
    this.cameras.resize(width, height);

    // Scale factor for responsive design
    const scaleFactor = Math.min(width / GameConstants.GAME_WIDTH, height / GameConstants.GAME_HEIGHT, 1);

    // Position background
    if (this.background) {
      this.background.setDisplaySize(width, height);
    }

    // Position title
    if (this.title) {
      this.title.setPosition(width / 2, height * 0.25);
      this.title.setScale(scaleFactor);
    }

    // Position subtitle (find it by searching children)
    const subtitle = this.children.getByName('subtitle') as Phaser.GameObjects.Text | null;
    if (subtitle) {
      subtitle.setPosition(width / 2, height * 0.35);
      subtitle.setScale(scaleFactor);
    }

    // Position boss preview
    if (this.bossPreview) {
      this.bossPreview.setPosition(width / 2, height * 0.5);
      this.bossPreview.setScale(scaleFactor);
    }

    // Position play button
    if (this.playButton) {
      this.playButton.setPosition(width / 2, height * 0.65);
      this.playButton.setScale(scaleFactor);
    }

    // Position how to play button
    if (this.howToPlayButton) {
      this.howToPlayButton.setPosition(width / 2, height * 0.75);
      this.howToPlayButton.setScale(scaleFactor);
    }
  }
}