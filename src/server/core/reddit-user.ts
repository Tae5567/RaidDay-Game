import { context } from '@devvit/web/server';

export interface RedditUserData {
  username: string;
  redditUsername: string;
  avatarUrl?: string | undefined;
  isCurrentUser: boolean;
}

export class RedditUserService {
  private static userCache = new Map<string, { data: RedditUserData; timestamp: number }>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get Reddit user data with caching
   */
  public static async getUserData(userId: string): Promise<RedditUserData> {
    // Check cache first
    const cached = this.userCache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Check if this is the current user from Devvit context
      // Note: username property may not be available in all contexts
      const currentUsername = (context as any).username;
      if (userId === context.userId && currentUsername) {
        const userData: RedditUserData = {
          username: currentUsername,
          redditUsername: `u/${currentUsername}`,
          avatarUrl: undefined, // Will be fetched from Reddit API if needed
          isCurrentUser: true
        };

        // Try to get avatar from Reddit API
        try {
          const avatarUrl = await this.fetchUserAvatar(currentUsername);
          userData.avatarUrl = avatarUrl;
        } catch (error) {
          console.warn(`Could not fetch avatar for current user ${currentUsername}:`, error);
        }

        // Cache the result
        this.userCache.set(userId, { data: userData, timestamp: Date.now() });
        return userData;
      }

      // For other users, try to fetch from Reddit API
      // Note: This requires the username to be stored or mapped from userId
      // In a real implementation, you'd need to maintain a userId -> username mapping
      const userData = await this.fetchUserDataFromReddit(userId);
      
      // Cache the result
      this.userCache.set(userId, { data: userData, timestamp: Date.now() });
      return userData;

    } catch (error) {
      console.error(`Error fetching user data for ${userId}:`, error);
      
      // Return fallback data
      const fallbackData: RedditUserData = {
        username: `User${userId.slice(-4)}`,
        redditUsername: `u/User${userId.slice(-4)}`,
        avatarUrl: undefined,
        isCurrentUser: false
      };

      // Cache fallback for a shorter time
      this.userCache.set(userId, { data: fallbackData, timestamp: Date.now() - (this.CACHE_DURATION - 60000) });
      return fallbackData;
    }
  }

  /**
   * Fetch user avatar from Reddit API
   */
  private static async fetchUserAvatar(username: string): Promise<string | undefined> {
    try {
      const response = await fetch(`https://www.reddit.com/user/${username}/about.json`, {
        headers: {
          'User-Agent': 'RaidDay/1.0 (Devvit App)'
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (!response.ok) {
        console.warn(`Reddit API returned ${response.status} for user ${username}`);
        return undefined;
      }

      const userData = await response.json() as any;
      
      // Reddit API returns different avatar fields
      const avatarUrl = userData.data?.snoovatar_img || 
                       userData.data?.icon_img || 
                       userData.data?.subreddit?.icon_img;

      return avatarUrl || undefined;
    } catch (error) {
      console.warn(`Failed to fetch avatar for ${username}:`, error);
      return undefined;
    }
  }

  /**
   * Fetch user data from Reddit API using username lookup
   */
  private static async fetchUserDataFromReddit(userId: string): Promise<RedditUserData> {
    // In a real implementation, you'd need to maintain a mapping of userId -> username
    // For now, we'll use a fallback approach
    
    // Try to extract username from userId if it follows a pattern
    let username = this.extractUsernameFromUserId(userId);
    
    if (!username) {
      throw new Error(`Cannot determine username for userId: ${userId}`);
    }

    try {
      const response = await fetch(`https://www.reddit.com/user/${username}/about.json`, {
        headers: {
          'User-Agent': 'RaidDay/1.0 (Devvit App)'
        },
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`Reddit API returned ${response.status}`);
      }

      const userData = await response.json() as any;
      const actualUsername = userData.data?.name || username;
      const avatarUrl = userData.data?.snoovatar_img || 
                       userData.data?.icon_img || 
                       userData.data?.subreddit?.icon_img;

      return {
        username: actualUsername,
        redditUsername: `u/${actualUsername}`,
        avatarUrl: avatarUrl || undefined,
        isCurrentUser: false
      };
    } catch (error) {
      console.warn(`Failed to fetch Reddit data for ${username}:`, error);
      
      // Return data based on what we know
      return {
        username: username,
        redditUsername: `u/${username}`,
        avatarUrl: undefined,
        isCurrentUser: false
      };
    }
  }

  /**
   * Extract username from userId (implementation-specific)
   */
  private static extractUsernameFromUserId(userId: string): string | null {
    // This is a placeholder - in a real implementation, you'd have a proper mapping
    // For now, assume userId might contain the username or use a fallback
    
    // If userId looks like a Reddit username, use it
    if (userId.match(/^[a-zA-Z0-9_-]+$/)) {
      return userId;
    }

    // If userId is a hash or ID, you'd need to look it up in your database
    // For now, return null to indicate we can't determine the username
    return null;
  }

  /**
   * Store username mapping for future lookups
   */
  public static async storeUserMapping(userId: string, username: string): Promise<void> {
    // In a real implementation, you'd store this in Redis
    // For now, we'll just update our cache
    try {
      const userData = await this.getUserData(userId);
      userData.username = username;
      userData.redditUsername = `u/${username}`;
      
      this.userCache.set(userId, { data: userData, timestamp: Date.now() });
    } catch (error) {
      console.error(`Error storing user mapping for ${userId} -> ${username}:`, error);
    }
  }

  /**
   * Batch fetch multiple users (more efficient for leaderboards)
   */
  public static async getBatchUserData(userIds: string[]): Promise<Map<string, RedditUserData>> {
    const results = new Map<string, RedditUserData>();
    
    // Process in parallel but limit concurrency
    const batchSize = 5;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      const promises = batch.map(userId => this.getUserData(userId));
      
      try {
        const batchResults = await Promise.all(promises);
        batch.forEach((userId, index) => {
          const result = batchResults[index];
          if (result) {
            results.set(userId, result);
          }
        });
      } catch (error) {
        console.error(`Error in batch ${i}-${i + batchSize}:`, error);
        
        // Add fallback data for failed batch
        batch.forEach(userId => {
          if (!results.has(userId)) {
            results.set(userId, {
              username: `User${userId.slice(-4)}`,
              redditUsername: `u/User${userId.slice(-4)}`,
              avatarUrl: undefined,
              isCurrentUser: false
            });
          }
        });
      }
    }
    
    return results;
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  public static clearCache(): void {
    this.userCache.clear();
  }

  /**
   * Get current user data from Devvit context
   */
  public static getCurrentUserData(): RedditUserData | null {
    const currentUsername = (context as any).username;
    if (!context.userId || !currentUsername) {
      return null;
    }

    return {
      username: currentUsername,
      redditUsername: `u/${currentUsername}`,
      avatarUrl: undefined, // Would need to be fetched separately
      isCurrentUser: true
    };
  }
}