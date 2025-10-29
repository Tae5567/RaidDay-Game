import { Scene } from 'phaser';
import { RecentAttacker } from '../../../shared/types/api';
import { GameConstants } from '../utils/GameConstants';

/**
 * LiveActivityFeed - Shows scrolling ticker of recent attacks: "u/Player1 dealt 234 damage (5s ago)"
 * Updates every 5 seconds with last 10 attacks and displays real Reddit usernames
 */
export class LiveActivityFeed {
  private scene: Scene;
  private container: Phaser.GameObjects.Container;
  private tickerContainer: Phaser.GameObjects.Container;
  private recentAttackers: RecentAttacker[] = [];
  private tickerTexts: Phaser.GameObjects.Text[] = [];
  private updateTimer?: Phaser.Time.TimerEvent;
  private scrollTween?: Phaser.Tweens.Tween;

  constructor(scene: Scene, x: number, y: number) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.tickerContainer = scene.add.container(0, 0);
    this.container.add(this.tickerContainer);
    this.createBackground();
    this.startUpdateTimer();
  }

  private createBackground(): void {
    // Scrolling ticker background - horizontal bar at bottom of screen
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.8);
    bg.fillRect(-400, -15, 800, 30); // Wide horizontal bar
    bg.lineStyle(1, GameConstants.COLORS.UI_SECONDARY, 0.6);
    bg.strokeRect(-400, -15, 800, 30);
    this.container.add(bg);

    // Activity indicator icon
    const activityIcon = this.scene.add.text(-380, 0, '⚡', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffff00',
    }).setOrigin(0.5);
    this.container.add(activityIcon);
  }

  private startUpdateTimer(): void {
    // Update recent attackers every 5 seconds as specified in requirements
    this.updateTimer = this.scene.time.addEvent({
      delay: 5000,
      callback: () => this.fetchRecentAttackers(),
      loop: true
    });

    // Initial fetch
    this.fetchRecentAttackers();
  }

  private async fetchRecentAttackers(): Promise<void> {
    try {
      const response = await fetch('/api/recent-attackers');
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          this.updateRecentAttackers(data.recentAttackers);
        }
      }
    } catch (error) {
      console.error('Failed to fetch recent attackers:', error);
      // Use mock data for testing
      this.updateRecentAttackers(this.getMockRecentAttackers());
    }
  }

  private getMockRecentAttackers(): RecentAttacker[] {
    const currentTime = Date.now();
    return [
      {
        userId: 'user1',
        username: 'You',
        redditUsername: 'u/YourUsername',
        characterClass: 'warrior',
        level: 12,
        damage: 1247,
        timestamp: currentTime - 5000,
        avatarUrl: undefined
      },
      {
        userId: 'user2',
        username: 'BossSlayer99',
        redditUsername: 'u/BossSlayer99',
        characterClass: 'rogue',
        level: 15,
        damage: 892,
        timestamp: currentTime - 15000,
        avatarUrl: undefined
      },
      {
        userId: 'user3',
        username: 'MageKnight',
        redditUsername: 'u/MageKnight',
        characterClass: 'mage',
        level: 13,
        damage: 1156,
        timestamp: currentTime - 25000,
        avatarUrl: undefined
      },
      {
        userId: 'user4',
        username: 'HealBot',
        redditUsername: 'u/HealBot',
        characterClass: 'healer',
        level: 11,
        damage: 734,
        timestamp: currentTime - 35000,
        avatarUrl: undefined
      }
    ];
  }

  private updateRecentAttackers(attackers: RecentAttacker[]): void {
    // Filter to last 60 seconds and get last 10 attacks as specified
    const sixtySecondsAgo = Date.now() - 60000;
    this.recentAttackers = attackers
      .filter(attacker => attacker.timestamp > sixtySecondsAgo)
      .slice(0, 10); // Show last 10 attacks as per requirements

    this.refreshScrollingTicker();
  }

  private refreshScrollingTicker(): void {
    // Clear existing ticker texts
    this.tickerTexts.forEach(text => text.destroy());
    this.tickerTexts = [];

    // Stop existing scroll animation
    if (this.scrollTween) {
      this.scrollTween.destroy();
    }

    // Show message if no recent attackers
    if (this.recentAttackers.length === 0) {
      const noActivityText = this.scene.add.text(-350, 0, 'No recent activity - Be the first to attack!', {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#cccccc',
      }).setOrigin(0, 0.5);
      this.tickerContainer.add(noActivityText);
      this.tickerTexts.push(noActivityText);
      return;
    }

    // Create scrolling ticker messages in format: "u/Player1 dealt 234 damage (5s ago)"
    const tickerMessages: string[] = [];
    this.recentAttackers.forEach(attacker => {
      const timeAgo = this.getTimeAgo(attacker.timestamp);
      const message = `${attacker.redditUsername} dealt ${attacker.damage.toLocaleString()} damage (${timeAgo})`;
      tickerMessages.push(message);
    });

    // Join messages with separators
    const fullTickerText = tickerMessages.join('  •  ');
    
    // Create scrolling text
    const tickerText = this.scene.add.text(350, 0, fullTickerText, {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);
    
    this.tickerContainer.add(tickerText);
    this.tickerTexts.push(tickerText);

    // Start scrolling animation - move from right to left
    const textWidth = tickerText.width;
    const scrollDistance = textWidth + 700; // Text width + screen width
    
    this.scrollTween = this.scene.tweens.add({
      targets: tickerText,
      x: -scrollDistance,
      duration: scrollDistance * 20, // Adjust speed (lower = faster)
      ease: 'Linear',
      repeat: -1, // Infinite loop
      onRepeat: () => {
        // Reset position when animation repeats
        tickerText.x = 350;
      }
    });
  }





  private getTimeAgo(timestamp: number): string {
    const secondsAgo = Math.floor((Date.now() - timestamp) / 1000);
    
    if (secondsAgo < 10) return 'just now';
    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `${minutesAgo}m ago`;
  }

  public addRecentAttack(attacker: RecentAttacker): void {
    // Add new attacker to the beginning of the list
    this.recentAttackers.unshift(attacker);
    
    // Keep only the 10 most recent as per requirements
    this.recentAttackers = this.recentAttackers.slice(0, 10);
    
    // Refresh ticker display
    this.refreshScrollingTicker();

    // Flash the activity icon to indicate new activity
    const activityIcon = this.container.getAt(1) as Phaser.GameObjects.Text; // The ⚡ icon
    if (activityIcon) {
      this.scene.tweens.add({
        targets: activityIcon,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 200,
        yoyo: true,
        ease: 'Power2'
      });
    }
  }

  public setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  public setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  public destroy(): void {
    if (this.updateTimer) {
      this.updateTimer.destroy();
    }
    if (this.scrollTween) {
      this.scrollTween.destroy();
    }
    this.tickerTexts.forEach(text => text.destroy());
    this.tickerTexts = [];
    this.container.destroy();
  }
}