import { Scene } from 'phaser';
import { MobileUtils } from '../utils/MobileUtils';
import { GameConstants } from '../utils/GameConstants';

export interface LayoutConfig {
  portrait: {
    hudTopHeight: number;
    hudBottomHeight: number;
    battleAreaHeight: number;
    sidebarWidth: number;
    fontSize: {
      title: string;
      subtitle: string;
      body: string;
      small: string;
    };
  };
  landscape: {
    hudTopHeight: number;
    hudBottomHeight: number;
    battleAreaHeight: number;
    sidebarWidth: number;
    fontSize: {
      title: string;
      subtitle: string;
      body: string;
      small: string;
    };
  };
}

export interface ResponsiveElement {
  gameObject: Phaser.GameObjects.GameObject;
  portraitConfig: ElementConfig;
  landscapeConfig: ElementConfig;
}

export interface ElementConfig {
  x: number | string; // Can be pixel value or percentage string like "50%"
  y: number | string;
  scale?: number;
  visible?: boolean;
  alpha?: number;
}

/**
 * ResponsiveLayoutSystem - Manages dynamic layout scaling for portrait/landscape modes
 * Handles responsive positioning and sizing of UI elements
 */
export class ResponsiveLayoutSystem {
  private scene: Scene;
  private elements: Map<string, ResponsiveElement> = new Map();
  private currentOrientation: 'portrait' | 'landscape';
  private layoutConfig: LayoutConfig;
  private resizeDebounceTimer?: NodeJS.Timeout;

  constructor(scene: Scene) {
    this.scene = scene;
    this.currentOrientation = MobileUtils.getScreenOrientation();
    this.layoutConfig = this.createLayoutConfig();
    
    this.setupResizeListener();
  }

  private createLayoutConfig(): LayoutConfig {
    const isMobile = MobileUtils.isMobile();
    
    return {
      portrait: {
        hudTopHeight: isMobile ? 100 : 100,
        hudBottomHeight: isMobile ? 140 : 100, // Extra space for larger touch buttons
        battleAreaHeight: isMobile ? 360 : 400, // Adjusted for mobile portrait
        sidebarWidth: 0, // No sidebar in portrait
        fontSize: {
          title: isMobile ? '20px' : '24px', // Larger for mobile readability
          subtitle: isMobile ? '16px' : '18px',
          body: isMobile ? '14px' : '14px', // Increased for mobile
          small: isMobile ? '12px' : '12px'
        }
      },
      landscape: {
        hudTopHeight: isMobile ? 80 : 80,
        hudBottomHeight: isMobile ? 100 : 100,
        battleAreaHeight: isMobile ? 320 : 420,
        sidebarWidth: isMobile ? 120 : 150,
        fontSize: {
          title: isMobile ? '18px' : '24px',
          subtitle: isMobile ? '14px' : '18px',
          body: isMobile ? '12px' : '14px',
          small: isMobile ? '10px' : '12px'
        }
      }
    };
  }

  private setupResizeListener(): void {
    this.scene.scale.on('resize', () => {
      // Debounce resize events to prevent excessive updates
      if (this.resizeDebounceTimer) {
        clearTimeout(this.resizeDebounceTimer);
      }
      
      this.resizeDebounceTimer = setTimeout(() => {
        this.handleResize();
      }, 100);
    });
  }

  private handleResize(): void {
    const newOrientation = MobileUtils.getScreenOrientation();
    const orientationChanged = newOrientation !== this.currentOrientation;
    
    if (orientationChanged) {
      this.currentOrientation = newOrientation;
      console.log(`Orientation changed to: ${newOrientation}`);
    }
    
    this.updateAllElements();
    
    // Emit orientation change event for other systems to respond
    if (orientationChanged) {
      this.scene.events.emit('orientation-changed', newOrientation);
    }
  }

  /**
   * Register a responsive element with the system
   */
  public registerElement(
    id: string,
    gameObject: Phaser.GameObjects.GameObject,
    portraitConfig: ElementConfig,
    landscapeConfig: ElementConfig
  ): void {
    this.elements.set(id, {
      gameObject,
      portraitConfig,
      landscapeConfig
    });
    
    // Apply initial layout
    this.updateElement(id);
  }

  /**
   * Unregister an element from the system
   */
  public unregisterElement(id: string): void {
    this.elements.delete(id);
  }

  /**
   * Update a specific element's layout
   */
  public updateElement(id: string): void {
    const element = this.elements.get(id);
    if (!element) return;

    const config = this.currentOrientation === 'portrait' 
      ? element.portraitConfig 
      : element.landscapeConfig;
    
    const { width, height } = this.scene.scale;
    
    // Calculate position
    const x = this.parsePosition(config.x, width);
    const y = this.parsePosition(config.y, height);
    
    // Apply transformations
    if ('setPosition' in element.gameObject) {
      (element.gameObject as any).setPosition(x, y);
    }
    
    if (config.scale !== undefined && 'setScale' in element.gameObject) {
      (element.gameObject as any).setScale(config.scale);
    }
    
    if (config.visible !== undefined && 'setVisible' in element.gameObject) {
      (element.gameObject as any).setVisible(config.visible);
    }
    
    if (config.alpha !== undefined && 'setAlpha' in element.gameObject) {
      (element.gameObject as any).setAlpha(config.alpha);
    }
  }

