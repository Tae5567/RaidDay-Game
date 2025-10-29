import { Scene } from 'phaser';
import { BossEntity, getCurrentBoss } from '../entities/BossEntity';
import { PlayerCharacter, CharacterClass } from '../entities/PlayerCharacter';
import { EnergySystem } from '../systems/EnergySystem';
import { CombatSystem } from '../systems/CombatSystem';
import { GameConstants } from '../utils/GameConstants';
import { MobileUtils } from '../utils/MobileUtils';

/**
 * Battle - Main battle scene where combat takes place
 * Simplified version with better text visibility and engaging gameplay
 */
export class Battle extends Scene {
  // Core entities
  private boss?: BossEntity;
  private playerCharacter?: PlayerCharacter;
  private communityPlayers: PlayerCharacter[] = [];

  // Systems
  private energySystem?: EnergySystem;
  private combatSystem?: CombatSystem;

  // Game state
  private selectedClass?: CharacterClass;
  private bossCurrentHP: number = 80000;
  private bossMaxHP: number = 80000;
  private bossPhase: number = 1;
  private sessionDamage: number = 0;
  private playerRank: number = 1;
  private activeRaiders: number = 42;
  
  // Engagement mechanics
  private comboCount: number = 0;
  private lastAttackTime: number = 0;
  private comboTimeWindow: number = 3000; // 3 seconds to maintain combo
  private isAttacking: boolean = false;

  // UI elements
  private bossHPBar?: Phaser.GameObjects.Graphics;
  private bossHPText?: Phaser.GameObjects.Text;
  private statsText?: Phaser.GameObjects.Text;
  private comboText?: Phaser.GameObjects.Text;

  constructor() {
    super('Battle');
  }

  init(): void {
    // Get selected class from registry with fallback
    this.selectedClass = this.registry.get('selectedClass') as CharacterClass || CharacterClass.WARRIOR;
    console.log('Battle scene initialized with class:', this.selectedClass);
    
    // Reset state
    this.communityPlayers = [];
    this.bossCurrentHP = 80000;
    this.bossMaxHP = 80000;
    this.bossPhase = 1;
    this.sessionDamage = 0;
    this.playerRank = 1;
    this.activeRaiders = 42;
    this.comboCount = 0;
    this.lastAttackTime = 0;
    this.isAttacking = false;
  }

  create(): void {
    console.log('Battle scene starting...');
    
    this.setupSystems();
    this.createBackground();
    this.createEntities();
    this.createUI();
    this.setupControls();
    this.startGameLoop();
    this.showGameplayTip();
    
    console.log('Battle scene created successfully');
  }

  private setupSystems(): void {
    this.energySystem = new EnergySystem();
    this.combatSystem = new CombatSystem();
  }

  private createBackground(): void {
    const { width, height } = this.scale;
    
    // Create appealing gradient background
    const graphics = this.add.graphics();
    
    // Sky gradient (top to middle)
    graphics.fillGradientStyle(0x2c3e50, 0x34495e, 0x2c3e50, 0x34495e);
    graphics.fillRect(0, 0, width, height * 0.6);
    
    // Ground gradient (middle to bottom)
    graphics.fillGradientStyle(0x27ae60, 0x2ecc71, 0x16a085, 0x1abc9c);
    graphics.fillRect(0, height * 0.6, width, height * 0.4);
    
    // Add some atmospheric effects
    for (let i = 0; i < 20; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height * 0.5),
        1,
        0xffffff,
        0.8
      );
      
