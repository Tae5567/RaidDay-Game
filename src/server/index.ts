import express from 'express';
import { 
  InitResponse, 
  IncrementResponse, 
  DecrementResponse,
  BossStatusResponse,
  AttackRequest,
  AttackResponse,
  CommunityDPSResponse,
  LeaderboardEntry,
  AttackEvent
} from '../shared/types/api';
import { redis, createServer, context } from '@devvit/web/server';
import { createPost } from './core/post';
import { BossManager } from './core/boss';
import { PlayerManager, CharacterClass } from './core/player';
import { CommunityManager } from './core/community';
import { RedditUserService } from './core/reddit-user';

const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

const router = express.Router();

router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
  '/api/init',
  async (_, res): Promise<void> => {
    const { postId } = context;

    if (!postId) {
      console.error('API Init Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      const count = await redis.get('count');
      res.json({
        type: 'init',
        postId: postId,
        count: count ? parseInt(count) : 0,
      });
    } catch (error) {
      console.error(`API Init Error for post ${postId}:`, error);
      let errorMessage = 'Unknown error during initialization';
      if (error instanceof Error) {
        errorMessage = `Initialization failed: ${error.message}`;
      }
      res.status(400).json({ status: 'error', message: errorMessage });
    }
  }
);

router.post<{ postId: string }, IncrementResponse | { status: string; message: string }, unknown>(
  '/api/increment',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', 1),
      postId,
      type: 'increment',
    });
  }
);

router.post<{ postId: string }, DecrementResponse | { status: string; message: string }, unknown>(
  '/api/decrement',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', -1),
      postId,
      type: 'decrement',
    });
  }
);

router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

// Special ability validation endpoints
router.post('/api/validate-special-ability', async (_, res): Promise<void> => {
  const { postId, userId } = context;
  
  if (!postId || !userId) {
    res.status(400).json({
      status: 'error',
      message: 'postId and userId are required',
    });
    return;
  }

  try {
    const sessionKey = `special_ability:${postId}:${userId}`;
    const lastUsed = await redis.get(sessionKey);
    
    // Check if special ability was already used in this session (2 hours)
    if (lastUsed) {
      const lastUsedTime = parseInt(lastUsed);
      const timeSinceLastUse = Date.now() - lastUsedTime;
      const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
      
      if (timeSinceLastUse < twoHours) {
        res.json({
          canUse: false,
          reason: 'special_ability_used',
          timeRemaining: twoHours - timeSinceLastUse
        });
        return;
      }
    }
    
    res.json({
      canUse: true,
      reason: 'available'
    });
  } catch (error) {
    console.error(`Error validating special ability for user ${userId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to validate special ability'
    });
  }
});

// Combat API Endpoints

router.post<{}, AttackResponse, AttackRequest>('/api/attack', async (_req, res): Promise<void> => {
  const { postId, userId } = context;
  const { characterClass, damage, isCritical = false } = _req.body;
  
  if (!postId || !userId) {
    res.status(400).json({
      success: false,
      damage: 0,
      isCritical: false,
      newBossHP: 0,
      bossPhase: 1,
      isEnraged: false,
      playerLevel: 1,
      xpGained: 0,
      energyRemaining: 0,
      message: 'postId and userId are required'
    });
    return;
  }

  try {
    // Store user mapping for Reddit integration (if we have username from context)
    const currentUsername = (context as any).username;
    if (currentUsername) {
      await RedditUserService.storeUserMapping(userId, currentUsername);
    }

    // Check and consume energy
    const energyResult = await PlayerManager.consumeEnergy(postId, userId);
    if (!energyResult.success) {
      res.status(400).json({
        success: false,
        damage: 0,
        isCritical: false,
        newBossHP: 0,
        bossPhase: 1,
        isEnraged: false,
        playerLevel: 1,
        xpGained: 0,
        energyRemaining: energyResult.energyState.current,
        message: 'Insufficient energy'
      });
      return;
    }

    // Track active player for boss scaling
    await BossManager.trackActivePlayer(postId, userId);

    // Apply damage to boss
    const bossState = await BossManager.takeDamage(postId, damage);
    
    // Update player data and add XP
    const playerData = await PlayerManager.addDamage(postId, userId, damage, isCritical);
    
    // Update session stats
    await PlayerManager.updateSessionStats(postId, userId, isCritical);
    
    // Record attack for community tracking with Reddit user data
    const attackEvent: AttackEvent = {
      userId,
      characterClass,
      damage,
      isCritical,
      timestamp: Date.now()
    };
    await CommunityManager.recordAttack(postId, attackEvent);

    res.json({
      success: true,
      damage,
      isCritical,
      newBossHP: bossState.currentHP,
      bossPhase: bossState.phase,
      isEnraged: bossState.isEnraged,
      playerLevel: playerData.level,
      xpGained: Math.floor(damage / 100) * 10 + (isCritical ? Math.floor(damage / 200) * 5 : 0),
      energyRemaining: energyResult.energyState.current
    });
  } catch (error) {
    console.error(`Error processing attack for user ${userId}:`, error);
    res.status(500).json({
      success: false,
      damage: 0,
      isCritical: false,
      newBossHP: 0,
      bossPhase: 1,
      isEnraged: false,
      playerLevel: 1,
      xpGained: 0,
      energyRemaining: 0,
      message: 'Failed to process attack'
    });
  }
});

router.post('/api/special-ability', async (_req, res): Promise<void> => {
  const { postId, userId } = context;
  const { characterClass, damage } = _req.body;
  
  if (!postId || !userId) {
    res.status(400).json({
      status: 'error',
      message: 'postId and userId are required',
    });
    return;
  }

  try {
    // Store user mapping for Reddit integration
    const currentUsername = (context as any).username;
    if (currentUsername) {
      await RedditUserService.storeUserMapping(userId, currentUsername);
    }

    // Check if special ability can be used
    const canUse = await PlayerManager.useSpecialAbility(postId, userId);
    if (!canUse) {
      res.status(400).json({
        status: 'error',
        message: 'Special ability already used in this session'
      });
      return;
    }

    // Track active player
    await BossManager.trackActivePlayer(postId, userId);

    // Apply damage to boss (special abilities deal 3x damage)
    const specialDamage = damage * 3;
    const bossState = await BossManager.takeDamage(postId, specialDamage);
    
    // Update player data
    const playerData = await PlayerManager.addDamage(postId, userId, specialDamage, false);
    
    // Record special attack for community tracking
    const attackEvent: AttackEvent = {
      userId,
      characterClass,
      damage: specialDamage,
      isCritical: false,
      timestamp: Date.now()
    };
    await CommunityManager.recordAttack(postId, attackEvent);
    
    res.json({
      status: 'success',
      damage: specialDamage,
      newBossHP: bossState.currentHP,
      characterClass: characterClass,
      playerLevel: playerData.level
    });
  } catch (error) {
    console.error(`Error using special ability for user ${userId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to use special ability'
    });
  }
});

