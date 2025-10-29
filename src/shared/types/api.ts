export type InitResponse = {
  type: 'init';
  postId: string;
  count: number;
};

export type IncrementResponse = {
  type: 'increment';
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: 'decrement';
  postId: string;
  count: number;
};

export type SpecialAbilityValidationResponse = {
  canUse: boolean;
  reason: 'available' | 'special_ability_used' | 'insufficient_energy';
  timeRemaining?: number;
};

export type SpecialAbilityUseRequest = {
  characterClass: string;
  damage: number;
};

export type SpecialAbilityUseResponse = {
  status: 'success' | 'error';
  damage?: number;
  newBossHP?: number;
  characterClass?: string;
  message?: string;
};

// Boss and Combat API Types
export interface BossData {
  id: string;
  name: string;
  theme: string;
  baseHP: number;
  level: number;
  spriteKey: string;
  phase2Threshold: number;
  enrageThreshold: number;
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

export interface BossStatusResponse {
  data: BossData;
  state: BossState;
  isDefeated: boolean;
}

export interface AttackRequest {
  characterClass: string;
  damage: number;
  isCritical?: boolean;
}

export interface AttackResponse {
  success: boolean;
  damage: number;
  isCritical: boolean;
  newBossHP: number;
  bossPhase: number;
  isEnraged: boolean;
  playerLevel: number;
  xpGained: number;
  energyRemaining: number;
  message?: string;
}

export interface PlayerData {
  userId: string;
  characterClass: string;
  level: number;
  experience: number;
  sessionDamage: number;
  totalDamage: number;
  energyState: {
    current: number;
    max: number;
    cooldowns: number[];
    lastRefresh: number;
    sessionStart: number;
  };
  specialAbilityUsed: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  username?: string | undefined;
  redditUsername?: string | undefined;
  characterClass: string;
  level: number;
  sessionDamage: number;
  totalDamage: number;
  rank: number;
  avatarUrl?: string | undefined;
}

export interface CommunityDPSResponse {
  attacksPerMinute: number;
  averageDamage: number;
  activePlayers: number;
  topDamageDealer?: string;
  recentAttacks: AttackEvent[];
  totalDamageDealt: number;
}

export interface AttackEvent {
  userId: string;
  username?: string;
  redditUsername?: string;
  characterClass: string;
  damage: number;
  isCritical: boolean;
  timestamp: number;
  avatarUrl?: string;
}

export interface RecentAttacker {
  userId: string;
  username: string;
  redditUsername: string;
  characterClass: string;
  level: number;
  damage: number;
  timestamp: number;
  avatarUrl?: string | undefined;
}

export interface LiveLeaderboardResponse {
  status: 'success' | 'error';
  leaderboard: LeaderboardEntry[];
  currentUserRank?: number;
  totalPlayers: number;
  lastUpdated: number;
}

export interface RecentAttackersResponse {
  status: 'success' | 'error';
  recentAttackers: RecentAttacker[];
  lastUpdated: number;
}

export interface SessionStats {
  sessionDamage: number;
  attackCount: number;
  criticalHits: number;
  specialAbilityUsed: boolean;
  sessionStartTime: number;
  playerRank: number;
}

export interface VictoryDataResponse {
  status: 'success' | 'error';
  playerData?: PlayerData;
  sessionStats?: SessionStats;
  leaderboard?: LeaderboardEntry[];
  bossData?: BossData;
  xpGained?: number;
  rewards?: {
    coins: number;
    gems: number;
    potions: number;
    scrolls: number;
  };
  message?: string;
}

export interface ClaimRewardsResponse {
  status: 'success' | 'error';
  xpGained?: number;
  newLevel?: number;
  newExperience?: number;
  rewards?: {
    coins: number;
    gems: number;
    potions: number;
    scrolls: number;
  };
  message?: string;
}

// Server Synchronization API Types

export interface BossHPSyncResponse {
  status: 'success' | 'error';
  currentHP: number;
  maxHP: number;
  phase: number;
  isEnraged: boolean;
  totalDamageDealt: number;
  activePlayers: number;
  attacksPerMinute: number;
  lastSyncTime: number;
}

export interface CommunityDPSDetailedResponse {
  status: 'success' | 'error';
  attacksPerMinute: number;
  averageDamage: number;
  activePlayers: number;
  topDamageDealer?: string;
  recentAttacks: AttackEvent[];
  totalDamageDealt: number;
  estimatedDPS: number;
  timeSinceLastDamage: number;
  bossPhase: number;
  isEnraged: boolean;
  lastUpdated: number;
}

export interface PlayerDataSyncResponse {
  status: 'success' | 'error';
  playerData: PlayerData & {
    energyState: {
      current: number;
      max: number;
      cooldowns: number[];
      lastRefresh: number;
      sessionStart: number;
      cooldownsRemaining: number[];
    };
  };
  sessionStats: SessionStats;
  canRefreshSession: boolean;
  lastSyncTime: number;
}

export interface AttackFrequencyData {
  last1Minute: number;
  last5Minutes: number;
  last15Minutes: number;
}

export interface DamageByClassData {
  warrior: number;
  mage: number;
  rogue: number;
  healer: number;
}

export interface PeakActivityData {
  peakHour: number;
  peakMinute: number;
  currentActivity: 'low' | 'medium' | 'high';
}

// Session Sharing API Types
export interface ShareSessionRequest {
  sessionDamage: number;
  bossName: string;
  playerRank: number;
}

export interface ShareSessionResponse {
  status: 'success' | 'error';
  shareText?: string;
  sessionDamage?: number;
  bossName?: string;
  playerRank?: number;
  characterClass?: string;
  message?: string;
}

// Game State API Response
export interface GameStateResponse {
  status: 'success' | 'error';
  boss?: {
    data: BossData;
    state: BossState;
    isDefeated: boolean;
  };
  player?: {
    data: PlayerData;
    sessionStats: SessionStats;
  } | null;
  community?: CommunityDPSResponse;
  lastUpdated?: number;
  message?: string;
}

// Recent Attacks API Response
export interface RecentAttacksResponse {
  status: 'success' | 'error';
  recentAttacks?: AttackEvent[];
  lastUpdated?: number;
  message?: string;
}
