import { Scene } from 'phaser';
import { CharacterClass } from '../entities/PlayerCharacter';
import { GameConstants } from '../utils/GameConstants';
import { MobileUtils } from '../utils/MobileUtils';

/**
 * ClassSelect - Character class selection scene
 * Allows players to choose their character class before battle
 */
export class ClassSelect extends Scene {
  private selectedClass: CharacterClass | undefined;
  private classButtons: Map<CharacterClass, Phaser.GameObjects.Container> = new Map();
  private confirmButton: Phaser.GameObjects.Container | undefined;

  constructor() {
    super('ClassSelect');
  }

  init(): void {
    this.selectedClass = undefined;
    this.classButtons.clear();
  }

  create(): void {
    console.log('ClassSelect scene created');
    
    this.createBackground();
    this.createTitle();
    this.createClassButtons();
    this.createConfirmButton();
    

    
    this.refreshLayout();

    // Setup mobile optimizations
    MobileUtils.optimizeForMobile(this);
    MobileUtils.setupTouchControls(this);

    // Re-calculate positions on resize
    this.scale.on('resize', () => this.refreshLayout());
  }



  private createBackground(): void {
    const { width, height } = this.scale;
    
    // Dark background
    const graphics = this.add.graphics();
    graphics.fillStyle(GameConstants.COLORS.BACKGROUND);
    graphics.fillRect(0, 0, width, height);
  }

  private createTitle(): void {
    this.add.text(0, 0, 'Choose Your Class', {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5).setName('title');
  }

  private createClassButtons(): void {
    const classes = [
      { 
        class: CharacterClass.WARRIOR, 
        name: 'Warrior', 
        description: 'High damage, balanced fighter',
        color: 0xff4444 
      },
      { 
        class: CharacterClass.MAGE, 
        name: 'Mage', 
        description: 'Magical attacks, area effects',
        color: 0x4444ff 
      },
      { 
        class: CharacterClass.ROGUE, 
        name: 'Rogue', 
        description: '30% critical chance, high mobility',
        color: 0x44ff44 
      },
      { 
        class: CharacterClass.HEALER, 
        name: 'Healer', 
        description: 'Support abilities, team buffs',
        color: 0xffff44 
      }
    ];

    classes.forEach((classInfo) => {
      const button = this.createClassButton(
        classInfo.class,
        classInfo.name,
        classInfo.description,
        classInfo.color
      );
      
      this.classButtons.set(classInfo.class, button);
    });
  }

  private createClassButton(
    characterClass: CharacterClass,
    name: string,
    description: string,
    color: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);

    // Button dimensions
    const buttonWidth = 180;
    const buttonHeight = 120;

    // Button background
    const background = this.add.rectangle(0, 0, buttonWidth, buttonHeight, color, 0.3)
      .setStrokeStyle(3, color);

    // Class name
    const nameText = this.add.text(0, -30, name, {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Class description
    const descText = this.add.text(0, 10, description, {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#cccccc',
      align: 'center',
      wordWrap: { width: buttonWidth - 20 }
    }).setOrigin(0.5);

    // Selection indicator (initially hidden)
    const selector = this.add.rectangle(0, 0, buttonWidth + 10, buttonHeight + 10)
      .setStrokeStyle(4, 0xffffff)
      .setVisible(false);

    container.add([selector, background, nameText, descText]);

    // Make background interactive with clear feedback
    background.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        console.log('Hovering over class:', characterClass);
        if (this.selectedClass !== characterClass) {
          background.setAlpha(0.6);
        }
      })
      .on('pointerout', () => {
        if (this.selectedClass !== characterClass) {
          background.setAlpha(0.3);
        }
      })
      .on('pointerdown', () => {
        console.log('Class button clicked:', characterClass);
        this.selectClass(characterClass);
      });

    return container;
  }

  private selectClass(characterClass: CharacterClass): void {
    console.log('Selecting class:', characterClass);
    
    // Clear previous selection
    if (this.selectedClass) {
      const prevButton = this.classButtons.get(this.selectedClass);
      if (prevButton) {
        const selector = prevButton.list[0] as Phaser.GameObjects.Rectangle;
        const background = prevButton.list[1] as Phaser.GameObjects.Rectangle;
        selector.setVisible(false);
        background.setAlpha(0.3);
      }
    }

    // Set new selection
    this.selectedClass = characterClass;
    const button = this.classButtons.get(characterClass);
    if (button) {
      const selector = button.list[0] as Phaser.GameObjects.Rectangle;
      const background = button.list[1] as Phaser.GameObjects.Rectangle;
      selector.setVisible(true);
      background.setAlpha(0.8);
    }

    // Enable confirm button
    if (this.confirmButton) {
      const background = this.confirmButton.list[0] as Phaser.GameObjects.Rectangle;
      const text = this.confirmButton.list[1] as Phaser.GameObjects.Text;
      background.setFillStyle(GameConstants.COLORS.BUTTON_ENABLED);
      text.setColor('#ffffff');
      console.log('Confirm button enabled');
    }
  }

  private createConfirmButton(): void {
    // Button background (initially disabled)
    const background = this.add.rectangle(0, 0, 200, 50, GameConstants.COLORS.BUTTON_DISABLED)
      .setStrokeStyle(2, GameConstants.COLORS.TEXT_SECONDARY)
      .setName('confirmButtonBg');

    // Button text
    const text = this.add.text(0, 0, 'START BATTLE', {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: '#666666',
    }).setOrigin(0.5).setName('confirmButtonText');

    // Create container and add elements
    const container = this.add.container(0, 0, [background, text]);

    // Make background interactive with larger hit area
    background.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        console.log('Hovering over confirm button, selectedClass:', this.selectedClass);
        if (this.selectedClass) {
          background.setStrokeStyle(2, 0xffffff);
        }
      })
      .on('pointerout', () => {
        if (this.selectedClass) {
          background.setStrokeStyle(2, GameConstants.COLORS.TEXT_SECONDARY);
        }
      })
      .on('pointerdown', () => {
        console.log('Confirm button clicked! selectedClass:', this.selectedClass);
        
        if (this.selectedClass) {
          console.log('Starting Battle scene with class:', this.selectedClass);
          this.registry.set('selectedClass', this.selectedClass);
          this.scene.start('Battle');
        } else {
          console.log('No class selected - button should be disabled');
        }
      });

    this.confirmButton = container;
  }

  private refreshLayout(): void {
    const { width, height } = this.scale;

    // Resize camera
    this.cameras.resize(width, height);

    // Scale factor
    const scaleFactor = Math.min(width / GameConstants.GAME_WIDTH, height / GameConstants.GAME_HEIGHT, 1);

    // Position title
    const title = this.children.getByName('title') as Phaser.GameObjects.Text;
    if (title) {
      title.setPosition(width / 2, height * 0.15);
      title.setScale(scaleFactor);
    }

    // Position class buttons in a 2x2 grid
    const classes = Array.from(this.classButtons.keys());
    classes.forEach((characterClass, index) => {
      const button = this.classButtons.get(characterClass);
      if (button) {
        const col = index % 2;
        const row = Math.floor(index / 2);
        
        const x = width / 2 + (col - 0.5) * 220 * scaleFactor;
        const y = height * 0.4 + row * 140 * scaleFactor;
        
        button.setPosition(x, y);
        button.setScale(scaleFactor);
      }
    });

    // Position confirm button
    if (this.confirmButton) {
      this.confirmButton.setPosition(width / 2, height * 0.85);
      this.confirmButton.setScale(scaleFactor);
    }


  }
}