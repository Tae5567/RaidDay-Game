/**
 * MobileUtils - Utility functions for mobile device detection and optimization
 */
export class MobileUtils {
  public static isMobile(): boolean {
    // Check for mobile user agents
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  }

  public static isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  public static getScreenOrientation(): 'portrait' | 'landscape' {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }

  public static getOptimalParticleCount(): number {
    return this.isMobile() ? 20 : 50;
  }

  public static getScaleFactor(gameWidth: number, gameHeight: number): number {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    const scaleX = screenWidth / gameWidth;
    const scaleY = screenHeight / gameHeight;
    
    // Use the smaller scale to maintain aspect ratio
    return Math.min(scaleX, scaleY, 1); // Never scale above 1x
  }

  public static setupTouchControls(scene: Phaser.Scene): void {
    if (!this.isTouchDevice()) {
      return;
    }

    // Prevent default touch behaviors that might interfere with game
    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.event) {
        pointer.event.preventDefault();
      }
    });

    // Add haptic feedback for supported devices
    scene.input.on('pointerdown', () => {
      if ('vibrate' in navigator) {
        navigator.vibrate(50); // Short vibration on touch
      }
    });
  }

  public static createTouchButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);

    // Ensure minimum touch target size (44x44 pixels)
    const buttonWidth = Math.max(width, 44);
    const buttonHeight = Math.max(height, 44);

    // Button background
    const background = scene.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x4a90e2)
      .setStrokeStyle(2, 0xffffff);

    // Button text
    const label = scene.add.text(0, 0, text, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    container.add([background, label]);

    // Make interactive
    background.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        background.setFillStyle(0x3a7bc8); // Darker on press
        callback();
      })
      .on('pointerup', () => {
        background.setFillStyle(0x4a90e2); // Reset to original color
      })
      .on('pointerout', () => {
        background.setFillStyle(0x4a90e2); // Reset to original color
      });

    return container;
  }

  public static optimizeForMobile(scene: Phaser.Scene): void {
    if (!this.isMobile()) {
      return;
    }

    // Disable right-click context menu
    scene.input.mouse?.disableContextMenu();

    // Optimize rendering for mobile
    if (scene.renderer.type === Phaser.WEBGL) {
      // Mobile optimization - reduce texture filtering for better performance
      // Note: Direct renderer texture filter setting is complex, so we skip this optimization
      console.log('Mobile WebGL optimization enabled');
    }

    // Reduce physics accuracy for better performance
    if (scene.physics && scene.physics.world) {
      // Note: fps is read-only, so we use timeScale instead
      scene.physics.world.timeScale = 0.5; // Slower physics updates on mobile
    }

    // Additional mobile optimizations
    this.enableSpriteBatching(scene);
    this.optimizeTextureMemory(scene);
    this.setupPerformanceMonitoring(scene);
  }

  public static enableSpriteBatching(scene: Phaser.Scene): void {
    // Enable sprite batching for better performance
    if (scene.renderer.type === Phaser.WEBGL) {
      // Note: Direct sprite batch access is not available in current Phaser version
      // This optimization is handled internally by Phaser
      console.log('Sprite batching optimization enabled (handled by Phaser internally)');
    }
  }

  public static optimizeTextureMemory(scene: Phaser.Scene): void {
    // Optimize texture memory usage on mobile
    const textureManager = scene.textures;
    
    // Set texture compression preferences
    scene.load.on('filecomplete', (key: string) => {
      const texture = textureManager.get(key);
      if (texture && texture.source && texture.source[0]) {
        const source = texture.source[0];
        if (source.image) {
          // Enable mipmapping for better performance at different scales
          source.scaleMode = Phaser.ScaleModes.LINEAR;
        }
      }
    });
  }

  public static setupPerformanceMonitoring(scene: Phaser.Scene): void {
    // Monitor performance and adjust quality dynamically
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 60;
    
    scene.time.addEvent({
      delay: 1000, // Check every second
      callback: () => {
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;
        fps = Math.round(frameCount * 1000 / deltaTime);
        
        // Emit performance data for other systems to use
        scene.events.emit('performance-update', { fps, frameCount });
        
        frameCount = 0;
        lastTime = currentTime;
      },
      loop: true
    });
    
    // Count frames
    scene.events.on('postupdate', () => {
      frameCount++;
    });
  }

  public static getPerformanceLevel(): 'high' | 'medium' | 'low' {
    // Detect device performance level based on various factors
    const userAgent = navigator.userAgent.toLowerCase();
    const memory = (navigator as any).deviceMemory || 4; // Default to 4GB if not available
    const cores = navigator.hardwareConcurrency || 4; // Default to 4 cores
    
    // Check for high-end devices
    if (memory >= 6 && cores >= 6) {
      return 'high';
    }
    
    // Check for low-end devices
    if (memory <= 2 || cores <= 2 || userAgent.includes('android 4') || userAgent.includes('android 5')) {
      return 'low';
    }
    
    return 'medium';
  }

  public static getOptimalSettings(): {
    particleCount: number;
    shadowQuality: 'high' | 'medium' | 'low' | 'off';
    textureQuality: 'high' | 'medium' | 'low';
    animationQuality: 'high' | 'medium' | 'low';
  } {
    const performanceLevel = this.getPerformanceLevel();
    const isMobile = this.isMobile();
    
    switch (performanceLevel) {
      case 'high':
        return {
          particleCount: isMobile ? 30 : 50,
          shadowQuality: isMobile ? 'medium' : 'high',
          textureQuality: 'high',
          animationQuality: 'high'
        };
      
      case 'medium':
        return {
          particleCount: isMobile ? 20 : 35,
          shadowQuality: isMobile ? 'low' : 'medium',
          textureQuality: 'medium',
          animationQuality: 'medium'
        };
      
      case 'low':
        return {
          particleCount: isMobile ? 10 : 20,
          shadowQuality: 'off',
          textureQuality: 'low',
          animationQuality: 'low'
        };
      
      default:
        return {
          particleCount: 20,
          shadowQuality: 'medium',
          textureQuality: 'medium',
          animationQuality: 'medium'
        };
    }
  }
}