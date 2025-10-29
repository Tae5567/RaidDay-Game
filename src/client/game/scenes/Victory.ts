import { Scene } from 'phaser';
import { GameConstants } from '../utils/GameConstants';
import { ParticleSystem } from '../systems/ParticleSystem';
import { SynchronizationSystem } from '../systems/SynchronizationSystem';
import { BossData, getCurrentBoss, getBossByDay } from '../entities/BossEntity';
import { LeaderboardEntry, PlayerData } from '../../../shared/types/api';
import { TransitionSystem } from '../systems/TransitionSystem';
import { AnimationSystem } from '../systems/AnimationSystem';

/**
 * Victory - Boss defeat celebration and rewards scene
 * Shows victory animation, loot distribution, and progression
 */
export class Victory extends Scene {
  private celebrationText?: Phaser.GameObjects.Text;
  private lootItems: Phaser.GameObjects.Sprite[] = [];
  private xpBar?: Phaser.GameObjects.Graphics;
  private leaderboard?: Phaser.GameObjects.Container;
  private particleSystem?: ParticleSystem;
  private synchronizationSystem?: SynchronizationSystem;
  private transitionSystem?: TransitionSystem;
  private bossData?: BossData;
  private playerData: PlayerData | undefined;
  private leaderboardData: LeaderboardEntry[] = [];
  private xpGained: number = 0;
  private newLevel: number = 0;
  private oldLevel: number = 0;

  constructor() {
    super('Victory');
  }

  init(data?: { 
    bossData?: BossData; 
    playerData?: PlayerData; 
    leaderboard?: LeaderboardEntry[];
    xpGained?: number;
  }): void {
    this.lootItems = [];
    this.bossData = data?.bossData || getCurrentBoss();
    this.playerData = data?.playerData || undefined;
    this.leaderboardData = data?.leaderboard || [];
    this.xpGained = data?.xpGained || 250;
    
    // Calculate level progression
    if (this.playerData) {
      this.oldLevel = this.playerData.level;
      const newXP = this.playerData.experience + this.xpGained;
      this.newLevel = Math.floor(newXP / 1000) + 1; // Simple level calculation
    } else {
      this.oldLevel = 12;
      this.newLevel = 13;
    }
  }

  async create(): Promise<void> {
    // Initialize systems
    this.particleSystem = new ParticleSystem(this);
    this.transitionSystem = new TransitionSystem(this);
    
    // Initialize synchronization system for leaderboard updates
    this.synchronizationSystem = new SynchronizationSystem(this);
    this.setupSynchronizationCallbacks();
    
    // Smooth transition in with celebration effect
    await this.transitionSystem.transitionIn({
      type: 'zoom',
      duration: GameConstants.TRANSITION_DURATION_SLOW
    });
    
    // Enable physics for loot rain
    this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
    
    this.createBackground();
    
    // Fetch victory data from server if not provided
    if (!this.playerData || this.leaderboardData.length === 0) {
      this.fetchVictoryData().then(() => {
        this.playBossDeathSequence();
      }).catch((error) => {
        console.error('Failed to fetch victory data:', error);
        // Continue with mock data
        this.playBossDeathSequence();
      });
    } else {
      this.playBossDeathSequence();
    }
    
    this.refreshLayout();

    // Re-calculate positions on resize
    this.scale.on('resize', () => this.refreshLayout());

    // Start synchronization system for leaderboard updates
    if (this.synchronizationSystem) {
      this.synchronizationSystem.start();
    }

    // Auto-return to splash after delay
    this.time.delayedCall(15000, () => {
      if (this.transitionSystem) {
        this.transitionSystem.quickFade('Splash');
      }
    });
  }

  private async fetchVictoryData(): Promise<void> {
    try {
      const response = await fetch('/api/victory-data');
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          this.playerData = data.playerData || undefined;
          this.leaderboardData = data.leaderboard || [];
          this.bossData = data.bossData || getCurrentBoss();
          this.xpGained = data.xpGained || 250;
          
          // Update level progression
          if (this.playerData) {
            this.oldLevel = this.playerData.level;
            const newXP = this.playerData.experience + this.xpGained;
            this.newLevel = Math.floor(newXP / 1000) + 1;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching victory data:', error);
    }
  }

  private createBackground(): void {
    const { width, height } = this.scale;
    
    // Victory background with celebration colors
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x1a1a2e, 0x4a4a8e, 0x1a1a2e, 0x4a4a8e);
    graphics.fillRect(0, 0, width, height);
  }

