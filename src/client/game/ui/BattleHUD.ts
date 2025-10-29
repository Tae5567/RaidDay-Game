import { Scene } from 'phaser';
import { GameConstants } from '../utils/GameConstants';
import { MobileUtils } from '../utils/MobileUtils';
import { EnergySystem } from '../systems/EnergySystem';

/**
 * BattleHUD - Manages all UI elements in the battle scene
 * Provides responsive layout for mobile and desktop
 */
export class BattleHUD {
  private scene: Scene;
  private container: Phaser.GameObjects.Container;
  
  // Top HUD elements
  private topBar: Phaser.GameObjects.Container;
  private bossNameText: Phaser.GameObjects.Text;
  private bossLevelText: Phaser.GameObjects.Text;
  private bossHPBar: Phaser.GameObjects.Graphics;
  private bossHPBarBg: Phaser.GameObjects.Graphics;
  private bossHPText: Phaser.GameObjects.Text;
  
  // Bottom HUD elements
  private bottomBar: Phaser.GameObjects.Container;
  private energyContainer: Phaser.GameObjects.Container;
  private energyIndicators: Phaser.GameObjects.Graphics[] = [];
  private energyLabel: Phaser.GameObjects.Text;
  
  // Side panel elements
  private sidePanel: Phaser.GameObjects.Container;
  private sessionStatsContainer: Phaser.GameObjects.Container;
  private communityInfoContainer: Phaser.GameObjects.Container;
  private sessionDamageText: Phaser.GameObjects.Text;
  private playerRankText: Phaser.GameObjects.Text;
  private activeRaidersText: Phaser.GameObjects.Text;
  
  // Layout properties
  private isPortrait: boolean = false;
  private isMobile: boolean = false;
  
