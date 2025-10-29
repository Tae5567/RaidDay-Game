import { Boot } from './scenes/Boot';
import { Splash } from './scenes/Splash';
import { CharacterSelect } from './scenes/CharacterSelect';
import { Battle } from './scenes/Battle';
import { Results } from './scenes/Results';
import { Victory } from './scenes/Victory';
import { HowToPlay } from './scenes/HowToPlay';
import * as Phaser from 'phaser';
import { AUTO, Game } from 'phaser';

//  Raid Day Phaser.js 3.70+ Configuration
//  Responsive canvas that fills the entire screen
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO, // Automatically choose WEBGL or CANVAS
  parent: 'game-container',
  backgroundColor: '#1a1a2e', // Dark theme for battle atmosphere
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.RESIZE, // Resize to fill entire screen
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
    min: {
      width: 320,
      height: 240
    },
    max: {
      width: 2560,
      height: 1440
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
  scene: [Boot, Splash, CharacterSelect, HowToPlay, Battle, Results, Victory],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