  private playBossDeathSequence(): void {
    const { width, height } = this.scale;
    
    // Create boss sprite for death animation
    const bossSprite = this.add.sprite(width / 2, height * 0.4, this.bossData?.spriteKey || 'boss_lag_spike');
    bossSprite.setScale(1.5);
    
    // Create boss death animation frames (8-frame explosion)
    this.createBossDeathAnimation();
    
    // Play death animation
    bossSprite.play(`${this.bossData?.spriteKey || 'boss_lag_spike'}_death`);
    
    // Enhanced screen flash effect with multiple colors
    const flash = this.add.rectangle(0, 0, width, height, 0xffffff, 1).setOrigin(0);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        // Secondary flash with boss theme color
        const colorFlash = this.add.rectangle(0, 0, width, height, this.bossData?.hitEffect?.flashColor || 0xff0000, 0.6).setOrigin(0);
        this.tweens.add({
          targets: colorFlash,
          alpha: 0,
          duration: 500,
          ease: 'Power2',
          onComplete: () => {
            flash.destroy();
            colorFlash.destroy();
          }
        });
      }
    });
    
    // Massive screen shake for boss death with multiple phases
    this.cameras.main.shake(1000, 15);
    
    // Enhanced particle explosion sequence
    this.time.delayedCall(200, () => {
      // Initial massive explosion
      this.particleSystem?.createDeathExplosion(bossSprite.x, bossSprite.y);
      
      // Multiple secondary explosions in a circle pattern
      for (let i = 0; i < 8; i++) {
        this.time.delayedCall(i * 100, () => {
          const angle = (i / 8) * Math.PI * 2;
          const radius = 80;
          const offsetX = Math.cos(angle) * radius;
          const offsetY = Math.sin(angle) * radius;
          this.particleSystem?.createDeathExplosion(bossSprite.x + offsetX, bossSprite.y + offsetY);
        });
      }
      
      // Final central explosion
      this.time.delayedCall(1000, () => {
        this.particleSystem?.createDeathExplosion(bossSprite.x, bossSprite.y);
      });
    });
    
    // Enhanced boss death animation with rotation and scaling
    this.time.delayedCall(600, () => {
      this.tweens.add({
        targets: bossSprite,
        scaleX: 2,
        scaleY: 2,
        rotation: Math.PI * 2,
        alpha: 0,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => {
          bossSprite.destroy();
          this.playVictorySequence();
        }
      });
    });
  }

  private createBossDeathAnimation(): void {
    const spriteKey = this.bossData?.spriteKey || 'boss_lag_spike';
    
    // Create placeholder death animation if it doesn't exist
    if (!this.anims.exists(`${spriteKey}_death`)) {
      // Create 8-frame death animation using existing frames
      const frames = [];
      for (let i = 0; i < 8; i++) {
        frames.push({ key: spriteKey, frame: i % 4 }); // Cycle through available frames
      }
      
      this.anims.create({
        key: `${spriteKey}_death`,
        frames: frames,
        frameRate: 8,
        repeat: 0
      });
    }
  }

  private playVictorySequence(): void {
    const { width, height } = this.scale;

    // Enhanced victory text with multiple effects
    this.celebrationText = this.add.text(width / 2, height * 0.2, 'VICTORY!', {
      fontFamily: 'Arial Black',
      fontSize: '64px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Add glow effect to victory text
    const glowEffect = this.add.text(width / 2, height * 0.2, 'VICTORY!', {
      fontFamily: 'Arial Black',
      fontSize: '68px',
      color: '#ffffff',
    }).setOrigin(0.5);
    glowEffect.setAlpha(0.3);

    // Animate victory text with enhanced bounce effect
    this.celebrationText.setScale(0);
    glowEffect.setScale(0);
    
    this.tweens.add({
      targets: [this.celebrationText, glowEffect],
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 600,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: [this.celebrationText, glowEffect],
          scaleX: 1,
          scaleY: 1,
          duration: 200,
          ease: 'Power2'
        });
        
        // Add pulsing glow effect
        this.tweens.add({
          targets: glowEffect,
          alpha: 0.1,
          duration: 1000,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1
        });
      }
    });

    // Enhanced boss defeated message with celebration effects
    this.time.delayedCall(800, () => {
      const bossName = this.bossData?.name || 'The Lag Spike';
      const defeatedText = this.add.text(width / 2, height * 0.3, `🎉 ${bossName} has been defeated! 🎉`, {
        fontFamily: 'Arial Black',
        fontSize: '24px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center',
      }).setOrigin(0.5);
      
      // Animate defeated text
      defeatedText.setAlpha(0);
      this.tweens.add({
        targets: defeatedText,
        alpha: 1,
        y: defeatedText.y - 10,
        duration: 500,
        ease: 'Power2'
      });
      
      // Community celebration message
      this.time.delayedCall(500, () => {
        const communityText = this.add.text(width / 2, height * 0.35, 'The community has triumphed together!', {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: '#00ff00',
          align: 'center',
        }).setOrigin(0.5);
        
        communityText.setAlpha(0);
        this.tweens.add({
          targets: communityText,
          alpha: 1,
          duration: 500,
          ease: 'Power2'
        });
      });
      
      // Add celebration particle effects
      this.createCelebrationEffects();
      
      // Start loot rain after victory text
      this.createLootRain();
    });

    // Start other UI elements with staggered timing
    this.time.delayedCall(1500, () => {
      this.createProgressionUI();
    });
    
    this.time.delayedCall(2500, () => {
      this.createLeaderboard();
    });
    
    this.time.delayedCall(3000, () => {
      // Create victory post on Reddit
      this.createVictoryPost();
    });
    
    this.time.delayedCall(4000, () => {
      this.createNextBossPreview();
    });
  }

  private createCelebrationEffects(): void {
    const { width, height } = this.scale;
    
    // Create fireworks-style particle bursts
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(i * 300, () => {
        const x = Phaser.Math.Between(width * 0.2, width * 0.8);
        const y = Phaser.Math.Between(height * 0.1, height * 0.4);
        
        // Create colorful burst effect
        this.particleSystem?.createSpecialEffect(x, y, 'victory_burst');
        
        // Add screen flash for each burst
        const burstFlash = this.add.rectangle(0, 0, width, height, 
          Phaser.Utils.Array.GetRandom([0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff]), 0.2).setOrigin(0);
        this.tweens.add({
          targets: burstFlash,
          alpha: 0,
          duration: 200,
          onComplete: () => burstFlash.destroy()
        });
      });
    }
    
    // Create confetti effect
    for (let i = 0; i < 20; i++) {
      this.time.delayedCall(i * 50, () => {
        const confetti = this.add.rectangle(
          Phaser.Math.Between(0, width),
          -10,
          Phaser.Math.Between(4, 8),
          Phaser.Math.Between(4, 8),
          Phaser.Utils.Array.GetRandom([0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff])
        );
        
        // Add physics for realistic falling
        this.physics.add.existing(confetti);
        const body = confetti.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(
          Phaser.Math.Between(-50, 50),
          Phaser.Math.Between(100, 200)
        );
        body.setAngularVelocity(Phaser.Math.Between(-300, 300));
        
        // Remove after falling off screen
        this.time.delayedCall(5000, () => {
          if (confetti.active) confetti.destroy();
        });
      });
    }
  }

  private createLootRain(): void {
    const { width } = this.scale;

    // Create loot item textures
    this.createLootTextures();

    // Create falling loot items with physics
    const lootTypes = ['coin', 'gem', 'potion', 'scroll', 'chest', 'star'];
    
    for (let i = 0; i < 30; i++) {
      this.time.delayedCall(i * 150, () => {
        const lootType = Phaser.Utils.Array.GetRandom(lootTypes);
        const x = Phaser.Math.Between(50, width - 50);
        
        // Create loot sprite with texture
        const loot = this.add.sprite(x, -50, `loot_${lootType}`);
        loot.setScale(Phaser.Math.FloatBetween(0.8, 1.2));
        
        // Add physics for realistic bouncing
        this.physics.add.existing(loot);
        const body = loot.body as Phaser.Physics.Arcade.Body;
        body.setBounce(Phaser.Math.FloatBetween(0.4, 0.8));
        body.setCollideWorldBounds(true);
        body.setVelocity(
          Phaser.Math.Between(-100, 100), 
          Phaser.Math.Between(150, 300)
        );
        
        // Add rotation for visual appeal
        body.setAngularVelocity(Phaser.Math.Between(-200, 200));
        
        // Add glow effect for special items
        if (lootType === 'chest' || lootType === 'star') {
          const glow = this.add.circle(loot.x, loot.y, 25, 0xffff00, 0.3);
          this.tweens.add({
            targets: glow,
            alpha: 0.1,
            duration: 1000,
            yoyo: true,
            repeat: -1
          });
          
          // Update glow position with loot
          this.time.addEvent({
            delay: 16,
            callback: () => {
              if (loot.active) {
                glow.setPosition(loot.x, loot.y);
              } else {
                glow.destroy();
              }
            },
            loop: true
          });
        }

        this.lootItems.push(loot);

        // Fade out and remove loot after some time
        this.time.delayedCall(8000, () => {
          if (loot.active) {
            this.tweens.add({
              targets: loot,
              alpha: 0,
              duration: 1000,
              onComplete: () => loot.destroy()
            });
          }
        });
      });
    }
  }

  private createLootTextures(): void {
    const graphics = this.add.graphics();

    // Coin (golden circle)
    graphics.clear();
    graphics.fillStyle(0xffd700);
    graphics.fillCircle(10, 10, 8);
    graphics.lineStyle(2, 0xffaa00);
    graphics.strokeCircle(10, 10, 8);
    graphics.generateTexture('loot_coin', 20, 20);

    // Gem (diamond shape)
    graphics.clear();
    graphics.fillStyle(0x00ff88);
    graphics.beginPath();
    graphics.moveTo(10, 2);
    graphics.lineTo(18, 10);
    graphics.lineTo(10, 18);
    graphics.lineTo(2, 10);
    graphics.closePath();
    graphics.fillPath();
    graphics.lineStyle(2, 0x00aa44);
    graphics.strokePath();
    graphics.generateTexture('loot_gem', 20, 20);

    // Potion (bottle shape)
    graphics.clear();
    graphics.fillStyle(0xff4444);
    graphics.fillRoundedRect(6, 8, 8, 10, 2);
    graphics.fillStyle(0x888888);
    graphics.fillRect(8, 6, 4, 4);
    graphics.generateTexture('loot_potion', 20, 20);

    // Scroll (rolled paper)
    graphics.clear();
    graphics.fillStyle(0xffffcc);
    graphics.fillRoundedRect(4, 6, 12, 8, 1);
    graphics.lineStyle(1, 0xccccaa);
    graphics.strokeRoundedRect(4, 6, 12, 8, 1);
    graphics.generateTexture('loot_scroll', 20, 20);

    // Chest (treasure chest)
    graphics.clear();
    graphics.fillStyle(0x8b4513);
    graphics.fillRoundedRect(4, 10, 12, 8, 2);
    graphics.fillStyle(0xffd700);
    graphics.fillRect(9, 12, 2, 2);
    graphics.generateTexture('loot_chest', 20, 20);

    // Star (special reward)
    graphics.clear();
    graphics.fillStyle(0xffff00);
    graphics.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 144 - 90) * Math.PI / 180;
      const x = 10 + Math.cos(angle) * 8;
      const y = 10 + Math.sin(angle) * 8;
      if (i === 0) graphics.moveTo(x, y);
      else graphics.lineTo(x, y);
    }
    graphics.closePath();
    graphics.fillPath();
    graphics.generateTexture('loot_star', 20, 20);

    graphics.destroy();
  }



  private createProgressionUI(): void {
    const { width, height } = this.scale;

    // XP gained text with animation
    const xpText = this.add.text(width / 2, height * 0.5, `+${this.xpGained} XP`, {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Animate XP text appearance
    xpText.setScale(0);
    this.tweens.add({
      targets: xpText,
      scale: 1.2,
      duration: 400,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: xpText,
          scale: 1,
          duration: 200
        });
      }
    });

    // XP bar background
    const barWidth = 300;
    const barHeight = 20;
    const barX = width / 2 - barWidth / 2;
    const barY = height * 0.55;

    const xpBarBg = this.add.graphics();
    xpBarBg.fillStyle(0x333333);
    xpBarBg.fillRect(barX, barY, barWidth, barHeight);
    xpBarBg.lineStyle(2, 0xffffff);
    xpBarBg.strokeRect(barX, barY, barWidth, barHeight);

    // XP bar fill (animated)
    this.xpBar = this.add.graphics();
    
    // Calculate XP progression
    const currentXP = this.playerData?.experience || 800;
    const xpForCurrentLevel = (this.oldLevel - 1) * 1000;
    const currentLevelProgress = currentXP - xpForCurrentLevel;
    const targetProgress = Math.min(currentLevelProgress + this.xpGained, 1000);
    
    // Animate XP bar filling
    this.tweens.addCounter({
      from: currentLevelProgress,
      to: targetProgress,
      duration: 2000,
      delay: 500,
      onUpdate: (tween) => {
        const value = tween.getValue();
        const fillWidth = (value / 1000) * barWidth;
        
        this.xpBar!.clear();
        this.xpBar!.fillStyle(0x00ff00);
        this.xpBar!.fillRect(barX, barY, fillWidth, barHeight);
        
        // Add glow effect when bar is filling
        if (value > currentLevelProgress) {
          this.xpBar!.lineStyle(2, 0x88ff88, 0.8);
          this.xpBar!.strokeRect(barX, barY, fillWidth, barHeight);
        }
      },
      onComplete: () => {
        // Level up effect if applicable
        if (this.newLevel > this.oldLevel) {
          this.playLevelUpEffect();
        }
      }
    });

    // Level text
    const levelText = this.oldLevel === this.newLevel ? 
      `Level ${this.oldLevel}` : 
      `Level ${this.oldLevel} → Level ${this.newLevel}`;
      
    this.add.text(width / 2, height * 0.6, levelText, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);
  }

  private playLevelUpEffect(): void {
    const { width, height } = this.scale;
    
    // Level up text
    const levelUpText = this.add.text(width / 2, height * 0.45, 'LEVEL UP!', {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Animate level up text
    levelUpText.setScale(0);
    this.tweens.add({
      targets: levelUpText,
      scale: 1.3,
      duration: 600,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: levelUpText,
          scale: 1,
          duration: 200,
          onComplete: () => {
            // Fade out after showing
            this.time.delayedCall(2000, () => {
              this.tweens.add({
                targets: levelUpText,
                alpha: 0,
                duration: 1000,
                onComplete: () => levelUpText.destroy()
              });
            });
          }
        });
      }
    });

    // Level up particle effect
    this.particleSystem?.createSpecialEffect(width / 2, height * 0.45, 'healer_sparkles');
  }

  private createLeaderboard(): void {
    const { width, height } = this.scale;

    // Leaderboard container
    this.leaderboard = this.add.container(width / 2, height * 0.75);

    // Leaderboard background
    const bgWidth = 350;
    const bgHeight = 180;
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRoundedRect(-bgWidth/2, -90, bgWidth, bgHeight, 10);
    bg.lineStyle(2, 0xffffff, 0.8);
    bg.strokeRoundedRect(-bgWidth/2, -90, bgWidth, bgHeight, 10);
    this.leaderboard.add(bg);

    // Leaderboard title
    const title = this.add.text(0, -75, 'Top 5 Contributors', {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    this.leaderboard.add(title);

    // Use real leaderboard data if available, otherwise mock data
    const topPlayers = this.leaderboardData.length > 0 ? 
      this.leaderboardData.slice(0, 5) : [
        { userId: 'player1', username: 'Player123', sessionDamage: 15420, rank: 1, characterClass: 'warrior', level: 15, totalDamage: 45000 },
        { userId: 'player2', username: 'BossSlayer', sessionDamage: 12890, rank: 2, characterClass: 'rogue', level: 13, totalDamage: 38000 },
        { userId: 'current', username: 'You', sessionDamage: this.playerData?.sessionDamage || 8750, rank: 3, characterClass: this.playerData?.characterClass || 'mage', level: this.playerData?.level || 12, totalDamage: this.playerData?.totalDamage || 25000 },
        { userId: 'player4', username: 'CritMaster', sessionDamage: 7230, rank: 4, characterClass: 'rogue', level: 11, totalDamage: 22000 },
        { userId: 'player5', username: 'Healer99', sessionDamage: 6100, rank: 5, characterClass: 'healer', level: 10, totalDamage: 18000 }
      ];

    topPlayers.forEach((player, index) => {
      const y = -45 + index * 22;
      const isCurrentPlayer = player.username === 'You' || player.userId === 'current';
      const color = isCurrentPlayer ? '#ffff00' : '#ffffff';
      const bgColor = isCurrentPlayer ? 0x444400 : 0x222222;
      
      // Player background highlight
      if (isCurrentPlayer) {
        const playerBg = this.add.graphics();
        playerBg.fillStyle(bgColor, 0.5);
        playerBg.fillRoundedRect(-160, y - 8, 320, 18, 5);
        this.leaderboard?.add(playerBg);
      }
      
      // Rank and class icon
      const rankText = this.add.text(-150, y, `${player.rank}.`, {
        fontFamily: 'Arial Black',
        fontSize: '12px',
        color: color,
      }).setOrigin(0, 0.5);
      this.leaderboard?.add(rankText);
      
      // Class indicator
      const classColor = this.getClassColor(player.characterClass);
      const classIcon = this.add.circle(-125, y, 4, classColor);
      this.leaderboard?.add(classIcon);
      
      // Player name and level
      const nameText = this.add.text(-110, y, `${player.username || 'Player'} (Lv.${player.level})`, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: color,
      }).setOrigin(0, 0.5);
      this.leaderboard?.add(nameText);
      
      // Damage dealt
      const damageText = this.add.text(140, y, `${player.sessionDamage.toLocaleString()}`, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: color,
      }).setOrigin(1, 0.5);
      this.leaderboard?.add(damageText);
    });

    // Animate leaderboard appearance
    if (this.leaderboard) {
      this.leaderboard.setAlpha(0);
      this.tweens.add({
        targets: this.leaderboard,
        alpha: 1,
        duration: 800,
        ease: 'Power2'
      });
    }
  }

  private getClassColor(characterClass: string): number {
    switch (characterClass) {
      case 'warrior': return 0xff0000;
      case 'mage': return 0x0000ff;
      case 'rogue': return 0x00ff00;
      case 'healer': return 0xffff00;
      default: return 0xffffff;
    }
  }

  private createNextBossPreview(): void {
    const { width, height } = this.scale;

    // Fetch next boss data from server
    this.fetchNextBossData().then((nextBossData) => {
      // Next boss preview container
      const previewContainer = this.add.container(width / 2, height * 0.9);
      
      // Enhanced preview background with boss theme colors
      const previewBg = this.add.graphics();
      previewBg.fillStyle(0x000000, 0.8);
      previewBg.fillRoundedRect(-220, -50, 440, 100, 15);
      previewBg.lineStyle(3, this.getBossThemeColor(nextBossData.nextBoss?.theme || 'gaming'));
      previewBg.strokeRoundedRect(-220, -50, 440, 100, 15);
      previewContainer.add(previewBg);

      // Next boss title with enhanced styling
      const nextBossText = this.add.text(0, -30, `🔮 Next Boss: ${nextBossData.nextBoss?.name || 'Unknown Boss'}`, {
        fontFamily: 'Arial Black',
        fontSize: '18px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center',
      }).setOrigin(0.5);
      previewContainer.add(nextBossText);

      // Add anticipation glow effect to next boss text
      this.tweens.add({
        targets: nextBossText,
        alpha: 0.7,
        duration: 1500,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });

      // Boss theme with enhanced styling
      const themeText = this.add.text(0, -10, `${nextBossData.nextBoss?.theme || 'Unknown'} Theme • Level ${nextBossData.nextBoss?.level || 1} • 50,000 HP`, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#cccccc',
        align: 'center',
      }).setOrigin(0.5);
      previewContainer.add(themeText);

      // Add anticipation message
      const anticipationText = this.add.text(0, 35, 'Prepare for tomorrow\'s battle!', {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: '#ffaa00',
        align: 'center',
      }).setOrigin(0.5);
      previewContainer.add(anticipationText);

      // Add subtle pulsing effect to anticipation text
      this.tweens.add({
        targets: anticipationText,
        scale: 1.1,
        duration: 2000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });

      // Enhanced countdown timer with server data
      const countdownText = this.add.text(0, 15, this.formatCountdown(nextBossData.countdown), {
        fontFamily: 'Arial Black',
        fontSize: '16px',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);
      previewContainer.add(countdownText);

      // Update countdown every second using server data
      this.time.addEvent({
        delay: 1000,
        callback: () => {
          // Recalculate countdown based on server spawn time
          const now = Date.now();
          const spawnTime = new Date(nextBossData.spawnTime).getTime();
          const timeRemaining = Math.max(0, spawnTime - now);
          
          const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
          const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
          
          countdownText.setText(`Spawns in: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        },
        loop: true
      });

      // Share Session button
      const shareButton = this.add.container(width / 2 - 80, height * 0.97);
      
      const shareBg = this.add.rectangle(0, 0, 150, 30, 0x4CAF50)
        .setStrokeStyle(2, 0xffffff);
      
      const shareText = this.add.text(0, 0, 'Share My Damage', {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#ffffff',
      }).setOrigin(0.5);

      shareButton.add([shareBg, shareText]);

      // Share button hover effects
      shareBg.setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
          shareBg.setFillStyle(0x45a049);
        })
        .on('pointerout', () => {
          shareBg.setFillStyle(0x4CAF50);
        })
        .on('pointerdown', () => {
          this.shareSessionRecap();
        });

      // Return to menu button
      const returnButton = this.add.container(width / 2 + 80, height * 0.97);
      
      const buttonBg = this.add.rectangle(0, 0, 150, 30, GameConstants.COLORS.BUTTON_ENABLED)
        .setStrokeStyle(2, 0xffffff);
      
      const buttonText = this.add.text(0, 0, 'Return to Menu', {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#ffffff',
      }).setOrigin(0.5);

      returnButton.add([buttonBg, buttonText]);

      // Button hover effects
      buttonBg.setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
          buttonBg.setFillStyle(GameConstants.COLORS.BUTTON_HOVER);
        })
        .on('pointerout', () => {
          buttonBg.setFillStyle(GameConstants.COLORS.BUTTON_ENABLED);
        })
        .on('pointerdown', () => {
          if (this.transitionSystem) {
            this.transitionSystem.quickFade('Splash');
          }
        });

      // Animate preview container appearance
      previewContainer.setAlpha(0);
      this.tweens.add({
        targets: previewContainer,
        alpha: 1,
        duration: 1000,
        ease: 'Power2'
      });
    }).catch((error) => {
      console.error('Failed to fetch next boss data:', error);
      // Fallback to local next boss calculation
      this.createFallbackNextBossPreview();
    });
  }

  private getNextBoss(): BossData {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayOfWeek = tomorrow.getDay();
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = days[dayOfWeek];
    return getBossByDay(dayName || 'monday');
  }

  private async fetchNextBossData(): Promise<any> {
    try {
      const response = await fetch('/api/nextBoss');
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          return data;
        }
      }
      throw new Error('Failed to fetch next boss data');
    } catch (error) {
      console.error('Error fetching next boss data:', error);
      throw error;
    }
  }

  private formatCountdown(countdown: { hours: number; minutes: number; seconds: number }): string {
    return `Spawns in: ${countdown.hours.toString().padStart(2, '0')}:${countdown.minutes.toString().padStart(2, '0')}:${countdown.seconds.toString().padStart(2, '0')}`;
  }

  private getBossThemeColor(theme: string): number {
    const themeColors: Record<string, number> = {
      'gaming': 0xff0000,
      'internet': 0x00ff00,
      'social_media': 0xff69b4,
      'work': 0xffff00,
      'entertainment': 0x800080,
      'sports': 0x000000,
      'memes': 0xffa500
    };
    return themeColors[theme] || 0xffffff;
  }

  private createFallbackNextBossPreview(): void {
    const { width, height } = this.scale;
    
    // Fallback to local calculation
    const nextBoss = this.getNextBoss();
    
    // Simple fallback preview
    const previewContainer = this.add.container(width / 2, height * 0.9);
    
    const previewBg = this.add.graphics();
    previewBg.fillStyle(0x000000, 0.6);
    previewBg.fillRoundedRect(-200, -40, 400, 80, 10);
    previewBg.lineStyle(2, 0x666666);
    previewBg.strokeRoundedRect(-200, -40, 400, 80, 10);
    previewContainer.add(previewBg);

    const nextBossText = this.add.text(0, -15, `Next Boss: ${nextBoss.name}`, {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);
    previewContainer.add(nextBossText);

    const countdownText = this.add.text(0, 10, this.getCountdownText(), {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffff00',
    }).setOrigin(0.5);
    previewContainer.add(countdownText);

    previewContainer.setAlpha(0);
    this.tweens.add({
      targets: previewContainer,
      alpha: 1,
      duration: 1000,
      ease: 'Power2'
    });
  }

  private getCountdownText(): string {
    const now = new Date();
    const next8AM = new Date();
    next8AM.setDate(next8AM.getDate() + 1);
    next8AM.setHours(8, 0, 0, 0); // Next boss spawns at 8 AM, not midnight
    
    // If it's already past 8 AM today, set for tomorrow
    if (now.getHours() >= 8) {
      next8AM.setDate(next8AM.getDate() + 1);
    }
    
    const timeUntilNext = next8AM.getTime() - now.getTime();
    const hours = Math.floor(timeUntilNext / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilNext % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeUntilNext % (1000 * 60)) / 1000);
    
    return `Spawns in: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  private async shareSessionRecap(): Promise<void> {
    try {
      const response = await fetch('/api/share-session-recap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          // Show success message
          const { width, height } = this.scale;
          const successText = this.add.text(width / 2, height / 2, 'Session shared to r/RaidDay!', {
            fontFamily: 'Arial Black',
            fontSize: '18px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 2,
          }).setOrigin(0.5);

          // Animate success message
          successText.setAlpha(0);
          this.tweens.add({
            targets: successText,
            alpha: 1,
            duration: 300,
            onComplete: () => {
              this.time.delayedCall(2000, () => {
                this.tweens.add({
                  targets: successText,
                  alpha: 0,
                  duration: 300,
                  onComplete: () => successText.destroy()
                });
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to share session recap:', error);
      
      // Show error message
      const { width, height } = this.scale;
      const errorText = this.add.text(width / 2, height / 2, 'Failed to share session', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ff4444',
      }).setOrigin(0.5);

      this.time.delayedCall(2000, () => errorText.destroy());
    }
  }

  private async createVictoryPost(): Promise<void> {
    try {
      const response = await fetch('/api/create-victory-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.victoryPost) {
          console.log('Victory post created:', data.victoryPost);
          
          // Show enhanced victory post notification with details
          const { width } = this.scale;
          const postText = this.add.text(width / 2, 50, '🎉 Victory post created on r/RaidDay!', {
            fontFamily: 'Arial Black',
            fontSize: '16px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2,
          }).setOrigin(0.5);

          // Show top contributors notification
          const contributorsText = this.add.text(width / 2, 75, 
            `Top contributors: ${data.victoryPost.topPlayers.slice(0, 3).map((p: any) => p.redditUsername).join(', ')}`, {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#ffffff',
            align: 'center',
          }).setOrigin(0.5);

          // Animate notifications
          postText.setAlpha(0);
          contributorsText.setAlpha(0);
          
          this.tweens.add({
            targets: [postText, contributorsText],
            alpha: 1,
            duration: 500,
            onComplete: () => {
              this.time.delayedCall(4000, () => {
                this.tweens.add({
                  targets: [postText, contributorsText],
                  alpha: 0,
                  duration: 500,
                  onComplete: () => {
                    postText.destroy();
                    contributorsText.destroy();
                  }
                });
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to create victory post:', error);
      
      // Show error notification
      const { width } = this.scale;
      const errorText = this.add.text(width / 2, 50, 'Failed to create victory post', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ff4444',
      }).setOrigin(0.5);

      this.time.delayedCall(2000, () => errorText.destroy());
    }
  }

  /**
   * Setup synchronization system callbacks for leaderboard updates
   */
  private setupSynchronizationCallbacks(): void {
    if (!this.synchronizationSystem) return;

    this.synchronizationSystem.setCallbacks({
      onBossHPSync: (_data) => {
        // Boss HP sync not needed in victory scene
        console.log('Boss HP sync received in victory scene (ignored)');
      },
      
      onCommunityDPSSync: (data) => {
        // Update community statistics for final leaderboard
        console.log(`Community DPS sync: ${data.attacksPerMinute} APM, ${data.activePlayers} players`);
        
        // Update leaderboard if we have recent attack data
        if (data.recentAttacks.length > 0) {
          this.updateLeaderboardWithRecentData(data.recentAttacks);
        }
      },
      
      onPlayerDataSync: (data) => {
        // Update final player statistics
        if (data.sessionStats) {
          console.log(`Final player stats: Damage ${data.sessionStats.sessionDamage}, Rank: ${data.sessionStats.playerRank}`);
          
          // Update displayed stats if they changed
          if (this.playerData) {
            // Note: PlayerData interface may not have sessionDamage and rank fields
            // These would be handled separately in the victory scene display
            this.updateDisplayedStats();
          }
        }
      },
      
      onSyncError: (error) => {
        console.error('Synchronization error in victory scene:', error);
        // Victory scene can continue without sync data
      }
    });
  }

  /**
   * Update leaderboard with recent attack data
   */
  private updateLeaderboardWithRecentData(recentAttacks: any[]): void {
    // Convert recent attacks to leaderboard entries and update display
    // This would update the leaderboard shown in the victory scene
    console.log('Updating leaderboard with recent attack data:', recentAttacks.length, 'attacks');
  }

  /**
   * Update displayed player statistics
   */
  private updateDisplayedStats(): void {
    // Update any displayed player stats in the victory scene
    console.log('Updating displayed player statistics');
  }

  private refreshLayout(): void {
    const { width, height } = this.scale;

    // Resize camera
    this.cameras.resize(width, height);

    // Scale factor for responsive design
    const scaleFactor = Math.min(width / GameConstants.GAME_WIDTH, height / GameConstants.GAME_HEIGHT, 1);

    // Reposition main elements
    if (this.celebrationText) {
      this.celebrationText.setPosition(width / 2, height * 0.2);
      this.celebrationText.setScale(scaleFactor);
    }

    if (this.leaderboard) {
      this.leaderboard.setPosition(width / 2, height * 0.75);
      this.leaderboard.setScale(scaleFactor);
    }

    // Update loot physics world bounds
    if (this.physics.world) {
      this.physics.world.setBounds(0, 0, width, height);
    }
  }
}