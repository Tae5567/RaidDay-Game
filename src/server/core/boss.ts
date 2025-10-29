import { redis } from '@devvit/web/server';

export interface BossData {
  id: string;
  name: string;
  theme: DailyTheme;
  baseHP: number;
  level: number;
  spriteKey: string;
  phase2Threshold: number; // HP percentage for phase 2
  enrageThreshold: number; // HP percentage for enrage
  damageResistance: {
    phase1: number;
    phase2: number;
  };
}

export enum DailyTheme {
  GAMING = 'gaming',
  INTERNET = 'internet',
  SOCIAL_MEDIA = 'social_media',
  WORK = 'work',
  ENTERTAINMENT = 'entertainment',
  SPORTS = 'sports',
  MEMES = 'memes'
}

export interface BossState {
  currentHP: number;
  maxHP: number;
  phase: number;
  isEnraged: boolean;
  lastDamageTime: number;
  totalDamageDealt: number;
  activePlayerCount: number;
}

// Daily boss rotation (7 themed bosses) - Simplified for 50,000 HP shared pool
const DAILY_BOSSES: Record<number, BossData> = {
  0: { // Sunday
    id: 'the_cringe',
    name: 'The Cringe',
    theme: DailyTheme.MEMES,
    baseHP: 50000, // Simplified shared HP pool
    level: 1,
    spriteKey: 'boss_cringe',
    phase2Threshold: 0.5, // Simplified phases
    enrageThreshold: 0.2,
    damageResistance: { phase1: 1.0, phase2: 1.0 } // No damage resistance for simplicity
  },
  1: { // Monday
    id: 'the_lag_spike',
    name: 'The Lag Spike',
    theme: DailyTheme.GAMING,
    baseHP: 50000,
    level: 1,
    spriteKey: 'boss_lag_spike',
    phase2Threshold: 0.5,
    enrageThreshold: 0.2,
    damageResistance: { phase1: 1.0, phase2: 1.0 }
  },
  2: { // Tuesday
    id: 'the_algorithm',
    name: 'The Algorithm',
    theme: DailyTheme.INTERNET,
    baseHP: 50000,
    level: 1,
    spriteKey: 'boss_algorithm',
    phase2Threshold: 0.5,
    enrageThreshold: 0.2,
    damageResistance: { phase1: 1.0, phase2: 1.0 }
  },
  3: { // Wednesday
    id: 'the_influencer',
    name: 'The Influencer',
    theme: DailyTheme.SOCIAL_MEDIA,
    baseHP: 50000,
    level: 1,
    spriteKey: 'boss_influencer',
    phase2Threshold: 0.5,
    enrageThreshold: 0.2,
    damageResistance: { phase1: 1.0, phase2: 1.0 }
  },
  4: { // Thursday
    id: 'the_deadline',
    name: 'The Deadline',
    theme: DailyTheme.WORK,
    baseHP: 50000,
    level: 1,
    spriteKey: 'boss_deadline',
    phase2Threshold: 0.5,
    enrageThreshold: 0.2,
    damageResistance: { phase1: 1.0, phase2: 1.0 }
  },
  5: { // Friday
    id: 'the_spoiler',
    name: 'The Spoiler',
    theme: DailyTheme.ENTERTAINMENT,
    baseHP: 50000,
    level: 1,
    spriteKey: 'boss_spoiler',
    phase2Threshold: 0.5,
    enrageThreshold: 0.2,
    damageResistance: { phase1: 1.0, phase2: 1.0 }
  },
  6: { // Saturday
    id: 'the_referee',
    name: 'The Referee',
    theme: DailyTheme.SPORTS,
    baseHP: 50000,
    level: 1,
    spriteKey: 'boss_referee',
    phase2Threshold: 0.5,
    enrageThreshold: 0.2,
    damageResistance: { phase1: 1.0, phase2: 1.0 }
  }
};

export class BossManager {
  private static getBossKey(postId: string): string {
    return `boss_state:${postId}`;
  }

  private static getActivePlayersKey(postId: string): string {
    return `active_players:${postId}`;
  }

  /**
   * Get current boss data based on day of week
   */
  public static getCurrentBoss(): BossData {
    const dayOfWeek = new Date().getDay();
    const boss = DAILY_BOSSES[dayOfWeek];
    if (!boss) {
      // Fallback to Monday's boss if something goes wrong
      return DAILY_BOSSES[1]!;
    }
    return boss;
  }

  /**
   * Get next boss data by day name
   */
  public static async getNextBossData(dayName: string): Promise<BossData> {
    const dayMap: Record<string, number> = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };
    
    const dayIndex = dayMap[dayName.toLowerCase()];
    if (dayIndex === undefined) {
      return DAILY_BOSSES[1]!; // Fallback to Monday
    }
    const boss = DAILY_BOSSES[dayIndex];
    
    if (!boss) {
      // Fallback to Monday's boss if something goes wrong
      return DAILY_BOSSES[1]!;
    }
    
