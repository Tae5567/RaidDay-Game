import { Scene } from 'phaser';

export interface TransitionConfig {
  duration: number;
  ease: string;
  type: 'fade' | 'slide' | 'zoom' | 'dissolve' | 'wipe';
  direction?: 'up' | 'down' | 'left' | 'right';
  color?: number;
  showLoadingIndicator?: boolean;
  loadingText?: string;
}

export interface LoadingIndicatorConfig {
  text: string;
  fontSize: string;
  color: string;
  spinnerColor: number;
  showProgress?: boolean;
}

/**
 * TransitionSystem - Manages smooth scene transitions without black loading screens
 * Provides various transition effects and loading indicators (Requirements 7.3, 7.4, 7.5)
 */
export class TransitionSystem {
  private scene: Scene;
  private transitionOverlay?: Phaser.GameObjects.Graphics | undefined;
  private loadingContainer?: Phaser.GameObjects.Container | undefined;
  private loadingSpinner?: Phaser.GameObjects.Graphics | undefined;
  private loadingText?: Phaser.GameObjects.Text | undefined;
  private progressBar?: Phaser.GameObjects.Graphics | undefined;
  private progressBarBg?: Phaser.GameObjects.Graphics | undefined;
  private isTransitioning: boolean = false;
  private currentTransition?: Phaser.Tweens.Tween | undefined;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Transition to a new scene with smooth effects
   */
  public async transitionToScene(
    targetScene: string,
    config: Partial<TransitionConfig> = {},
    sceneData?: any
  ): Promise<void> {
    if (this.isTransitioning) {
      console.warn('Transition already in progress');
      return;
    }

    const finalConfig: TransitionConfig = {
      duration: 800,
      ease: 'Power2.easeInOut',
      type: 'fade',
      color: 0x000000,
      showLoadingIndicator: true,
      loadingText: 'Loading...',
      ...config
    };

    this.isTransitioning = true;

    try {
      // Create transition overlay
      await this.createTransitionOverlay(finalConfig);
      
      // Show loading indicator if enabled
      if (finalConfig.showLoadingIndicator) {
        this.showLoadingIndicator({
          text: finalConfig.loadingText!,
          fontSize: '24px',
          color: '#ffffff',
          spinnerColor: 0xffffff,
          showProgress: false
        });
      }

      // Perform transition out
      await this.transitionOut(finalConfig);

      // Small delay to ensure smooth transition
      await this.delay(100);

      // Start the new scene
      this.scene.scene.start(targetScene, sceneData);

      // The new scene should call transitionIn() in its create method
    } catch (error) {
      console.error('Transition failed:', error);
      this.isTransitioning = false;
      this.cleanup();
    }
  }

  /**
   * Transition into the current scene (called by new scene)
   */
  public async transitionIn(config: Partial<TransitionConfig> = {}): Promise<void> {
    const finalConfig: TransitionConfig = {
      duration: 600,
      ease: 'Power2.easeOut',
      type: 'fade',
      color: 0x000000,
      showLoadingIndicator: false,
      ...config
    };

    try {
      // Ensure overlay exists
      if (!this.transitionOverlay) {
        this.createTransitionOverlay(finalConfig);
      }

      // Hide loading indicator
      this.hideLoadingIndicator();

      // Perform transition in
      await this.performTransitionIn(finalConfig);

      // Cleanup
      this.cleanup();
      this.isTransitioning = false;
    } catch (error) {
      console.error('Transition in failed:', error);
      this.cleanup();
      this.isTransitioning = false;
    }
  }

  /**
   * Create the transition overlay
   */
  private createTransitionOverlay(config: TransitionConfig): void {
    const { width, height } = this.scene.scale;
    
    this.transitionOverlay = this.scene.add.graphics();
    this.transitionOverlay.setDepth(10000); // Very high depth
    this.transitionOverlay.setScrollFactor(0); // Don't scroll with camera
    
    // Fill the entire screen
    this.transitionOverlay.fillStyle(config.color!);
    this.transitionOverlay.fillRect(0, 0, width, height);
    
    // Start invisible for fade in, visible for fade out
    this.transitionOverlay.setAlpha(0);
  }

