import { GameConstants } from '../utils/GameConstants';

/**
 * EnergySystem - Manages player energy points and cooldown timers
 * Handles 5-point energy system with 30-second per-point cooldowns
 */
export interface EnergyState {
  current: number;        // 0-5 energy points
  max: number;           // Always 5
  cooldowns: number[];   // Per-point cooldown timers (30s each)
  lastRefresh: number;   // Server-side 2-hour gate
  sessionStart: number;  // Track session duration
  specialAbilityUsed: boolean; // Once-per-session limitation
}

export class EnergySystem {
  private energyState: EnergyState;

  constructor() {
    this.energyState = {
      current: GameConstants.MAX_ENERGY,
      max: GameConstants.MAX_ENERGY,
      cooldowns: new Array(GameConstants.MAX_ENERGY).fill(0),
      lastRefresh: Date.now(),
      sessionStart: Date.now(),
      specialAbilityUsed: false
    };
  }

  public canAttack(): boolean {
    return this.energyState.current > 0;
  }

  public consumeEnergy(): boolean {
    if (!this.canAttack()) {
      return false;
    }

    // Find the first available energy point
    for (let i = 0; i < this.energyState.max; i++) {
      if (this.energyState.cooldowns[i] === 0) {
        this.energyState.cooldowns[i] = GameConstants.ENERGY_COOLDOWN_MS;
        this.energyState.current--;
        return true;
      }
    }

    return false;
  }

  public getNextRefreshTime(): number {
    // Find the shortest cooldown time remaining
    const activeCooldowns = this.energyState.cooldowns.filter(cd => cd > 0);
    if (activeCooldowns.length === 0) {
      return 0;
    }
    return Math.min(...activeCooldowns);
  }

  public updateCooldowns(deltaTime: number): void {
    let energyRestored = 0;

    for (let i = 0; i < this.energyState.cooldowns.length; i++) {
      if (this.energyState.cooldowns[i] > 0) {
        this.energyState.cooldowns[i] = Math.max(0, this.energyState.cooldowns[i] - deltaTime);
        
        if (this.energyState.cooldowns[i] === 0) {
          energyRestored++;
        }
      }
    }

    this.energyState.current = Math.min(this.energyState.max, this.energyState.current + energyRestored);

    // Check for 2-hour session refresh
    const timeSinceRefresh = Date.now() - this.energyState.lastRefresh;
    if (timeSinceRefresh >= GameConstants.SESSION_REFRESH_MS) {
      this.refreshSession();
    }
  }

  private refreshSession(): void {
    this.energyState.current = this.energyState.max;
    this.energyState.cooldowns = new Array(GameConstants.MAX_ENERGY).fill(0);
    this.energyState.lastRefresh = Date.now();
    this.energyState.specialAbilityUsed = false; // Reset special ability on session refresh
  }

  /**
   * Get cooldown time remaining for a specific energy point
   */
  public getCooldownForPoint(index: number): number {
    if (index < 0 || index >= this.energyState.cooldowns.length) {
      return 0;
    }
    return this.energyState.cooldowns[index];
  }

  /**
   * Get total session time in milliseconds
   */
  public getSessionDuration(): number {
    return Date.now() - this.energyState.sessionStart;
  }

  /**
   * Check if session refresh is available (2 hours passed)
   */
  public canRefreshSession(): boolean {
    const timeSinceRefresh = Date.now() - this.energyState.lastRefresh;
    return timeSinceRefresh >= GameConstants.SESSION_REFRESH_MS;
  }

  /**
   * Force refresh session (for server-side validation)
   */
  public forceRefreshSession(): void {
    this.refreshSession();
  }

  /**
   * Check if special ability can be used (once per session)
   */
  public canUseSpecialAbility(): boolean {
    return !this.energyState.specialAbilityUsed && this.energyState.current >= 3;
  }

  /**
   * Mark special ability as used for this session
   */
  public useSpecialAbility(): boolean {
    if (!this.canUseSpecialAbility()) {
      return false;
    }
    this.energyState.specialAbilityUsed = true;
    return true;
  }

  /**
   * Check if special ability has been used this session
   */
  public isSpecialAbilityUsed(): boolean {
    return this.energyState.specialAbilityUsed;
  }

  public getEnergyState(): EnergyState {
    return { ...this.energyState };
  }

  public hasFullEnergy(): boolean {
    return this.energyState.current === this.energyState.max;
  }

  /**
   * Synchronize energy state with server data
   */
  public syncWithServer(serverEnergyState: {
    current: number;
    max: number;
    cooldowns: number[];
    lastRefresh: number;
    sessionStart: number;
    cooldownsRemaining?: number[];
  }): void {
    // Update energy state from server
    this.energyState.current = serverEnergyState.current;
    this.energyState.max = serverEnergyState.max;
    this.energyState.lastRefresh = serverEnergyState.lastRefresh;
    this.energyState.sessionStart = serverEnergyState.sessionStart;
    
    // Use server-calculated cooldowns if available
    if (serverEnergyState.cooldownsRemaining) {
      this.energyState.cooldowns = [...serverEnergyState.cooldownsRemaining];
    } else {
      this.energyState.cooldowns = [...serverEnergyState.cooldowns];
    }
    
    console.log('EnergySystem: Synced with server state', this.energyState);
  }
}