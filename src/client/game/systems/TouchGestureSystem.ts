import { Scene } from 'phaser';
import { MobileUtils } from '../utils/MobileUtils';

export interface GestureConfig {
  tapThreshold: number;      // Max time for tap (ms)
  holdThreshold: number;     // Min time for hold (ms)
  swipeThreshold: number;    // Min distance for swipe (pixels)
  swipeTimeThreshold: number; // Max time for swipe (ms)
}

export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface SwipeData {
  direction: 'up' | 'down' | 'left' | 'right';
  distance: number;
  duration: number;
  startPoint: TouchPoint;
  endPoint: TouchPoint;
}

export interface TapData {
  x: number;
  y: number;
  duration: number;
}

export interface HoldData {
  x: number;
  y: number;
  duration: number;
}

/**
 * TouchGestureSystem - Handles touch gesture recognition and events
 * Supports tap, hold, and swipe gestures with customizable thresholds
 */
export class TouchGestureSystem {
  private scene: Scene;
  private config: GestureConfig;
  private isEnabled: boolean = false;
  
  // Touch tracking
  private touchStart?: TouchPoint;
  private touchCurrent?: TouchPoint;
  private isTracking: boolean = false;
  private holdTimer?: Phaser.Time.TimerEvent;
  
  // Event callbacks
  private onTapCallback?: (data: TapData) => void;
  private onHoldStartCallback?: (data: { x: number; y: number }) => void;
  private onHoldEndCallback?: (data: { x: number; y: number; duration: number }) => void;
  private onSwipeCallback?: (data: SwipeData) => void;
  
  constructor(scene: Scene, config?: Partial<GestureConfig>) {
    this.scene = scene;
    this.config = {
      tapThreshold: 300,      // 300ms max for tap
      holdThreshold: 500,     // 500ms min for hold
      swipeThreshold: 50,     // 50px min for swipe
      swipeTimeThreshold: 500, // 500ms max for swipe
      ...config
    };
    
    // Only enable on touch devices
    if (MobileUtils.isTouchDevice()) {
      this.setupTouchHandlers();
      this.isEnabled = true;
    }
  }

