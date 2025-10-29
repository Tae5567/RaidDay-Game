import { Scene } from 'phaser';
import { MobileUtils } from '../utils/MobileUtils';
// GameConstants import removed as it's not used

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  drawCalls?: number;
  textureMemory?: number;
  particleCount: number;
  activeObjects: number;
}

export interface QualitySettings {
  particleCount: number;
  shadowQuality: 'high' | 'medium' | 'low' | 'off';
  textureQuality: 'high' | 'medium' | 'low';
  animationQuality: 'high' | 'medium' | 'low';
  enableScreenShake: boolean;
  enableParticleEffects: boolean;
  enableGlowEffects: boolean;
}

export interface PerformanceThresholds {
  targetFPS: number;
  minFPS: number;
  maxFrameTime: number;
  memoryWarningThreshold?: number;
}

/**
 * PerformanceMonitor - Monitors game performance and automatically adjusts quality settings
 * Implements frame rate detection, automatic quality adjustment, and fallback systems
 */
export class PerformanceMonitor {
  private scene: Scene;
  private isEnabled: boolean = true;
  
  // Performance tracking
  private metrics: PerformanceMetrics;
  private thresholds: PerformanceThresholds;
  private qualitySettings: QualitySettings;
  
  // Frame rate tracking
  private frameCount: number = 0;
  private lastTime: number = 0;
  private frameTimeHistory: number[] = [];
  private fpsHistory: number[] = [];
  private readonly historySize = 60; // Track last 60 frames
  
  // Quality adjustment
  private lastQualityAdjustment: number = 0;
  private readonly adjustmentCooldown = 5000; // 5 seconds between adjustments
  private qualityLevel: 'high' | 'medium' | 'low' = 'high';
  
  // Object pools for performance optimization
  private objectPools: Map<string, any[]> = new Map();
  
  // Event callbacks
  private onQualityChangeCallback?: (settings: QualitySettings) => void;
  private onPerformanceWarningCallback?: (metrics: PerformanceMetrics) => void;

  constructor(scene: Scene, thresholds?: Partial<PerformanceThresholds>) {
    this.scene = scene;
    
    // Set performance thresholds based on device capabilities
    this.thresholds = {
      targetFPS: 60,
      minFPS: MobileUtils.isMobile() ? 30 : 45,
      maxFrameTime: MobileUtils.isMobile() ? 33 : 22, // 30fps vs 45fps
      memoryWarningThreshold: MobileUtils.isMobile() ? 100 : 200, // MB
      ...thresholds
    };
    
    // Initialize metrics
    this.metrics = {
      fps: 60,
      frameTime: 16.67,
      particleCount: 0,
      activeObjects: 0
    };
    
    // Set initial quality settings based on device performance
    this.qualitySettings = this.getInitialQualitySettings();
    
    this.setupPerformanceTracking();
    this.setupObjectPools();
  }

  private getInitialQualitySettings(): QualitySettings {
    const optimalSettings = MobileUtils.getOptimalSettings();
    
    return {
      particleCount: optimalSettings.particleCount,
      shadowQuality: optimalSettings.shadowQuality,
      textureQuality: optimalSettings.textureQuality,
      animationQuality: optimalSettings.animationQuality,
      enableScreenShake: true,
      enableParticleEffects: true,
      enableGlowEffects: !MobileUtils.isMobile() || MobileUtils.getPerformanceLevel() === 'high'
    };
  }

