import { redis } from '@devvit/web/server';

export enum CharacterClass {
  WARRIOR = 'warrior',
  MAGE = 'mage',
  ROGUE = 'rogue',
  HEALER = 'healer'
}

export interface EnergyState {
  current: number;        // 0-5 energy points
  max: number;           // Always 5
  cooldowns: number[];   // Per-point cooldown timers (30s each)
  lastRefresh: number;   // Server-side 2-hour gate
  sessionStart: number;  // Track session duration
}

export interface PlayerData {
  userId: string;
  characterClass: CharacterClass;
  level: number;
  experience: number;
  sessionDamage: number;
  totalDamage: number;
  lastEnergyRefresh: number;
  energyState: EnergyState;
  specialAbilityUsed: boolean;
  lastActiveTime: number;
}

export interface LeaderboardEntry {
  userId: string;
  username?: string;
  characterClass: CharacterClass;
  level: number;
  sessionDamage: number;
  totalDamage: number;
  rank: number;
}

export interface SessionStats {
  sessionDamage: number;
  attackCount: number;
  criticalHits: number;
  specialAbilityUsed: boolean;
  sessionStartTime: number;
  playerRank: number;
}

export class PlayerManager {
  private static getPlayerKey(postId: string, userId: string): string {
    return `player:${postId}:${userId}`;
  }

  private static getLeaderboardKey(postId: string): string {
    return `leaderboard:${postId}`;
  }

  private static getSessionStatsKey(postId: string, userId: string): string {
    return `session_stats:${postId}:${userId}`;
  }

  /**
   * Initialize or get existing player data
   */
  public static async getPlayerData(postId: string, userId: string): Promise<PlayerData> {
    const playerKey = this.getPlayerKey(postId, userId);
    const existingData = await redis.get(playerKey);

    if (existingData) {
      return JSON.parse(existingData) as PlayerData;
    }

    // Create new player with default values
    const newPlayer: PlayerData = {
      userId,
      characterClass: CharacterClass.WARRIOR, // Default class
      level: 1,
      experience: 0,
      sessionDamage: 0,
      totalDamage: 0,
      lastEnergyRefresh: Date.now(),
      energyState: {
        current: 5,
        max: 5,
        cooldowns: [0, 0, 0, 0, 0],
        lastRefresh: Date.now(),
        sessionStart: Date.now()
      },
      specialAbilityUsed: false,
      lastActiveTime: Date.now()
    };

    await redis.set(playerKey, JSON.stringify(newPlayer));
    return newPlayer;
  }

  /**
   * Update player's character class
   */
  public static async setCharacterClass(postId: string, userId: string, characterClass: CharacterClass): Promise<PlayerData> {
    const playerData = await this.getPlayerData(postId, userId);
    playerData.characterClass = characterClass;
    playerData.lastActiveTime = Date.now();

    await redis.set(this.getPlayerKey(postId, userId), JSON.stringify(playerData));
    return playerData;
  }

  /**
   * Update energy state after attack
   */
  public static async consumeEnergy(postId: string, userId: string): Promise<{ success: boolean; energyState: EnergyState }> {
    const playerData = await this.getPlayerData(postId, userId);
    const now = Date.now();

    // Update cooldowns first
    const energyState = playerData.energyState;
    if (!energyState) {
      return { success: false, energyState: { current: 0, max: 5, cooldowns: [0, 0, 0, 0, 0], lastRefresh: now, sessionStart: now } };
    }
    
    const cooldowns = energyState.cooldowns || [0, 0, 0, 0, 0];
    for (let i = 0; i < cooldowns.length; i++) {
      const currentCooldown = cooldowns[i];
      if (currentCooldown && currentCooldown > 0) {
        const timeElapsed = now - energyState.lastRefresh;
        cooldowns[i] = Math.max(0, currentCooldown - timeElapsed);
        
        // Restore energy point if cooldown is complete
        if (cooldowns[i] === 0 && energyState.current < (energyState.max || 5)) {
          energyState.current++;
        }
      }
    }
    energyState.cooldowns = cooldowns;

    // Check if player has energy to spend
    if (!playerData.energyState || playerData.energyState.current <= 0) {
      return { success: false, energyState: playerData.energyState || { current: 0, max: 5, cooldowns: [0, 0, 0, 0, 0], lastRefresh: now, sessionStart: now } };
    }

    // Consume energy and start cooldown (30 seconds)
    if (playerData.energyState) {
      playerData.energyState.current--;
      const energyIndex = playerData.energyState.current; // Use the slot that was just emptied
      if (playerData.energyState.cooldowns && energyIndex >= 0 && energyIndex < playerData.energyState.cooldowns.length) {
        playerData.energyState.cooldowns[energyIndex] = 30000; // 30 seconds in milliseconds
      }
    }
    if (playerData.energyState) {
      playerData.energyState.lastRefresh = now;
    }
    playerData.lastActiveTime = now;

    await redis.set(this.getPlayerKey(postId, userId), JSON.stringify(playerData));
    return { success: true, energyState: playerData.energyState };
  }

