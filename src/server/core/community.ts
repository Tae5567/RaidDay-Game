import { redis } from '@devvit/web/server';
import { AttackEvent, CommunityDPSResponse, RecentAttacker, LeaderboardEntry } from '../../shared/types/api';
import { RedditUserService } from './reddit-user';

export type CommunityStats = CommunityDPSResponse;

export class CommunityManager {
  private postId: string;

  constructor(postId: string) {
    this.postId = postId;
  }
  private static getRecentAttacksKey(postId: string): string {
    return `recent_attacks:${postId}`;
  }

  private static getCommunityStatsKey(postId: string): string {
    return `community_stats:${postId}`;
  }

  private static getAttackCountKey(postId: string): string {
    return `attack_count:${postId}`;
  }

  /**
   * Record a new attack for community tracking
   */
  public static async recordAttack(postId: string, attackEvent: AttackEvent): Promise<void> {
    const recentAttacksKey = this.getRecentAttacksKey(postId);
    const attackCountKey = this.getAttackCountKey(postId);
    
    try {
      // Get existing attacks and add new one (simplified approach)
      const existingAttacks = await redis.get(recentAttacksKey);
      const attacks: AttackEvent[] = existingAttacks ? JSON.parse(existingAttacks) : [];
      
      // Add new attack to beginning and keep only last 50
      attacks.unshift(attackEvent);
      if (attacks.length > 50) {
        attacks.splice(50);
      }
      
      await redis.set(recentAttacksKey, JSON.stringify(attacks));
      
      // Increment attack counter for this minute
      const minuteKey = `${attackCountKey}:${Math.floor(Date.now() / 60000)}`;
      const currentCount = await redis.get(minuteKey);
      await redis.set(minuteKey, ((currentCount ? parseInt(currentCount) : 0) + 1).toString(), {
        expiration: new Date(Date.now() + 5 * 60 * 1000) // Expire after 5 minutes
      });
      
      // Update community stats
      await this.updateCommunityStats(postId);
    } catch (error) {
      console.error('Error recording attack:', error);
    }
  }

  /**
   * Get recent attacks for activity feed
   */
  public static async getRecentAttacks(postId: string, limit: number = 10): Promise<AttackEvent[]> {
    const recentAttacksKey = this.getRecentAttacksKey(postId);
    
    try {
      const attacksData = await redis.get(recentAttacksKey);
      if (!attacksData) return [];
      
      const attacks: AttackEvent[] = JSON.parse(attacksData);
      return attacks.slice(0, limit);
    } catch (error) {
      console.error('Error getting recent attacks:', error);
      return [];
    }
  }

  /**
   * Calculate attacks per minute over the last 5 minutes
   */
  public static async getAttacksPerMinute(postId: string): Promise<number> {
    const attackCountKey = this.getAttackCountKey(postId);
    const currentMinute = Math.floor(Date.now() / 60000);
    
    try {
      let totalAttacks = 0;
      
      // Check last 5 minutes
      for (let i = 0; i < 5; i++) {
        const minuteKey = `${attackCountKey}:${currentMinute - i}`;
        const count = await redis.get(minuteKey);
        totalAttacks += count ? parseInt(count) : 0;
      }
      
      return Math.round(totalAttacks / 5); // Average per minute
    } catch (error) {
      console.error('Error calculating attacks per minute:', error);
      return 0;
    }
  }

