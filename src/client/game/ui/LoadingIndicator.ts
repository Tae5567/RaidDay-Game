import { Scene } from 'phaser';

export interface LoadingConfig {
  text?: string;
  showProgress?: boolean;
  showSpinner?: boolean;
  fontSize?: string;
  color?: string;
  backgroundColor?: number;
  alpha?: number;
}

/**
 * LoadingIndicator - Reusable loading screen component
 * Provides smooth loading animations and progress tracking
 */
export class LoadingIndicator {
  private scene: Scene;
  private container?: Phaser.GameObjects.Container | undefined;
  private background?: Phaser.GameObjects.Graphics | undefined;
  private loadingText?: Phaser.GameObjects.Text | undefined;
  private spinner?: Phaser.GameObjects.Graphics | undefined;
  private progressBarBg?: Phaser.GameObjects.Graphics | undefined;
  private progressBar?: Phaser.GameObjects.Graphics | undefined;
  private spinnerTween?: Phaser.Tweens.Tween | null;
  private isVisible: boolean = false;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Show loading indicator with configuration
   */
  public show(config: LoadingConfig = {}): void {
    if (this.isVisible) {
      this.hide();
    }

    const finalConfig: Required<LoadingConfig> = {
      text: 'Loading...',
      showProgress: false,
      showSpinner: true,
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: 0x000000,
      alpha: 0.8,
      ...config
    };

    this.createLoadingScreen(finalConfig);
    this.isVisible = true;
  }

  /**
   * Update loading progress (0-1)
   */
  public updateProgress(progress: number): void {
    if (this.progressBar) {
      const barWidth = 300;
      this.progressBar.clear();
      this.progressBar.fillStyle(0x00ff00);
      this.progressBar.fillRect(-barWidth / 2 + 2, 0, (barWidth - 4) * progress, 16);
    }

    // Update text with percentage
    if (this.loadingText && progress >= 0 && progress <= 1) {
      const percentage = Math.round(progress * 100);
      const baseText = this.loadingText.text.split(' - ')[0];
      this.loadingText.setText(`${baseText} - ${percentage}%`);
    }
  }

  /**
   * Update loading text
   */
  public updateText(text: string): void {
    if (this.loadingText) {
      this.loadingText.setText(text);
    }
  }

  /**
   * Hide loading indicator with smooth animation
   */
  public hide(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.container || !this.isVisible) {
        resolve();
        return;
      }

      // Stop spinner animation
      if (this.spinnerTween) {
        this.spinnerTween.stop();
        this.spinnerTween = null;
      }

