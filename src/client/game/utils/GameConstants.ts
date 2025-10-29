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

  // Energy system
  static readonly MAX_ENERGY = 5;
  static readonly ENERGY_COOLDOWN_MS = 30000; // 30 seconds
  static readonly SESSION_REFRESH_MS = 7200000; // 2 hours

  // Combat
  static readonly FULL_ENERGY_BONUS = 1.2; // 20% bonus
  static readonly CRIT_MULTIPLIER = 3;
  static readonly PHASE2_RESISTANCE = 0.9; // 10% reduction
  static readonly ROGUE_CRIT_CHANCE = 0.3; // 30%
  static readonly DEFAULT_CRIT_CHANCE = 0.1; // 10%

  // Animation timings
  static readonly ATTACK_SEQUENCE_DURATION = 1500; // 1.5 seconds
  static readonly HIT_PAUSE_DURATION = 100; // 0.1 seconds
  static readonly SCREEN_SHAKE_DURATION = 200; // 0.2 seconds

  // Screen shake intensities
  static readonly SHAKE_NORMAL = 2;
  static readonly SHAKE_CRITICAL = 5;
  static readonly SHAKE_BOSS_PHASE = 8;

  // Mobile optimization
  static readonly MOBILE_MAX_PARTICLES = 20;
  static readonly DESKTOP_MAX_PARTICLES = 50;
  static readonly MOBILE_TOUCH_TARGET_SIZE = 44; // 44x44 pixels minimum

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