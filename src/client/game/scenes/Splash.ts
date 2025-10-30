import { Scene } from 'phaser';
import { GameConstants } from '../utils/GameConstants';
import { BossStatusResponse } from '../../../shared/types/api';
import { MobileUtils } from '../utils/MobileUtils';
import { TransitionSystem } from '../systems/TransitionSystem';
import { AnimationSystem } from '../systems/AnimationSystem';

/**
 * Splash - Main menu scene with boss preview and game entry
 * Shows current daily boss with shared HP bar and community stats
 */
export class Splash extends Scene {
  private background?: Phaser.GameObjects.Image;
  private title?: Phaser.GameObjects.Text;
  private subtitle?: Phaser.GameObjects.Text;
  private playButton?: Phaser.GameObjects.Container;

  // Boss preview elements
  private bossSprite?: Phaser.GameObjects.Sprite;
  private bossNameText?: Phaser.GameObjects.Text;
  private hpBarBackground?: Phaser.GameObjects.Graphics;
  private hpBarFill?: Phaser.GameObjects.Graphics;
  private hpText?: Phaser.GameObjects.Text;
  private communityCounter?: Phaser.GameObjects.Text;

  // Boss data
  private bossData: BossStatusResponse | undefined;
  private updateTimer: Phaser.Time.TimerEvent | undefined;
  
  // Systems
  private transitionSystem?: TransitionSystem;
  private animationSystem?: AnimationSystem;

  constructor() {
    super('Splash');
  }

  init(): void {
    // Reset cached references
    this.bossData = undefined;
    if (this.updateTimer) {
      this.updateTimer.destroy();
      this.updateTimer = undefined;
    }
  }

  async create(): Promise<void> {
    // Setup systems
    this.transitionSystem = new TransitionSystem(this);
    this.animationSystem = new AnimationSystem(this);
    
    // Setup mobile optimizations
    MobileUtils.setupTouchControls(this);
    MobileUtils.optimizeForMobile(this);
    
    // Transition in smoothly
    await this.transitionSystem.transitionIn({
      type: 'fade',
      duration: GameConstants.TRANSITION_DURATION_NORMAL
    });
    
    this.createBackground();
    this.createTitle();
    await this.loadBossData();
    this.createBossPreview();
    this.createPlayButton();
    
    // Animate elements entrance
    await this.animateElementsEntrance();
    
    this.refreshLayout();

    // Re-calculate positions on resize
    this.scale.on('resize', () => this.refreshLayout());

    // Set up real-time HP updates every 10 seconds
    this.updateTimer = this.time.addEvent({
      delay: 10000, // 10 seconds
      callback: this.updateBossHP,
      callbackScope: this,
      loop: true
    });
  }

  private async animateElementsEntrance(): Promise<void> {
    // Collect all UI elements for entrance animation
    const uiElements: Phaser.GameObjects.GameObject[] = [];
    
    if (this.title) uiElements.push(this.title);
    if (this.subtitle) uiElements.push(this.subtitle);
    if (this.bossNameText) uiElements.push(this.bossNameText);
    if (this.hpText) uiElements.push(this.hpText);
    if (this.communityCounter) uiElements.push(this.communityCounter);
    if (this.playButton) uiElements.push(this.playButton);
    
    // Animate boss entrance first
    if (this.bossSprite && this.animationSystem) {
      await this.animationSystem.animateBossEntrance(this.bossSprite);
    }
    
    // Then animate UI elements
    if (this.animationSystem) {
      await this.animationSystem.animateUIEntrance(uiElements);
    }
  }

  shutdown(): void {
    if (this.updateTimer) {
      this.updateTimer.destroy();
      this.updateTimer = undefined;
    }
  }

  private createBackground(): void {
    const { width, height } = this.scale;
    
    // Use castle_arena.png or background.png as scene background (per requirements)
    if (this.textures.exists('castle_arena')) {
      this.background = this.add.image(0, 0, 'castle_arena').setOrigin(0);
    } else if (this.textures.exists('background')) {
      this.background = this.add.image(0, 0, 'background').setOrigin(0);
    } else {
      // Fallback: Dark gradient background for battle atmosphere
      const graphics = this.add.graphics();
      graphics.fillGradientStyle(
        GameConstants.COLORS.BACKGROUND, 
        GameConstants.COLORS.BACKGROUND,
        GameConstants.COLORS.UI_PRIMARY,
        GameConstants.COLORS.UI_PRIMARY
      );
      graphics.fillRect(0, 0, width, height);
    }
  }

  private createTitle(): void {
    this.title = this.add.text(0, 0, 'RAID DAY', {
      fontFamily: 'Arial Black',
      fontSize: '48px',
      color: '#ffff00',
      stroke: '#ff0000',
      strokeThickness: 6,
      align: 'center',
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: '#000000',
        blur: 5,
        fill: true
      }
    }).setOrigin(0.5);