  /**
   * Update all registered elements
   */
  public updateAllElements(): void {
    this.elements.forEach((_, id) => {
      this.updateElement(id);
    });
  }

  /**
   * Parse position value (supports percentages and pixel values)
   */
  private parsePosition(position: number | string, dimension: number): number {
    if (typeof position === 'string' && position.endsWith('%')) {
      const percentage = parseFloat(position.replace('%', '')) / 100;
      return dimension * percentage;
    }
    return typeof position === 'number' ? position : parseFloat(position);
  }

  /**
   * Get current layout configuration
   */
  public getCurrentLayoutConfig(): LayoutConfig[keyof LayoutConfig] {
    return this.layoutConfig[this.currentOrientation];
  }

  /**
   * Get current orientation
   */
  public getCurrentOrientation(): 'portrait' | 'landscape' {
    return this.currentOrientation;
  }

  /**
   * Check if device is in portrait mode
   */
  public isPortrait(): boolean {
    return this.currentOrientation === 'portrait';
  }

  /**
   * Check if device is in landscape mode
   */
  public isLandscape(): boolean {
    return this.currentOrientation === 'landscape';
  }

  /**
   * Get responsive font size for current orientation
   */
  public getFontSize(type: 'title' | 'subtitle' | 'body' | 'small'): string {
    return this.getCurrentLayoutConfig().fontSize[type];
  }

  /**
   * Get safe area dimensions (accounting for mobile notches, etc.)
   */
  public getSafeAreaDimensions(): { width: number; height: number; offsetX: number; offsetY: number } {
    const { width, height } = this.scene.scale;
    
    // Basic safe area calculation - can be enhanced with actual device detection
    const isMobile = MobileUtils.isMobile();
    const isPortrait = this.isPortrait();
    
    let offsetX = 0;
    let offsetY = 0;
    let safeWidth = width;
    let safeHeight = height;
    
    if (isMobile) {
      if (isPortrait) {
        // Account for status bar and home indicator
        offsetY = 20;
        safeHeight = height - 40;
      } else {
        // Account for notches in landscape
        offsetX = 20;
        safeWidth = width - 40;
        offsetY = 10;
        safeHeight = height - 20;
      }
    }
    
    return { width: safeWidth, height: safeHeight, offsetX, offsetY };
  }

  /**
   * Create responsive button with appropriate sizing
   */
  public createResponsiveButton(
    x: number | string,
    y: number | string,
    text: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const { width, height } = this.scene.scale;
    const isMobile = MobileUtils.isMobile();
    
    // Calculate responsive button size
    const buttonWidth = isMobile ? 
      Math.max(120, GameConstants.MOBILE_TOUCH_TARGET_SIZE) : 
      140;
    const buttonHeight = isMobile ? 
      GameConstants.MOBILE_TOUCH_TARGET_SIZE : 
      40;
    
    const container = this.scene.add.container(
      this.parsePosition(x, width),
      this.parsePosition(y, height)
    );
    
    // Button background
    const background = this.scene.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x4a90e2)
      .setStrokeStyle(2, 0xffffff);
    
    // Button text with responsive font size
    const label = this.scene.add.text(0, 0, text, {
      fontSize: this.getFontSize('body'),
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    container.add([background, label]);
    
    // Make interactive with proper touch handling
    background.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        background.setFillStyle(0x3a7bc8);
        container.setScale(0.95);
        
        // Haptic feedback on mobile
        if (isMobile && 'vibrate' in navigator) {
          navigator.vibrate(50);
        }
      })
      .on('pointerup', () => {
        background.setFillStyle(0x4a90e2);
        container.setScale(1);
        callback();
      })
      .on('pointerout', () => {
        background.setFillStyle(0x4a90e2);
        container.setScale(1);
      });
    
    return container;
  }

  /**
   * Apply responsive text styling
   */
  public applyResponsiveTextStyle(
    textObject: Phaser.GameObjects.Text,
    type: 'title' | 'subtitle' | 'body' | 'small'
  ): void {
    textObject.setFontSize(this.getFontSize(type));
  }

  /**
   * Get optimal particle count for current device
   */
  public getOptimalParticleCount(): number {
    return MobileUtils.getOptimalParticleCount();
  }

  /**
   * Destroy the system and clean up resources
   */
  public destroy(): void {
    if (this.resizeDebounceTimer) {
      clearTimeout(this.resizeDebounceTimer);
    }
    
    this.scene.scale.off('resize');
    this.elements.clear();
  }
}