import { Scene } from 'phaser';
import { GameConstants } from '../utils/GameConstants';
import { MobileUtils } from '../utils/MobileUtils';

/**
 * HowToPlay - Tutorial and instructions scene
 * Explains game mechanics, controls, and objectives
 */
export class HowToPlay extends Scene {
  private backButton?: Phaser.GameObjects.Container;
  private contentContainer?: Phaser.GameObjects.Container;

  constructor() {
    super('HowToPlay');
  }

  create(): void {
    this.createBackground();
    this.createContent();
    this.createBackButton();
    
    this.refreshLayout();

    // Re-calculate positions on resize
    this.scale.on('resize', () => this.refreshLayout());
  }

  private createBackground(): void {
    const { width, height } = this.scale;
    
    // Dark gradient background matching game theme
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(
      GameConstants.COLORS.BACKGROUND, 
      GameConstants.COLORS.BACKGROUND,
      GameConstants.COLORS.UI_PRIMARY,
      GameConstants.COLORS.UI_PRIMARY
    );
    graphics.fillRect(0, 0, width, height);
  }

  private createContent(): void {
    this.contentContainer = this.add.container(0, 0);

    // Title
    const title = this.add.text(0, 0, 'HOW TO PLAY', {
      fontFamily: 'Arial Black',
      fontSize: MobileUtils.isMobile() ? '24px' : '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5);

    // Simple, concise instructions
    const instructions = this.add.text(0, 0, 
      'GOAL: Defeat the daily boss with other Reddit players!\n\n' +
      
      'COMBAT:\n' +
      '• Choose your class (Warrior, Mage, Rogue, Healer)\n' +
      '• Click ATTACK or press SPACEBAR to fight\n' +
      '• Click SPECIAL or press SHIFT for big damage\n' +
      '• Energy refills over time (30 seconds each)\n\n' +
      
      'STRATEGY:\n' +
      '• Full energy (5/5) = 20% damage bonus\n' +
      '• Boss gets stronger at 75% health\n' +
      '• Work together for maximum damage!\n\n' +
      
      'CLASSES:\n' +
      '• WARRIOR: Balanced damage dealer\n' +
      '• MAGE: Magical area attacks\n' +
      '• ROGUE: 30% critical hit chance\n' +
      '• HEALER: Support and team buffs',
      {
        fontFamily: 'Arial',
        fontSize: MobileUtils.isMobile() ? '12px' : '16px',
        color: '#cccccc',
        align: 'left',
        lineSpacing: 4,
        wordWrap: { width: MobileUtils.isMobile() ? 300 : 500 }
      }
    ).setOrigin(0.5);

    // Add elements to container
    this.contentContainer.add([title, instructions]);
  }

  private createBackButton(): void {
    const buttonContainer = this.add.container(0, 0);

    // Button background
    const buttonBg = this.add.rectangle(0, 0, 
      MobileUtils.isMobile() ? 120 : 150, 
      MobileUtils.isMobile() ? 40 : 50, 
      GameConstants.COLORS.BUTTON_ENABLED
    ).setStrokeStyle(2, GameConstants.COLORS.TEXT_PRIMARY);

    // Button text
    const buttonText = this.add.text(0, 0, 'BACK', {
      fontFamily: 'Arial Black',
      fontSize: MobileUtils.isMobile() ? '14px' : '16px',
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
        this.scene.start('Splash');
      });

    this.backButton = buttonContainer;
  }

  private refreshLayout(): void {
    const { width, height } = this.scale;

    // Resize camera
    this.cameras.resize(width, height);

    // Scale factor for responsive design
    const scaleFactor = Math.min(width / GameConstants.GAME_WIDTH, height / GameConstants.GAME_HEIGHT, 1);

    if (this.contentContainer) {
      // Position content container
      this.contentContainer.setPosition(width / 2, height / 2);
      this.contentContainer.setScale(scaleFactor);

      // Layout content elements vertically
      const children = this.contentContainer.list as Phaser.GameObjects.Text[];
      if (children.length >= 2) {
        const title = children[0];
        const instructions = children[1];
        if (title && instructions) {
          title.setPosition(0, -150); // Title
          instructions.setPosition(0, 0);    // Instructions
        }
      }
    }

    // Position back button
    if (this.backButton) {
      this.backButton.setPosition(
        MobileUtils.isMobile() ? 70 : 100, 
        MobileUtils.isMobile() ? 40 : 50
      );
      this.backButton.setScale(scaleFactor);
    }
  }
}