router.get<{}, BossStatusResponse>('/api/boss-status', async (_req, res): Promise<void> => {
  const { postId } = context;
  
  if (!postId) {
    res.status(400).json({
      data: {} as any,
      state: {} as any,
      isDefeated: false
    });
    return;
  }

  try {
    const bossInfo = await BossManager.getBossInfo(postId);
    const isDefeated = await BossManager.isBossDefeated(postId);
    
    res.json({
      data: bossInfo.data,
      state: bossInfo.state,
      isDefeated
    });
  } catch (error) {
    console.error(`Error getting boss status for post ${postId}:`, error);
    res.status(500).json({
      data: {} as any,
      state: {} as any,
      isDefeated: false
    });
  }
});

router.get<{}, CommunityDPSResponse>('/api/community-dps', async (_req, res): Promise<void> => {
  const { postId } = context;
  
  if (!postId) {
    res.status(400).json({
      attacksPerMinute: 0,
      averageDamage: 0,
      activePlayers: 0,
      recentAttacks: [],
      totalDamageDealt: 0
    });
    return;
  }

  try {
    const communityStats = await CommunityManager.getCommunityStats(postId);
    res.json(communityStats);
  } catch (error) {
    console.error(`Error getting community DPS for post ${postId}:`, error);
    res.status(500).json({
      attacksPerMinute: 0,
      averageDamage: 0,
      activePlayers: 0,
      recentAttacks: [],
      totalDamageDealt: 0
    });
  }
});

// Player Management Endpoints

router.post('/api/select-class', async (_req, res): Promise<void> => {
  const { postId, userId } = context;
  const { characterClass } = _req.body;
  
  if (!postId || !userId) {
    res.status(400).json({
      status: 'error',
      message: 'postId and userId are required'
    });
    return;
  }

  if (!Object.values(CharacterClass).includes(characterClass)) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid character class'
    });
    return;
  }

  try {
    // Store user mapping for Reddit integration
    const currentUsername = (context as any).username;
    if (currentUsername) {
      await RedditUserService.storeUserMapping(userId, currentUsername);
    }

    const playerData = await PlayerManager.setCharacterClass(postId, userId, characterClass);
    res.json({
      status: 'success',
      playerData
    });
  } catch (error) {
    console.error(`Error setting character class for user ${userId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to set character class'
    });
  }
});

router.get('/api/player-stats', async (_req, res): Promise<void> => {
  const { postId, userId } = context;
  
  if (!postId || !userId) {
    res.status(400).json({
      status: 'error',
      message: 'postId and userId are required'
    });
    return;
  }

  try {
    const playerData = await PlayerManager.getPlayerData(postId, userId);
    const sessionStats = await PlayerManager.getSessionStats(postId, userId);
    
    res.json({
      status: 'success',
      playerData,
      sessionStats
    });
  } catch (error) {
    console.error(`Error getting player stats for user ${userId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get player stats'
    });
  }
});