  constructor(scene: Scene) {
    this.scene = scene;
    this.isMobile = MobileUtils.isMobile();
    this.container = scene.add.container(0, 0);
    
    try {
      this.createHUDElements();
      this.setupResponsiveLayout();
      
      // Listen for resize events with debouncing to prevent infinite loops
      let resizeTimeout: NodeJS.Timeout;
      scene.scale.on('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => this.handleResize(), 100);
      });
    } catch (error) {
      console.error('Error in BattleHUD constructor:', error);
      throw error;
    }
  }

  private createHUDElements(): void {
    this.createTopBar();
    this.createBottomBar();
    this.createSidePanel();
  }

  private createTopBar(): void {
    this.topBar = this.scene.add.container(0, 0);
    
    // Boss name and level
    this.bossNameText = this.scene.add.text(0, 0, 'The Lag Spike', {
      fontFamily: 'Arial Black',
      fontSize: this.isMobile ? '18px' : '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.bossLevelText = this.scene.add.text(0, 0, '• Level 45', {
      fontFamily: 'Arial',
      fontSize: this.isMobile ? '14px' : '18px',
      color: '#cccccc',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0, 0.5);

    // Boss HP bar background
    this.bossHPBarBg = this.scene.add.graphics();
    this.bossHPBar = this.scene.add.graphics();
    
    // Boss HP text
    this.bossHPText = this.scene.add.text(0, 0, '80,000 / 80,000', {
      fontFamily: 'Arial',
      fontSize: this.isMobile ? '12px' : '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0.5);

    this.topBar.add([
      this.bossNameText,
      this.bossLevelText,
      this.bossHPBarBg,
      this.bossHPBar,
      this.bossHPText
    ]);
    
    this.container.add(this.topBar);
  }

  private createBottomBar(): void {
    this.bottomBar = this.scene.add.container(0, 0);
    
    // Energy system container
    this.energyContainer = this.scene.add.container(0, 0);
    
    // Energy label
    this.energyLabel = this.scene.add.text(0, 0, 'Energy:', {
      fontFamily: 'Arial',
      fontSize: this.isMobile ? '12px' : '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0.5);

    // Create energy indicators
    for (let i = 0; i < GameConstants.MAX_ENERGY; i++) {
      const energyDot = this.scene.add.graphics();
      this.energyIndicators.push(energyDot);
      this.energyContainer.add(energyDot);
    }
    
    this.energyContainer.add(this.energyLabel);
    this.bottomBar.add(this.energyContainer);
    this.container.add(this.bottomBar);
  }

  private createSidePanel(): void {
    this.sidePanel = this.scene.add.container(0, 0);
    
    // Session stats container
    this.sessionStatsContainer = this.scene.add.container(0, 0);
    
    const statsTitle = this.scene.add.text(0, 0, 'Session Stats', {
      fontFamily: 'Arial Black',
      fontSize: this.isMobile ? '12px' : '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0.5);

    this.sessionDamageText = this.scene.add.text(0, 0, 'Damage: 0', {
      fontFamily: 'Arial',
      fontSize: this.isMobile ? '10px' : '12px',
      color: '#cccccc',
    }).setOrigin(0.5);

    this.playerRankText = this.scene.add.text(0, 0, 'Rank: #--', {
      fontFamily: 'Arial',
      fontSize: this.isMobile ? '10px' : '12px',
      color: '#cccccc',
    }).setOrigin(0.5);

    this.sessionStatsContainer.add([statsTitle, this.sessionDamageText, this.playerRankText]);
    
    // Community info container
    this.communityInfoContainer = this.scene.add.container(0, 0);
    
    const communityTitle = this.scene.add.text(0, 0, 'Community', {
      fontFamily: 'Arial Black',
      fontSize: this.isMobile ? '12px' : '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0.5);

    this.activeRaidersText = this.scene.add.text(0, 0, 'Raiders: 42', {
      fontFamily: 'Arial',
      fontSize: this.isMobile ? '10px' : '12px',
      color: '#cccccc',
    }).setOrigin(0.5);

    this.communityInfoContainer.add([communityTitle, this.activeRaidersText]);
    
    this.sidePanel.add([this.sessionStatsContainer, this.communityInfoContainer]);
    this.container.add(this.sidePanel);
  }

  private setupResponsiveLayout(): void {
    this.handleResize();
  }

  private handleResize(): void {
    const { width, height } = this.scene.scale;
    this.isPortrait = height > width;
    
    if (this.isPortrait) {
      this.layoutPortrait(width, height);
    } else {
      this.layoutLandscape(width, height);
    }
  }

  private layoutPortrait(width: number, height: number): void {
    // Top bar - full width at top
    this.topBar.setPosition(0, 0);
    this.layoutTopBarPortrait(width);
    
    // Bottom bar - full width at bottom
    const bottomY = height - GameConstants.HUD_BOTTOM_HEIGHT;
    this.bottomBar.setPosition(0, bottomY);
    this.layoutBottomBarPortrait(width);
    
    // Side panel - positioned above bottom bar
    const sidePanelY = bottomY - 120;
    this.sidePanel.setPosition(width / 2, sidePanelY);
    this.layoutSidePanelPortrait();
  }

  private layoutLandscape(width: number, height: number): void {
    // Top bar - centered at top
    this.topBar.setPosition(0, 0);
    this.layoutTopBarLandscape(width);
    
    // Bottom bar - centered at bottom
    const bottomY = height - GameConstants.HUD_BOTTOM_HEIGHT;
    this.bottomBar.setPosition(0, bottomY);
    this.layoutBottomBarLandscape(width);
    
    // Side panel - positioned on the right side
    const sidePanelX = width - 100;
    const sidePanelY = height / 2;
    this.sidePanel.setPosition(sidePanelX, sidePanelY);
    this.layoutSidePanelLandscape();
  }

  private layoutTopBarPortrait(width: number): void {
    const centerX = width / 2;
    const topMargin = this.isMobile ? 20 : 30;
    
    // Boss name centered
    this.bossNameText.setPosition(centerX, topMargin);
    
    // Boss level next to name
    const nameWidth = this.bossNameText.width;
    this.bossLevelText.setPosition(centerX + nameWidth / 2 + 10, topMargin);
    
    // HP bar below name
    const hpBarY = topMargin + 35;
    const hpBarWidth = Math.min(width - 40, 300);
    this.drawHPBar(centerX, hpBarY, hpBarWidth);
    
    // HP text below bar
    this.bossHPText.setPosition(centerX, hpBarY + 25);
  }

  private layoutTopBarLandscape(width: number): void {
    const centerX = width / 2;
    const topMargin = this.isMobile ? 15 : 25;
    
    // Boss name centered
    this.bossNameText.setPosition(centerX, topMargin);
    
    // Boss level next to name
    const nameWidth = this.bossNameText.width;
    this.bossLevelText.setPosition(centerX + nameWidth / 2 + 10, topMargin);
    
    // HP bar below name
    const hpBarY = topMargin + 30;
    const hpBarWidth = Math.min(width - 60, 400);
    this.drawHPBar(centerX, hpBarY, hpBarWidth);
    
    // HP text below bar
    this.bossHPText.setPosition(centerX, hpBarY + 20);
  }

  private layoutBottomBarPortrait(width: number): void {
    const centerX = width / 2;
    const energyY = GameConstants.HUD_BOTTOM_HEIGHT / 2 - 20;
    
    // Energy container centered
    this.energyContainer.setPosition(centerX, energyY);
    this.layoutEnergyIndicators(true);
  }

  private layoutBottomBarLandscape(width: number): void {
    const centerX = width / 2;
    const energyY = GameConstants.HUD_BOTTOM_HEIGHT / 2 - 10;
    
    // Energy container centered
    this.energyContainer.setPosition(centerX, energyY);
    this.layoutEnergyIndicators(false);
  }

  private layoutSidePanelPortrait(): void {
    // Stack vertically in portrait mode
    this.sessionStatsContainer.setPosition(0, -40);
    this.communityInfoContainer.setPosition(0, 20);
    
    // Layout session stats vertically
    const statsChildren = this.sessionStatsContainer.list as Phaser.GameObjects.GameObject[];
    if (statsChildren.length >= 3) {
      (statsChildren[0] as Phaser.GameObjects.Text).setPosition(0, 0); // Title
      (statsChildren[1] as Phaser.GameObjects.Text).setPosition(0, 15); // Damage
      (statsChildren[2] as Phaser.GameObjects.Text).setPosition(0, 30); // Rank
    }
    
    // Layout community info vertically
    const communityChildren = this.communityInfoContainer.list as Phaser.GameObjects.GameObject[];
    if (communityChildren.length >= 2) {
      (communityChildren[0] as Phaser.GameObjects.Text).setPosition(0, 0); // Title
      (communityChildren[1] as Phaser.GameObjects.Text).setPosition(0, 15); // Raiders
    }
  }

  private layoutSidePanelLandscape(): void {
    // Stack vertically in landscape mode too, but more compact
    this.sessionStatsContainer.setPosition(0, -60);
    this.communityInfoContainer.setPosition(0, 40);
    
    // Layout session stats vertically
    const statsChildren = this.sessionStatsContainer.list as Phaser.GameObjects.GameObject[];
    if (statsChildren.length >= 3) {
      (statsChildren[0] as Phaser.GameObjects.Text).setPosition(0, 0); // Title
      (statsChildren[1] as Phaser.GameObjects.Text).setPosition(0, 20); // Damage
      (statsChildren[2] as Phaser.GameObjects.Text).setPosition(0, 35); // Rank
    }
    
    // Layout community info vertically
    const communityChildren = this.communityInfoContainer.list as Phaser.GameObjects.GameObject[];
    if (communityChildren.length >= 2) {
      (communityChildren[0] as Phaser.GameObjects.Text).setPosition(0, 0); // Title
      (communityChildren[1] as Phaser.GameObjects.Text).setPosition(0, 20); // Raiders
    }
  }

  private layoutEnergyIndicators(_isPortrait: boolean): void {
    const spacing = this.isMobile ? 35 : 45;
    const startX = -(GameConstants.MAX_ENERGY - 1) * spacing / 2;
    
    // Energy label above indicators
    this.energyLabel.setPosition(0, -25);
    
    // Position energy dots
    this.energyIndicators.forEach((indicator, index) => {
      const x = startX + index * spacing;
      indicator.setPosition(x, 0);
    });
  }

  private drawHPBar(centerX: number, y: number, width: number): void {
    const height = this.isMobile ? 16 : 20;
    
    // Clear previous graphics
    this.bossHPBarBg.clear();
    this.bossHPBar.clear();
    
    // Background
    this.bossHPBarBg.fillStyle(0x333333);
    this.bossHPBarBg.fillRect(centerX - width / 2, y - height / 2, width, height);
    this.bossHPBarBg.lineStyle(2, 0xffffff);
    this.bossHPBarBg.strokeRect(centerX - width / 2, y - height / 2, width, height);
    
    // Store dimensions for HP bar updates
    this.bossHPBar.setData('centerX', centerX);
    this.bossHPBar.setData('y', y);
    this.bossHPBar.setData('width', width);
    this.bossHPBar.setData('height', height);
  }

  // Public methods for updating HUD elements
  public updateBossInfo(name: string, level: number): void {
    this.bossNameText.setText(name);
    this.bossLevelText.setText(`• Level ${level}`);
  }

  public updateBossHP(currentHP: number, maxHP: number): void {
    const hpPercentage = currentHP / maxHP;
    const centerX = this.bossHPBar.getData('centerX') as number || 0;
    const y = this.bossHPBar.getData('y') as number || 0;
    const width = this.bossHPBar.getData('width') as number || 300;
    const height = this.bossHPBar.getData('height') as number || 20;
    
    const barWidth = width * hpPercentage;
    
    this.bossHPBar.clear();
    this.bossHPBar.fillStyle(GameConstants.COLORS.HP_BAR);
    this.bossHPBar.fillRect(centerX - width / 2, y - height / 2, barWidth, height);
    
    this.bossHPText.setText(`${currentHP.toLocaleString()} / ${maxHP.toLocaleString()}`);
  }

  public updateEnergyIndicators(energySystem: EnergySystem): void {
    const energyState = energySystem.getEnergyState();
    
    this.energyIndicators.forEach((indicator, index) => {
      indicator.clear();
      
      const hasEnergy = index < energyState.current;
      const isOnCooldown = index >= energyState.current && energyState.cooldowns && energyState.cooldowns[index] && energyState.cooldowns[index] > 0;
      
      let color: number;
      if (hasEnergy) {
        color = GameConstants.COLORS.ENERGY_FULL;
      } else if (isOnCooldown) {
        color = GameConstants.COLORS.ENERGY_COOLDOWN;
      } else {
        color = GameConstants.COLORS.ENERGY_EMPTY;
      }
      
      const radius = this.isMobile ? 12 : 15;
      indicator.fillStyle(color);
      indicator.fillCircle(0, 0, radius);
      indicator.lineStyle(2, 0xffffff);
      indicator.strokeCircle(0, 0, radius);
      
      // Show cooldown timer if applicable
      if (isOnCooldown) {
        const cooldownSeconds = Math.ceil((energyState.cooldowns && energyState.cooldowns[index] || 0) / 1000);
        const timerText = this.scene.add.text(indicator.x, indicator.y, cooldownSeconds.toString(), {
          fontFamily: 'Arial',
          fontSize: this.isMobile ? '8px' : '10px',
          color: '#ffffff',
        }).setOrigin(0.5);
        
        // Remove timer text after a short delay
        this.scene.time.delayedCall(100, () => {
          if (timerText && timerText.scene) {
            timerText.destroy();
          }
        });
      }
    });
  }

  public updateSessionStats(damage: number, rank: number): void {
    this.sessionDamageText.setText(`Damage: ${damage.toLocaleString()}`);
    this.playerRankText.setText(`Rank: #${rank}`);
  }

  public updateCommunityInfo(activeRaiders: number): void {
    this.activeRaidersText.setText(`Raiders: ${activeRaiders}`);
  }

  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  public destroy(): void {
    this.container.destroy();
  }
}