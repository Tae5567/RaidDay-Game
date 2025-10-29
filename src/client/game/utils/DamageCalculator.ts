import { CharacterClass } from '../entities/PlayerCharacter';

/**
 * Simplified DamageCalculator for Raid Day
 * Focuses on simple damage ranges with minimal class differences
 * Removes complex energy/cooldown mechanics per requirements 5.3, 5.4, 5.5
 */
export class DamageCalculator {
  // Base damage ranges by class (minimal differences per requirement 5.2)
  private static readonly CLASS_DAMAGE_RANGES = {
    [CharacterClass.WARRIOR]: { min: 180, max: 220 },
    [CharacterClass.MAGE]: { min: 170, max: 230 }, 
    [CharacterClass.ROGUE]: { min: 160, max: 240 },
    [CharacterClass.HEALER]: { min: 175, max: 225 }
  };

  /**
   * Calculate damage with simplified mechanics
   * @param playerClass Character class
   * @param playerLevel Player level for scaling
   * @returns Calculated damage amount
   */
  public static calculateDamage(
    playerClass: CharacterClass,
    playerLevel: number = 1
  ): number {
    const range = this.CLASS_DAMAGE_RANGES[playerClass];
    
    // Random damage within class range
    let damage = this.randomInt(range.min, range.max);
    
    // Simple level scaling (2% per level)
    damage *= (1 + playerLevel * 0.02);
    
    // Random variance ±15% for variety
    damage *= this.randomFloat(0.85, 1.15);
    
    return Math.floor(damage);
  }

  /**
   * Roll for critical hit (simplified)
   * @param _playerClass Character class (unused - all classes have same crit chance)
   * @returns Whether attack is critical
   */
  public static rollCritical(_playerClass: CharacterClass): boolean {
    // Simple 15% crit chance for all classes
    return Math.random() < 0.15;
  }

  /**
   * Apply critical hit multiplier
   * @param damage Base damage
   * @param isCritical Whether hit is critical
   * @returns Modified damage
   */
  public static applyCritical(damage: number, isCritical: boolean): number {
    return isCritical ? Math.floor(damage * 2.0) : damage; // 2x for crits
  }

  /**
   * Calculate complete attack damage (main method)
   * @param playerClass Character class
   * @param playerLevel Player level
   * @returns Attack result with damage and crit status
   */
  public static calculateAttack(
    playerClass: CharacterClass,
    playerLevel: number = 1
  ): { damage: number; isCritical: boolean } {
    const baseDamage = this.calculateDamage(playerClass, playerLevel);
    const isCritical = this.rollCritical(playerClass);
    const finalDamage = this.applyCritical(baseDamage, isCritical);
    
    return {
      damage: finalDamage,
      isCritical
    };
  }

  /**
   * Get damage range for display purposes
   * @param playerClass Character class
   * @param playerLevel Player level
   * @returns Min and max damage range
   */
  public static getDamageRange(
    playerClass: CharacterClass,
    playerLevel: number = 1
  ): { min: number; max: number } {
    const range = this.CLASS_DAMAGE_RANGES[playerClass];
    const levelMultiplier = (1 + playerLevel * 0.02);
    
    return {
      min: Math.floor(range.min * levelMultiplier * 0.85), // With variance
      max: Math.floor(range.max * levelMultiplier * 1.15)
    };
  }

  // Utility methods
  private static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private static randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  public static formatDamage(damage: number): string {
    if (damage >= 1000) {
      return `${(damage / 1000).toFixed(1)}K`;
    }
    return damage.toString();
  }
}