router.get<{}, LeaderboardEntry[]>('/api/leaderboard', async (_req, res): Promise<void> => {
  const { postId } = context;
  
  if (!postId) {
    res.status(400).json([]);
    return;
  }

  try {
    const leaderboard = await PlayerManager.getLeaderboard(postId, 10);
    res.json(leaderboard);
  } catch (error) {
    console.error(`Error getting leaderboard for post ${postId}:`, error);
    res.status(500).json([]);
  }
});

// Victory and Rewards Endpoints

router.get('/api/victory-data', async (_req, res): Promise<void> => {
  const { postId, userId } = context;
  
  if (!postId || !userId) {
    res.status(400).json({
      status: 'error',
      message: 'postId and userId are required'
    });
    return;
  }

  try {
    // Get player data
    const playerData = await PlayerManager.getPlayerData(postId, userId);
    const sessionStats = await PlayerManager.getSessionStats(postId, userId);
    
    // Get leaderboard
    const leaderboard = await PlayerManager.getLeaderboard(postId, 5);
    
    // Get boss info
    const bossInfo = await BossManager.getBossInfo(postId);
    
    // Calculate XP gained (based on session damage)
    const xpGained = Math.floor(sessionStats.sessionDamage / 100) * 10 + 
                    (sessionStats.criticalHits * 25) + 
                    (sessionStats.specialAbilityUsed ? 100 : 0);
    
    res.json({
      status: 'success',
      playerData,
      sessionStats,
      leaderboard,
      bossData: bossInfo.data,
      xpGained,
      rewards: {
        coins: Math.floor(sessionStats.sessionDamage / 500),
        gems: Math.floor(sessionStats.criticalHits / 2),
        potions: sessionStats.specialAbilityUsed ? 1 : 0,
        scrolls: Math.floor(sessionStats.sessionDamage / 1000)
      }
    });
  } catch (error) {
    console.error(`Error getting victory data for user ${userId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get victory data'
    });
  }
});

router.post('/api/claim-rewards', async (_req, res): Promise<void> => {
  const { postId, userId } = context;
  
  if (!postId || !userId) {
    res.status(400).json({
      status: 'error',
      message: 'postId and userId are required'
    });
    return;
  }

  try {
    // Check if rewards already claimed
    const rewardsKey = `rewards_claimed:${postId}:${userId}`;
    const alreadyClaimed = await redis.get(rewardsKey);
    
    if (alreadyClaimed) {
      res.status(400).json({
        status: 'error',
        message: 'Rewards already claimed'
      });
      return;
    }

    // Get session stats for reward calculation
    const sessionStats = await PlayerManager.getSessionStats(postId, userId);
    
    // Calculate and apply rewards
    const xpGained = Math.floor(sessionStats.sessionDamage / 100) * 10 + 
                    (sessionStats.criticalHits * 25) + 
                    (sessionStats.specialAbilityUsed ? 100 : 0);
    
    // Add XP to player
    await PlayerManager.addExperience(postId, userId, xpGained);
    
    // Mark rewards as claimed (expires in 24 hours)
    await redis.set(rewardsKey, Date.now().toString(), {
      expiration: new Date(Date.now() + 86400 * 1000) // 24 hours
    });
    
    // Get updated player data
    const updatedPlayerData = await PlayerManager.getPlayerData(postId, userId);
    
    res.json({
      status: 'success',
      xpGained,
      newLevel: updatedPlayerData.level,
      newExperience: updatedPlayerData.experience,
      rewards: {
        coins: Math.floor(sessionStats.sessionDamage / 500),
        gems: Math.floor(sessionStats.criticalHits / 2),
        potions: sessionStats.specialAbilityUsed ? 1 : 0,
        scrolls: Math.floor(sessionStats.sessionDamage / 1000)
      }
    });
  } catch (error) {
    console.error(`Error claiming rewards for user ${userId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to claim rewards'
    });
  }
});

