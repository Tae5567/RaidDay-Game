import { EventEmitter } from 'events';

export interface SessionState {
  timeRemaining: number;    // 120 seconds (2 minutes)
  attacksUsed: number;      // Track attacks in session
  sessionDamage: number;    // Total damage this session
  canAttack: boolean;       // Simple attack availability
  isActive: boolean;        // Whether session is running
  sessionStartTime: number; // When session started
  maxAttacks: number;       // Maximum attacks per session (5-10)
}

export interface SessionSummary {
  totalDamage: number;
  attacksUsed: number;
  averageDamage: number;
  sessionDuration: number;
  criticalHits: number;
  playerRank?: number;
}

export class SessionSystem extends EventEmitter {
  private sessionState: SessionState;
  private sessionTimer: Phaser.Time.TimerEvent | null = null;
  private scene: Phaser.Scene;
  private criticalHitCount: number = 0;

  constructor(scene: Phaser.Scene) {
    super();
    this.scene = scene;
    this.sessionState = this.createInitialState();
  }

  private createInitialState(): SessionState {
    return {
      timeRemaining: 120, // 2 minutes in seconds
      attacksUsed: 0,
      sessionDamage: 0,
      canAttack: false,
      isActive: false,
      sessionStartTime: 0,
      maxAttacks: 10 // Allow up to 10 attacks per session
    };
  }

  public startSession(): void {
    if (this.sessionState.isActive) {
      console.warn('Session already active');
      return;
    }

    this.sessionState = {
      ...this.createInitialState(),
      isActive: true,
      canAttack: true,
      sessionStartTime: Date.now()
    };

    // Create 2-minute timer
    this.sessionTimer = this.scene.time.addEvent({
      delay: 120000, // 2 minutes in milliseconds
      callback: this.endSession.bind(this),
      callbackScope: this
    });

    // Emit session started event
    this.emit('sessionStarted', this.sessionState);

    console.log('Session started - 2 minutes, up to 10 attacks');
  }

  public canAttack(): boolean {
    return this.sessionState.isActive && 
           this.sessionState.canAttack && 
           this.sessionState.attacksUsed < this.sessionState.maxAttacks &&
           this.sessionState.timeRemaining > 0;
  }

  public recordAttack(damage: number, isCritical: boolean = false): void {
    if (!this.canAttack()) {
      console.warn('Cannot record attack - session not active or attack limit reached');
      return;
    }

    this.sessionState.attacksUsed++;
    this.sessionState.sessionDamage += damage;

    if (isCritical) {
      this.criticalHitCount++;
    }

    // Emit attack recorded event
    this.emit('attackRecorded', {
      damage,
      isCritical,
      attacksUsed: this.sessionState.attacksUsed,
      sessionDamage: this.sessionState.sessionDamage,
      attacksRemaining: this.sessionState.maxAttacks - this.sessionState.attacksUsed
    });

    // Check if max attacks reached
    if (this.sessionState.attacksUsed >= this.sessionState.maxAttacks) {
      console.log('Maximum attacks reached, ending session');
      this.endSession();
    }
  }

  public getTimeRemaining(): number {
    if (!this.sessionState.isActive || !this.sessionTimer) {
      return 0;
    }

    const elapsed = this.sessionTimer.getElapsed();
    const remaining = Math.max(0, 120000 - elapsed) / 1000; // Convert to seconds
    this.sessionState.timeRemaining = remaining;
    
    return remaining;
  }

  public getSessionState(): SessionState {
    // Update time remaining before returning state
    this.getTimeRemaining();
    return { ...this.sessionState };
  }

  public getAttacksRemaining(): number {
    return Math.max(0, this.sessionState.maxAttacks - this.sessionState.attacksUsed);
  }

  public endSession(): SessionSummary {
    if (!this.sessionState.isActive) {
      console.warn('No active session to end');
      return this.createEmptySummary();
    }

    // Stop the timer if it exists
    if (this.sessionTimer) {
      this.sessionTimer.destroy();
      this.sessionTimer = null;
    }

    // Calculate session duration
    const sessionDuration = (Date.now() - this.sessionState.sessionStartTime) / 1000;

    // Create session summary
    const summary: SessionSummary = {
      totalDamage: this.sessionState.sessionDamage,
      attacksUsed: this.sessionState.attacksUsed,
      averageDamage: this.sessionState.attacksUsed > 0 ? 
        Math.round(this.sessionState.sessionDamage / this.sessionState.attacksUsed) : 0,
      sessionDuration: Math.round(sessionDuration),
      criticalHits: this.criticalHitCount
    };

    // Reset session state
    this.sessionState = this.createInitialState();
    this.criticalHitCount = 0;

    // Emit session ended event
    this.emit('sessionEnded', summary);

    console.log('Session ended:', summary);
    return summary;
  }

  private createEmptySummary(): SessionSummary {
    return {
      totalDamage: 0,
      attacksUsed: 0,
      averageDamage: 0,
      sessionDuration: 0,
      criticalHits: 0
    };
  }

  public isSessionActive(): boolean {
    return this.sessionState.isActive;
  }

  public getSessionDamage(): number {
    return this.sessionState.sessionDamage;
  }

  public getAttacksUsed(): number {
    return this.sessionState.attacksUsed;
  }

  public destroy(): void {
    if (this.sessionTimer) {
      this.sessionTimer.destroy();
      this.sessionTimer = null;
    }
    this.removeAllListeners();
  }
}