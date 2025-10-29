import { Scene } from 'phaser';
import { BossEntity, getCurrentBoss } from '../entities/BossEntity';
import { PlayerCharacter, CharacterClass } from '../entities/PlayerCharacter';
import { SessionSystem } from '../systems/SessionSystem';
import { DamageCalculator } from '../utils/DamageCalculator';
import { ActionButton, ButtonState } from '../ui/ActionButton';
import { DamageNumberPool } from '../ui/DamageNumber';
import { GameConstants } from '../utils/GameConstants';
import { MobileUtils } from '../utils/MobileUtils';
import { ResponsiveLayoutSystem } from '../systems/ResponsiveLayoutSystem';
import { CameraEffectsSystem } from '../systems/CameraEffectsSystem';
import { ParticleSystem } from '../systems/ParticleSystem';
import { AnimationSystem } from '../systems/AnimationSystem';
import { PerformanceMonitor } from '../systems/PerformanceMonitor';
import { TransitionSystem } from '../systems/TransitionSystem';

/**
 * Battle - Main battle scene where combat takes place
 * Simplified 2-minute session with attack button and visual feedback
 */
export class Battle extends Scene {
  // Core entities
  private boss?: BossEntity;
  private playerCharacter?: PlayerCharacter;

  // Systems
  private sessionSystem?: SessionSystem;
  private damageNumberPool?: DamageNumberPool;
  private responsiveLayout?: ResponsiveLayoutSystem;
  private cameraEffects?: CameraEffectsSystem;
  private particleSystem?: ParticleSystem;
  private animationSystem?: AnimationSystem;
  private performanceMonitor?: PerformanceMonitor;
  private transitionSystem?: TransitionSystem;

  // Game state
  private selectedClass: CharacterClass = CharacterClass.WARRIOR;
  private bossCurrentHP: number = GameConstants.BOSS_MAX_HP;
  private bossMaxHP: number = GameConstants.BOSS_MAX_HP;
  private playerCurrentHP: number = GameConstants.PLAYER_MAX_HP;
  private playerMaxHP: number = GameConstants.PLAYER_MAX_HP;
  private sessionDamage: number = 0;
  private sessionAttackCount: number = 0;
  private isAttacking: boolean = false;
  private bossAttackTimer?: Phaser.Time.TimerEvent;

  // UI elements
  private bossHPBar?: Phaser.GameObjects.Graphics;
  private bossHPText?: Phaser.GameObjects.Text;
  private playerHPBar?: Phaser.GameObjects.Graphics;
  private playerHPText?: Phaser.GameObjects.Text;
  private attackButton?: ActionButton;

  constructor() {
    super('Battle');
  }

  init(): void {
    // Get selected class from registry with fallback
    this.selectedClass = this.registry.get('selectedClass') as CharacterClass || CharacterClass.WARRIOR;
    console.log('Battle scene initialized with class:', this.selectedClass);
    
    // Reset state
    this.bossCurrentHP = GameConstants.BOSS_MAX_HP;
    this.bossMaxHP = GameConstants.BOSS_MAX_HP;
    this.playerCurrentHP = GameConstants.PLAYER_MAX_HP;
    this.playerMaxHP = GameConstants.PLAYER_MAX_HP;
    this.sessionDamage = 0;
    this.sessionAttackCount = 0;
    this.isAttacking = false;
  }

  async create(): Promise<void> {
    console.log('Battle scene starting...');
    
    this.setupSystems();
    
    // Smooth transition in
    if (this.transitionSystem) {
      await this.transitionSystem.transitionIn({
        type: 'zoom',
        duration: GameConstants.TRANSITION_DURATION_NORMAL
      });
    }
    
    this.createBackground();
    await this.createEntities();
    this.createUI();
    
    // Animate entrance of entities and UI
    await this.animateSceneEntrance();
    
    this.setupControls();
    this.startSession();
    
    // Handle screen resize
    this.scale.on('resize', () => this.handleResize());
    
    console.log('Battle scene created successfully');
  }