  /**
   * Update community statistics
   */
  private static async updateCommunityStats(postId: string): Promise<void> {
    const statsKey = this.getCommunityStatsKey(postId);
    
    try {
      const recentAttacks = await this.getRecentAttacks(postId, 50);
      const attacksPerMinute = await this.getAttacksPerMinute(postId);
      
      // Calculate average damage from recent attacks
      const totalDamage = recentAttacks.reduce((sum, attack) => sum + attack.damage, 0);
      const averageDamage = recentAttacks.length > 0 ? Math.round(totalDamage / recentAttacks.length) : 0;
      
      // Find top damage dealer from recent attacks
      const damageByUser = new Map<string, number>();
      recentAttacks.forEach(attack => {
        const current = damageByUser.get(attack.userId) || 0;
        damageByUser.set(attack.userId, current + attack.damage);
      });
      
      let topDamageDealer = '';
      let maxDamage = 0;
      damageByUser.forEach((damage, userId) => {
        if (damage > maxDamage) {
          maxDamage = damage;
          topDamageDealer = userId;
        }
      });
      
      // Count unique active players from recent attacks
      const uniquePlayers = new Set(recentAttacks.map(attack => attack.userId));
      
      const stats: CommunityStats = {
        attacksPerMinute,
        averageDamage,
        activePlayers: uniquePlayers.size,
        ...(topDamageDealer && { topDamageDealer }),
        recentAttacks: recentAttacks.slice(0, 10), // Return only last 10 for API
        totalDamageDealt: totalDamage
      };
      
      await redis.set(statsKey, JSON.stringify(stats), {
        expiration: new Date(Date.now() + 60000) // Cache for 1 minute
      });
    } catch (error) {
      console.error('Error updating community stats:', error);
    }
  }

  /**
   * Get current community statistics
   */
  public static async getCommunityStats(postId: string): Promise<CommunityStats> {
    const statsKey = this.getCommunityStatsKey(postId);
    
    try {
      const cachedStats = await redis.get(statsKey);
      
      if (cachedStats) {
        return JSON.parse(cachedStats) as CommunityStats;
      }
      
      // Generate fresh stats if not cached
      await this.updateCommunityStats(postId);
      const freshStats = await redis.get(statsKey);
      
      if (freshStats) {
        return JSON.parse(freshStats) as CommunityStats;
      }
    } catch (error) {
      console.error('Error getting community stats:', error);
    }
    
    // Return default stats if all else fails
    return {
      attacksPerMinute: 0,
      averageDamage: 0,
      activePlayers: 0,
      recentAttacks: [],
      totalDamageDealt: 0
    };
  }

  /**
   * Simulate community attack for visual effects (used by client)
   */
  public static async simulateCommunityAttack(postId: string): Promise<AttackEvent | null> {
    const recentAttacks = await this.getRecentAttacks(postId, 20);
    
    if (recentAttacks.length === 0) {
      return null;
    }
    
    // Pick a random recent attack to simulate
    const randomAttack = recentAttacks[Math.floor(Math.random() * recentAttacks.length)];
    
    if (!randomAttack) {
      return null;
    }
    
    // Modify it slightly for simulation
    return {
      userId: randomAttack.userId,
      characterClass: randomAttack.characterClass,
      damage: Math.floor(randomAttack.damage * (0.8 + Math.random() * 0.4)), // ±20% variance
      isCritical: randomAttack.isCritical,
      timestamp: Date.now()
    };
  }

  /**
   * Get recent attackers with Reddit usernames and avatars (last 60 seconds)
   */
  public async getRecentAttackers(timeWindowMs: number = 60000): Promise<RecentAttacker[]> {
    const recentAttacksKey = CommunityManager.getRecentAttacksKey(this.postId);
    const cutoffTime = Date.now() - timeWindowMs;
    
    try {
      const attacksData = await redis.get(recentAttacksKey);
      if (!attacksData) return [];
      
      const attacks: AttackEvent[] = JSON.parse(attacksData);
      
      // Filter to time window and get unique users
      const recentAttacks = attacks.filter(attack => attack.timestamp >= cutoffTime);
      const uniqueUserIds = [...new Set(recentAttacks.map(attack => attack.userId))];
      
      // Batch fetch Reddit user data for efficiency
      const userDataMap = await RedditUserService.getBatchUserData(uniqueUserIds.slice(0, 4));
      
      // Convert to RecentAttacker format
      const recentAttackers: RecentAttacker[] = [];
      const seenUsers = new Set<string>();
      
      for (const attack of recentAttacks) {
        if (seenUsers.has(attack.userId)) continue;
        
        seenUsers.add(attack.userId);
        const userData = userDataMap.get(attack.userId);
        
        if (userData) {
          recentAttackers.push({
            userId: attack.userId,
            username: userData.username,
            redditUsername: userData.redditUsername,
            characterClass: attack.characterClass,
            level: Math.floor(Math.random() * 10) + 10, // Mock level for now
            damage: attack.damage,
            timestamp: attack.timestamp,
            avatarUrl: userData.avatarUrl
          });
        }
        
        if (recentAttackers.length >= 4) break; // Max 4 recent attackers
      }
      
      return recentAttackers;
    } catch (error) {
      console.error('Error getting recent attackers:', error);
      return [];
    }
  }

