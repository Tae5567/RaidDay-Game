import { Scene } from 'phaser';

export class Boot extends Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    //  Load minimal assets needed for the Preloader scene
    //  These should be small files for quick loading

    // Background for preloader
    this.load.image('background', 'assets/bg.png');
    
    // Create simple colored rectangles as placeholder sprites if assets don't exist
    this.createPlaceholderAssets();
  }

  create() {
    this.scene.start('Preloader');
  }

  private createPlaceholderAssets(): void {
    // Create placeholder textures for development
    // These will be replaced with actual sprite sheets later
    
    // Character placeholders (32x32)
    this.createColoredTexture('warrior', 32, 32, 0xff4444);
    this.createColoredTexture('mage', 32, 32, 0x4444ff);
    this.createColoredTexture('rogue', 32, 32, 0x44ff44);
    this.createColoredTexture('healer', 32, 32, 0xffff44);
    
    // Boss placeholder (128x128)
    this.createColoredTexture('boss_lag_spike', 128, 128, 0x8b0000);
    
    // Particle placeholders
    this.createColoredTexture('slash_particle', 8, 8, 0xffffff);
    this.createColoredTexture('crit_particle', 12, 12, 0xff6600);
    this.createColoredTexture('explosion_particle', 16, 16, 0xff0000);
    this.createColoredTexture('energy_particle', 6, 6, 0x00ff00);
  }

  private createColoredTexture(key: string, width: number, height: number, color: number): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(color);
    graphics.fillRect(0, 0, width, height);
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }
}
