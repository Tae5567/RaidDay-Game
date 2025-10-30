import { Scene } from 'phaser';
import { BossEntity, getCurrentBoss } from '../entities/BossEntity';
import { PlayerCharacter, CharacterClass } from '../entities/PlayerCharacter';
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
  private bossAttackTimer?: Phaser.Time.TimerEvent | undefined;
  
  // Session timer
  private sessionTimeRemaining: number = 60; // 60 seconds
  private sessionTimer?: Phaser.Time.TimerEvent;
  private timerText?: Phaser.GameObjects.Text;

  // UI elements
  private bossHPBar?: Phaser.GameObjects.Graphics;
  private bossHPText?: Phaser.GameObjects.Text;
  private playerHPBar?: Phaser.GameObjects.Graphics;
  private playerHPText?: Phaser.GameObjects.Text;
  private attackButton?: ActionButton;
  private specialButton?: ActionButton;

  constructor() {
    super('Battle');
  }

  init(): void {
    // Get selected class from registry with fallback
    this.selectedClass = this.registry.get('selectedClass') as CharacterClass || CharacterClass.WARRIOR;
    console.log('Battle scene initialized with class:', this.selectedClass);
    
    // Initialize with default values - will be loaded from server
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
    
    // Load persistent boss HP from server
    await this.loadBossState();
    
    // Initialize new battle session
    await this.initializeBattleSession();
    
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

  private async loadBossState(): Promise<void> {
    try {
      const response = await fetch('/api/boss-status');
      if (response.ok) {
        const bossStatus = await response.json();
        this.bossCurrentHP = bossStatus.state.currentHP;
        this.bossMaxHP = bossStatus.state.maxHP;
        console.log('Loaded boss HP:', this.bossCurrentHP, '/', this.bossMaxHP);
      }
    } catch (error) {
      console.error('Failed to load boss state:', error);
      // Keep default values if loading fails
    }
  }

  private async initializeBattleSession(): Promise<void> {
    try {
      // Start a new battle session
      const response = await fetch('/api/refresh-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Battle session initialized:', result);
      } else {
        console.warn('Failed to initialize battle session, continuing with existing session');
      }
    } catch (error) {
      console.error('Failed to initialize battle session:', error);
      // Continue anyway - player might have an existing session
    }
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
    if (this.playerHPText) uiElements.push(this.playerHPText);
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
    
    // Boss HP bar at top
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

    // Session timer at top right
    this.timerText = this.add.text(width - 20, 20, `Time: ${this.sessionTimeRemaining}s`, {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(1, 0);

    // Player HP bar - positioned to left side to not cover character
    const playerHPBarY = height - 100;
    const playerHPBarWidth = 200;
    const playerHPBarX = 20; // Left side of screen
    
    // Player HP bar background
    const playerHPBarBg = this.add.graphics();
    playerHPBarBg.fillStyle(0x333333);
    playerHPBarBg.fillRect(playerHPBarX, playerHPBarY - 10, playerHPBarWidth, 16);
    playerHPBarBg.lineStyle(2, 0xffffff);
    playerHPBarBg.strokeRect(playerHPBarX, playerHPBarY - 10, playerHPBarWidth, 16);
    
    // Player HP bar (will be updated)
    this.playerHPBar = this.add.graphics();
    
    // Player HP text - positioned above HP bar
    this.playerHPText = this.add.text(playerHPBarX + playerHPBarWidth / 2, playerHPBarY - 25, `Your HP: ${this.playerCurrentHP} / ${this.playerMaxHP}`, {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Create attack button positioned to right side
    this.createAttackButton();
    
    // Create special ability button
    this.createSpecialButton();
    
    this.updateUI();
  }

  private createAttackButton(): void {
    const { width, height } = this.scale;
    
    // Large, touch-friendly attack button positioned to right side
    const buttonWidth = MobileUtils.isMobile() ? 100 : 90;
    const buttonHeight = MobileUtils.isMobile() ? 50 : 45;
    
    this.attackButton = new ActionButton(this, {
      x: width - 60, // Right side of screen
      y: height - 120, // Higher up to make room for special button
      width: buttonWidth,
      height: buttonHeight,
      text: 'ATTACK',
      callback: () => this.performAttack()
    });
    
    // Register with responsive layout system
    if (this.responsiveLayout) {
      this.responsiveLayout.registerElement('attackButton', this.attackButton, 
        { x: width - 60, y: height - 120 }, // Portrait
        { x: width - 60, y: height - 100 }   // Landscape
      );
    }
  }

  private createSpecialButton(): void {
    const { width, height } = this.scale;
    
    // Special ability button with class-specific text
    const buttonWidth = MobileUtils.isMobile() ? 100 : 90;
    const buttonHeight = MobileUtils.isMobile() ? 50 : 45;
    
    const specialAbilities = {
      [CharacterClass.WARRIOR]: 'RAGE',
      [CharacterClass.MAGE]: 'FIREBALL',
      [CharacterClass.ROGUE]: 'STEALTH',
      [CharacterClass.HEALER]: 'HEAL'
    };
    
    this.specialButton = new ActionButton(this, {
      x: width - 60, // Right side of screen
      y: height - 60, // Below attack button
      width: buttonWidth,
      height: buttonHeight,
      text: specialAbilities[this.selectedClass],
      callback: () => this.performSpecialAbility()
    });
    
    // Register with responsive layout system
    if (this.responsiveLayout) {
      this.responsiveLayout.registerElement('specialButton', this.specialButton, 
        { x: width - 60, y: height - 60 }, // Portrait
        { x: width - 60, y: height - 50 }   // Landscape
      );
    }
  }

  private async performSpecialAbility(): Promise<void> {
    if (this.isAttacking) {
      return;
    }
    
    if (!this.playerCharacter || !this.boss || !this.damageNumberPool) {
      return;
    }

    // Check if button is not on cooldown
    if (this.specialButton?.getState() !== ButtonState.ENABLED) {
      this.specialButton?.playErrorAnimation();
      return;
    }

    this.isAttacking = true;

    // Show success animation on button
    this.specialButton?.playSuccessAnimation();

    // Class-specific special abilities
    switch (this.selectedClass) {
      case CharacterClass.WARRIOR:
        await this.performRage();
        break;
      case CharacterClass.MAGE:
        await this.performFireball();
        break;
      case CharacterClass.ROGUE:
        await this.performStealth();
        break;
      case CharacterClass.HEALER:
        await this.performHeal();
        break;
    }

    // Set long cooldown for special abilities (30 seconds)
    this.specialButton?.startCooldown(30000);
    this.isAttacking = false;
  }

  private async performRage(): Promise<void> {
    // Warrior Rage: Next 3 attacks deal double damage
    const damage = this.calculateClassBasedDamage() * 2;
    
    try {
      const response = await fetch('/api/special-ability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterClass: this.selectedClass,
          damage: damage
        })
      });

      if (response.ok) {
        const result = await response.json();
        this.bossCurrentHP = result.newBossHP;
        this.sessionDamage += damage;
        
        // Visual effects
        this.cameraEffects?.flashScreen(0xff0000, 300, 0.5);
        this.damageNumberPool?.showDamage({
          x: this.boss!.x,
          y: this.boss!.y - 50,
          damage: damage,
          isCritical: true,
          isSpecial: true
        });
      }
    } catch (error) {
      console.error('Rage ability error:', error);
    }
    
    this.updateUI();
  }

  private async performFireball(): Promise<void> {
    // Mage Fireball: High damage area attack
    const damage = this.calculateClassBasedDamage() * 2.5;
    
    try {
      const response = await fetch('/api/special-ability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterClass: this.selectedClass,
          damage: damage
        })
      });

      if (response.ok) {
        const result = await response.json();
        this.bossCurrentHP = result.newBossHP;
        this.sessionDamage += damage;
        
        // Visual effects
        this.cameraEffects?.flashScreen(0xff8800, 300, 0.5);
        this.particleSystem?.createCriticalBurst(this.boss!.x, this.boss!.y);
        this.damageNumberPool?.showDamage({
          x: this.boss!.x,
          y: this.boss!.y - 50,
          damage: damage,
          isCritical: true,
          isSpecial: true
        });
      }
    } catch (error) {
      console.error('Fireball ability error:', error);
    }
    
    this.updateUI();
  }

  private async performStealth(): Promise<void> {
    // Rogue Stealth: Guaranteed critical hit on next attack
    const damage = this.calculateClassBasedDamage() * 3; // Guaranteed crit
    
    try {
      const response = await fetch('/api/special-ability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterClass: this.selectedClass,
          damage: damage
        })
      });

      if (response.ok) {
        const result = await response.json();
        this.bossCurrentHP = result.newBossHP;
        this.sessionDamage += damage;
        
        // Visual effects
        this.cameraEffects?.flashScreen(0x00ff00, 300, 0.5);
        this.damageNumberPool?.showDamage({
          x: this.boss!.x,
          y: this.boss!.y - 50,
          damage: damage,
          isCritical: true,
          isSpecial: true
        });
      }
    } catch (error) {
      console.error('Stealth ability error:', error);
    }
    
    this.updateUI();
  }

  private async performHeal(): Promise<void> {
    // Healer Heal: Restore HP and deal damage
    const healAmount = 150;
    const damage = this.calculateClassBasedDamage();
    
    // Heal player
    this.playerCurrentHP = Math.min(this.playerMaxHP, this.playerCurrentHP + healAmount);
    
    try {
      const response = await fetch('/api/special-ability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterClass: this.selectedClass,
          damage: damage
        })
      });

      if (response.ok) {
        const result = await response.json();
        this.bossCurrentHP = result.newBossHP;
        this.sessionDamage += damage;
        
        // Visual effects
        this.cameraEffects?.flashScreen(0x00ffff, 300, 0.5);
        
        // Show heal number on player
        this.damageNumberPool?.showDamage({
          x: this.playerCharacter!.x,
          y: this.playerCharacter!.y - 30,
          damage: healAmount,
          isCritical: false,
          isPlayerDamage: true
        });
        
        // Show damage on boss
        this.damageNumberPool?.showDamage({
          x: this.boss!.x,
          y: this.boss!.y - 50,
          damage: damage,
          isCritical: false,
          isSpecial: true
        });
      }
    } catch (error) {
      console.error('Heal ability error:', error);
    }
    
    this.updateUI();
  }

  private setupControls(): void {
    // Keyboard controls for desktop
    if (!MobileUtils.isMobile()) {
      this.input.keyboard?.on('keydown-SPACE', () => this.performAttack());
    }
  }

  private startSession(): void {
    // Start 60-second session timer
    this.sessionTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.sessionTimeRemaining--;
        this.updateUI();
        
        if (this.sessionTimeRemaining <= 0) {
          this.endSession();
        }
      },
      loop: true
    });
    
    // Start boss attack system
    this.startBossAttacks();
    
    // Check for battle end conditions
    this.time.addEvent({
      delay: 500,
      callback: () => this.checkBattleEnd(),
      loop: true
    });
  }

  private endSession(): void {
    // Stop all timers
    if (this.sessionTimer) {
      this.sessionTimer.destroy();
    }
    if (this.bossAttackTimer) {
      this.bossAttackTimer.destroy();
    }
    
    // Transition to results
    this.transitionToResults();
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
      this.damageNumberPool.showDamage({
        x: this.playerCharacter.x,
        y: this.playerCharacter.y - 30,
        damage: damage,
        isCritical: false
      });
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

  private async performAttack(): Promise<void> {
    if (this.isAttacking) {
      return;
    }
    
    if (!this.playerCharacter || !this.boss || !this.damageNumberPool) {
      return;
    }

    // Check if button is not on cooldown (spam prevention)
    if (this.attackButton?.getState() !== ButtonState.ENABLED) {
      this.attackButton?.playErrorAnimation();
      return;
    }

    this.isAttacking = true;
    this.sessionAttackCount++;

    // Show success animation on button
    this.attackButton?.playSuccessAnimation();

    // Calculate damage based on class
    const damage = this.calculateClassBasedDamage();
    const isCritical = this.calculateCriticalHit();

    try {
      // Call server API to apply damage
      const response = await fetch('/api/attack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterClass: this.selectedClass,
          damage: damage,
          isCritical: isCritical
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          // Update boss HP from server response
          this.bossCurrentHP = result.newBossHP;
          this.sessionDamage += damage;

          // Play attack animation sequence
          this.playAttackSequence(damage);

          // Check for victory
          if (this.bossCurrentHP <= 0) {
            this.time.delayedCall(800, () => {
              this.scene.start('Victory', {
                bossData: getCurrentBoss(),
                sessionDamage: this.sessionDamage
              });
            });
          }
        } else {
          console.error('Attack failed:', result.message);
          this.attackButton?.playErrorAnimation();
          
          // If session expired, try to refresh
          if (result.message.includes('Session expired')) {
            this.handleSessionExpired();
          }
        }
      } else {
        const errorData = await response.json();
        console.error('Attack failed:', errorData);
        this.attackButton?.playErrorAnimation();
        
        // If session expired, try to refresh
        if (errorData.message && errorData.message.includes('Session expired')) {
          this.handleSessionExpired();
        }
      }
    } catch (error) {
      console.error('Attack error:', error);
      this.attackButton?.playErrorAnimation();
    }

    this.updateUI();
    this.isAttacking = false;
  }

  private calculateClassBasedDamage(): number {
    // Different damage ranges for each class
    switch (this.selectedClass) {
      case CharacterClass.WARRIOR:
        return Phaser.Math.Between(180, 220); // Balanced
      case CharacterClass.MAGE:
        return Phaser.Math.Between(200, 250); // High damage
      case CharacterClass.ROGUE:
        return Phaser.Math.Between(160, 200); // Lower base, higher crit chance
      case CharacterClass.HEALER:
        return Phaser.Math.Between(140, 180); // Lower damage, support focused
      default:
        return Phaser.Math.Between(180, 220);
    }
  }

  private calculateCriticalHit(): boolean {
    // Different crit chances for each class
    switch (this.selectedClass) {
      case CharacterClass.WARRIOR:
        return Math.random() < 0.15; // 15% crit chance
      case CharacterClass.MAGE:
        return Math.random() < 0.10; // 10% crit chance
      case CharacterClass.ROGUE:
        return Math.random() < 0.30; // 30% crit chance as specified
      case CharacterClass.HEALER:
        return Math.random() < 0.05; // 5% crit chance
      default:
        return Math.random() < 0.15;
    }
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
    }
    this.bossAttackTimer = undefined;
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

    // Update session timer
    if (this.timerText) {
      this.timerText.setText(`Time: ${this.sessionTimeRemaining}s`);
      
      // Change color based on time remaining
      if (this.sessionTimeRemaining <= 10) {
        this.timerText.setColor('#ff0000'); // Red when low
      } else if (this.sessionTimeRemaining <= 30) {
        this.timerText.setColor('#ffaa00'); // Orange when medium
      } else {
        this.timerText.setColor('#ffff00'); // Yellow when high
      }
    }

    // Update Player HP bar - positioned on left side
    if (this.playerHPBar) {
      const hpPercentage = this.playerCurrentHP / this.playerMaxHP;
      const playerHPBarWidth = 200;
      const playerHPBarX = 20;
      const barWidth = playerHPBarWidth * hpPercentage;
      
      this.playerHPBar.clear();
      
      // Color based on HP percentage
      let barColor = 0x00ff00; // Green
      if (hpPercentage < 0.5) barColor = 0xffff00; // Yellow
      if (hpPercentage < 0.25) barColor = 0xff0000; // Red
      
      this.playerHPBar.fillStyle(barColor);
      this.playerHPBar.fillRect(playerHPBarX, height - 110, barWidth, 16);
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

  private async handleSessionExpired(): Promise<void> {
    try {
      // Try to refresh the session
      const response = await fetch('/api/refresh-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          console.log('Session refreshed successfully');
          // Reset session timer to 60 seconds
          this.sessionTimeRemaining = 60;
          return;
        }
      }
      
      // If refresh failed, end the session
      console.log('Session refresh failed, ending battle');
      this.endSession();
    } catch (error) {
      console.error('Failed to refresh session:', error);
      this.endSession();
    }
  }
}
