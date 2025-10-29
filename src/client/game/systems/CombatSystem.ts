import { CharacterClass, AttackResult } from '../entities/PlayerCharacter';
import { DamageCalculator } from '../utils/DamageCalculator';
import { GameConstants } from '../utils/GameConstants';

/**
 * CombatSystem - Handles damage calculations and combat mechanics
 * Manages class modifiers, critical hits, and boss phase resistance
 */
export class CombatSystem {

  public calculateDamage(
    playerClass: CharacterClass,
    playerLevel: number,
    hasFullEnergy: boolean,
    bossPhase: number,
    forceCritical: boolean = false
  ): AttackResult {
    // Calculate base damage using utility
    const baseDamage = DamageCalculator.calculateBaseDamage(playerClass, playerLevel);

    // Determine if critical hit occurs
    const isCritical = forceCritical || DamageCalculator.rollCritical(playerClass);
    
    // Apply all modifiers
    const finalDamage = DamageCalculator.applyModifiers(
      baseDamage,
      hasFullEnergy,
      bossPhase,
      isCritical
    );

    return {
      damage: finalDamage,
      isCritical,
      energyConsumed: 1
    };
  }

  public calculateSpecialAbilityDamage(
    playerClass: CharacterClass,
    playerLevel: number,
    bossPhase: number
  ): AttackResult {
    // Calculate special ability damage using utility
    const damage = DamageCalculator.calculateSpecialDamage(playerClass, playerLevel, bossPhase);

    return {
      damage,
      isCritical: true, // Special abilities are always critical
      energyConsumed: 3
    };
  }

  /**
   * Validate if an attack can be performed
   */
  public canPerformAttack(energyAvailable: number): boolean {
    return energyAvailable > 0;
  }

  /**
   * Validate if a special ability can be performed (deprecated - use EnergySystem.canUseSpecialAbility)
   */
  public canPerformSpecialAbility(energyAvailable: number, specialUsed: boolean): boolean {
    return energyAvailable >= 3 && !specialUsed;
  }

  /**
   * Apply special ability effects based on class
   */
  public applySpecialAbilityEffects(
    playerClass: CharacterClass,
    scene: Phaser.Scene
  ): void {
    switch (playerClass) {
      case CharacterClass.WARRIOR:
        // Triple hit combo - handled in animation sequence
        break;
      case CharacterClass.MAGE:
        // Fireball explosion - handled in animation sequence
        break;
      case CharacterClass.ROGUE:
        // Guaranteed critical backstab - handled in damage calculation
        break;
      case CharacterClass.HEALER:
        // Community buff - handled by CommunityBuffSystem
        scene.events.emit('apply-healer-buff');
        break;
    }
  }

  /**
   * Calculate damage for community simulation
   */
  public calculateCommunityDamage(averageLevel: number = 10): number {
    // Simulate random community player attack
    const classes = Object.values(CharacterClass);
    const randomClass = classes[Math.floor(Math.random() * classes.length)];
    const randomLevel = Math.floor(Math.random() * 10) + averageLevel - 5; // ±5 levels
    
    const result = this.calculateDamage(randomClass, randomLevel, false, 1, false);
    return result.damage;
  }

  /**
   * Get class-specific attack animation duration
   */
  public getAttackAnimationDuration(playerClass: CharacterClass): number {
    // Different classes might have slightly different animation timings
    const baseDuration = GameConstants.ATTACK_SEQUENCE_DURATION;
    
    switch (playerClass) {
      case CharacterClass.ROGUE:
        return baseDuration * 0.9; // Faster attacks
      case CharacterClass.WARRIOR:
        return baseDuration * 1.1; // Slower, heavier attacks
      default:
        return baseDuration;
    }
  }
}