  private async animateSceneEntrance(): Promise<void> {
    // Animate boss entrance first
    if (this.boss && this.animationSystem) {
      await this.animationSystem.animateBossEntrance(this.boss);
    }
    
    // Then animate player entrance
    if (this.playerCharacter && this.animationSystem) {
      await this.animationSystem.animatePlayerEntrance(this.playerCharacter);
    }
    
    // Finally animate UI elements
    const uiElements: Phaser.GameObjects.GameObject[] = [];
    if (this.bossHPText) uiElements.push(this.bossHPText);
    if (this.sessionInfoText) uiElements.push(this.sessionInfoText);
    if (this.attackButton) uiElements.push(this.attackButton);
    
    if (this.animationSystem && uiElements.length > 0) {
      await this.animationSystem.animateUIEntrance(uiElements);
    }
  }

  private handleResize(): void {
    const { width, height } = this.scale;
    
    // Resize camera to fill entire screen
    this.cameras.main.setViewport(0, 0, width, height);
    
    // Update UI positions
    this.updateUI();
  }

  private setupSystems(): void {
    this.sessionSystem = new SessionSystem(this);
    this.damageNumberPool = new DamageNumberPool(this);
    this.responsiveLayout = new ResponsiveLayoutSystem(this);
    this.cameraEffects = new CameraEffectsSystem(this, MobileUtils.isMobile());
    this.particleSystem = new ParticleSystem(this, MobileUtils.isMobile());
    this.animationSystem = new AnimationSystem(this);
    this.transitionSystem = new TransitionSystem(this);
    
    // Setup performance monitoring (Requirements 6.3, 6.4)
    this.performanceMonitor = new PerformanceMonitor(this);
    this.setupPerformanceOptimizations();
    
    // Setup mobile optimizations
    MobileUtils.setupTouchControls(this);
    MobileUtils.optimizeForMobile(this);
    
    // Listen for camera shake events
    this.events.on('camera-shake', (intensity: number) => {
      this.cameraEffects?.screenShake(intensity);
    });
  }

  private setupPerformanceOptimizations(): void {
    if (!this.performanceMonitor) return;

    // Handle quality changes automatically
    this.performanceMonitor.onQualityChange((settings) => {
      // Update particle system limits
      this.particleSystem?.setMaxParticles(settings.particleCount);
      this.particleSystem?.setEffectsEnabled(settings.enableParticleEffects);
      
      // Update camera effects
      this.cameraEffects?.setMobileMode(!settings.enableScreenShake);
      
      // Update animation system
      this.animationSystem?.setMobileMode(settings.animationQuality === 'low');
      
      console.log('Performance settings updated:', settings);
    });

    // Handle performance warnings
    this.performanceMonitor.onPerformanceWarning((metrics) => {
      console.warn('Performance warning:', metrics);
      
      // Implement fallback systems for low-performance devices
      if (metrics.fps < 20) {
        this.enableFallbackMode();
      }
    });

    // Listen for performance updates
    this.events.on('performance-update', (metrics: any) => {
      // Update particle count in metrics
      if (this.particleSystem) {
        metrics.particleCount = this.particleSystem.getActiveParticleCount();
      }
    });
  }

  /**
   * Enable fallback systems for low-performance devices (Requirements 6.3, 6.4)
   */
  private enableFallbackMode(): void {
    console.log('Enabling fallback mode for low-performance device');
    
    // Disable all visual effects
    this.particleSystem?.setEffectsEnabled(false);
    this.cameraEffects?.setMobileMode(true);
    
    // Reduce animation quality
    this.animationSystem?.setMobileMode(true);
    
    // Simplify UI updates
    this.time.removeAllEvents();
    this.time.addEvent({
      delay: 2000, // Update UI less frequently
      callback: () => this.updateUI(),
      loop: true
    });
    
    // Show performance warning to user
    this.showPerformanceWarning();
  }