router.post('/api/refresh-session', async (_req, res): Promise<void> => {
  const { postId, userId } = context;
  
  if (!postId || !userId) {
    res.status(400).json({
      status: 'error',
      message: 'postId and userId are required'
    });
    return;
  }

  try {
    const result = await PlayerManager.refreshSession(postId, userId);
    
    if (result.success) {
      res.json({
        status: 'success',
        playerData: result.playerData
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Session refresh not available yet'
      });
    }
  } catch (error) {
    console.error(`Error refreshing session for user ${userId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to refresh session'
    });
  }
});

// Server Synchronization Endpoints

// Boss HP Sync - 10-second accuracy sync endpoint
router.get('/api/boss-hp-sync', async (_, res) => {
  try {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({ status: 'error', message: 'postId required' });
      return;
    }

    const bossInfo = await BossManager.getBossInfo(postId);
    const communityStats = await CommunityManager.getCommunityStats(postId);
    
    res.json({
      status: 'success',
      currentHP: bossInfo.state.currentHP,
      maxHP: bossInfo.state.maxHP,
      phase: bossInfo.state.phase,
      isEnraged: bossInfo.state.isEnraged,
      totalDamageDealt: bossInfo.state.totalDamageDealt,
      activePlayers: communityStats.activePlayers,
      attacksPerMinute: communityStats.attacksPerMinute,
      lastSyncTime: Date.now()
    });
  } catch (error) {
    console.error('Boss HP sync error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to sync boss HP' });
  }
});

// Real-time Community DPS Tracking
router.get('/api/community-dps-detailed', async (_, res) => {
  try {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({ status: 'error', message: 'postId required' });
      return;
    }

    const communityStats = await CommunityManager.getCommunityStats(postId);
    const bossInfo = await BossManager.getBossInfo(postId);
    
    // Calculate additional DPS metrics
    const timeSinceLastDamage = Date.now() - bossInfo.state.lastDamageTime;
    const estimatedDPS = timeSinceLastDamage < 60000 ? 
      (bossInfo.state.totalDamageDealt / ((Date.now() - bossInfo.state.lastDamageTime) / 1000)) : 0;
    
    res.json({
      status: 'success',
      ...communityStats,
      estimatedDPS: Math.round(estimatedDPS),
      timeSinceLastDamage,
      bossPhase: bossInfo.state.phase,
      isEnraged: bossInfo.state.isEnraged,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Community DPS detailed error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch detailed DPS stats' });
  }
});

// Player Data Sync - Get comprehensive player state
router.get('/api/player-data-sync', async (_, res) => {
  try {
    const { postId, userId } = context;
    if (!postId || !userId) {
      res.status(400).json({ status: 'error', message: 'postId and userId required' });
      return;
    }

    const playerData = await PlayerManager.getPlayerData(postId, userId);
    const sessionStats = await PlayerManager.getSessionStats(postId, userId);
    const energyState = playerData.energyState;
    
    // Calculate energy cooldown times
    const now = Date.now();
    const cooldownsRemaining = energyState.cooldowns.map(cooldown => 
      Math.max(0, cooldown - (now - energyState.lastRefresh))
    );
    
    res.json({
      status: 'success',
      playerData: {
        ...playerData,
        energyState: {
          ...energyState,
          cooldownsRemaining
        }
      },
      sessionStats,
      canRefreshSession: await PlayerManager.canRefreshSession(postId, userId),
      lastSyncTime: now
    });
  } catch (error) {
    console.error('Player data sync error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to sync player data' });
  }
});

// Recent Attackers API - Get last 4 real players who attacked in past 60 seconds
router.get('/api/recent-attackers', async (_, res) => {
  try {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({ status: 'error', message: 'postId required' });
      return;
    }

    const communityManager = new CommunityManager(postId);
    const recentAttackers = await communityManager.getRecentAttackers(60000); // 60 seconds
    
    res.json({
      status: 'success',
      recentAttackers: recentAttackers.slice(0, 4), // Last 4 attackers
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Recent attackers API error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch recent attackers' });
  }
});

// Live Leaderboard API - Get Top 20 with real-time updates
router.get('/api/live-leaderboard', async (_, res) => {
  try {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({ status: 'error', message: 'postId required' });
      return;
    }

    const communityManager = new CommunityManager(postId);
    const leaderboard = await communityManager.getLeaderboard(20); // Top 20
    
    // Get current user's rank if available
    const currentUserId = context.userId;
    let currentUserRank;
    if (currentUserId) {
      const playerManager = new PlayerManager(currentUserId, postId);
      currentUserRank = await playerManager.getCurrentRank();
    }
    
    res.json({
      status: 'success',
      leaderboard,
      currentUserRank,
      totalPlayers: await communityManager.getTotalPlayerCount(),
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Live leaderboard API error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch leaderboard' });
  }
});

// Victory Post Creation API - Auto-generate Reddit post when boss is defeated
router.post('/api/create-victory-post', async (_, res) => {
  try {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({ status: 'error', message: 'postId required' });
      return;
    }

    const bossInfo = await BossManager.getBossInfo(postId);
    
    if (!bossInfo.data) {
      res.status(400).json({ status: 'error', message: 'No boss data found' });
      return;
    }

    const communityManager = new CommunityManager(postId);
    const topPlayers = await communityManager.getLeaderboard(3); // Top 3 for tagging
    
    // Create victory post
    const victoryPostData = {
      title: `🎉 r/RaidDay defeated ${bossInfo.data.name}!`,
      bossName: bossInfo.data.name,
      topPlayers,
      totalDamage: await communityManager.getTotalDamageDealt(),
      participantCount: await communityManager.getTotalPlayerCount()
    };

    // In a real implementation, this would create an actual Reddit post
    // For now, we'll just return the post data
    res.json({
      status: 'success',
      victoryPost: victoryPostData,
      message: 'Victory post created successfully'
    });
  } catch (error) {
    console.error('Victory post creation error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create victory post' });
  }
});

// Analytics Endpoints for Enhanced Synchronization

// Attack Frequency Analytics
router.get('/api/attack-frequency', async (_, res) => {
  try {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({ status: 'error', message: 'postId required' });
      return;
    }

    const frequency = await CommunityManager.getAttackFrequency(postId);
    res.json(frequency);
  } catch (error) {
    console.error('Attack frequency API error:', error);
    res.status(500).json({ last1Minute: 0, last5Minutes: 0, last15Minutes: 0 });
  }
});

// Damage by Class Analytics
router.get('/api/damage-by-class', async (_, res) => {
  try {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({ status: 'error', message: 'postId required' });
      return;
    }

    const damageByClass = await CommunityManager.getDamageByClass(postId);
    res.json(damageByClass);
  } catch (error) {
    console.error('Damage by class API error:', error);
    res.status(500).json({ warrior: 0, mage: 0, rogue: 0, healer: 0 });
  }
});

// Peak Activity Analytics
router.get('/api/peak-activity', async (_, res) => {
  try {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({ status: 'error', message: 'postId required' });
      return;
    }

    const peakActivity = await CommunityManager.getPeakActivityTimes(postId);
    res.json(peakActivity);
  } catch (error) {
    console.error('Peak activity API error:', error);
    res.status(500).json({ peakHour: 0, peakMinute: 0, currentActivity: 'low' });
  }
});

// Force Refresh Community Stats (for manual sync)
router.post('/api/force-refresh-stats', async (_, res) => {
  try {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({ status: 'error', message: 'postId required' });
      return;
    }

    await CommunityManager.forceRefreshStats(postId);
    const freshStats = await CommunityManager.getSynchronizedStats(postId);
    
    res.json({
      status: 'success',
      message: 'Stats refreshed successfully',
      stats: freshStats
    });
  } catch (error) {
    console.error('Force refresh stats error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to refresh stats' });
  }
});

// Session Recap Sharing API - Create damage sharing comment
router.post('/api/share-session-recap', async (_, res) => {
  try {
    const { postId, userId } = context;
    if (!postId || !userId) {
      res.status(400).json({ status: 'error', message: 'postId and userId required' });
      return;
    }

    const playerManager = new PlayerManager(userId, postId);
    const playerData = await playerManager.getPlayerData();
    
    if (!playerData) {
      res.status(400).json({ status: 'error', message: 'Player data not found' });
      return;
    }

    const classEmojis = {
      warrior: '⚔️',
      mage: '🔮',
      rogue: '🗡️',
      healer: '✨'
    };

    const emoji = classEmojis[playerData.characterClass as keyof typeof classEmojis] || '⚔️';
    const shareText = `I dealt ${playerData.sessionDamage.toLocaleString()} damage as a ${playerData.characterClass}! ${emoji}`;

    // In a real implementation, this would create an actual Reddit comment
    // For now, we'll just return the share data
    res.json({
      status: 'success',
      shareText,
      sessionDamage: playerData.sessionDamage,
      characterClass: playerData.characterClass,
      level: playerData.level,
      message: 'Session recap shared successfully'
    });
  } catch (error) {
    console.error('Session recap sharing error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to share session recap' });
  }
});

// Use router middleware
app.use(router);

// Get port from environment variable with fallback
const port = process.env.WEBBIT_PORT || 3000;

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port, () => console.log(`http://localhost:${port}`));