  /**
   * Get leaderboard with Reddit integration
   */
  public async getLeaderboard(limit: number = 20): Promise<LeaderboardEntry[]> {
    try {
      // Get actual leaderboard data from Redis (using PlayerManager's leaderboard)
      const leaderboardKey = `leaderboard:${this.postId}`;
      const topPlayers = await redis.zRange(leaderboardKey, 0, limit - 1, { by: 'rank', reverse: true });
      
      if (topPlayers.length === 0) {
        // Return mock data if no real players yet
        return this.getMockLeaderboard(limit);
      }

      // Extract user IDs from leaderboard
      const userIds = topPlayers.map(player => player.member);
      
      // Batch fetch Reddit user data
      const userDataMap = await RedditUserService.getBatchUserData(userIds);
      
      // Build leaderboard with Reddit data
      const leaderboard: LeaderboardEntry[] = [];
      
      for (let i = 0; i < topPlayers.length; i++) {
        const player = topPlayers[i];
        if (!player) continue;
        
        const userId = player.member;
        const sessionDamage = player.score;
        
        // Get player data from Redis
        const playerKey = `player:${this.postId}:${userId}`;
        const playerDataStr = await redis.get(playerKey);
        
        if (playerDataStr) {
          const playerData = JSON.parse(playerDataStr);
          const userData = userDataMap.get(userId);
          
          if (userData) {
            leaderboard.push({
              userId,
              username: userData.username,
              redditUsername: userData.redditUsername,
              characterClass: playerData.characterClass || 'warrior',
              level: playerData.level || 1,
              sessionDamage: sessionDamage,
              totalDamage: playerData.totalDamage || sessionDamage,
              rank: i + 1,
              avatarUrl: userData.avatarUrl
            });
          }
        }
      }
      
      // Fill with mock data if we don't have enough real players
      if (leaderboard.length < limit) {
        const mockData = await this.getMockLeaderboard(limit - leaderboard.length);
        leaderboard.push(...mockData.map(entry => ({
          ...entry,
          rank: entry.rank + leaderboard.length
        })));
      }
      
      return leaderboard;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return this.getMockLeaderboard(limit);
    }
  }

  /**
   * Get mock leaderboard data for testing/fallback
   */
  private async getMockLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
    const mockLeaderboard: LeaderboardEntry[] = [];
    
    const usernames = [
      'DragonSlayer', 'BossHunter99', 'CritMaster', 'HealBot', 'WarriorKing',
      'MageSupreme', 'RogueNinja', 'PaladinLight', 'ShadowBlade', 'FireMage',
      'IceQueen', 'ThunderGod', 'EarthShaker', 'WindWalker', 'DarkKnight',
      'LightBringer', 'VoidHunter', 'StarGazer', 'MoonDancer', 'SunWarrior'
    ];

    // Batch fetch user data for mock users
    const mockUserIds = Array.from({ length: Math.min(limit, usernames.length) }, (_, i) => `mock_user_${i + 1}`);
    const userDataMap = await RedditUserService.getBatchUserData(mockUserIds);

    for (let i = 0; i < Math.min(limit, usernames.length); i++) {
      const userId = `mock_user_${i + 1}`;
      const userData = userDataMap.get(userId);
      const characterClass = ['warrior', 'mage', 'rogue', 'healer'][i % 4];
      const username = usernames[i];
      
      if (characterClass && username) {
        mockLeaderboard.push({
          userId,
          username: userData?.username || username,
          redditUsername: userData?.redditUsername || `u/${username}`,
          characterClass: characterClass,
          level: 15 - Math.floor(i / 4),
          sessionDamage: 25000 - (i * 1000) - Math.floor(Math.random() * 500),
          totalDamage: 100000 - (i * 3000),
          rank: i + 1,
          avatarUrl: userData?.avatarUrl
        });
      }
    }
    