  private setupTouchHandlers(): void {
    // Use Phaser's input system for cross-platform compatibility
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleTouchStart(pointer);
    });
    
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.handleTouchMove(pointer);
    });
    
    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      this.handleTouchEnd(pointer);
    });
    
    // Prevent default touch behaviors
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.event) {
        pointer.event.preventDefault();
      }
    });
  }

  private handleTouchStart(pointer: Phaser.Input.Pointer): void {
    if (!this.isEnabled) return;
    
    this.touchStart = {
      x: pointer.x,
      y: pointer.y,
      timestamp: Date.now()
    };
    
    this.touchCurrent = { ...this.touchStart };
    this.isTracking = true;
    
    // Start hold timer
    this.startHoldTimer();
  }

  private handleTouchMove(pointer: Phaser.Input.Pointer): void {
    if (!this.isEnabled || !this.isTracking || !this.touchStart) return;
    
    this.touchCurrent = {
      x: pointer.x,
      y: pointer.y,
      timestamp: Date.now()
    };
    
    // Cancel hold if moved too far
    const distance = this.calculateDistance(this.touchStart, this.touchCurrent);
    if (distance > 20) { // 20px tolerance for hold
      this.cancelHoldTimer();
    }
  }

  private handleTouchEnd(pointer: Phaser.Input.Pointer): void {
    if (!this.isEnabled || !this.isTracking || !this.touchStart) return;
    
    const touchEnd: TouchPoint = {
      x: pointer.x,
      y: pointer.y,
      timestamp: Date.now()
    };
    
    const duration = touchEnd.timestamp - this.touchStart.timestamp;
    const distance = this.calculateDistance(this.touchStart, touchEnd);
    
    // Cancel any ongoing hold timer
    this.cancelHoldTimer();
    
    // Determine gesture type
    if (duration <= this.config.tapThreshold && distance < 20) {
      // Tap gesture
      this.handleTap({
        x: touchEnd.x,
        y: touchEnd.y,
        duration
      });
    } else if (distance >= this.config.swipeThreshold && duration <= this.config.swipeTimeThreshold) {
      // Swipe gesture
      this.handleSwipe(this.touchStart, touchEnd, duration);
    }
    
    // Reset tracking
    this.isTracking = false;
    this.touchStart = undefined as any;
    this.touchCurrent = undefined as any;
  }

  private startHoldTimer(): void {
    if (!this.touchStart) return;
    
    this.holdTimer = this.scene.time.delayedCall(this.config.holdThreshold, () => {
      if (this.touchStart && this.isTracking) {
        // Hold start detected
        if (this.onHoldStartCallback) {
          this.onHoldStartCallback({
            x: this.touchStart.x,
            y: this.touchStart.y
          });
        }
        
        // Haptic feedback for hold start
        if ('vibrate' in navigator) {
          navigator.vibrate(100);
        }
      }
    });
  }

  private cancelHoldTimer(): void {
    if (this.holdTimer) {
      this.holdTimer.destroy();
      this.holdTimer = undefined as any;
      
      // If we were in a hold, trigger hold end
      if (this.touchStart && this.isTracking) {
        const duration = Date.now() - this.touchStart.timestamp;
        if (duration >= this.config.holdThreshold && this.onHoldEndCallback) {
          this.onHoldEndCallback({
            x: this.touchStart.x,
            y: this.touchStart.y,
            duration
          });
        }
      }
    }
  }

  private handleTap(data: TapData): void {
    if (this.onTapCallback) {
      this.onTapCallback(data);
    }
    
    // Light haptic feedback for tap
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Emit scene event
    this.scene.events.emit('gesture-tap', data);
  }

  private handleSwipe(start: TouchPoint, end: TouchPoint, duration: number): void {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Determine swipe direction
    let direction: SwipeData['direction'];
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }
    
    const swipeData: SwipeData = {
      direction,
      distance,
      duration,
      startPoint: start,
      endPoint: end
    };
    
    if (this.onSwipeCallback) {
      this.onSwipeCallback(swipeData);
    }
    
    // Medium haptic feedback for swipe
    if ('vibrate' in navigator) {
      navigator.vibrate(75);
    }
    
    // Emit scene event
    this.scene.events.emit('gesture-swipe', swipeData);
  }

  private calculateDistance(point1: TouchPoint, point2: TouchPoint): number {
    const deltaX = point2.x - point1.x;
    const deltaY = point2.y - point1.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  // Public API methods
  
  /**
   * Set tap gesture callback
   */
  public onTap(callback: (data: TapData) => void): void {
    this.onTapCallback = callback;
  }



  public onHoldStart(callback: (data: { x: number; y: number }) => void): void {
    this.onHoldStartCallback = callback;
  }

  public onHoldEnd(callback: (data: { x: number; y: number; duration: number }) => void): void {
    this.onHoldEndCallback = callback;
  }

  /**
   * Set swipe gesture callback
   */
  public onSwipe(callback: (data: SwipeData) => void): void {
    this.onSwipeCallback = callback;
  }

  /**
   * Enable or disable gesture recognition
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    if (!enabled) {
      this.cancelHoldTimer();
      this.isTracking = false;
      this.touchStart = undefined as any;
      this.touchCurrent = undefined as any;
    }
  }

  /**
   * Check if gesture system is enabled
   */
  public getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Update gesture configuration
   */
  public updateConfig(config: Partial<GestureConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current gesture configuration
   */
  public getConfig(): GestureConfig {
    return { ...this.config };
  }

  /**
   * Check if currently tracking a gesture
   */
  public isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  /**
   * Get current touch position (if tracking)
   */
  public getCurrentTouchPosition(): TouchPoint | undefined {
    return this.touchCurrent ? { ...this.touchCurrent } : undefined;
  }

  /**
   * Destroy the gesture system and clean up resources
   */
  public destroy(): void {
    this.setEnabled(false);
    
    // Remove event listeners
    this.scene.input.off('pointerdown');
    this.scene.input.off('pointermove');
    this.scene.input.off('pointerup');
    
    // Clear callbacks
    this.onTapCallback = undefined as any;
    this.onHoldStartCallback = undefined as any;
    this.onHoldEndCallback = undefined as any;
    this.onSwipeCallback = undefined as any;
  }
}