  private showPerformanceWarning(): void {
    const warningText = this.add.text(
      this.scale.width / 2,
      50,
      'Performance mode enabled',
      {
        fontSize: '14px',
        color: '#ffaa00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    ).setOrigin(0.5).setDepth(1000);

    // Fade out warning after 3 seconds
    this.tweens.add({
      targets: warningText,
      alpha: 0,
      duration: 3000,
      delay: 2000,
      onComplete: () => warningText.destroy()
    });
  }

  private createBackground(): void {
    const { width, height } = this.scale;
    
    // Use castle_arena.png as battle background as specified in requirements
    const background = this.add.image(width / 2, height / 2, 'castle_arena');
    
    // Scale background to fit screen while maintaining aspect ratio
    const scaleX = width / background.width;
    const scaleY = height / background.height;
    const scale = Math.max(scaleX, scaleY);
    background.setScale(scale);
  }

  private async createEntities(): Promise<void> {
    const { width, height } = this.scale;

    // Create boss at top with HP bar as specified
    const currentBossData = getCurrentBoss();
    this.boss = new BossEntity(
      this,
      width / 2,
      height * 0.25, // Position at top
      currentBossData
    );

    // Create player character at bottom as specified
    this.playerCharacter = new PlayerCharacter(
      this,
      width / 2,
      height * 0.75, // Position at bottom
      this.selectedClass
    );

    // Add smooth entrance animations (Requirements 7.2, 7.5)
    if (this.animationSystem && this.boss && this.playerCharacter) {
      // Animate boss entrance first
      await this.animationSystem.animateBossEntrance(this.boss);
      
      // Then animate player entrance
      await this.animationSystem.animatePlayerEntrance(this.playerCharacter);
      
      // Add floating idle animation for boss
      this.animationSystem.animateFloating(this.boss, 3, 3000);
    }
  }



  private createUI(): void {
    const { width, height } = this.scale;
    
    // Boss HP bar at top as specified
    const hpBarY = 50;
    const hpBarWidth = Math.min(width - 40, 400);
    
    // HP bar background
    const hpBarBg = this.add.graphics();
    hpBarBg.fillStyle(0x333333);
    hpBarBg.fillRect(width / 2 - hpBarWidth / 2, hpBarY - 10, hpBarWidth, 20);
    hpBarBg.lineStyle(2, 0xffffff);
    hpBarBg.strokeRect(width / 2 - hpBarWidth / 2, hpBarY - 10, hpBarWidth, 20);
    
    // HP bar (will be updated)
    this.bossHPBar = this.add.graphics();
    
    // Boss HP text
    this.bossHPText = this.add.text(width / 2, hpBarY + 20, `Boss: ${this.bossCurrentHP.toLocaleString()} / ${this.bossMaxHP.toLocaleString()}`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Player HP bar at bottom
    const playerHPBarY = height - 120;
    const playerHPBarWidth = Math.min(width - 40, 300);
    
    // Player HP bar background
    const playerHPBarBg = this.add.graphics();
    playerHPBarBg.fillStyle(0x333333);
    playerHPBarBg.fillRect(width / 2 - playerHPBarWidth / 2, playerHPBarY - 10, playerHPBarWidth, 20);
    playerHPBarBg.lineStyle(2, 0xffffff);
    playerHPBarBg.strokeRect(width / 2 - playerHPBarWidth / 2, playerHPBarY - 10, playerHPBarWidth, 20);
    
    // Player HP bar (will be updated)
    this.playerHPBar = this.add.graphics();
    
    // Player HP text
    this.playerHPText = this.add.text(width / 2, playerHPBarY + 20, `Your HP: ${this.playerCurrentHP} / ${this.playerMaxHP}`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Create attack button as specified
    this.createAttackButton();
    
    this.updateUI();
  }

  private createAttackButton(): void {
    const { width, height } = this.scale;
    
    // Large, touch-friendly attack button (60x60 minimum for mobile)
    const buttonWidth = MobileUtils.isMobile() ? 140 : 100;
    const buttonHeight = MobileUtils.isMobile() ? 70 : 50;
    
    this.attackButton = new ActionButton(this, {
      x: width / 2,
      y: height - 80, // More space from bottom for mobile
      width: buttonWidth,
      height: buttonHeight,
      text: 'ATTACK',
      callback: () => this.performAttack()
    });
    
    // Register with responsive layout system
    if (this.responsiveLayout) {
      this.responsiveLayout.registerElement('attackButton', this.attackButton, 
        { x: '50%', y: height - 80 }, // Portrait
        { x: '50%', y: height - 60 }  // Landscape
      );
    }
  }

  private setupControls(): void {
    // Keyboard controls for desktop
    if (!MobileUtils.isMobile()) {
      this.input.keyboard?.on('keydown-SPACE', () => this.performAttack());
    }
  }

  private startSession(): void {
    // Start boss attack system
    this.startBossAttacks();
    
    // Update UI every second
    this.time.addEvent({
      delay: 1000,
      callback: () => this.updateUI(),
      loop: true
    });
    
    // Check for battle end conditions
    this.time.addEvent({
      delay: 500,
      callback: () => this.checkBattleEnd(),
      loop: true
    });
  }

  private startBossAttacks(): void {
    const scheduleNextAttack = () => {
      const delay = Phaser.Math.Between(
        GameConstants.BOSS_ATTACK_INTERVAL_MIN,
        GameConstants.BOSS_ATTACK_INTERVAL_MAX
      );
      
      this.bossAttackTimer = this.time.delayedCall(delay, () => {
        this.performBossAttack();
        scheduleNextAttack(); // Schedule next attack
      });
    };
    
    // Start the attack cycle
    scheduleNextAttack();
  }

  private performBossAttack(): void {
    if (this.playerCurrentHP <= 0) return;
    
    const damage = Phaser.Math.Between(
      GameConstants.BOSS_DAMAGE_MIN,
      GameConstants.BOSS_DAMAGE_MAX
    );
    
    this.playerCurrentHP = Math.max(0, this.playerCurrentHP - damage);
    
    // Show damage number on player
    if (this.damageNumberPool && this.playerCharacter) {
      this.damageNumberPool.showDamage(
        this.playerCharacter.x,
        this.playerCharacter.y - 30,
        damage,
        false, // Not critical
        '#ff4444' // Red color for boss damage
      );
    }
    
    // Screen shake for boss attack
    if (this.cameraEffects) {
      this.cameraEffects.screenShake(GameConstants.SHAKE_NORMAL);
    }
    
    // Flash screen red
    if (this.cameraEffects) {
      this.cameraEffects.flashScreen(0xff0000, 200, 0.3);
    }
    
    console.log(`Boss attacks for ${damage} damage! Player HP: ${this.playerCurrentHP}`);
  }

  private checkBattleEnd(): void {
    // Player defeated
    if (this.playerCurrentHP <= 0) {
      this.transitionToResults();
      return;
    }
    
    // Boss defeated
    if (this.bossCurrentHP <= 0) {
      this.scene.start('Victory', {
        sessionDamage: this.sessionDamage,
        bossName: getCurrentBoss().name
      });
      return;
    }
  }

  private performAttack(): void {
    if (this.isAttacking) {
      return;
    }
    
    if (!this.sessionSystem || !this.playerCharacter || !this.boss || !this.damageNumberPool) {
      return;
    }

    // Check if session allows attack and button is not on cooldown (spam prevention)
    if (!this.sessionSystem.canAttack() || this.attackButton?.getState() !== ButtonState.ENABLED) {
      this.attackButton?.playErrorAnimation();
      return;
    }

    this.isAttacking = true;
    this.sessionAttackCount++;

    // Show success animation on button
    this.attackButton?.playSuccessAnimation();

    // Calculate damage
    const damage = DamageCalculator.calculateDamage(
      this.selectedClass,
      1 // Player level
    );

    // Play attack animation sequence (0.8 seconds total)
    this.playAttackSequence(damage);

    // Apply damage to boss
    this.bossCurrentHP = Math.max(0, this.bossCurrentHP - damage);
    this.sessionDamage += damage;

    // Check for victory
    if (this.bossCurrentHP <= 0) {
      this.time.delayedCall(800, () => {
        this.scene.start('Victory', {
          bossData: getCurrentBoss(),
          sessionDamage: this.sessionDamage
        });
      });
    }

    this.updateUI();
  }

  private playAttackSequence(damage: number): void {
    if (!this.playerCharacter || !this.boss || !this.damageNumberPool) {
      return;
    }

    // 0.8-second attack sequence as specified
    // Phase 1: Run forward (0.3s)
    this.tweens.add({
      targets: this.playerCharacter,
      x: this.playerCharacter.x + 50,
      duration: 300,
      ease: 'Power2.Out',
      onComplete: () => {
        // Phase 2: Attack animation (0.2s) + damage popup
        this.playerCharacter?.playAnimation('attack');
        
        // Show damage number with "YOUR damage: +234" styling
        this.damageNumberPool?.showDamage({
          x: this.boss!.x,
          y: this.boss!.y - 50,
          damage: damage,
          isCritical: false,
          isPlayerDamage: true // Distinguish player damage as specified
        });
        
        // Enhanced visual effects (Requirements 7.1, 7.2)
        // Screen shake proportional to damage dealt
        this.cameraEffects?.screenShakeForDamage(damage);
        
        // Attack impact animation
        this.animationSystem?.animateAttackImpact(this.boss!, damage);
        
        // Particle effects for attacks (limited to 10 particles on mobile)
        this.particleSystem?.createSlashEffect(this.boss!.x, this.boss!.y);
        
        // Critical hit effects for high damage
        if (damage > 300) {
          this.particleSystem?.createCriticalBurst(this.boss!.x, this.boss!.y);
          this.cameraEffects?.flashScreen(0xffff00, 150, 0.3); // Yellow flash for crit
        }

        this.time.delayedCall(200, () => {
          // Phase 3: Run back (0.3s)
          this.tweens.add({
            targets: this.playerCharacter,
            x: this.playerCharacter!.x - 50,
            duration: 300,
            ease: 'Power2.In',
            onComplete: () => {
              this.isAttacking = false;
              
              // Set attack cooldown to prevent spam clicking
              this.attackButton?.startCooldown(800); // 0.8 second cooldown
            }
          });
        });
      }
    });
  }



  shutdown(): void {
    // Clean up boss attack timer
    if (this.bossAttackTimer) {
      this.bossAttackTimer.destroy();
      this.bossAttackTimer = undefined;
    }
  }

  override update(): void {
    // Update visual effects systems
    this.cameraEffects?.update();
    
    // Performance monitoring is handled automatically via events
    // No manual update needed for PerformanceMonitor
  }

  private updateUI(): void {
    const { width, height } = this.scale;
    
    // Update Boss HP bar
    if (this.bossHPBar) {
      const hpPercentage = this.bossCurrentHP / this.bossMaxHP;
      const hpBarWidth = Math.min(width - 40, 400);
      const barWidth = hpBarWidth * hpPercentage;
      
      this.bossHPBar.clear();
      this.bossHPBar.fillStyle(GameConstants.COLORS.HP_BAR);
      this.bossHPBar.fillRect(width / 2 - hpBarWidth / 2, 40, barWidth, 20);
    }
    
    // Update Boss HP text
    if (this.bossHPText) {
      this.bossHPText.setText(`Boss: ${this.bossCurrentHP.toLocaleString()} / ${this.bossMaxHP.toLocaleString()}`);
    }

    // Update Player HP bar
    if (this.playerHPBar) {
      const hpPercentage = this.playerCurrentHP / this.playerMaxHP;
      const hpBarWidth = Math.min(width - 40, 300);
      const barWidth = hpBarWidth * hpPercentage;
      
      this.playerHPBar.clear();
      
      // Color based on HP percentage
      let barColor = 0x00ff00; // Green
      if (hpPercentage < 0.5) barColor = 0xffff00; // Yellow
      if (hpPercentage < 0.25) barColor = 0xff0000; // Red
      
      this.playerHPBar.fillStyle(barColor);
      this.playerHPBar.fillRect(width / 2 - hpBarWidth / 2, height - 130, barWidth, 20);
    }
    
    // Update Player HP text
    if (this.playerHPText) {
      this.playerHPText.setText(`Your HP: ${this.playerCurrentHP} / ${this.playerMaxHP}`);
      
      // Change color based on HP
      const hpPercentage = this.playerCurrentHP / this.playerMaxHP;
      if (hpPercentage < 0.25) {
        this.playerHPText.setColor('#ff0000');
      } else if (hpPercentage < 0.5) {
        this.playerHPText.setColor('#ffff00');
      } else {
        this.playerHPText.setColor('#ffffff');
      }
    }
  }

  private transitionToResults(): void {
    // Get player rank from server before transitioning
    this.getPlayerRank().then(playerRank => {
      // Smooth transition to results scene with session data
      if (this.transitionSystem) {
        this.transitionSystem.slideTransition('Results', 'up', {
          sessionDamage: this.sessionDamage,
          sessionAttackCount: this.sessionAttackCount,
          bossName: getCurrentBoss().name,
          bossHPRemaining: this.bossCurrentHP,
          playerRank: playerRank
        });
      }
    });
  }

  private async getPlayerRank(): Promise<number> {
    try {
      const response = await fetch('/api/leaderboard');
      if (response.ok) {
        await response.json();
        // Find current player's rank (this would need user ID in real implementation)
        // For now, return a simulated rank
        return Math.floor(Math.random() * 50) + 1;
      }
    } catch (error) {
      console.error('Failed to get player rank:', error);
    }
    return 0; // Default rank if failed
  }
}