    return boss;
  }

  /**
   * Initialize boss for a post with shared 50,000 HP pool
   */
  public static async initializeBoss(postId: string): Promise<BossState> {
    const bossData = this.getCurrentBoss();
    
    // Check if we need to reset for new day (8 AM daily reset)
    const shouldReset = await this.shouldResetForNewDay(postId);
    if (shouldReset) {
      await this.performDailyReset(postId);
    }
    
    // Use fixed 50,000 HP as specified in requirements
    const bossState: BossState = {
      currentHP: bossData.baseHP, // Always 50,000
      maxHP: bossData.baseHP,
      phase: 1,
      isEnraged: false,
      lastDamageTime: Date.now(),
      totalDamageDealt: 0,
      activePlayerCount: 1
    };

    await redis.set(this.getBossKey(postId), JSON.stringify(bossState));
    await this.setLastResetTime(postId);
    return bossState;
  }

  /**
   * Get current boss state, initializing if needed
   */
  public static async getBossState(postId: string): Promise<BossState> {
    const stateData = await redis.get(this.getBossKey(postId));
    
    if (!stateData) {
      return await this.initializeBoss(postId);
    }

    return JSON.parse(stateData) as BossState;
  }

  /**
   * Update boss state after taking damage (simplified for shared HP pool)
   */
  public static async takeDamage(postId: string, damage: number): Promise<BossState> {
    const bossState = await this.getBossState(postId);
    const bossData = this.getCurrentBoss();
    
    // Apply damage directly (no resistance for simplicity)
    const actualDamage = Math.floor(damage);
    bossState.currentHP = Math.max(0, bossState.currentHP - actualDamage);
    bossState.lastDamageTime = Date.now();
    bossState.totalDamageDealt += actualDamage;

    // Check for phase transitions (simplified)
    const hpPercentage = bossState.currentHP / bossState.maxHP;
    
    // Phase 2 transition at 50% HP
    if (bossState.phase === 1 && hpPercentage <= bossData.phase2Threshold) {
      bossState.phase = 2;
    }
    
    // Enrage transition at 20% HP
    if (!bossState.isEnraged && hpPercentage <= bossData.enrageThreshold) {
      bossState.isEnraged = true;
    }

    await redis.set(this.getBossKey(postId), JSON.stringify(bossState));
    return bossState;
  }

  /**
   * Track active player for HP scaling
   */
  public static async trackActivePlayer(postId: string, userId: string): Promise<void> {
    const key = this.getActivePlayersKey(postId);
    const playerKey = `${key}:${userId}`;
    const countKey = `${key}:count`;
    
    // Check if this is a new active player
    const existingPlayer = await redis.get(playerKey);
    
    // Set player as active with 10-minute expiration
    await redis.set(playerKey, Date.now().toString(), { 
      expiration: new Date(Date.now() + 10 * 60 * 1000) 
    });
    
    // If new player, increment count
    if (!existingPlayer) {
      const currentCount = await redis.get(countKey);
      await redis.set(countKey, ((currentCount ? parseInt(currentCount) : 0) + 1).toString(), {
        expiration: new Date(Date.now() + 15 * 60 * 1000) // Slightly longer expiration for count
      });
    }
  }

  /**
   * Get count of active players (for HP scaling)
   */
  public static async getActivePlayerCount(postId: string): Promise<number> {
    const key = this.getActivePlayersKey(postId);
    
    try {
      // Simplified approach - track count in a separate key
      const countKey = `${key}:count`;
      const count = await redis.get(countKey);
      return count ? parseInt(count) : 1;
    } catch (error) {
      console.error('Error getting active player count:', error);
      return 1; // Default to 1 player
    }
  }

  /**
   * Check if boss is defeated
   */
  public static async isBossDefeated(postId: string): Promise<boolean> {
    const bossState = await this.getBossState(postId);
    return bossState.currentHP <= 0;
  }

  /**
   * Reset boss (for new day or manual reset)
   */
  public static async resetBoss(postId: string): Promise<BossState> {
    await redis.del(this.getBossKey(postId));
    return await this.initializeBoss(postId);
  }

  /**
   * Get boss data and state combined
   */
  public static async getBossInfo(postId: string): Promise<{ data: BossData; state: BossState }> {
    const data = this.getCurrentBoss();
    const state = await this.getBossState(postId);
    return { data, state };
  }

  /**
   * Check if boss should reset for new day (8 AM daily reset)
   */
  private static async shouldResetForNewDay(postId: string): Promise<boolean> {
    const lastResetKey = `boss_last_reset:${postId}`;
    const lastResetTime = await redis.get(lastResetKey);
    
    if (!lastResetTime) {
      return true; // First time, needs reset
    }
    
    const lastReset = new Date(parseInt(lastResetTime));
    const now = new Date();
    
    // Check if we've passed 8 AM today and haven't reset yet
    const today8AM = new Date(now);
    today8AM.setHours(8, 0, 0, 0);
    
    // If current time is past 8 AM today and last reset was before 8 AM today
    if (now >= today8AM && lastReset < today8AM) {
      return true;
    }
    
    return false;
  }

  /**
   * Perform daily boss reset at 8 AM
   */
  private static async performDailyReset(postId: string): Promise<void> {
    // Clear boss state to force reinitialization
    await redis.del(this.getBossKey(postId));
    
    // Clear leaderboard for new day
    const leaderboardKey = `leaderboard:${postId}`;
    await redis.del(leaderboardKey);
    
    // Clear community stats
    const communityStatsKey = `community_stats:${postId}`;
    await redis.del(communityStatsKey);
    
    // Clear recent attacks
    const recentAttacksKey = `recent_attacks:${postId}`;
    await redis.del(recentAttacksKey);
    
    console.log(`Daily reset performed for post ${postId} at ${new Date().toISOString()}`);
  }

  /**
   * Set last reset time for daily tracking
   */
  private static async setLastResetTime(postId: string): Promise<void> {
    const lastResetKey = `boss_last_reset:${postId}`;
    await redis.set(lastResetKey, Date.now().toString());
  }

  /**
   * Get next reset time (next 8 AM)
   */
  public static getNextResetTime(): Date {
    const now = new Date();
    const next8AM = new Date(now);
    next8AM.setHours(8, 0, 0, 0);
    
    // If it's already past 8 AM today, set for tomorrow
    if (now >= next8AM) {
      next8AM.setDate(next8AM.getDate() + 1);
    }
    
    return next8AM;
  }
}