      // Fade out animation
      this.scene.tweens.add({
        targets: this.container,
        alpha: 0,
        duration: 300,
        ease: 'Power2.easeIn',
        onComplete: () => {
          this.cleanup();
          this.isVisible = false;
          resolve();
        }
      });
    });
  }

  /**
   * Create the loading screen elements
   */
  private createLoadingScreen(config: Required<LoadingConfig>): void {
    const { width, height } = this.scene.scale;
    
    // Main container
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(9999); // Very high depth
    this.container.setScrollFactor(0); // Don't scroll with camera

    // Semi-transparent background
    this.background = this.scene.add.graphics();
    this.background.fillStyle(config.backgroundColor, config.alpha);
    this.background.fillRect(0, 0, width, height);
    this.container.add(this.background);

    // Loading text
    this.loadingText = this.scene.add.text(width / 2, height / 2 - 30, config.text, {
      fontFamily: 'Arial Black',
      fontSize: config.fontSize,
      color: config.color,
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    this.container.add(this.loadingText);

    // Animated spinner
    if (config.showSpinner) {
      this.createSpinner(width / 2, height / 2 + 20);
    }

    // Progress bar
    if (config.showProgress) {
      this.createProgressBar(width / 2, height / 2 + 60);
    }

    // Fade in animation
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 300,
      ease: 'Power2.easeOut'
    });
  }

  /**
   * Create animated spinner
   */
  private createSpinner(x: number, y: number): void {
    this.spinner = this.scene.add.graphics();
    this.spinner.setPosition(x, y);
    
    // Draw spinner arc
    const radius = 20;
    const thickness = 4;
    
    this.spinner.lineStyle(thickness, 0xffffff, 1);
    this.spinner.beginPath();
    this.spinner.arc(0, 0, radius, 0, Math.PI * 1.5);
    this.spinner.strokePath();
    
    // Add glow effect
    this.spinner.lineStyle(thickness + 2, 0xffffff, 0.3);
    this.spinner.beginPath();
    this.spinner.arc(0, 0, radius, 0, Math.PI * 1.5);
    this.spinner.strokePath();

    this.container?.add(this.spinner);

    // Animate spinner rotation
    this.spinnerTween = this.scene.tweens.add({
      targets: this.spinner,
      rotation: Math.PI * 2,
      duration: 1000,
      ease: 'Linear',
      repeat: -1
    });
  }

  /**
   * Create progress bar
   */
  private createProgressBar(x: number, y: number): void {
    const barWidth = 300;
    const barHeight = 20;
    
    // Background
    this.progressBarBg = this.scene.add.graphics();
    this.progressBarBg.setPosition(x, y);
    this.progressBarBg.fillStyle(0x333333);
    this.progressBarBg.fillRect(-barWidth / 2, -barHeight / 2, barWidth, barHeight);
    this.progressBarBg.lineStyle(2, 0x666666);
    this.progressBarBg.strokeRect(-barWidth / 2, -barHeight / 2, barWidth, barHeight);

    // Progress fill
    this.progressBar = this.scene.add.graphics();
    this.progressBar.setPosition(x, y - barHeight / 2 + 2);
    
    this.container?.add(this.progressBarBg);
    this.container?.add(this.progressBar);
  }

  /**
   * Create pulsing dots animation
   */
  public createPulsingDots(x: number, y: number): void {
    const dots: Phaser.GameObjects.Graphics[] = [];
    const dotCount = 3;
    const dotSpacing = 15;
    
    for (let i = 0; i < dotCount; i++) {
      const dot = this.scene.add.graphics();
      dot.setPosition(x + (i - 1) * dotSpacing, y);
      dot.fillStyle(0xffffff);
      dot.fillCircle(0, 0, 4);
      
      // Animate dot pulsing with delay
      this.scene.tweens.add({
        targets: dot,
        scaleX: 1.5,
        scaleY: 1.5,
        alpha: 0.5,
        duration: 600,
        ease: 'Power2.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: i * 200
      });
      
      dots.push(dot);
      this.container?.add(dot);
    }
  }

  /**
   * Show loading tips
   */
  public showTip(tip: string): void {
    if (!this.container) return;

    const { width, height } = this.scene.scale;
    
    const tipText = this.scene.add.text(width / 2, height / 2 + 100, tip, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#cccccc',
      align: 'center',
      wordWrap: { width: width * 0.8 }
    }).setOrigin(0.5);
    
    this.container.add(tipText);
    
    // Fade in tip
    tipText.setAlpha(0);
    this.scene.tweens.add({
      targets: tipText,
      alpha: 1,
      duration: 500,
      ease: 'Power2.easeOut'
    });
  }

  /**
   * Cleanup all elements
   */
  private cleanup(): void {
    if (this.spinnerTween) {
      this.spinnerTween.stop();
      this.spinnerTween = null;
    }

    if (this.container) {
      this.container.destroy();
    }

    this.container = undefined;
    this.background = undefined;
    this.loadingText = undefined;
    this.spinner = undefined;
    this.progressBarBg = undefined;
    this.progressBar = undefined;
  }

  /**
   * Check if loading indicator is visible
   */
  public get visible(): boolean {
    return this.isVisible;
  }

  /**
   * Destroy the loading indicator
   */
  public destroy(): void {
    this.hide();
  }
}

/**
 * Global loading tips for the game
 */
export const LOADING_TIPS = [
  'Tip: Attack timing is key - wait for the perfect moment!',
  'Tip: Different character classes have unique attack styles',
  'Tip: Boss HP is shared across all players in the community',
  'Tip: Critical hits deal 3x damage and create screen shake',
  'Tip: Sessions last 2 minutes - make every attack count!',
  'Tip: Check the leaderboard to see top damage dealers',
  'Tip: Share your results on Reddit to celebrate victories',
  'Tip: Bosses change daily at 8 AM - each has unique themes',
  'Tip: Mobile users can tap rapidly for quick attacks',
  'Tip: Victory celebrations unlock when the boss is defeated'
] as const;

/**
 * Get a random loading tip
 */
export function getRandomTip(): string {
  return Phaser.Utils.Array.GetRandom([...LOADING_TIPS]);
}