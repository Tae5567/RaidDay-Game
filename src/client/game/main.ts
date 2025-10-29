import { Boot } from './scenes/Boot';
import { Splash } from './scenes/Splash';
import { Battle } from './scenes/Battle';
import { ClassSelect } from './scenes/ClassSelect';
import { Victory } from './scenes/Victory';
import { HowToPlay } from './scenes/HowToPlay';
import * as Phaser from 'phaser';
import { AUTO, WEBGL, CANVAS, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';

//  Raid Day Phaser.js 3.70+ Configuration
//  800x600 canvas with WebGL/Canvas fallback for boss battle game
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO, // Automatically choose WEBGL or CANVAS
  parent: 'game-container',
  backgroundColor: '#1a1a2e', // Dark theme for battle atmosphere
  width: 800,
  height: 600,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
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
  scene: [Boot, Preloader, Splash, HowToPlay, ClassSelect, Battle, Victory],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