  /**
   * Perform transition out animation
   */
  private async transitionOut(config: TransitionConfig): Promise<void> {
    if (!this.transitionOverlay) return;

    return new Promise((resolve) => {
      switch (config.type) {
        case 'fade':
          this.currentTransition = this.scene.tweens.add({
            targets: this.transitionOverlay,
            alpha: 1,
            duration: config.duration,
            ease: config.ease,
            onComplete: () => resolve()
          });
          break;

        case 'slide':
          this.performSlideTransition(config, 'out', resolve);
          break;

        case 'zoom':
          this.performZoomTransition(config, 'out', resolve);
          break;

        case 'dissolve':
          this.performDissolveTransition(config, 'out', resolve);
          break;

        case 'wipe':
          this.performWipeTransition(config, 'out', resolve);
          break;

        default:
          resolve();
      }
    });
  }

  /**
   * Perform transition in animation
   */
  private async performTransitionIn(config: TransitionConfig): Promise<void> {
    if (!this.transitionOverlay) return;

    return new Promise((resolve) => {
      switch (config.type) {
        case 'fade':
          this.currentTransition = this.scene.tweens.add({
            targets: this.transitionOverlay,
            alpha: 0,
            duration: config.duration,
            ease: config.ease,
            onComplete: () => resolve()
          });
          break;

        case 'slide':
          this.performSlideTransition(config, 'in', resolve);
          break;

        case 'zoom':
          this.performZoomTransition(config, 'in', resolve);
          break;

        case 'dissolve':
          this.performDissolveTransition(config, 'in', resolve);
          break;

        case 'wipe':
          this.performWipeTransition(config, 'in', resolve);
          break;

        default:
          resolve();
      }
    });
  }

  /**
   * Slide transition effect
   */
  private performSlideTransition(
    config: TransitionConfig, 
    direction: 'in' | 'out', 
    callback: () => void
  ): void {
    if (!this.transitionOverlay) return;

    const { width, height } = this.scene.scale;
    const slideDirection = config.direction || 'right';
    
    let startX = 0, startY = 0, endX = 0, endY = 0;
    
    if (direction === 'out') {
      // Slide in from edge
      switch (slideDirection) {
        case 'left':
          startX = -width;
          endX = 0;
          break;
        case 'right':
          startX = width;
          endX = 0;
          break;
        case 'up':
          startY = -height;
          endY = 0;
          break;
        case 'down':
          startY = height;
          endY = 0;
          break;
      }
    } else {
      // Slide out to edge
      switch (slideDirection) {
        case 'left':
          startX = 0;
          endX = -width;
          break;
        case 'right':
          startX = 0;
          endX = width;
          break;
        case 'up':
          startY = 0;
          endY = -height;
          break;
        case 'down':
          startY = 0;
          endY = height;
          break;
      }
    }

    this.transitionOverlay.setPosition(startX, startY);
    this.transitionOverlay.setAlpha(1);

    this.currentTransition = this.scene.tweens.add({
      targets: this.transitionOverlay,
      x: endX,
      y: endY,
      duration: config.duration,
      ease: config.ease,
      onComplete: callback
    });
  }

  /**
   * Zoom transition effect
   */
  private performZoomTransition(
    config: TransitionConfig, 
    direction: 'in' | 'out', 
    callback: () => void
  ): void {
    if (!this.transitionOverlay) return;

    const { width, height } = this.scene.scale;
    
    // Create circular mask effect
    this.transitionOverlay.clear();
    
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
    
    let startRadius: number, endRadius: number;
    
    if (direction === 'out') {
      startRadius = 0;
      endRadius = maxRadius;
    } else {
      startRadius = maxRadius;
      endRadius = 0;
    }

    // Animate the circular mask
    const animData = { radius: startRadius };
    
    this.currentTransition = this.scene.tweens.add({
      targets: animData,
      radius: endRadius,
      duration: config.duration,
      ease: config.ease,
      onUpdate: () => {
        if (this.transitionOverlay) {
          this.transitionOverlay.clear();
          this.transitionOverlay.fillStyle(config.color!);
          
          if (direction === 'out') {
            // Growing circle reveals content
            this.transitionOverlay.fillRect(0, 0, width, height);
            this.transitionOverlay.beginPath();
            this.transitionOverlay.arc(centerX, centerY, animData.radius, 0, Math.PI * 2);
            this.transitionOverlay.fillPath();
          } else {
            // Shrinking circle hides content
            this.transitionOverlay.beginPath();
            this.transitionOverlay.arc(centerX, centerY, animData.radius, 0, Math.PI * 2);
            this.transitionOverlay.fillPath();
          }
        }
      },
      onComplete: callback
    });
  }

