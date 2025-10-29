import { Boot } from './scenes/Boot';
import { Splash } from './scenes/Splash';
import { Battle } from './scenes/Battle';
import { Results } from './scenes/Results';
import { Victory } from './scenes/Victory';
import * as Phaser from 'phaser';
import { AUTO, Game } from 'phaser';

//  Raid Day Phaser.js 3.70+ Configuration
//  800x600 canvas with mobile-optimized scaling for boss battle game
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO, // Automatically choose WEBGL or CANVAS
  parent: 'game-container',
  backgroundColor: '#1a1a2e', // Dark theme for battle atmosphere
  width: 800,
  height: 600,
  scale: {
    mode: Phaser.Scale.FIT, // Use FIT to maintain aspect ratio while filling screen
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
    min: {
      width: 320,
      height: 240
    },
    max: {
      width: 1920,
      height: 1080
    }
  },
  render: {
    antialias: true,
    pixelArt: true, // Enable pixel art rendering for 2D sprites
    roundPixels: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // No gravity for top-down battle view
      debug: false,
    },
  },
  scene: [Boot, Splash, Battle, Results, Victory],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