  private setupPerformanceTracking(): void {
    this.lastTime = performance.now();
    
    // Track performance every frame
    this.scene.events.on('postupdate', () => {
      this.updateMetrics();
    });
    
    // Analyze performance every second
    this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        this.analyzePerformance();
      },
      loop: true
    });
    
    // Memory monitoring (if available)
    if ('memory' in performance) {
      this.scene.time.addEvent({
        delay: 5000, // Check memory every 5 seconds
        callback: () => {
          this.updateMemoryMetrics();
        },
        loop: true
      });
    }
  }

  private updateMetrics(): void {
    const currentTime = performance.now();
    const frameTime = currentTime - this.lastTime;
    
    this.frameCount++;
    this.frameTimeHistory.push(frameTime);
    
    // Keep history size manageable
    if (this.frameTimeHistory.length > this.historySize) {
      this.frameTimeHistory.shift();
    }
    
    // Calculate FPS
    if (this.frameTimeHistory.length >= 10) {
      const avgFrameTime = this.frameTimeHistory.slice(-10).reduce((a, b) => a + b, 0) / 10;
      this.metrics.fps = Math.round(1000 / avgFrameTime);
      this.metrics.frameTime = avgFrameTime;
    }
    
    this.lastTime = currentTime;
    
    // Count active objects in scene
    this.metrics.activeObjects = this.countActiveObjects();
  }

  private updateMemoryMetrics(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
    }
  }

  private countActiveObjects(): number {
    let count = 0;
    
    // Count display objects
    this.scene.children.list.forEach(child => {
      if (child.active && (child as any).visible !== false) {
        count++;
        
        // Count children of containers
        if ('list' in child) {
          count += (child as any).list.length;
        }
      }
    });
    
    return count;
  }

  private analyzePerformance(): void {
    if (!this.isEnabled) return;
    
    const avgFPS = this.calculateAverageFPS();
    const avgFrameTime = this.calculateAverageFrameTime();
    
    // Update FPS history
    this.fpsHistory.push(avgFPS);
    if (this.fpsHistory.length > 10) {
      this.fpsHistory.shift();
    }
    
    // Check if performance adjustment is needed
    const needsAdjustment = this.shouldAdjustQuality(avgFPS, avgFrameTime);
    
    if (needsAdjustment && this.canAdjustQuality()) {
      this.adjustQuality(avgFPS);
    }
    
    // Check for performance warnings
    if (avgFPS < this.thresholds.minFPS || avgFrameTime > this.thresholds.maxFrameTime) {
      this.handlePerformanceWarning();
    }
    
    // Emit performance update event
    this.scene.events.emit('performance-update', {
      ...this.metrics,
      fps: avgFPS,
      frameTime: avgFrameTime
    });
  }

  private calculateAverageFPS(): number {
    if (this.frameTimeHistory.length === 0) return 60;
    
    const recentFrames = this.frameTimeHistory.slice(-30); // Last 30 frames
    const avgFrameTime = recentFrames.reduce((a, b) => a + b, 0) / recentFrames.length;
    return Math.round(1000 / avgFrameTime);
  }

  private calculateAverageFrameTime(): number {
    if (this.frameTimeHistory.length === 0) return 16.67;
    
    const recentFrames = this.frameTimeHistory.slice(-30);
    return recentFrames.reduce((a, b) => a + b, 0) / recentFrames.length;
  }

  private shouldAdjustQuality(fps: number, frameTime: number): boolean {
    // Adjust if consistently below target
    const recentFPS = this.fpsHistory.slice(-3); // Last 3 seconds
    const consistentlyLow = recentFPS.length >= 3 && recentFPS.every(f => f < this.thresholds.targetFPS * 0.8);
    
    // Or if frame time is consistently high
    const recentFrameTimes = this.frameTimeHistory.slice(-30);
    const consistentlyHighFrameTime = recentFrameTimes.length >= 30 && 
      recentFrameTimes.slice(-10).every(ft => ft > this.thresholds.maxFrameTime);
    
    return consistentlyLow || consistentlyHighFrameTime;
  }

  private canAdjustQuality(): boolean {
    const now = Date.now();
    return now - this.lastQualityAdjustment > this.adjustmentCooldown;
  }

  private adjustQuality(currentFPS: number): void {
    this.lastQualityAdjustment = Date.now();
    
    if (currentFPS < this.thresholds.minFPS) {
      // Reduce quality
      this.reduceQuality();
    } else if (currentFPS > this.thresholds.targetFPS && this.qualityLevel !== 'high') {
      // Increase quality if performance allows
      this.increaseQuality();
    }
    
    // Notify about quality change
    if (this.onQualityChangeCallback) {
      this.onQualityChangeCallback(this.qualitySettings);
    }
    
    this.scene.events.emit('quality-changed', this.qualitySettings);
    
    console.log(`Quality adjusted to ${this.qualityLevel} (FPS: ${currentFPS})`);
  }

  private reduceQuality(): void {
    switch (this.qualityLevel) {
      case 'high':
        this.qualityLevel = 'medium';
        this.qualitySettings.particleCount = Math.floor(this.qualitySettings.particleCount * 0.7);
        this.qualitySettings.shadowQuality = 'medium';
        this.qualitySettings.enableGlowEffects = false;
        break;
        
      case 'medium':
        this.qualityLevel = 'low';
        this.qualitySettings.particleCount = Math.floor(this.qualitySettings.particleCount * 0.5);
        this.qualitySettings.shadowQuality = 'off';
        this.qualitySettings.textureQuality = 'low';
        this.qualitySettings.animationQuality = 'low';
        this.qualitySettings.enableScreenShake = false;
        break;
        
      case 'low':
        // Already at lowest quality, disable more effects
        this.qualitySettings.particleCount = Math.max(5, Math.floor(this.qualitySettings.particleCount * 0.5));
        this.qualitySettings.enableParticleEffects = false;
        break;
    }
  }

  private increaseQuality(): void {
    switch (this.qualityLevel) {
      case 'low':
        this.qualityLevel = 'medium';
        this.qualitySettings.particleCount = Math.min(30, this.qualitySettings.particleCount * 2);
        this.qualitySettings.shadowQuality = 'medium';
        this.qualitySettings.textureQuality = 'medium';
        this.qualitySettings.animationQuality = 'medium';
        this.qualitySettings.enableScreenShake = true;
        this.qualitySettings.enableParticleEffects = true;
        break;
        
      case 'medium':
        this.qualityLevel = 'high';
        this.qualitySettings.particleCount = Math.min(50, this.qualitySettings.particleCount * 1.5);
        this.qualitySettings.shadowQuality = 'high';
        this.qualitySettings.textureQuality = 'high';
        this.qualitySettings.animationQuality = 'high';
        this.qualitySettings.enableGlowEffects = true;
        break;
    }
  }

  private handlePerformanceWarning(): void {
    if (this.onPerformanceWarningCallback) {
      this.onPerformanceWarningCallback(this.metrics);
    }
    
    this.scene.events.emit('performance-warning', this.metrics);
  }

  private setupObjectPools(): void {
    // Create object pools for frequently created/destroyed objects
    this.createObjectPool('damageNumbers', 20);
    this.createObjectPool('particles', 100);
    this.createObjectPool('statusMessages', 10);
  }

  private createObjectPool(type: string, size: number): void {
    this.objectPools.set(type, new Array(size).fill(null));
  }

  // Public API methods

  /**
   * Get an object from the pool
   */
  public getPooledObject(type: string): any {
    const pool = this.objectPools.get(type);
    if (!pool) return null;
    
    // Find first available object
    for (let i = 0; i < pool.length; i++) {
      if (pool[i] === null || !pool[i].active) {
        return pool[i];
      }
    }
    
    return null; // Pool exhausted
  }

  /**
   * Return an object to the pool
   */
  public returnToPool(type: string, object: any): void {
    const pool = this.objectPools.get(type);
    if (!pool) return;
    
    // Find empty slot
    for (let i = 0; i < pool.length; i++) {
      if (pool[i] === null) {
        pool[i] = object;
        if (object.setActive) {
          object.setActive(false);
        }
        if (object.setVisible) {
          object.setVisible(false);
        }
        break;
      }
    }
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get current quality settings
   */
  public getQualitySettings(): QualitySettings {
    return { ...this.qualitySettings };
  }

  /**
   * Get current quality level
   */
  public getQualityLevel(): 'high' | 'medium' | 'low' {
    return this.qualityLevel;
  }

  /**
   * Manually set quality settings
   */
  public setQualitySettings(settings: Partial<QualitySettings>): void {
    this.qualitySettings = { ...this.qualitySettings, ...settings };
    
    if (this.onQualityChangeCallback) {
      this.onQualityChangeCallback(this.qualitySettings);
    }
    
    this.scene.events.emit('quality-changed', this.qualitySettings);
  }

  /**
   * Set callback for quality changes
   */
  public onQualityChange(callback: (settings: QualitySettings) => void): void {
    this.onQualityChangeCallback = callback;
  }

  /**
   * Set callback for performance warnings
   */
  public onPerformanceWarning(callback: (metrics: PerformanceMetrics) => void): void {
    this.onPerformanceWarningCallback = callback;
  }

  /**
   * Enable or disable performance monitoring
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Force a quality adjustment check
   */
  public forceQualityCheck(): void {
    const avgFPS = this.calculateAverageFPS();
    const avgFrameTime = this.calculateAverageFrameTime();
    
    if (this.shouldAdjustQuality(avgFPS, avgFrameTime)) {
      this.adjustQuality(avgFPS);
    }
  }

  /**
   * Reset performance history
   */
  public resetHistory(): void {
    this.frameTimeHistory = [];
    this.fpsHistory = [];
    this.frameCount = 0;
    this.lastTime = performance.now();
  }

  /**
   * Get performance statistics
   */
  public getPerformanceStats(): {
    averageFPS: number;
    minFPS: number;
    maxFPS: number;
    frameTimeVariance: number;
  } {
    if (this.fpsHistory.length === 0) {
      return { averageFPS: 60, minFPS: 60, maxFPS: 60, frameTimeVariance: 0 };
    }
    
    const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    const minFPS = Math.min(...this.fpsHistory);
    const maxFPS = Math.max(...this.fpsHistory);
    
    const frameTimeVariance = this.frameTimeHistory.length > 1 ? 
      this.calculateVariance(this.frameTimeHistory) : 0;
    
    return {
      averageFPS: Math.round(avgFPS),
      minFPS,
      maxFPS,
      frameTimeVariance: Math.round(frameTimeVariance * 100) / 100
    };
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Destroy the performance monitor and clean up resources
   */
  public destroy(): void {
    this.isEnabled = false;
    
    // Clear object pools
    this.objectPools.clear();
    
    // Remove event listeners
    this.scene.events.off('postupdate');
    
    // Clear callbacks
    this.onQualityChangeCallback = undefined as any;
    this.onPerformanceWarningCallback = undefined as any;
  }
}