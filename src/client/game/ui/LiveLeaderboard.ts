import { Scene } from 'phaser';
import { LeaderboardEntry } from '../../../shared/types/api';
import { GameConstants } from '../utils/GameConstants';
// import { MobileUtils } from '../utils/MobileUtils'; // Unused import

/**
 * LiveLeaderboard - Swipe-up overlay showing Top 20 leaderboard with real-time updates
 */
export class LiveLeaderboard {
  private scene: Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Graphics;
  private leaderboardEntries: LeaderboardEntry[] = [];
  private entryElements: Phaser.GameObjects.Container[] = [];
  private updateTimer?: Phaser.Time.TimerEvent;
  private isVisible: boolean = false;
  private currentUserRank: number | undefined;
  private swipeZone?: Phaser.GameObjects.Zone;

  constructor(scene: Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.createBackground();
    this.createSwipeZone();
    this.startUpdateTimer();
    this.container.setVisible(false);
  }

  private createBackground(): void {
    const { width, height } = this.scene.scale;
    
    // Full screen overlay background
    this.background = this.scene.add.graphics();
    this.background.fillStyle(0x000000, 0.9);
    this.background.fillRect(0, 0, width, height);
    this.container.add(this.background);

    // Header
    const header = this.scene.add.graphics();
    header.fillStyle(GameConstants.COLORS.UI_PRIMARY);
    header.fillRect(0, 0, width, 80);
    this.container.add(header);

    // Title
    const title = this.scene.add.text(width / 2, 40, 'Top 10 Leaderboard', {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
    this.container.add(title);

    // Close button
    const closeButton = this.scene.add.text(width - 20, 40, '✕', {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);
    closeButton.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.hide());
    this.container.add(closeButton);

    // Swipe down hint
    const swipeHint = this.scene.add.text(width / 2, height - 30, 'Swipe down to close', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#cccccc',
    }).setOrigin(0.5);
    this.container.add(swipeHint);
  }

  private createSwipeZone(): void {
    const { width, height } = this.scene.scale;
    
    // Create invisible zone for swipe detection at bottom of screen
    this.swipeZone = this.scene.add.zone(width / 2, height - 50, width, 100);
    this.swipeZone.setInteractive();
    
    let startY = 0;
    let isDragging = false;

    this.swipeZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      startY = pointer.y;
      isDragging = true;
    });

