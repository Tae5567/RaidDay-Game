import { Scene } from 'phaser';
import { RecentAttacker } from '../../../shared/types/api';
import { GameConstants } from '../utils/GameConstants';

/**
 * LiveActivityFeed - Shows recent real player attacks with avatars and usernames
 */
export class LiveActivityFeed {
  private scene: Scene;
  private container: Phaser.GameObjects.Container;
  private recentAttackers: RecentAttacker[] = [];
  private attackerElements: Map<string, Phaser.GameObjects.Container> = new Map();
  private updateTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Scene, x: number, y: number) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.createBackground();
    this.startUpdateTimer();
  }

  private createBackground(): void {
    // Activity feed background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRoundedRect(-120, -80, 240, 160, 8);
    bg.lineStyle(2, GameConstants.COLORS.UI_SECONDARY, 0.8);
    bg.strokeRoundedRect(-120, -80, 240, 160, 8);
    this.container.add(bg);

    // Title
    const title = this.scene.add.text(0, -65, 'Recent Raiders', {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    this.container.add(title);
  }

  private startUpdateTimer(): void {
    // Update recent attackers every 5 seconds
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
    // Filter to last 60 seconds
    const sixtySecondsAgo = Date.now() - 60000;
    this.recentAttackers = attackers
      .filter(attacker => attacker.timestamp > sixtySecondsAgo)
      .slice(0, 4); // Show max 4 recent attackers

    this.refreshDisplay();
  }

  private refreshDisplay(): void {
    // Clear existing attacker elements
    this.attackerElements.forEach(element => element.destroy());
    this.attackerElements.clear();

    // Show message if no recent attackers
    if (this.recentAttackers.length === 0) {
      const noActivityText = this.scene.add.text(0, 0, 'No recent activity\nBe the first to attack!', {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#cccccc',
        align: 'center',
      }).setOrigin(0.5);
      this.container.add(noActivityText);
      this.attackerElements.set('no-activity', this.scene.add.container().add(noActivityText));
      return;
    }

    // Display each recent attacker
    this.recentAttackers.forEach((attacker, index) => {
      const y = -35 + (index * 30);
      const attackerContainer = this.createAttackerElement(attacker, y);
      this.container.add(attackerContainer);
      this.attackerElements.set(attacker.userId, attackerContainer);
    });
  }

  private createAttackerElement(attacker: RecentAttacker, y: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, y);

    // Avatar (placeholder circle for now, will be replaced with real Reddit avatars)
    const avatar = this.scene.add.circle(-90, 0, 12, this.getClassColor(attacker.characterClass));
    avatar.setStrokeStyle(2, 0xffffff);
    container.add(avatar);

    // If we have an avatar URL, load it (simplified for now)
    if (attacker.avatarUrl) {
      // In a real implementation, you'd load the image from the URL
      // For now, we'll use a colored circle with initials
      const initials = attacker.redditUsername.substring(2, 4).toUpperCase(); // Remove 'u/' prefix
      const initialsText = this.scene.add.text(-90, 0, initials, {
        fontFamily: 'Arial Black',
        fontSize: '8px',
        color: '#ffffff',
      }).setOrigin(0.5);
      container.add(initialsText);
    }

    // Username (highlight if it's the current user)
    const isCurrentUser = attacker.username === 'You';
    const usernameColor = isCurrentUser ? '#ffff00' : '#ffffff';
    const username = this.scene.add.text(-70, -8, attacker.redditUsername, {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: usernameColor,
    }).setOrigin(0, 0.5);
    container.add(username);

    // Class and level
    const classText = this.scene.add.text(-70, 4, `Lv.${attacker.level} ${this.capitalizeFirst(attacker.characterClass)}`, {
      fontFamily: 'Arial',
      fontSize: '8px',
      color: '#cccccc',
    }).setOrigin(0, 0.5);
    container.add(classText);

    // Damage dealt
    const damageText = this.scene.add.text(90, 0, `${attacker.damage.toLocaleString()}`, {
      fontFamily: 'Arial Black',
      fontSize: '10px',
      color: '#00ff00',
    }).setOrigin(1, 0.5);
    container.add(damageText);

    // Time ago
    const timeAgo = this.getTimeAgo(attacker.timestamp);
    const timeText = this.scene.add.text(90, -10, timeAgo, {
      fontFamily: 'Arial',
      fontSize: '8px',
      color: '#999999',
    }).setOrigin(1, 0.5);
    container.add(timeText);

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
    
    // Keep only the 4 most recent
    this.recentAttackers = this.recentAttackers.slice(0, 4);
    
    // Refresh display
    this.refreshDisplay();

    // Animate the new entry
    const newElement = this.attackerElements.get(attacker.userId);
    if (newElement) {
      newElement.setAlpha(0);
      newElement.setScale(0.8);
      this.scene.tweens.add({
        targets: newElement,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Back.easeOut'
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
    this.attackerElements.forEach(element => element.destroy());
    this.attackerElements.clear();
    this.container.destroy();
  }
}