  /**
   * Dissolve transition effect
   */
  private performDissolveTransition(
    config: TransitionConfig, 
    direction: 'in' | 'out', 
    callback: () => void
  ): void {
    if (!this.transitionOverlay) return;

    // Simple alpha fade with noise effect
    const startAlpha = direction === 'out' ? 0 : 1;
    const endAlpha = direction === 'out' ? 1 : 0;
    
    this.transitionOverlay.setAlpha(startAlpha);
    
    this.currentTransition = this.scene.tweens.add({
      targets: this.transitionOverlay,
      alpha: endAlpha,
      duration: config.duration,
      ease: config.ease,
      onComplete: callback
    });
  }

  /**
   * Wipe transition effect
   */
  private performWipeTransition(
    config: TransitionConfig, 
    direction: 'in' | 'out', 
    callback: () => void
  ): void {
    if (!this.transitionOverlay) return;

    const { width, height } = this.scene.scale;
    const wipeDirection = config.direction || 'right';
    
    // Create a mask that wipes across the screen
    let startWidth = 0, startHeight = 0, endWidth = width, endHeight = height;
    
    if (direction === 'out') {
      switch (wipeDirection) {
        case 'right':
          endWidth = width;
          endHeight = height;
          break;
        case 'left':
          this.transitionOverlay.setPosition(width, 0);
          endWidth = -width;
          endHeight = height;
          break;
        case 'down':
          endWidth = width;
          endHeight = height;
          break;
        case 'up':
          this.transitionOverlay.setPosition(0, height);
          endWidth = width;
          endHeight = -height;
          break;
      }
    } else {
      startWidth = width;
      startHeight = height;
      endWidth = 0;
      endHeight = 0;
    }

    const animData = { w: startWidth, h: startHeight };
    
    this.currentTransition = this.scene.tweens.add({
      targets: animData,
      w: endWidth,
      h: endHeight,
      duration: config.duration,
      ease: config.ease,
      onUpdate: () => {
        if (this.transitionOverlay) {
          this.transitionOverlay.clear();
          this.transitionOverlay.fillStyle(config.color!);
          this.transitionOverlay.fillRect(0, 0, animData.w, animData.h);
        }
      },
      onComplete: callback
    });
  }