    this.swipeZone.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (isDragging) {
        const deltaY = pointer.y - startY;
        
        // Swipe up to show leaderboard (when hidden)
        if (deltaY < -50 && !this.isVisible) {
          this.show();
        }
        // Swipe down to hide leaderboard (when visible)
        else if (deltaY > 50 && this.isVisible) {
          this.hide();
        }
      }
      isDragging = false;
    });

    // Add swipe zone to scene, not container (so it's always active)
    // We'll manage its visibility separately
  }

  private startUpdateTimer(): void {
    // Update leaderboard every 10 seconds as specified in requirements
    this.updateTimer = this.scene.time.addEvent({
      delay: 10000,
      callback: () => this.fetchLeaderboard(),
      loop: true
    });

    // Initial fetch
    this.fetchLeaderboard();
  }

  private async fetchLeaderboard(): Promise<void> {
    try {
      const response = await fetch('/api/live-leaderboard');
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          this.updateLeaderboard(data.leaderboard, data.currentUserRank);
        }
      }
    } catch (error) {
      console.error('Failed to fetch live leaderboard:', error);
      // Use mock data for testing
      this.updateLeaderboard(this.getMockLeaderboard(), 3);
    }
  }

  private getMockLeaderboard(): LeaderboardEntry[] {
    const mockData: LeaderboardEntry[] = [];
    const usernames = [
      'DragonSlayer', 'BossHunter99', 'You', 'CritMaster', 'HealBot',
      'WarriorKing', 'MageSupreme', 'RogueNinja', 'PaladinLight', 'ShadowBlade'
    ];

    for (let i = 0; i < 10; i++) { // Only top 10 as per requirements
      mockData.push({
        userId: `user${i + 1}`,
        username: usernames[i],
        redditUsername: `u/${usernames[i]}`,
        characterClass: (['warrior', 'mage', 'rogue', 'healer'][i % 4]) as string,
        level: 15 - Math.floor(i / 4),
        sessionDamage: 25000 - (i * 1000) - Math.floor(Math.random() * 500),
        totalDamage: 100000 - (i * 3000),
        rank: i + 1,
        avatarUrl: undefined
      });
    }

    return mockData;
  }

  private updateLeaderboard(entries: LeaderboardEntry[], currentUserRank?: number): void {
    this.leaderboardEntries = entries.slice(0, 10); // Top 10 as specified in requirements
    this.currentUserRank = currentUserRank;
    
    if (this.isVisible) {
      this.refreshDisplay();
    }
  }

  private refreshDisplay(): void {
    // Clear existing entries
    this.entryElements.forEach(element => element.destroy());
    this.entryElements = [];

    const { width } = this.scene.scale;
    const startY = 100;

    // Create leaderboard entries
    this.leaderboardEntries.forEach((entry, index) => {
      const y = startY + (index * 35);
      const entryContainer = this.createLeaderboardEntry(entry, y, width);
      this.container.add(entryContainer);
      this.entryElements.push(entryContainer);
    });
  }

  private createLeaderboardEntry(entry: LeaderboardEntry, y: number, width: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, y);
    
    // Enhanced highlighting for current user with special styling as per requirements
    const isCurrentUser = entry.username === 'You' || entry.rank === this.currentUserRank;
    const bgColor = isCurrentUser ? 0x555500 : (entry.rank <= 3 ? 0x333333 : 0x222222);
    const textColor = isCurrentUser ? '#ffff00' : '#ffffff';

    // Background with enhanced styling for current user
    const bg = this.scene.add.graphics();
    bg.fillStyle(bgColor, isCurrentUser ? 0.9 : 0.8);
    bg.fillRect(10, -15, width - 20, 30);
    
    if (isCurrentUser) {
      // Special border and glow effect for current user
      bg.lineStyle(3, 0xffff00, 1.0);
      bg.strokeRect(10, -15, width - 20, 30);
      
      // Add pulsing glow effect
      this.scene.tweens.add({
        targets: bg,
        alpha: 0.7,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
    container.add(bg);

    // Rank with special styling for top 3
    let rankText = `${entry.rank}`;
    let rankColor = textColor;
    let rankFontSize = '14px';
    
    if (entry.rank === 1) {
      rankText = '🥇';
      rankFontSize = '16px';
    } else if (entry.rank === 2) {
      rankText = '🥈';
      rankFontSize = '16px';
    } else if (entry.rank === 3) {
      rankText = '🥉';
      rankFontSize = '16px';
    }

    const rank = this.scene.add.text(30, 0, rankText, {
      fontFamily: 'Arial Black',
      fontSize: rankFontSize,
      color: rankColor,
    }).setOrigin(0, 0.5);
    container.add(rank);

    // Avatar placeholder with class-specific colors
    const avatar = this.scene.add.circle(70, 0, 10, this.getClassColor(entry.characterClass));
    avatar.setStrokeStyle(2, isCurrentUser ? 0xffff00 : 0xffffff);
    container.add(avatar);

    // Username with enhanced styling for current user
    const usernameStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: isCurrentUser ? 'Arial Black' : 'Arial',
      fontSize: isCurrentUser ? '13px' : '12px',
      color: textColor,
    };
    
    if (isCurrentUser) {
      usernameStyle.stroke = '#000000';
      usernameStyle.strokeThickness = 2;
    }
    
    const username = this.scene.add.text(90, -5, entry.redditUsername || entry.username || 'Unknown', usernameStyle).setOrigin(0, 0.5);
    container.add(username);

    // Class and level
    const classLevel = this.scene.add.text(90, 8, `Lv.${entry.level} ${this.capitalizeFirst(entry.characterClass)}`, {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: isCurrentUser ? '#ffff88' : '#cccccc',
    }).setOrigin(0, 0.5);
    container.add(classLevel);

    // Total damage (main metric) - show username, total damage, and current rank as per requirements
    const damage = this.scene.add.text(width - 30, -5, entry.totalDamage.toLocaleString(), {
      fontFamily: 'Arial Black',
      fontSize: isCurrentUser ? '13px' : '12px',
      color: isCurrentUser ? '#00ff88' : '#00ff00',
    }).setOrigin(1, 0.5);
    container.add(damage);

    // Session damage (secondary metric)
    const sessionDamage = this.scene.add.text(width - 30, 8, `Session: ${entry.sessionDamage.toLocaleString()}`, {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: '#888888',
    }).setOrigin(1, 0.5);
    container.add(sessionDamage);

    return container;
  }

  private getClassColor(characterClass: string): number {
    switch (characterClass) {
      case 'warrior': return 0xff4444;
      case 'mage': return 0x4444ff;
      case 'rogue': return 0x44ff44;
      case 'healer': return 0xffff44;
      default: return 0xffffff;
    }
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  public show(): void {
    if (this.isVisible) return;
    
    this.isVisible = true;
    this.container.setVisible(true);
    this.refreshDisplay();

    // Animate in from bottom
    const { height } = this.scene.scale;
    this.container.setY(height);
    this.scene.tweens.add({
      targets: this.container,
      y: 0,
      duration: 300,
      ease: 'Power2'
    });
  }

  public hide(): void {
    if (!this.isVisible) return;
    
    this.isVisible = false;
    
    // Animate out to bottom
    const { height } = this.scene.scale;
    this.scene.tweens.add({
      targets: this.container,
      y: height,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.container.setVisible(false);
      }
    });
  }

  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  public resize(width: number, height: number): void {
    // Update background size
    this.background.clear();
    this.background.fillStyle(0x000000, 0.9);
    this.background.fillRect(0, 0, width, height);

    // Update swipe zone
    if (this.swipeZone) {
      this.swipeZone.setPosition(width / 2, height - 50);
      this.swipeZone.setSize(width, 100);
    }

    // Refresh display if visible
    if (this.isVisible) {
      this.refreshDisplay();
    }
  }

  public destroy(): void {
    if (this.updateTimer) {
      this.updateTimer.destroy();
    }
    if (this.swipeZone) {
      this.swipeZone.destroy();
    }
    this.entryElements.forEach(element => element.destroy());
    this.entryElements = [];
    this.container.destroy();
  }
}