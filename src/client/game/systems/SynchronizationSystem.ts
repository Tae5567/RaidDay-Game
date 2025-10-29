import { Scene } from 'phaser';
import { 
  BossHPSyncResponse, 
  CommunityDPSDetailedResponse, 
  PlayerDataSyncResponse,
  AttackFrequencyData,
  DamageByClassData,
  PeakActivityData
} from '../../../shared/types/api';

/**
 * SynchronizationSystem - Handles real-time synchronization with server
 * Implements 10-second HP sync and community DPS tracking
 */
export class SynchronizationSystem {
  private scene: Scene;
  private isActive: boolean = false;
  
  // Sync timers
  private bossHPSyncTimer?: Phaser.Time.TimerEvent | undefined;
  private communityDPSTimer?: Phaser.Time.TimerEvent | undefined;
  private playerDataTimer?: Phaser.Time.TimerEvent | undefined;
  
  // Sync intervals (in milliseconds)
  private readonly BOSS_HP_SYNC_INTERVAL = 10000; // 10 seconds
  private readonly COMMUNITY_DPS_INTERVAL = 5000; // 5 seconds
  private readonly PLAYER_DATA_INTERVAL = 15000; // 15 seconds
  
  // Cached data
  private lastBossSync: BossHPSyncResponse | null = null;
  private lastCommunitySync: CommunityDPSDetailedResponse | null = null;
  private lastPlayerSync: PlayerDataSyncResponse | null = null;
  private activeFightersCount: number = 0;
  
  // Event callbacks
  private onBossHPSync?: ((data: BossHPSyncResponse) => void) | undefined;
  private onCommunityDPSSync?: ((data: CommunityDPSDetailedResponse) => void) | undefined;
  private onPlayerDataSync?: ((data: PlayerDataSyncResponse) => void) | undefined;
  private onActiveFightersUpdate?: ((count: number) => void) | undefined;
  private onSyncError?: ((error: string) => void) | undefined;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Start synchronization system
   */
  public start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('SynchronizationSystem: Starting real-time sync...');
    
    // Start boss HP sync (10-second accuracy requirement)
    this.bossHPSyncTimer = this.scene.time.addEvent({
      delay: this.BOSS_HP_SYNC_INTERVAL,
      callback: () => this.syncBossHP(),
      loop: true
    });
    
    // Start community DPS tracking
    this.communityDPSTimer = this.scene.time.addEvent({
      delay: this.COMMUNITY_DPS_INTERVAL,
      callback: () => this.syncCommunityDPS(),
      loop: true
    });
    
    // Start player data sync
    this.playerDataTimer = this.scene.time.addEvent({
      delay: this.PLAYER_DATA_INTERVAL,
      callback: () => this.syncPlayerData(),
      loop: true
    });
    
