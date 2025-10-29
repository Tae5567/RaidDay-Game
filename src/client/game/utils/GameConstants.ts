/**
 * GameConstants - Central configuration for game settings and constants
 */
export class GameConstants {
  // Game dimensions
  static readonly GAME_WIDTH = 800;
  static readonly GAME_HEIGHT = 600;

  // Sprite dimensions
  static readonly CHARACTER_SPRITE_SIZE = 32;
  static readonly BOSS_SPRITE_SIZE = 128;

  // Energy system - faster for better gameplay
  static readonly MAX_ENERGY = 5;
  static readonly ENERGY_COOLDOWN_MS = 3000; // 3 seconds (faster)
  static readonly SESSION_DURATION_MS = 60000; // 1 minute sessions

  // Combat - New HP system
  static readonly PLAYER_MAX_HP = 500;
  static readonly BOSS_MAX_HP = 50000;
  static readonly FULL_ENERGY_BONUS = 1.2; // 20% bonus
  static readonly CRIT_MULTIPLIER = 3;
  static readonly PHASE2_RESISTANCE = 0.9; // 10% reduction
  static readonly ROGUE_CRIT_CHANCE = 0.3; // 30%
  static readonly DEFAULT_CRIT_CHANCE = 0.1; // 10%
  
  // Boss attack system
  static readonly BOSS_ATTACK_INTERVAL_MIN = 8000; // 8 seconds
  static readonly BOSS_ATTACK_INTERVAL_MAX = 15000; // 15 seconds
  static readonly BOSS_DAMAGE_MIN = 50;
  static readonly BOSS_DAMAGE_MAX = 150;

  // Animation timings - simplified for 0.8-second attack sequence
  static readonly ATTACK_SEQUENCE_DURATION = 800; // 0.8 seconds (per requirements 1.2, 1.3, 7.1, 7.2)
  static readonly SCREEN_SHAKE_DURATION = 150; // 0.15 seconds (shorter for faster sequence)
  static readonly HIT_PAUSE_DURATION = 50; // 0.05 seconds hit pause for impact feel

  // Scene transition settings
  static readonly TRANSITION_DURATION_FAST = 400; // Quick transitions
  static readonly TRANSITION_DURATION_NORMAL = 600; // Standard transitions
  static readonly TRANSITION_DURATION_SLOW = 800; // Dramatic transitions
  static readonly LOADING_INDICATOR_DELAY = 200; // Delay before showing loading

  // Screen shake intensities
  static readonly SHAKE_NORMAL = 2;
  static readonly SHAKE_CRITICAL = 5;
  static readonly SHAKE_BOSS_PHASE = 8;

  // Mobile optimization
  static readonly MOBILE_MAX_PARTICLES = 10; // Limited to 10 particles on mobile (Requirements 7.2)
  static readonly DESKTOP_MAX_PARTICLES = 50;
  static readonly MOBILE_TOUCH_TARGET_SIZE = 60; // 60x60 pixels minimum (Requirements 6.1)
  
  // Performance thresholds
  static readonly TARGET_FPS = 60;
  static readonly MIN_MOBILE_FPS = 30;
  static readonly MIN_DESKTOP_FPS = 45;
  static readonly PERFORMANCE_CHECK_INTERVAL = 1000; // 1 second

  // UI Layout (for 800x600 canvas)
  static readonly HUD_TOP_HEIGHT = 100;
  static readonly HUD_BOTTOM_HEIGHT = 100;
  static readonly BATTLE_AREA_HEIGHT = 400;

  // Boss phases
  static readonly BOSS_PHASE2_THRESHOLD = 0.75; // 75% HP
  static readonly BOSS_ENRAGE_THRESHOLD = 0.25; // 25% HP

  // Community simulation
  static readonly COMMUNITY_ATTACK_INTERVAL_MIN = 3000; // 3 seconds
  static readonly COMMUNITY_ATTACK_INTERVAL_MAX = 5000; // 5 seconds
  static readonly HP_SYNC_INTERVAL = 10000; // 10 seconds

  // Daily boss themes
  static readonly DAILY_THEMES = [
    'Gaming',      // Monday
    'Internet',    // Tuesday  
    'Social Media', // Wednesday
    'Work',        // Thursday
    'Entertainment', // Friday
    'Sports',      // Saturday
    'Memes'        // Sunday
  ] as const;

  // Color palette
  static readonly COLORS = {
    BACKGROUND: 0x1a1a2e,
    UI_PRIMARY: 0x16213e,
    UI_SECONDARY: 0x0f3460,
    TEXT_PRIMARY: 0xffffff,
    TEXT_SECONDARY: 0xcccccc,
    ENERGY_FULL: 0x00ff00,
    ENERGY_EMPTY: 0x666666,
    ENERGY_COOLDOWN: 0xff8800,
    HP_BAR: 0xff0000,
    DAMAGE_NORMAL: 0xffff00,
    DAMAGE_CRITICAL: 0xff6600,
    BUTTON_ENABLED: 0x4a90e2,
    BUTTON_HOVER: 0x6bb6ff,
    BUTTON_DISABLED: 0x666666
  } as const;
}