    return mockLeaderboard;
  }

  /**
   * Get total player count
   */
  public async getTotalPlayerCount(): Promise<number> {
    try {
      // In a real implementation, this would count unique players from Redis
      return Math.floor(Math.random() * 100) + 50; // Mock: 50-150 players
    } catch (error) {
      console.error('Error getting total player count:', error);
      return 0;
    }
  }

  /**
   * Get total damage dealt by all players
   */
  public async getTotalDamageDealt(): Promise<number> {
    try {
      // In a real implementation, this would sum all player damage from Redis
      return Math.floor(Math.random() * 1000000) + 500000; // Mock: 500k-1.5M damage
    } catch (error) {
      console.error('Error getting total damage dealt:', error);
      return 0;
    }
  }

  /**
   * Enhanced synchronization methods for real-time tracking
   */

  /**
   * Get synchronized community statistics with timestamp
   */
  public static async getSynchronizedStats(postId: string): Promise<CommunityStats & { lastSyncTime: number }> {
    const stats = await this.getCommunityStats(postId);
    return {
      ...stats,
      lastSyncTime: Date.now()
    };
  }

  /**
   * Force refresh community statistics (for 10-second sync)
   */
  public static async forceRefreshStats(postId: string): Promise<void> {
    // Clear cached stats to force recalculation
    const statsKey = this.getCommunityStatsKey(postId);
    await redis.del(statsKey);
    
    // Trigger immediate recalculation
    await this.updateCommunityStats(postId);
  }

  /**
   * Get attack frequency over different time windows
   */
  public static async getAttackFrequency(postId: string): Promise<{
    last1Minute: number;
    last5Minutes: number;
    last15Minutes: number;
  }> {
    const attackCountKey = this.getAttackCountKey(postId);
    const currentMinute = Math.floor(Date.now() / 60000);
    
    try {
      let attacks1Min = 0;
      let attacks5Min = 0;
      let attacks15Min = 0;
      
      // Count attacks in different time windows
      for (let i = 0; i < 15; i++) {
        const minuteKey = `${attackCountKey}:${currentMinute - i}`;
        const count = await redis.get(minuteKey);
        const attackCount = count ? parseInt(count) : 0;
        
        if (i < 1) attacks1Min += attackCount;
        if (i < 5) attacks5Min += attackCount;
        attacks15Min += attackCount;
      }
      
      return {
        last1Minute: attacks1Min,
        last5Minutes: Math.round(attacks5Min / 5), // Average per minute
        last15Minutes: Math.round(attacks15Min / 15) // Average per minute
      };
    } catch (error) {
      console.error('Error calculating attack frequency:', error);
      return { last1Minute: 0, last5Minutes: 0, last15Minutes: 0 };
    }
  }

  /**
   * Get damage distribution by character class
   */
  public static async getDamageByClass(postId: string): Promise<Record<string, number>> {
    const recentAttacks = await this.getRecentAttacks(postId, 100); // Last 100 attacks
    
    const damageByClass: Record<string, number> = {
      warrior: 0,
      mage: 0,
      rogue: 0,
      healer: 0
    };
    
    recentAttacks.forEach(attack => {
      const characterClass = attack.characterClass as keyof typeof damageByClass;
      if (damageByClass[characterClass] !== undefined) {
        damageByClass[characterClass] += attack.damage;
      }
    });
    
    return damageByClass;
  }

  /**
   * Get peak activity times (for analytics)
   */
  public static async getPeakActivityTimes(postId: string): Promise<{
    peakHour: number;
    peakMinute: number;
    currentActivity: 'low' | 'medium' | 'high';
  }> {
    const attacksPerMinute = await this.getAttacksPerMinute(postId);
    
    // Simple activity classification
    let currentActivity: 'low' | 'medium' | 'high' = 'low';
    if (attacksPerMinute > 10) currentActivity = 'high';
    else if (attacksPerMinute > 3) currentActivity = 'medium';
    
    return {
      peakHour: new Date().getHours(), // Mock implementation
      peakMinute: Math.floor(Date.now() / 60000) % 60,
      currentActivity
    };
  }


}