  /**
   * Show loading indicator with spinner
   */
  public showLoadingIndicator(config: LoadingIndicatorConfig): void {
    const { width, height } = this.scene.scale;
    
    this.loadingContainer = this.scene.add.container(width / 2, height / 2);
    this.loadingContainer.setDepth(10001); // Above transition overlay
    this.loadingContainer.setScrollFactor(0);

    // Loading text
    this.loadingText = this.scene.add.text(0, 40, config.text, {
      fontFamily: 'Arial Black',
      fontSize: config.fontSize,
      color: config.color,
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Animated spinner
    this.loadingSpinner = this.scene.add.graphics();
    this.loadingSpinner.lineStyle(4, config.spinnerColor);
    
    // Draw spinner arc
    const radius = 20;
    this.loadingSpinner.beginPath();
    this.loadingSpinner.arc(0, 0, radius, 0, Math.PI * 1.5);
    this.loadingSpinner.strokePath();

    // Add spinner animation
    this.scene.tweens.add({
      targets: this.loadingSpinner,
      rotation: Math.PI * 2,
      duration: 1000,
      ease: 'Linear',
      repeat: -1
    });

    // Progress bar (if enabled)
    if (config.showProgress) {
      this.createProgressBar();
    }

    this.loadingContainer.add([this.loadingSpinner, this.loadingText]);
    
    if (this.progressBarBg && this.progressBar) {
      this.loadingContainer.add([this.progressBarBg, this.progressBar]);
    }

    // Fade in loading indicator
    this.loadingContainer.setAlpha(0);
    this.scene.tweens.add({
      targets: this.loadingContainer,
      alpha: 1,
      duration: 300,
      ease: 'Power2.easeOut'
    });
  }

  /**
   * Create progress bar for loading
   */
  private createProgressBar(): void {
    const barWidth = 200;
    const barHeight = 8;
    
    // Background
    this.progressBarBg = this.scene.add.graphics();
    this.progressBarBg.fillStyle(0x333333);
    this.progressBarBg.fillRect(-barWidth / 2, 70, barWidth, barHeight);
    this.progressBarBg.lineStyle(2, 0x666666);
    this.progressBarBg.strokeRect(-barWidth / 2, 70, barWidth, barHeight);

    // Progress fill
    this.progressBar = this.scene.add.graphics();
    this.progressBar.fillStyle(0x00ff00);
    this.progressBar.fillRect(-barWidth / 2 + 2, 72, 0, barHeight - 4);
  }

  /**
   * Update progress bar
   */
  public updateProgress(progress: number): void {
    if (this.progressBar) {
      const barWidth = 196; // 200 - 4 for padding
      this.progressBar.clear();
      this.progressBar.fillStyle(0x00ff00);
      this.progressBar.fillRect(-98, 72, barWidth * progress, 4);
    }
  }

  /**
   * Hide loading indicator
   */
  public hideLoadingIndicator(): void {
    if (this.loadingContainer) {
      this.scene.tweens.add({
        targets: this.loadingContainer,
        alpha: 0,
        duration: 300,
        ease: 'Power2.easeIn',
        onComplete: () => {
          if (this.loadingContainer) {
            this.loadingContainer.destroy();
            this.loadingContainer = undefined;
          }
          this.loadingSpinner = undefined;
          this.loadingText = undefined;
          this.progressBar = undefined;
          this.progressBarBg = undefined;
        }
      });
    }
  }

  /**
   * Quick fade transition for simple scene changes
   */
  public async quickFade(targetScene: string, sceneData?: any): Promise<void> {
    return this.transitionToScene(targetScene, {
      type: 'fade',
      duration: 400,
      showLoadingIndicator: false
    }, sceneData);
  }

  /**
   * Slide transition for directional scene changes
   */
  public async slideTransition(
    targetScene: string, 
    direction: 'up' | 'down' | 'left' | 'right' = 'right',
    sceneData?: any
  ): Promise<void> {
    return this.transitionToScene(targetScene, {
      type: 'slide',
      direction,
      duration: 600,
      showLoadingIndicator: false
    }, sceneData);
  }

  /**
   * Zoom transition for dramatic scene changes
   */
  public async zoomTransition(targetScene: string, sceneData?: any): Promise<void> {
    return this.transitionToScene(targetScene, {
      type: 'zoom',
      duration: 800,
      showLoadingIndicator: true,
      loadingText: 'Entering Battle...'
    }, sceneData);
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      this.scene.time.delayedCall(ms, resolve);
    });
  }

  /**
   * Cleanup transition elements
   */
  private cleanup(): void {
    if (this.currentTransition) {
      this.currentTransition.stop();
      this.currentTransition = undefined;
    }

    if (this.transitionOverlay) {
      this.transitionOverlay.destroy();
      this.transitionOverlay = undefined;
    }

    if (this.loadingContainer) {
      this.loadingContainer.destroy();
      this.loadingContainer = undefined;
    }

    this.loadingSpinner = undefined;
    this.loadingText = undefined;
    this.progressBar = undefined;
    this.progressBarBg = undefined;
  }

  /**
   * Check if transition is in progress
   */
  public isInTransition(): boolean {
    return this.isTransitioning;
  }

  /**
   * Force stop current transition
   */
  public stopTransition(): void {
    this.isTransitioning = false;
    this.cleanup();
  }

  /**
   * Destroy the transition system
   */
  public destroy(): void {
    this.stopTransition();
  }
}