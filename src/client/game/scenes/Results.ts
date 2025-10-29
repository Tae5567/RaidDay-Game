import { Scene } from 'phaser';
import { GameConstants } from '../utils/GameConstants';
import { TransitionSystem } from '../systems/TransitionSystem';
import { AnimationSystem } from '../systems/AnimationSystem';

/**
 * Results - Session summary scene showing damage dealt and sharing options
 * Simplified version focused on session completion and Reddit sharing
 */
export class Results extends Scene {
  private sessionDamage: number = 0;
  private playerRank: number = 0;
  private bossName: string = '';
  private bossHPRemaining: number = 0;
  private bossMaxHP: number = 50000;
  
  // Systems
  private transitionSystem?: TransitionSystem;
  private animationSystem?: AnimationSystem;

  constructor() {
    super('Results');
  }

  init(data?: { 
    sessionDamage?: number; 
    playerRank?: number; 
    bossName?: string;
    bossHPRemaining?: number;
    sessionAttackCount?: number;
  }): void {
    this.sessionDamage = data?.sessionDamage || 0;
    this.playerRank = data?.playerRank || 0;
    this.bossName = data?.bossName || 'The Lag Spike';
    this.bossHPRemaining = data?.bossHPRemaining || 45000;
    
    console.log('Results scene initialized with:', {
      sessionDamage: this.sessionDamage,
      playerRank: this.playerRank,
      bossName: this.bossName,
      bossHPRemaining: this.bossHPRemaining
    });
  }

  async create(): Promise<void> {
    // Initialize systems
    this.transitionSystem = new TransitionSystem(this);
    this.animationSystem = new AnimationSystem(this);
    
    // Smooth transition in
    await this.transitionSystem.transitionIn({
      type: 'slide',
      direction: 'up',
      duration: GameConstants.TRANSITION_DURATION_NORMAL
    });
    
    this.createBackground();
    this.createSessionSummary();
    this.createButtons();
    
    // Animate elements entrance
    await this.animateElementsEntrance();
    
    this.refreshLayout();

    // Handle screen resize
    this.scale.on('resize', () => this.refreshLayout());
  }

  private async animateElementsEntrance(): Promise<void> {
    // Collect all UI elements for entrance animation
    const uiElements: Phaser.GameObjects.GameObject[] = [];
    
    // Find all text and button elements
    this.children.list.forEach(child => {
      if (child instanceof Phaser.GameObjects.Text || 
          child instanceof Phaser.GameObjects.Container) {
        uiElements.push(child);
      }
    });
    
    // Animate UI elements entrance
    if (this.animationSystem && uiElements.length > 0) {
      await this.animationSystem.animateUIEntrance(uiElements);
    }
  }

  private createBackground(): void {
    const { width, height } = this.scale;
    
    // Dark gradient background
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(
      GameConstants.COLORS.BACKGROUND, 
      GameConstants.COLORS.BACKGROUND,
      GameConstants.COLORS.UI_PRIMARY,
      GameConstants.COLORS.UI_PRIMARY
    );
    graphics.fillRect(0, 0, width, height);
  }

  private createSessionSummary(): void {
    const { width, height } = this.scale;

    // Session Complete title
    this.add.text(width / 2, height * 0.2, 'SESSION COMPLETE!', {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Total damage dealt
    this.add.text(width / 2, height * 0.35, `Total Damage Dealt: ${this.sessionDamage.toLocaleString()}`, {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Boss HP remaining
    const hpPercentage = ((this.bossMaxHP - this.bossHPRemaining) / this.bossMaxHP * 100).toFixed(1);
    this.add.text(width / 2, height * 0.45, `${this.bossName} HP: ${this.bossHPRemaining.toLocaleString()} / ${this.bossMaxHP.toLocaleString()}`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#cccccc',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.5, `Boss ${hpPercentage}% defeated`, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Player rank
    if (this.playerRank > 0) {
      this.add.text(width / 2, height * 0.6, `Your rank: #${this.playerRank}`, {
        fontFamily: 'Arial Black',
        fontSize: '20px',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5);
    }
  }

  private createButtons(): void {
    const { width, height } = this.scale;

    // Share to r/RaidDay button
    const shareButton = this.add.container(width / 2, height * 0.75);
    
    const shareBg = this.add.rectangle(0, 0, 200, 50, 0x4CAF50)
      .setStrokeStyle(3, 0xffffff);
    
    const shareText = this.add.text(0, 0, 'Share to r/RaidDay', {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);

    shareButton.add([shareBg, shareText]);

    // Share button interactions
    shareBg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        shareBg.setFillStyle(0x45a049);
        shareButton.setScale(1.05);
      })
      .on('pointerout', () => {
        shareBg.setFillStyle(0x4CAF50);
        shareButton.setScale(1);
      })
      .on('pointerdown', () => {
        this.shareToReddit();
      });

    // Fight Again button
    const fightButton = this.add.container(width / 2, height * 0.85);
    
    const fightBg = this.add.rectangle(0, 0, 200, 50, GameConstants.COLORS.BUTTON_ENABLED)
      .setStrokeStyle(3, 0xffffff);
    
    const fightText = this.add.text(0, 0, 'Fight Again', {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);

    fightButton.add([fightBg, fightText]);

    // Fight button interactions
    fightBg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        fightBg.setFillStyle(GameConstants.COLORS.BUTTON_HOVER);
        fightButton.setScale(1.05);
      })
      .on('pointerout', () => {
        fightBg.setFillStyle(GameConstants.COLORS.BUTTON_ENABLED);
        fightButton.setScale(1);
      })
      .on('pointerdown', () => {
        if (this.transitionSystem) {
          this.transitionSystem.quickFade('Splash');
        }
      });
  }

  private async shareToReddit(): Promise<void> {
    try {
      const response = await fetch('/api/share-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionDamage: this.sessionDamage,
          bossName: this.bossName,
          playerRank: this.playerRank
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          this.showShareSuccess();
        } else {
          this.showShareError();
        }
      } else {
        this.showShareError();
      }
    } catch (error) {
      console.error('Failed to share session:', error);
      this.showShareError();
    }
  }

  private showShareSuccess(): void {
    const { width, height } = this.scale;
    
    const successText = this.add.text(width / 2, height * 0.95, 'Shared to r/RaidDay!', {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Fade out after 3 seconds
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: successText,
        alpha: 0,
        duration: 500,
        onComplete: () => successText.destroy()
      });
    });
  }

  private showShareError(): void {
    const { width, height } = this.scale;
    
    const errorText = this.add.text(width / 2, height * 0.95, 'Failed to share session', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Fade out after 3 seconds
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: errorText,
        alpha: 0,
        duration: 500,
        onComplete: () => errorText.destroy()
      });
    });
  }

  private refreshLayout(): void {
    const { width, height } = this.scale;
    
    // Resize camera to fill entire screen
    this.cameras.main.setViewport(0, 0, width, height);
  }
}