  /**
   * Check if 2-hour session refresh is available
   */
  public static async canRefreshSession(postId: string, userId: string): Promise<boolean> {
    const playerData = await this.getPlayerData(postId, userId);
    const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const timeSinceLastRefresh = Date.now() - playerData.lastEnergyRefresh;
    
    return timeSinceLastRefresh >= twoHours;
  }

  /**
   * Refresh player session (2-hour cooldown)
   */
  public static async refreshSession(postId: string, userId: string): Promise<{ success: boolean; playerData?: PlayerData }> {
    if (!(await this.canRefreshSession(postId, userId))) {
      return { success: false };
    }

    const playerData = await this.getPlayerData(postId, userId);
    const now = Date.now();

    // Reset energy and session data
    playerData.energyState = {
      current: 5,
      max: 5,
      cooldowns: [0, 0, 0, 0, 0],
      lastRefresh: now,
      sessionStart: now
    };
    playerData.lastEnergyRefresh = now;
    playerData.sessionDamage = 0;
    playerData.specialAbilityUsed = false;
    playerData.lastActiveTime = now;

    await redis.set(this.getPlayerKey(postId, userId), JSON.stringify(playerData));
    return { success: true, playerData };
  }

  /**
   * Add damage and experience to player
   */
  public static async addDamage(postId: string, userId: string, damage: number, isCritical: boolean = false): Promise<PlayerData> {
    const playerData = await this.getPlayerData(postId, userId);
    
    playerData.sessionDamage += damage;
    playerData.totalDamage += damage;
    playerData.lastActiveTime = Date.now();

    // Calculate XP gain (base 10 XP per 100 damage, bonus for critical)
    const baseXP = Math.floor(damage / 100) * 10;
    const criticalBonus = isCritical ? Math.floor(baseXP * 0.5) : 0;
    const xpGain = baseXP + criticalBonus;
    
    playerData.experience += xpGain;

    // Level up calculation (1000 XP per level for consistent progression)
    while (playerData.experience >= 1000) {
      playerData.level++;
      playerData.experience -= 1000;
    }

    await redis.set(this.getPlayerKey(postId, userId), JSON.stringify(playerData));
    
    // Update leaderboard
    await this.updateLeaderboard(postId, userId, playerData);
    
    return playerData;
  }

  /**
   * Add experience points to player (for victory rewards)
   */
  public static async addExperience(postId: string, userId: string, xpAmount: number): Promise<PlayerData> {
    const playerData = await this.getPlayerData(postId, userId);
    
    playerData.experience += xpAmount;
    playerData.lastActiveTime = Date.now();

    // Level up calculation (1000 XP per level for consistent progression)
    while (playerData.experience >= 1000) {
      playerData.level++;
      playerData.experience -= 1000;
    }

    await redis.set(this.getPlayerKey(postId, userId), JSON.stringify(playerData));
    return playerData;
  }

  /**
   * Mark special ability as used
   */
  public static async useSpecialAbility(postId: string, userId: string): Promise<boolean> {
    const playerData = await this.getPlayerData(postId, userId);
    
    if (playerData.specialAbilityUsed) {
      return false; // Already used
    }

    playerData.specialAbilityUsed = true;
    playerData.lastActiveTime = Date.now();
    
    await redis.set(this.getPlayerKey(postId, userId), JSON.stringify(playerData));
    return true;
  }

  /**
   * Update leaderboard with player data
   */
  private static async updateLeaderboard(postId: string, userId: string, playerData: PlayerData): Promise<void> {
    const leaderboardKey = this.getLeaderboardKey(postId);
    
    // Store player score for leaderboard (using session damage as primary metric)
    await redis.zAdd(leaderboardKey, {
      member: userId,
      score: playerData.sessionDamage
    });
  }