    // Add subtitle
    this.subtitle = this.add.text(0, 0, 'Join the community boss battle!', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#cccccc',
      align: 'center',
    }).setOrigin(0.5);
  }

  private async loadBossData(): Promise<void> {
    try {
      const response = await fetch('/api/boss-status');
      if (response.ok) {
        this.bossData = await response.json();
      } else {
        console.warn('Failed to load boss data, using fallback');
        this.createFallbackBossData();
      }
    } catch (error) {
      console.error('Error loading boss data:', error);
      this.createFallbackBossData();
    }
  }

  private createFallbackBossData(): void {
    // Fallback boss data based on current day
    const today = new Date().getDay();
    const bossNames = ['The Cringe', 'The Lag Spike', 'The Algorithm', 'The Influencer', 'The Deadline', 'The Spoiler', 'The Referee'];
    const bossSprites = ['boss_cringe', 'boss_lag_spike', 'boss_algorithm', 'boss_influencer', 'boss_deadline', 'boss_spoiler', 'boss_referee'];
    
    this.bossData = {
      data: {
        id: bossSprites[today] || 'boss_lag_spike',
        name: bossNames[today] || 'The Lag Spike',
        theme: GameConstants.DAILY_THEMES[today] || 'Gaming',
        baseHP: 80000,
        level: 45,
        spriteKey: bossSprites[today] || 'boss_lag_spike',
        phase2Threshold: 0.75,
        enrageThreshold: 0.25
      },
      state: {
        currentHP: 37432, // Example current HP
        maxHP: 80000,
        phase: 1,
        isEnraged: false,
        lastDamageTime: Date.now(),
        totalDamageDealt: 42568,
        activePlayerCount: 347
      },
      isDefeated: false
    };
  }

  private createBossPreview(): void {
    if (!this.bossData) return;

    const { width } = this.scale;
    
    // Boss sprite display
    this.bossSprite = this.add.sprite(width / 2, 0, this.bossData.data.spriteKey);
    this.bossSprite.setScale(0.8);
    
    // Boss name
    this.bossNameText = this.add.text(0, 0, this.bossData.data.name, {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
    }).setOrigin(0.5);
    
    // Shared HP bar
    this.createBossHPBar();
    
    // Community counter
    this.createCommunityCounter();
  }
  
  private createBossHPBar(): void {
    if (!this.bossData) return;

    const { width } = this.scale;
    const barWidth = 320;
    const barHeight = 28;
    const barX = width / 2 - barWidth / 2;
    
    // HP bar background with gradient
    this.hpBarBackground = this.add.graphics();
    this.hpBarBackground.fillGradientStyle(0x1a1a1a, 0x1a1a1a, 0x333333, 0x333333);
    this.hpBarBackground.fillRect(barX, 0, barWidth, barHeight);
    
    // Add inner shadow effect
    this.hpBarBackground.lineStyle(2, 0x000000, 0.8);
    this.hpBarBackground.strokeRect(barX + 1, 1, barWidth - 2, barHeight - 2);
    
    // Outer border
    this.hpBarBackground.lineStyle(3, 0xffffff);
    this.hpBarBackground.strokeRect(barX, 0, barWidth, barHeight);
    
    // HP bar fill with enhanced color coding and gradient
    const hpPercentage = this.bossData.state.currentHP / this.bossData.state.maxHP;
    this.hpBarFill = this.add.graphics();
    
    // Enhanced color coding with gradients
    let fillColor1, fillColor2;
    if (hpPercentage > 0.75) {
      fillColor1 = 0x00ff00; // Bright green
      fillColor2 = 0x00cc00; // Darker green
    } else if (hpPercentage > 0.5) {
      fillColor1 = 0xffff00; // Bright yellow
      fillColor2 = 0xcccc00; // Darker yellow
    } else if (hpPercentage > 0.25) {
      fillColor1 = 0xff8800; // Bright orange
      fillColor2 = 0xcc6600; // Darker orange
    } else {
      fillColor1 = 0xff0000; // Bright red
      fillColor2 = 0xcc0000; // Darker red
    }
    
    this.hpBarFill.fillGradientStyle(fillColor1, fillColor1, fillColor2, fillColor2);
    this.hpBarFill.fillRect(barX + 2, 2, (barWidth - 4) * hpPercentage, barHeight - 4);
    
    // Add HP percentage text above the bar
    const percentage = Math.round(hpPercentage * 100);
    this.add.text(width / 2, 0, `${percentage}%`, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    
    // HP text showing current/max HP with better formatting
    this.hpText = this.add.text(width / 2, 0, 
      `HP: ${this.bossData.state.currentHP.toLocaleString()} / ${this.bossData.state.maxHP.toLocaleString()}`, {
      fontFamily: 'Arial Bold',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
  }
  
  private createCommunityCounter(): void {
    if (!this.bossData) return;

    const activeCount = this.bossData.state.activePlayerCount || 347; // Fallback to 347
    this.communityCounter = this.add.text(0, 0, `${activeCount} Fighters Active`, {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
  }

  private createPlayButton(): void {
    
    // Main play button - properly sized for mobile
    const playButtonContainer = this.add.container(0, 0);
    const buttonWidth = MobileUtils.isMobile() ? 200 : 250;
    const buttonHeight = MobileUtils.isMobile() ? 60 : 70;
    
    const playButtonBg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, GameConstants.COLORS.BUTTON_ENABLED)
      .setStrokeStyle(3, GameConstants.COLORS.TEXT_PRIMARY);
    const playButtonText = this.add.text(0, 0, 'JOIN BATTLE', {
      fontFamily: 'Arial Black',
      fontSize: MobileUtils.isMobile() ? '16px' : '18px',
      color: '#ffffff',
    }).setOrigin(0.5);

    playButtonContainer.add([playButtonBg, playButtonText]);

    playButtonBg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        playButtonBg.setFillStyle(GameConstants.COLORS.BUTTON_HOVER);
        playButtonContainer.setScale(1.05);
      })
      .on('pointerout', () => {
        playButtonBg.setFillStyle(GameConstants.COLORS.BUTTON_ENABLED);
        playButtonContainer.setScale(1);
      })
      .on('pointerdown', async () => {
        if (this.animationSystem) {
          await this.animationSystem.animateButtonPress(playButtonContainer);
        }
        if (this.transitionSystem) {
          this.transitionSystem.slideTransition('CharacterSelect', 'right');
        }
      });

    this.playButton = playButtonContainer;

    // How to Play button - smaller and positioned separately
    const howToPlayButton = this.add.container(0, 0);
    const howToPlayWidth = MobileUtils.isMobile() ? 140 : 160;
    const howToPlayHeight = MobileUtils.isMobile() ? 40 : 45;
    
    const howToPlayBg = this.add.rectangle(0, 0, howToPlayWidth, howToPlayHeight, 0x444444)
      .setStrokeStyle(2, 0x888888);
    const howToPlayText = this.add.text(0, 0, 'How to Play', {
      fontFamily: 'Arial',
      fontSize: MobileUtils.isMobile() ? '14px' : '16px',
      color: '#ffffff',
    }).setOrigin(0.5);

    howToPlayButton.add([howToPlayBg, howToPlayText]);

    howToPlayBg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        howToPlayBg.setFillStyle(0x666666);
        howToPlayButton.setScale(1.05);
      })
      .on('pointerout', () => {
        howToPlayBg.setFillStyle(0x444444);
        howToPlayButton.setScale(1);
      })
      .on('pointerdown', async () => {
        if (this.animationSystem) {
          await this.animationSystem.animateButtonPress(howToPlayButton);
        }
        if (this.transitionSystem) {
          this.transitionSystem.slideTransition('HowToPlay', 'up');
        }
      });

    // Store reference to how to play button for positioning
    this.children.add(howToPlayButton);
    (this as any).howToPlayButton = howToPlayButton;
  }



  private async updateBossHP(): Promise<void> {
    try {
      const response = await fetch('/api/boss-hp-sync');
      if (response.ok) {
        const syncData = await response.json();
        if (syncData.status === 'success' && this.bossData) {
          // Update boss state
          this.bossData.state.currentHP = syncData.currentHP;
          this.bossData.state.maxHP = syncData.maxHP;
          this.bossData.state.phase = syncData.phase;
          this.bossData.state.isEnraged = syncData.isEnraged;
          this.bossData.state.activePlayerCount = syncData.activePlayers;

          // Update HP bar visual
          this.updateHPBarVisual();
          
          // Update community counter
          if (this.communityCounter) {
            this.communityCounter.setText(`${syncData.activePlayers} Fighters Active`);
          }
        }
      }
    } catch (error) {
      console.error('Error updating boss HP:', error);
    }
  }

  private updateHPBarVisual(): void {
    if (!this.bossData || !this.hpBarFill || !this.hpText) return;

    const { width } = this.scale;
    const barWidth = 320;
    const barHeight = 28;
    const barX = width / 2 - barWidth / 2;
    const hpPercentage = this.bossData.state.currentHP / this.bossData.state.maxHP;

    // Clear and redraw HP bar fill with animation
    this.hpBarFill.clear();
    
    // Enhanced color coding with gradients
    let fillColor1, fillColor2;
    if (hpPercentage > 0.75) {
      fillColor1 = 0x00ff00; // Bright green
      fillColor2 = 0x00cc00; // Darker green
    } else if (hpPercentage > 0.5) {
      fillColor1 = 0xffff00; // Bright yellow
      fillColor2 = 0xcccc00; // Darker yellow
    } else if (hpPercentage > 0.25) {
      fillColor1 = 0xff8800; // Bright orange
      fillColor2 = 0xcc6600; // Darker orange
    } else {
      fillColor1 = 0xff0000; // Bright red
      fillColor2 = 0xcc0000; // Darker red
    }
    
    this.hpBarFill.fillGradientStyle(fillColor1, fillColor1, fillColor2, fillColor2);
    this.hpBarFill.fillRect(barX + 2, 2, (barWidth - 4) * hpPercentage, barHeight - 4);

    // Add pulsing effect for low HP
    if (hpPercentage < 0.25) {
      this.tweens.add({
        targets: this.hpBarFill,
        alpha: 0.7,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    } else {
      this.hpBarFill.setAlpha(1);
      this.tweens.killTweensOf(this.hpBarFill);
    }

    // Update HP text with animation
    const newText = `HP: ${this.bossData.state.currentHP.toLocaleString()} / ${this.bossData.state.maxHP.toLocaleString()}`;
    this.hpText.setText(newText);
    
    // Brief flash effect on HP update
    this.hpText.setTint(0xffff00);
    this.time.delayedCall(200, () => {
      if (this.hpText) {
        this.hpText.clearTint();
      }
    });

    // Update percentage text
    const percentage = Math.round(hpPercentage * 100);
    const children = this.children.list;
    const percentageText = children.find(child => 
      child instanceof Phaser.GameObjects.Text && 
      child.text.includes('%')
    ) as Phaser.GameObjects.Text | undefined;
    
    if (percentageText) {
      percentageText.setText(`${percentage}%`);
      // Color code the percentage text
      if (percentage < 25) {
        percentageText.setColor('#ff0000');
      } else if (percentage < 50) {
        percentageText.setColor('#ff8800');
      } else if (percentage < 75) {
        percentageText.setColor('#ffff00');
      } else {
        percentageText.setColor('#00ff00');
      }
    }
  }

  private refreshLayout(): void {
    const { width, height } = this.scale;

    // Resize camera to fill entire screen
    this.cameras.main.setViewport(0, 0, width, height);

    // Scale factor for responsive design
    const scaleFactor = Math.min(width / GameConstants.GAME_WIDTH, height / GameConstants.GAME_HEIGHT, 1);

    // Position background
    if (this.background) {
      this.background.setDisplaySize(width, height);
    }

    // Position title
    if (this.title) {
      this.title.setPosition(width / 2, height * 0.15);
      this.title.setScale(scaleFactor);
    }

    // Position subtitle
    if (this.subtitle) {
      this.subtitle.setPosition(width / 2, height * 0.22);
      this.subtitle.setScale(scaleFactor);
    }

    // Position boss name
    if (this.bossNameText) {
      this.bossNameText.setPosition(width / 2, height * 0.32);
      this.bossNameText.setScale(scaleFactor);
    }
    
    // Position boss sprite
    if (this.bossSprite) {
      this.bossSprite.setPosition(width / 2, height * 0.45);
      this.bossSprite.setScale(0.8 * scaleFactor);
    }
    
    // Position HP percentage text
    const children = this.children.list;
    const percentageText = children.find(child => 
      child instanceof Phaser.GameObjects.Text && 
      child.text.includes('%')
    ) as Phaser.GameObjects.Text | undefined;
    
    if (percentageText) {
      percentageText.setPosition(width / 2, height * 0.55);
      percentageText.setScale(scaleFactor);
    }

    // Position HP bar elements
    if (this.hpBarBackground) {
      this.hpBarBackground.setPosition(0, height * 0.58);
      this.hpBarBackground.setScale(scaleFactor);
    }
    
    if (this.hpBarFill) {
      this.hpBarFill.setPosition(0, height * 0.58);
      this.hpBarFill.setScale(scaleFactor);
    }
    
    // Position HP text
    if (this.hpText) {
      this.hpText.setPosition(width / 2, height * 0.64);
      this.hpText.setScale(scaleFactor);
    }
    
    // Position community counter
    if (this.communityCounter) {
      this.communityCounter.setPosition(width / 2, height * 0.70);
      this.communityCounter.setScale(scaleFactor);
    }

    // Position play button with proper spacing
    if (this.playButton) {
      this.playButton.setPosition(width / 2, height * 0.78);
      this.playButton.setScale(scaleFactor);
    }

    // Position how to play button with safe spacing
    const howToPlayButton = (this as any).howToPlayButton as Phaser.GameObjects.Container | undefined;
    
    if (howToPlayButton) {
      howToPlayButton.setPosition(width / 2, height * 0.88);
      howToPlayButton.setScale(scaleFactor);
    }
  }
}
