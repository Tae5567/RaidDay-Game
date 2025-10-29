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

// Daily boss rotation (7 themed bosses)
const DAILY_BOSSES: Record<number, BossData> = {
  0: { // Sunday
    id: 'the_cringe',
    name: 'The Cringe',
    theme: DailyTheme.MEMES,
    baseHP: 80000,
    level: 45,
    spriteKey: 'boss_cringe',
    phase2Threshold: 0.75,
    enrageThreshold: 0.25,
    damageResistance: { phase1: 1.0, phase2: 0.9 }
  },
  1: { // Monday
    id: 'the_lag_spike',
    name: 'The Lag Spike',
    theme: DailyTheme.GAMING,
    baseHP: 80000,
    level: 45,
    spriteKey: 'boss_lag_spike',
    phase2Threshold: 0.75,
    enrageThreshold: 0.25,
    damageResistance: { phase1: 1.0, phase2: 0.9 }
  },
  2: { // Tuesday
    id: 'the_algorithm',
    name: 'The Algorithm',
    theme: DailyTheme.INTERNET,
    baseHP: 80000,
    level: 45,
    spriteKey: 'boss_algorithm',
    phase2Threshold: 0.75,
    enrageThreshold: 0.25,
    damageResistance: { phase1: 1.0, phase2: 0.9 }
  },
  3: { // Wednesday
    id: 'the_influencer',
    name: 'The Influencer',
    theme: DailyTheme.SOCIAL_MEDIA,
    baseHP: 80000,
    level: 45,
    spriteKey: 'boss_influencer',
    phase2Threshold: 0.75,
    enrageThreshold: 0.25,
    damageResistance: { phase1: 1.0, phase2: 0.9 }
  },
  4: { // Thursday
    id: 'the_deadline',
    name: 'The Deadline',
    theme: DailyTheme.WORK,
    baseHP: 80000,
    level: 45,
    spriteKey: 'boss_deadline',
    phase2Threshold: 0.75,
    enrageThreshold: 0.25,
    damageResistance: { phase1: 1.0, phase2: 0.9 }
  },
  5: { // Friday
    id: 'the_spoiler',
    name: 'The Spoiler',
    theme: DailyTheme.ENTERTAINMENT,
    baseHP: 80000,
    level: 45,
    spriteKey: 'boss_spoiler',
    phase2Threshold: 0.75,
    enrageThreshold: 0.25,
    damageResistance: { phase1: 1.0, phase2: 0.9 }
  },
  6: { // Saturday
    id: 'the_referee',
    name: 'The Referee',
    theme: DailyTheme.SPORTS,
    baseHP: 80000,
    level: 45,
    spriteKey: 'boss_referee',
    phase2Threshold: 0.75,
    enrageThreshold: 0.25,
    damageResistance: { phase1: 1.0, phase2: 0.9 }
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
   * Initialize boss for a post with HP scaling based on active players
   */
  public static async initializeBoss(postId: string): Promise<BossState> {
    const bossData = this.getCurrentBoss();
    const activePlayerCount = await this.getActivePlayerCount(postId);
    
    // Scale HP based on active players (minimum 1 player)
    const playerScaling = Math.max(1, Math.floor(activePlayerCount / 10)) * 0.2 + 1;
    const scaledHP = Math.floor(bossData.baseHP * playerScaling);
    
    const bossState: BossState = {
      currentHP: scaledHP,
      maxHP: scaledHP,
      phase: 1,
      isEnraged: false,
      lastDamageTime: Date.now(),
      totalDamageDealt: 0,
      activePlayerCount: activePlayerCount
    };

    await redis.set(this.getBossKey(postId), JSON.stringify(bossState));
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
   * Update boss state after taking damage
   */
  public static async takeDamage(postId: string, damage: number): Promise<BossState> {
    const bossState = await this.getBossState(postId);
    const bossData = this.getCurrentBoss();
    
    // Apply damage resistance based on phase
    const resistance = bossState.phase === 1 ? 
      bossData.damageResistance.phase1 : 
      bossData.damageResistance.phase2;
    
    const actualDamage = Math.floor(damage * resistance);
    bossState.currentHP = Math.max(0, bossState.currentHP - actualDamage);
    bossState.lastDamageTime = Date.now();
    bossState.totalDamageDealt += actualDamage;

    // Check for phase transitions
    const hpPercentage = bossState.currentHP / bossState.maxHP;
    
    // Phase 2 transition
    if (bossState.phase === 1 && hpPercentage <= bossData.phase2Threshold) {
      bossState.phase = 2;
    }
    
    // Enrage transition
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
}