      // Twinkling effect
      this.tweens.add({
        targets: star,
        alpha: 0.2,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Battle ground line with glow effect
    const groundY = height - 120;
    
    // Glow effect
    graphics.lineStyle(6, 0x3498db, 0.3);
    graphics.lineBetween(0, groundY, width, groundY);
    
    // Main line
    graphics.lineStyle(2, 0x3498db, 1);
    graphics.lineBetween(0, groundY, width, groundY);
  }

  private createEntities(): void {
    const { width, height } = this.scale;

    // Create boss (center-top of battle area)
    const currentBossData = getCurrentBoss();
    this.boss = new BossEntity(
      this,
      width / 2,
      height * 0.3,
      currentBossData
    );

    // Create player character (center-bottom of battle area)
    this.playerCharacter = new PlayerCharacter(
      this,
      width / 2,
      height - 150,
      this.selectedClass || CharacterClass.WARRIOR
    );
    
    // Highlight the player character
    this.highlightPlayerCharacter();

    // Create community players (spread across battle area)
    this.createCommunityPlayers();
  }

  private createCommunityPlayers(): void {
    const { width, height } = this.scale;
    const classes = [CharacterClass.WARRIOR, CharacterClass.MAGE, CharacterClass.ROGUE, CharacterClass.HEALER];
    
    // Create 4 community players positioned around the real player
    for (let i = 0; i < 4; i++) {
      // Position them to the left and right of the player
      const playerX = width / 2;
      const offsetX = (i < 2) ? -120 - (i * 80) : 120 + ((i - 2) * 80);
      const x = playerX + offsetX;
      const y = height - 150;
      
      const communityPlayer = new PlayerCharacter(
        this,
        x,
        y,
        classes[i % classes.length] || CharacterClass.WARRIOR
      );
      
      // Make community players slightly transparent and smaller
      communityPlayer.setAlpha(0.7);
      communityPlayer.setScale(1.2);
      
      this.communityPlayers.push(communityPlayer);
    }
  }

  private createUI(): void {
    const { width, height } = this.scale;
    
    // Boss info in top center with better visibility
    const currentBossData = getCurrentBoss();
    this.add.text(width / 2, 25, `${currentBossData.name} • Level ${currentBossData.level}`, {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Boss HP bar with better visibility
    const hpBarBg = this.add.graphics();
    hpBarBg.fillStyle(0x333333);
    hpBarBg.fillRect(width / 2 - 150, 45, 300, 16);
    hpBarBg.lineStyle(2, 0xffffff);
    hpBarBg.strokeRect(width / 2 - 150, 45, 300, 16);
    
    // HP bar (will be updated)
    this.bossHPBar = this.add.graphics();
    
    // HP text
    this.bossHPText = this.add.text(width / 2, 70, `${this.bossCurrentHP.toLocaleString()} / ${this.bossMaxHP.toLocaleString()}`, {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Player stats in bottom left corner
    this.statsText = this.add.text(10, height - 90, '', {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    });

    // Combo display in top left
    this.comboText = this.add.text(10, 10, '', {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 2,
    });

    // Community stats in bottom right corner
    this.add.text(width - 10, height - 60, 'Community:', {
      fontFamily: 'Arial Black',
      fontSize: '12px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(1, 0);

    this.add.text(width - 10, height - 45, `Raiders: ${this.activeRaiders}`, {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(1, 0);
    
    this.createButtons();
    this.updateUI();
  }

  private createButtons(): void {
    const { width, height } = this.scale;
    
    // Attack button with better interaction
    const attackButton = this.add.rectangle(width / 2 - 80, height - 50, 120, 40, GameConstants.COLORS.BUTTON_ENABLED)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        attackButton.setFillStyle(0x3a7bc8);
        this.performAttack();
      })
      .on('pointerup', () => {
        attackButton.setFillStyle(GameConstants.COLORS.BUTTON_ENABLED);
      })
      .on('pointerout', () => {
        attackButton.setFillStyle(GameConstants.COLORS.BUTTON_ENABLED);
      });
      
    this.add.text(width / 2 - 80, height - 50, 'ATTACK', {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Special button with better interaction
    const specialButton = this.add.rectangle(width / 2 + 80, height - 50, 120, 40, GameConstants.COLORS.BUTTON_ENABLED)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        specialButton.setFillStyle(0x3a7bc8);
        this.performSpecialAttack();
      })
      .on('pointerup', () => {
        specialButton.setFillStyle(GameConstants.COLORS.BUTTON_ENABLED);
      })
      .on('pointerout', () => {
        specialButton.setFillStyle(GameConstants.COLORS.BUTTON_ENABLED);
      });
      
    this.add.text(width / 2 + 80, height - 50, 'SPECIAL', {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
  }

  private setupControls(): void {
    // Keyboard controls for desktop
    if (!MobileUtils.isMobile()) {
      this.input.keyboard?.on('keydown-SPACE', () => this.performAttack());
      this.input.keyboard?.on('keydown-SHIFT', () => this.performSpecialAttack());
    }
  }

  private performAttack(): void {
    console.log('Attack performed!');
    
    if (this.isAttacking) {
      console.log('Already attacking');
      return;
    }
    
    if (!this.energySystem || !this.playerCharacter || !this.combatSystem || !this.boss) {
      console.log('Missing required systems for attack');
      return;
    }

    // Check energy
    if (!this.energySystem.canAttack()) {
      console.log('Cannot attack - no energy');
      return;
    }

    // Consume energy
    if (!this.energySystem.consumeEnergy()) {
      console.log('Failed to consume energy');
      return;
    }

    this.isAttacking = true;

    // Update combo system
    const currentTime = Date.now();
    if (currentTime - this.lastAttackTime <= this.comboTimeWindow) {
      this.comboCount++;
    } else {
      this.comboCount = 1;
    }
    this.lastAttackTime = currentTime;

    // Calculate damage with combo bonus
    const hasFullEnergy = this.energySystem.hasFullEnergy();
    let attackResult = this.combatSystem.calculateDamage(
      this.playerCharacter.getCharacterClass(),
      this.playerCharacter.getLevel(),
      hasFullEnergy,
      this.bossPhase
    );

    // Apply combo bonus (5% per combo hit, max 50%)
    const comboBonus = Math.min(this.comboCount * 0.05, 0.5);
    attackResult.damage = Math.floor(attackResult.damage * (1 + comboBonus));

    // Simple attack animation - move player forward and back
    const originalX = this.playerCharacter.x;
    
    // Move forward with combo speed bonus
    const attackSpeed = Math.max(150, 250 - (this.comboCount * 10));
    
    this.tweens.add({
      targets: this.playerCharacter,
      x: originalX + 60,
      duration: attackSpeed,
      ease: 'Power2.Out',
      onComplete: () => {
        // Show damage with combo info
        this.showDamageNumber(attackResult.damage, attackResult.isCritical, this.comboCount);
        
        // Boss hit effect
        this.boss?.setTint(0xff0000);
        this.time.delayedCall(100, () => {
          this.boss?.clearTint();
        });

        // Screen shake for impact (stronger with combo)
        const baseShake = attackResult.isCritical ? 5 : 2;
        const comboShake = Math.min(this.comboCount * 0.5, 3);
        this.cameras.main.shake(200, baseShake + comboShake);

        // Move back
        this.tweens.add({
          targets: this.playerCharacter,
          x: originalX,
          duration: attackSpeed + 50,
          ease: 'Power2.In',
          onComplete: () => {
            this.isAttacking = false;
          }
        });
      }
    });

    // Apply damage to boss
    this.bossCurrentHP = Math.max(0, this.bossCurrentHP - attackResult.damage);
    this.sessionDamage += attackResult.damage;

    // Check for boss phase transition
    this.checkBossPhase();

    // Check for victory
    if (this.bossCurrentHP <= 0) {
      this.time.delayedCall(500, () => {
        this.transitionToVictory();
      });
    }

    this.updateUI();
  }

  private performSpecialAttack(): void {
    console.log('Special attack performed!');
    
    if (this.isAttacking) {
      return;
    }
    
    if (!this.energySystem || !this.playerCharacter || !this.combatSystem || !this.boss) {
      return;
    }

    // Check if special ability can be used (requires 3 energy)
    if (this.energySystem.getEnergyState().current < 3) {
      console.log('Not enough energy for special attack');
      return;
    }

    // Consume 3 energy for special
    for (let i = 0; i < 3; i++) {
      if (!this.energySystem.consumeEnergy()) {
        break;
      }
    }

    this.isAttacking = true;

    // Calculate special damage (3x normal damage)
    const baseDamage = this.combatSystem.calculateDamage(
      this.playerCharacter.getCharacterClass(),
      this.playerCharacter.getLevel(),
      false,
      this.bossPhase
    );

    const specialDamage = baseDamage.damage * 3;

    // Special attack animation
    const originalX = this.playerCharacter.x;
    
    // Charge up effect
    this.playerCharacter.setTint(0xffff00);
    
    this.tweens.add({
      targets: this.playerCharacter,
      scaleX: 1.8,
      scaleY: 1.8,
      duration: 300,
      yoyo: true,
      onComplete: () => {
        if (this.playerCharacter) {
          this.playerCharacter.clearTint();
        }
        
        // Move forward for special attack
        this.tweens.add({
          targets: this.playerCharacter,
          x: originalX + 80,
          duration: 200,
          ease: 'Power3.Out',
          onComplete: () => {
            // Show special damage
            this.showDamageNumber(specialDamage, true, 0, true);
            
            // Boss hit effect
            this.boss?.setTint(0xff0000);
            this.time.delayedCall(200, () => {
              this.boss?.clearTint();
            });

            // Big screen shake
            this.cameras.main.shake(400, 8);

            // Move back
            this.tweens.add({
              targets: this.playerCharacter,
              x: originalX,
              duration: 300,
              ease: 'Power2.In',
              onComplete: () => {
                this.isAttacking = false;
              }
            });
          }
        });
      }
    });

    // Apply damage to boss
    this.bossCurrentHP = Math.max(0, this.bossCurrentHP - specialDamage);
    this.sessionDamage += specialDamage;

    // Check for boss phase transition
    this.checkBossPhase();

    // Check for victory
    if (this.bossCurrentHP <= 0) {
      this.time.delayedCall(800, () => {
        this.transitionToVictory();
      });
    }

    this.updateUI();
  }

  private showDamageNumber(damage: number, isCritical: boolean, comboCount: number = 0, isSpecial: boolean = false): void {
    if (!this.boss) return;

    let color = '#ffff00';
    let fontSize = '24px';
    
    if (isSpecial) {
      color = '#ff00ff';
      fontSize = '32px';
    } else if (isCritical) {
      color = '#ff6600';
      fontSize = '28px';
    }

    const text = (isCritical || isSpecial) ? `${damage}!` : damage.toString();

    const damageText = this.add.text(this.boss.x, this.boss.y - 50, text, {
      fontFamily: 'Arial Black',
      fontSize,
      color,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Animate damage number
    this.tweens.add({
      targets: damageText,
      y: damageText.y - 80,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => damageText.destroy()
    });

    // Show status text
    if (isSpecial) {
      const statusText = this.add.text(this.boss.x, this.boss.y - 80, 'SPECIAL!', {
        fontFamily: 'Arial Black',
        fontSize: '18px',
        color: '#ff00ff',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);

      this.tweens.add({
        targets: statusText,
        y: statusText.y - 60,
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => statusText.destroy()
      });
    } else if (isCritical) {
      const statusText = this.add.text(this.boss.x, this.boss.y - 80, 'CRITICAL!', {
        fontFamily: 'Arial Black',
        fontSize: '16px',
        color: '#ff6600',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);

      this.tweens.add({
        targets: statusText,
        y: statusText.y - 60,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => statusText.destroy()
      });
    }

    // Show combo text
    if (comboCount > 1) {
      const comboText = this.add.text(this.boss.x + 40, this.boss.y - 30, `${comboCount}x COMBO!`, {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: '#00ff00',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);

      this.tweens.add({
        targets: comboText,
        y: comboText.y - 40,
        alpha: 0,
        duration: 600,
        ease: 'Power2',
        onComplete: () => comboText.destroy()
      });
    }
  }

  private checkBossPhase(): void {
    const hpPercentage = this.bossCurrentHP / this.bossMaxHP;
    
    if (hpPercentage <= GameConstants.BOSS_PHASE2_THRESHOLD && this.bossPhase === 1) {
      this.bossPhase = 2;
      if (this.boss) {
        this.boss.enterPhase2();
      }
      
      // Visual indication of phase change
      this.cameras.main.shake(GameConstants.SCREEN_SHAKE_DURATION, GameConstants.SHAKE_BOSS_PHASE);
      
      // Show phase change message
      const phaseText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'PHASE 2!', {
        fontFamily: 'Arial Black',
        fontSize: '32px',
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5);

      this.tweens.add({
        targets: phaseText,
        alpha: 0,
        duration: 2000,
        ease: 'Power2',
        onComplete: () => phaseText.destroy()
      });
    }
  }

  private updateUI(): void {
    // Update HP bar
    if (this.bossHPBar) {
      const { width } = this.scale;
      const hpPercentage = this.bossCurrentHP / this.bossMaxHP;
      const barWidth = 300 * hpPercentage;
      
      this.bossHPBar.clear();
      this.bossHPBar.fillStyle(GameConstants.COLORS.HP_BAR);
      this.bossHPBar.fillRect(width / 2 - 150, 45, barWidth, 16);
    }
    
    // Update HP text
    if (this.bossHPText) {
      this.bossHPText.setText(`${this.bossCurrentHP.toLocaleString()} / ${this.bossMaxHP.toLocaleString()}`);
    }

    // Update stats
    if (this.statsText) {
      this.statsText.setText(
        `Your Stats:\nDamage: ${this.sessionDamage.toLocaleString()}\nRank: #${this.playerRank}`
      );
    }

    // Update combo display
    if (this.comboText) {
      if (this.comboCount > 1) {
        this.comboText.setText(`${this.comboCount}x COMBO!`);
        this.comboText.setVisible(true);
      } else {
        this.comboText.setVisible(false);
      }
    }
  }

  private startGameLoop(): void {
    // Update energy system every 100ms
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (this.energySystem) {
          this.energySystem.updateCooldowns(100);
        }
        
        // Check combo timeout
        this.checkComboTimeout();
      },
      loop: true
    });

    // Simulate community attacks
    this.time.addEvent({
      delay: Phaser.Math.Between(2000, 4000),
      callback: () => this.simulateCommunityAttack(),
      loop: true
    });
  }

  private checkComboTimeout(): void {
    const currentTime = Date.now();
    if (this.comboCount > 0 && currentTime - this.lastAttackTime > this.comboTimeWindow) {
      if (this.comboCount > 1) {
        // Show combo lost message
        const comboLostText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 50, 'COMBO LOST!', {
          fontFamily: 'Arial Black',
          fontSize: '16px',
          color: '#ff0000',
          stroke: '#000000',
          strokeThickness: 2,
        }).setOrigin(0.5);

        this.tweens.add({
          targets: comboLostText,
          alpha: 0,
          duration: 1000,
          ease: 'Power2',
          onComplete: () => comboLostText.destroy()
        });
      }
      this.comboCount = 0;
      this.updateUI();
    }
  }

  private simulateCommunityAttack(): void {
    if (this.communityPlayers.length === 0 || !this.boss) return;

    // Pick a random community player
    const attacker = Phaser.Utils.Array.GetRandom(this.communityPlayers);
    if (!attacker) return;

    // Simple attack animation
    const originalX = attacker.x;
    
    this.tweens.add({
      targets: attacker,
      x: originalX + 20,
      duration: 300,
      yoyo: true,
      ease: 'Power2',
      onComplete: () => {
        // Show community damage
        const damage = Phaser.Math.Between(150, 400);
        this.showDamageNumber(damage, false, 0, false);
      }
    });
  }

  private showGameplayTip(): void {
    const { width, height } = this.scale;
    
    const tipText = this.add.text(width / 2, height / 2 - 100, 
      'Click ATTACK rapidly to build combos!\nHigher combos = More damage!\nSpecial costs 3 energy but deals 3x damage!', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center'
    }).setOrigin(0.5).setAlpha(0);

    // Fade in tip
    this.tweens.add({
      targets: tipText,
      alpha: 1,
      duration: 500,
      onComplete: () => {
        // Fade out after 4 seconds
        this.time.delayedCall(4000, () => {
          this.tweens.add({
            targets: tipText,
            alpha: 0,
            duration: 1000,
            onComplete: () => tipText.destroy()
          });
        });
      }
    });
  }

  private highlightPlayerCharacter(): void {
    if (!this.playerCharacter) return;

    // Add a glow effect around the player
    const glow = this.add.circle(this.playerCharacter.x, this.playerCharacter.y, 40, 0xffff00, 0.2);
    this.tweens.add({
      targets: glow,
      alpha: 0.1,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // Add "YOU" label above the player
    this.add.text(this.playerCharacter.x, this.playerCharacter.y - 50, 'YOU', {
      fontFamily: 'Arial Black',
      fontSize: '12px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
  }

  private transitionToVictory(): void {
    // Get current boss data
    const bossData = getCurrentBoss();

    // Start victory scene with data
    this.scene.start('Victory', {
      bossData: bossData,
      sessionDamage: this.sessionDamage,
      playerRank: this.playerRank
    });
  }
}