    // Perform initial sync
    this.performInitialSync();
  }

  /**
   * Stop synchronization system
   */
  public stop(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    console.log('SynchronizationSystem: Stopping sync...');
    
    // Clear all timers
    if (this.bossHPSyncTimer) {
      this.bossHPSyncTimer.destroy();
      this.bossHPSyncTimer = undefined;
    }
    
    if (this.communityDPSTimer) {
      this.communityDPSTimer.destroy();
      this.communityDPSTimer = undefined;
    }
    
    if (this.playerDataTimer) {
      this.playerDataTimer.destroy();
      this.playerDataTimer = undefined;
    }
  }

  /**
   * Set event callbacks for sync updates
   */
  public setCallbacks(callbacks: {
    onBossHPSync?: ((data: BossHPSyncResponse) => void) | undefined;
    onCommunityDPSSync?: ((data: CommunityDPSDetailedResponse) => void) | undefined;
    onPlayerDataSync?: ((data: PlayerDataSyncResponse) => void) | undefined;
    onActiveFightersUpdate?: ((count: number) => void) | undefined;
    onSyncError?: ((error: string) => void) | undefined;
  }): void {
    this.onBossHPSync = callbacks.onBossHPSync;
    this.onCommunityDPSSync = callbacks.onCommunityDPSSync;
    this.onPlayerDataSync = callbacks.onPlayerDataSync;
    this.onActiveFightersUpdate = callbacks.onActiveFightersUpdate;
    this.onSyncError = callbacks.onSyncError;
  }

  /**
   * Perform initial synchronization on startup
   */
  private async performInitialSync(): Promise<void> {
    try {
      // Sync all data immediately
      await Promise.all([
        this.syncBossHP(),
        this.syncCommunityDPS(),
        this.syncPlayerData()
      ]);
      
      console.log('SynchronizationSystem: Initial sync completed');
    } catch (error) {
      console.error('SynchronizationSystem: Initial sync failed:', error);
      this.handleSyncError('Initial synchronization failed');
    }
  }

  /**
   * Sync boss HP and state (10-second accuracy requirement)
   */
  private async syncBossHP(): Promise<void> {
    try {
      const response = await fetch('/api/boss-hp-sync');
      
      if (!response.ok) {
        throw new Error(`Boss HP sync failed: ${response.status}`);
      }
      
      const data: BossHPSyncResponse = await response.json();
      
      if (data.status === 'success') {
        this.lastBossSync = data;
        
        // Update active fighters count from boss sync data
        if (data.activePlayers !== this.activeFightersCount) {
          this.activeFightersCount = data.activePlayers;
          if (this.onActiveFightersUpdate) {
            this.onActiveFightersUpdate(this.activeFightersCount);
          }
        }
        
        // Check for significant changes that need immediate updates
        const hasSignificantChange = this.checkForSignificantBossChanges(data);
        
        if (hasSignificantChange) {
          console.log('SynchronizationSystem: Significant boss changes detected');
        }
        
        // Trigger callback
        if (this.onBossHPSync) {
          this.onBossHPSync(data);
        }
        
        console.log(`SynchronizationSystem: Boss HP synced - ${data.currentHP}/${data.maxHP} (Phase ${data.phase}) - ${data.activePlayers} fighters`);
      } else {
        throw new Error('Boss HP sync returned error status');
      }
    } catch (error) {
      console.error('SynchronizationSystem: Boss HP sync error:', error);
      this.handleSyncError('Boss HP synchronization failed');
    }
  }

  /**
   * Sync community DPS and statistics
   */
  private async syncCommunityDPS(): Promise<void> {
    try {
      const response = await fetch('/api/community-dps-detailed');
      
      if (!response.ok) {
        throw new Error(`Community DPS sync failed: ${response.status}`);
      }
      
      const data: CommunityDPSDetailedResponse = await response.json();
      
      if (data.status === 'success') {
        this.lastCommunitySync = data;
        
        // Trigger callback
        if (this.onCommunityDPSSync) {
          this.onCommunityDPSSync(data);
        }
        
        console.log(`SynchronizationSystem: Community DPS synced - ${data.attacksPerMinute} APM, ${data.activePlayers} players`);
      } else {
        throw new Error('Community DPS sync returned error status');
      }
    } catch (error) {
      console.error('SynchronizationSystem: Community DPS sync error:', error);
      this.handleSyncError('Community DPS synchronization failed');
    }
  }

  /**
   * Sync player data and energy state
   */
  private async syncPlayerData(): Promise<void> {
    try {
      const response = await fetch('/api/player-data-sync');
      
      if (!response.ok) {
        throw new Error(`Player data sync failed: ${response.status}`);
      }
      
      const data: PlayerDataSyncResponse = await response.json();
      
      if (data.status === 'success') {
        this.lastPlayerSync = data;
        
        // Trigger callback
        if (this.onPlayerDataSync) {
          this.onPlayerDataSync(data);
        }
        
        console.log(`SynchronizationSystem: Player data synced - Energy: ${data.playerData.energyState.current}/5`);
      } else {
        throw new Error('Player data sync returned error status');
      }
    } catch (error) {
      console.error('SynchronizationSystem: Player data sync error:', error);
      this.handleSyncError('Player data synchronization failed');
    }
  }

  /**
   * Check for significant boss changes that require immediate UI updates
   */
  private checkForSignificantBossChanges(newData: BossHPSyncResponse): boolean {
    if (!this.lastBossSync) return true; // First sync is always significant
    
    const oldData = this.lastBossSync;
    
    // Check for phase changes
    if (newData.phase !== oldData.phase) return true;
    
    // Check for enrage state changes
    if (newData.isEnraged !== oldData.isEnraged) return true;
    
    // Check for large HP changes (more than 5% difference)
    const hpDifference = Math.abs(newData.currentHP - oldData.currentHP);
    const hpPercentageChange = hpDifference / newData.maxHP;
    if (hpPercentageChange > 0.05) return true;
    
    return false;
  }

  /**
   * Handle synchronization errors
   */
  private handleSyncError(error: string): void {
    if (this.onSyncError) {
      this.onSyncError(error);
    }
  }

  /**
   * Force immediate synchronization of all data
   */
  public async forceSyncAll(): Promise<void> {
    console.log('SynchronizationSystem: Force syncing all data...');
    await this.performInitialSync();
  }

  /**
   * Get cached synchronization data
   */
  public getCachedData(): {
    bossSync: BossHPSyncResponse | null;
    communitySync: CommunityDPSDetailedResponse | null;
    playerSync: PlayerDataSyncResponse | null;
  } {
    return {
      bossSync: this.lastBossSync,
      communitySync: this.lastCommunitySync,
      playerSync: this.lastPlayerSync
    };
  }

  /**
   * Get additional analytics data
   */
  public async getAnalyticsData(): Promise<{
    attackFrequency: AttackFrequencyData;
    damageByClass: DamageByClassData;
    peakActivity: PeakActivityData;
  }> {
    try {
      const [frequencyRes, damageRes, activityRes] = await Promise.all([
        fetch('/api/attack-frequency'),
        fetch('/api/damage-by-class'),
        fetch('/api/peak-activity')
      ]);

      const [frequency, damage, activity] = await Promise.all([
        frequencyRes.json(),
        damageRes.json(),
        activityRes.json()
      ]);

      return {
        attackFrequency: frequency,
        damageByClass: damage,
        peakActivity: activity
      };
    } catch (error) {
      console.error('SynchronizationSystem: Analytics data fetch failed:', error);
      
      // Return default data on error
      return {
        attackFrequency: { last1Minute: 0, last5Minutes: 0, last15Minutes: 0 },
        damageByClass: { warrior: 0, mage: 0, rogue: 0, healer: 0 },
        peakActivity: { peakHour: 0, peakMinute: 0, currentActivity: 'low' }
      };
    }
  }

  /**
   * Check if synchronization is active
   */
  public isRunning(): boolean {
    return this.isActive;
  }

  /**
   * Get current active fighters count for community stats tracking
   */
  public getActiveFightersCount(): number {
    return this.activeFightersCount;
  }

  /**
   * Get sync status information
   */
  public getSyncStatus(): {
    isActive: boolean;
    lastBossSync: number | null;
    lastCommunitySync: number | null;
    lastPlayerSync: number | null;
  } {
    return {
      isActive: this.isActive,
      lastBossSync: this.lastBossSync?.lastSyncTime || null,
      lastCommunitySync: this.lastCommunitySync?.lastUpdated || null,
      lastPlayerSync: this.lastPlayerSync?.lastSyncTime || null
    };
  }
}