  /**
   * Get leaderboard (top players by session damage)
   */
  public static async getLeaderboard(postId: string, limit: number = 10): Promise<LeaderboardEntry[]> {
    const leaderboardKey = this.getLeaderboardKey(postId);
    
    try {
      // Get top players by session damage (descending order)
      const topPlayers = await redis.zRange(leaderboardKey, 0, limit - 1, { by: 'rank', reverse: true });
      
      const leaderboard: LeaderboardEntry[] = [];
      
      for (let i = 0; i < topPlayers.length; i++) {
        const player = topPlayers[i];
        if (!player) continue;
        
        const userId = player.member;
        const sessionDamage = player.score;
        
        try {
          const playerData = await this.getPlayerData(postId, userId);
          
          leaderboard.push({
            userId,
            characterClass: playerData.characterClass,
            level: playerData.level,
            sessionDamage: sessionDamage,
            totalDamage: playerData.totalDamage,
            rank: i + 1
          });
        } catch (error) {
          console.error(`Error getting player data for leaderboard: ${userId}`, error);
        }
      }
      
      return leaderboard;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  /**
   * Get player's current session statistics
   */
  public static async getSessionStats(postId: string, userId: string): Promise<SessionStats> {
    const playerData = await this.getPlayerData(postId, userId);
    const sessionStatsKey = this.getSessionStatsKey(postId, userId);
    
    // Get additional session stats (attack count, critical hits)
    const sessionData = await redis.get(sessionStatsKey);
    const stats = sessionData ? JSON.parse(sessionData) : { attackCount: 0, criticalHits: 0 };
    
    // Get player rank from leaderboard
    const leaderboardKey = this.getLeaderboardKey(postId);
    let playerRank = 0;
    
    try {
      // Use a simplified ranking approach since zRevRank is not available
      const allScores = await redis.zRange(leaderboardKey, 0, -1, { by: 'rank', reverse: true });
      const rank = allScores.findIndex(entry => entry.member === userId);
      playerRank = rank !== null ? rank + 1 : 0;
    } catch (error) {
      console.error('Error getting player rank:', error);
    }

    return {
      sessionDamage: playerData.sessionDamage,
      attackCount: stats.attackCount || 0,
      criticalHits: stats.criticalHits || 0,
      specialAbilityUsed: playerData.specialAbilityUsed,
      sessionStartTime: playerData.energyState.sessionStart,
      playerRank
    };
  }

  /**
   * Update session statistics
   */
  public static async updateSessionStats(postId: string, userId: string, isCritical: boolean = false): Promise<void> {
    const sessionStatsKey = this.getSessionStatsKey(postId, userId);
    
    const sessionData = await redis.get(sessionStatsKey);
    const stats = sessionData ? JSON.parse(sessionData) : { attackCount: 0, criticalHits: 0 };
    
    stats.attackCount++;
    if (isCritical) {
      stats.criticalHits++;
    }
    
    await redis.set(sessionStatsKey, JSON.stringify(stats), {
      expiration: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hour expiration
    });
  }

  /**
   * Get total active player count across all posts
   */
  public static async getTotalActivePlayers(): Promise<number> {
    try {
      // This is a simplified version - in production you might want to track this more efficiently
      // For now, return a default count since Redis scan is not available in this context
      return 1;
    } catch (error) {
      console.error('Error getting total active players:', error);
      return 0;
    }
  }

  private userId: string;
  private postId: string;

  constructor(userId: string, postId: string) {
    this.userId = userId;
    this.postId = postId;
  }

  /**
   * Get current player's rank in the leaderboard
   */
  public async getCurrentRank(): Promise<number | undefined> {
    const leaderboardKey = PlayerManager.getLeaderboardKey(this.postId);
    
    try {
      // Get all scores in descending order
      const allScores = await redis.zRange(leaderboardKey, 0, -1, { by: 'rank', reverse: true });
      const rank = allScores.findIndex(entry => entry.member === this.userId);
      return rank !== -1 ? rank + 1 : undefined;
    } catch (error) {
      console.error('Error getting current player rank:', error);
      return undefined;
    }
  }

  /**
   * Get player data for this instance
   */
  public async getPlayerData(): Promise<PlayerData | null> {
    try {
      return await PlayerManager.getPlayerData(this.postId, this.userId);
    } catch (error) {
      console.error('Error getting player data:', error);
      return null;
    }
  }
}