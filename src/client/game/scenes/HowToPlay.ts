import { Scene } from 'phaser';
import { GameConstants } from '../utils/GameConstants';
import { TransitionSystem } from '../systems/TransitionSystem';
import { AnimationSystem } from '../systems/AnimationSystem';
import { MobileUtils } from '../utils/MobileUtils';

/**
 * HowToPlay - Tutorial and instructions scene
 * Explains game mechanics, controls, and objectives
 */
export class HowToPlay extends Scene {
  private transitionSystem?: TransitionSystem;
  private animationSystem?: AnimationSystem;
  private backButton?: Phaser.GameObjects.Container;
  private contentContainer?: Phaser.GameObjects.Container;

  constructor() {
    super('HowToPlay');
  }

  async create(): Promise<void> {
    // Setup systems
    this.transitionSystem = new TransitionSystem(this);
    this.animationSystem = new AnimationSystem(this);
    
    // Smooth transition in
    await this.transitionSystem.transitionIn({
      type: 'slide',
      direction: 'up',
      duration: GameConstants.TRANSITION_DURATION_NORMAL
    });
    
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

    // Very concise instructions to prevent overlap
    const instructions = this.add.text(0, 0,
      '🎯 Defeat boss together!\n\n' +
      '⚔️ Pick class → Attack\n' +
      '⏱️ 60 seconds per battle\n\n' +
      '🏛️ CLASSES:\n' +
      'Warrior: Balanced\n' +
      'Mage: High damage\n' +
      'Rogue: Critical hits\n' +
      'Healer: Support\n\n' +
      '⚠️ Boss attacks back!',
      {
        fontFamily: 'Arial Black',
        fontSize: MobileUtils.isMobile() ? '14px' : '16px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center',
        lineSpacing: 4,
        wordWrap: { width: MobileUtils.isMobile() ? 240 : 300 }
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
      .on('pointerdown', async () => {
        if (this.animationSystem) {
          await this.animationSystem.animateButtonPress(buttonContainer);
        }
        if (this.transitionSystem) {
          this.transitionSystem.slideTransition('Splash', 'down');
        }
      });

    this.backButton = buttonContainer;
  }

  private refreshLayout(): void {
    const { width, height } = this.scale;

    // Resize camera to fill entire screen
    this.cameras.main.setViewport(0, 0, width, height);

    // Scale factor for responsive design
    const scaleFactor = Math.min(width / GameConstants.GAME_WIDTH, height / GameConstants.GAME_HEIGHT, 1);

    if (this.contentContainer) {
      // Position content container
      this.contentContainer.setPosition(width / 2, height / 2);
      this.contentContainer.setScale(scaleFactor);

      // Layout content elements with safe spacing
      const children = this.contentContainer.list as Phaser.GameObjects.Text[];
      if (children.length >= 2) {
        const title = children[0];
        const instructions = children[1];
        if (title && instructions) {
          title.setPosition(0, MobileUtils.isMobile() ? -150 : -160); // Title much higher
          instructions.setPosition(0, MobileUtils.isMobile() ? -20 : 0);    // Instructions centered
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
