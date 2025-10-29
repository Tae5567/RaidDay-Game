import { CharacterClass, AttackResult } from '../entities/PlayerCharacter';
import { GameConstants } from './GameConstants';

/**
 * DamageCalculator - Utility class for damage calculations
 * Centralizes all damage-related math and formulas
 */
export class DamageCalculator {
  private static readonly CLASS_BASE_DAMAGE = {
    [CharacterClass.WARRIOR]: 120,
    [CharacterClass.MAGE]: 100,
    [CharacterClass.ROGUE]: 90,
    [CharacterClass.HEALER]: 80
  };

  public static calculateBaseDamage(
    playerClass: CharacterClass,
    playerLevel: number
  ): number {
    const baseDamage = this.CLASS_BASE_DAMAGE[playerClass];
    return baseDamage * (1 + playerLevel * 0.05);
  }

  public static applyModifiers(
    baseDamage: number,
    hasFullEnergy: boolean,
    bossPhase: number,
    isCritical: boolean
  ): number {
    let damage = baseDamage;

    // Full energy bonus
    if (hasFullEnergy) {
      damage *= GameConstants.FULL_ENERGY_BONUS;
    }

    // Boss phase resistance
    if (bossPhase === 2) {
      damage *= GameConstants.PHASE2_RESISTANCE;
    }

    // Critical hit multiplier
    if (isCritical) {
      damage *= GameConstants.CRIT_MULTIPLIER;
    }

    // RNG variance ±10%
    damage *= this.randomFloat(0.9, 1.1);

    return Math.floor(damage);
  }

  public static rollCritical(playerClass: CharacterClass): boolean {
    const critChance = playerClass === CharacterClass.ROGUE 
      ? GameConstants.ROGUE_CRIT_CHANCE 
      : GameConstants.DEFAULT_CRIT_CHANCE;
    
    return Math.random() < critChance;
  }

  public static calculateSpecialDamage(
    playerClass: CharacterClass,
    playerLevel: number,
    bossPhase: number
  ): number {
    const baseDamage = this.calculateBaseDamage(playerClass, playerLevel) * 3; // 3x for special
    
    // Special abilities are always critical (especially Rogue backstab)
    const isCritical = true;
    
    return this.applyModifiers(baseDamage, false, bossPhase, isCritical);
  }

  /**
   * Calculate special damage with class-specific bonuses
   */
  public static calculateEnhancedSpecialDamage(
    playerClass: CharacterClass,
    playerLevel: number,
    bossPhase: number
  ): { damage: number; isCritical: boolean; effects: string[] } {
    let baseDamage = this.calculateBaseDamage(playerClass, playerLevel) * 3;
    let isCritical = true;
    const effects: string[] = [];

    // Class-specific enhancements
    switch (playerClass) {
      case CharacterClass.WARRIOR:
        // Triple hit combo - each hit does normal special damage
        effects.push('triple_hit');
        break;
      case CharacterClass.MAGE:
        // Fireball explosion with area effect
        baseDamage *= 1.1; // 10% bonus for explosion
        effects.push('explosion', 'screen_shake');
        break;
      case CharacterClass.ROGUE:
        // Guaranteed critical with backstab bonus
        baseDamage *= 1.2; // 20% backstab bonus
        effects.push('guaranteed_critical', 'teleport');
        break;
      case CharacterClass.HEALER:
        // Lower damage but community buff
        baseDamage *= 0.8; // 20% less damage
        effects.push('community_buff');
        break;
    }

    const finalDamage = this.applyModifiers(baseDamage, false, bossPhase, isCritical);
    
    return {
      damage: finalDamage,
      isCritical,
      effects
    };
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