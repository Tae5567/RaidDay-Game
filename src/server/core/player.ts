import { redis } from '@devvit/web/server';

export enum CharacterClass {
  WARRIOR = 'warrior',
  MAGE = 'mage',
  ROGUE = 'rogue',
  HEALER = 'healer'
}

export interface EnergyState {
  current: number;        // 0-5 energy points (simplified for 2-minute sessions)
  max: number;           // Always 5
  cooldowns: number[];   // Per-point cooldown timers (simplified)
  lastRefresh: number;   // Session start time
  sessionStart: number;  // Track 2-minute session duration
}

export interface PlayerData {
  userId: string;
  characterClass: CharacterClass;
  level: number;
  experience: number;
  sessionDamage: number;      // Damage dealt in current 2-minute session
  totalDamage: number;        // Total damage across all sessions
  lastEnergyRefresh: number;  // Last session start time
  energyState: EnergyState;   // Simplified energy for 2-minute sessions
  specialAbilityUsed: boolean;
  lastActiveTime: number;
  sessionAttackCount: number; // Track 5-10 attacks per session
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
        current: 10, // Start with 10 attacks for 2-minute session
        max: 10,
        cooldowns: [],
        lastRefresh: Date.now(),
        sessionStart: Date.now()
      },
      specialAbilityUsed: false,
      lastActiveTime: Date.now(),
      sessionAttackCount: 0
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
   * Update energy state after attack (simplified for 2-minute sessions)
   */
  public static async consumeEnergy(postId: string, userId: string): Promise<{ success: boolean; energyState: EnergyState }> {
    const playerData = await this.getPlayerData(postId, userId);
    const now = Date.now();

    // Check if 2-minute session has expired
    const sessionDuration = now - playerData.energyState.sessionStart;
    const twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds
    
    if (sessionDuration >= twoMinutes) {
      // Auto-refresh session if expired
      console.log('Session expired, auto-refreshing for user:', userId);
      const refreshResult = await this.refreshSession(postId, userId);
      if (refreshResult.success && refreshResult.playerData) {
        // Use the refreshed player data
        const updatedPlayerData = refreshResult.playerData;
        updatedPlayerData.energyState.current--;
        updatedPlayerData.sessionAttackCount++;
        updatedPlayerData.energyState.lastRefresh = now;
        updatedPlayerData.lastActiveTime = now;
        
        await redis.set(this.getPlayerKey(postId, userId), JSON.stringify(updatedPlayerData));
        return { success: true, energyState: updatedPlayerData.energyState };
      } else {
        return { success: false, energyState: playerData.energyState };
      }
    }

    // Check if player has attacks remaining (5-10 attacks per session)
    if (!playerData.energyState || playerData.energyState.current <= 0) {
      // Try to auto-refresh if no attacks remaining
      console.log('No attacks remaining, attempting auto-refresh for user:', userId);
      const refreshResult = await this.refreshSession(postId, userId);
      if (refreshResult.success && refreshResult.playerData) {
        const updatedPlayerData = refreshResult.playerData;
        updatedPlayerData.energyState.current--;
        updatedPlayerData.sessionAttackCount++;
        updatedPlayerData.energyState.lastRefresh = now;
        updatedPlayerData.lastActiveTime = now;
        
        await redis.set(this.getPlayerKey(postId, userId), JSON.stringify(updatedPlayerData));
        return { success: true, energyState: updatedPlayerData.energyState };
      } else {
        return { success: false, energyState: playerData.energyState || { current: 0, max: 10, cooldowns: [], lastRefresh: now, sessionStart: now } };
      }
    }

    // Consume one attack from session
    playerData.energyState.current--;
    playerData.sessionAttackCount++;
    playerData.energyState.lastRefresh = now;
    playerData.lastActiveTime = now;

    await redis.set(this.getPlayerKey(postId, userId), JSON.stringify(playerData));
    return { success: true, energyState: playerData.energyState };
  }

  /**
   * Check if new 2-minute session can be started
   */
  public static async canRefreshSession(postId: string, userId: string): Promise<boolean> {
    const playerData = await this.getPlayerData(postId, userId);
    const now = Date.now();
    const sessionDuration = now - playerData.energyState.sessionStart;
    const twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds
    
    // Always allow refresh if session is expired, no attacks remaining, or this is a new player
    return sessionDuration >= twoMinutes || playerData.energyState.current <= 0 || !playerData.energyState.sessionStart;
  }

  /**
   * Start new 2-minute session
   */
  public static async refreshSession(postId: string, userId: string): Promise<{ success: boolean; playerData?: PlayerData }> {
    if (!(await this.canRefreshSession(postId, userId))) {
      return { success: false };
    }

    const playerData = await this.getPlayerData(postId, userId);
    const now = Date.now();

    // Reset session data for new 2-minute session
    playerData.energyState = {
      current: 10, // 5-10 attacks per session
      max: 10,
      cooldowns: [],
      lastRefresh: now,
      sessionStart: now
    };
    playerData.lastEnergyRefresh = now;
    playerData.sessionDamage = 0; // Reset session damage
    playerData.sessionAttackCount = 0;
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
   * Update leaderboard with player data using Redis sorted sets
   */
  private static async updateLeaderboard(postId: string, userId: string, playerData: PlayerData): Promise<void> {
    const leaderboardKey = this.getLeaderboardKey(postId);
    
    // Store player score for daily leaderboard (using session damage as primary metric)
    await redis.zAdd(leaderboardKey, {
      member: userId,
      score: playerData.sessionDamage
    });
    
    // Set expiration for daily reset (24 hours)
    const tomorrow8AM = new Date();
    tomorrow8AM.setDate(tomorrow8AM.getDate() + 1);
    tomorrow8AM.setHours(8, 0, 0, 0);
    
    await redis.expire(leaderboardKey, Math.floor((tomorrow8AM.getTime() - Date.now()) / 1000));
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
    
    // Get additional session stats (critical hits)
    const sessionData = await redis.get(sessionStatsKey);
    const stats = sessionData ? JSON.parse(sessionData) : { criticalHits: 0 };
    
    // Get player rank from leaderboard using Redis sorted sets
    const leaderboardKey = this.getLeaderboardKey(postId);
    let playerRank = 0;
    
    try {
      // Get all scores in descending order to find rank
      const allScores = await redis.zRange(leaderboardKey, 0, -1, { by: 'rank', reverse: true });
      const rankIndex = allScores.findIndex(entry => entry.member === userId);
      playerRank = rankIndex !== -1 ? rankIndex + 1 : 0;
    } catch (error) {
      console.error('Error getting player rank:', error);
    }

    return {
      sessionDamage: playerData.sessionDamage,
      attackCount: playerData.sessionAttackCount, // Use tracked attack count
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
