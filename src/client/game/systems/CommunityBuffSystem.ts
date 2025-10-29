import { CharacterClass } from '../entities/PlayerCharacter';

/**
 * CommunityBuffSystem - Manages community-wide buffs and effects
 * Handles Healer's buff aura that affects next 5 community attacks
 */
export interface CommunityBuff {
  type: 'damage_boost';
  multiplier: number;
  remainingUses: number;
  sourceClass: CharacterClass;
  timestamp: number;
}

export class CommunityBuffSystem {
  private activeBuff: CommunityBuff | undefined;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Apply Healer's buff aura (affects next 5 community attacks)
   */
  public applyHealerBuff(): void {
    this.activeBuff = {
      type: 'damage_boost',
      multiplier: 1.2, // 20% damage increase
      remainingUses: 5,
      sourceClass: CharacterClass.HEALER,
      timestamp: Date.now()
    };

    // Emit event for UI feedback
    this.scene.events.emit('community-buff-applied', {
      type: 'healer_aura',
      duration: 'next_5_attacks'
    });
  }

  /**
   * Check if community buff is active
   */
  public hasActiveBuff(): boolean {
    return this.activeBuff !== undefined && this.activeBuff.remainingUses > 0;
  }

  /**
   * Get current buff multiplier for community attacks
   */
  public getCommunityDamageMultiplier(): number {
    if (!this.hasActiveBuff()) {
      return 1.0;
    }
    return this.activeBuff!.multiplier;
  }

  /**
   * Consume one use of the community buff
   */
  public consumeBuffUse(): void {
    if (!this.activeBuff) return;

    this.activeBuff.remainingUses--;
    
    if (this.activeBuff.remainingUses <= 0) {
      this.clearBuff();
    }

    // Emit event for UI updates
    this.scene.events.emit('community-buff-consumed', {
      remainingUses: this.activeBuff?.remainingUses || 0
    });
  }

  /**
   * Clear active buff
   */
  public clearBuff(): void {
    if (this.activeBuff) {
      this.scene.events.emit('community-buff-expired');
      this.activeBuff = undefined;
    }
  }

  /**
   * Get remaining buff uses
   */
  public getRemainingUses(): number {
    return this.activeBuff?.remainingUses || 0;
  }

  /**
   * Get buff info for UI display
   */
  public getBuffInfo(): CommunityBuff | null {
    return this.activeBuff || null;
  }

  /**
   * Check if buff has expired (optional timeout after 2 minutes)
   */
  public update(): void {
    if (this.activeBuff) {
      const elapsed = Date.now() - this.activeBuff.timestamp;
      // Expire buff after 2 minutes if not consumed
      if (elapsed > 120000) {
        this.clearBuff();
      }
    }
  }
}