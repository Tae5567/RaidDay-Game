import { Scene } from 'phaser';
import { GameConstants } from '../utils/GameConstants';
import { TransitionSystem } from '../systems/TransitionSystem';
import { AnimationSystem } from '../systems/AnimationSystem';
import { CharacterClass } from '../entities/PlayerCharacter';

/**
 * CharacterSelect - Character class selection screen
 * Allows players to choose their character class before battle
 */
export class CharacterSelect extends Scene {
  private transitionSystem?: TransitionSystem;
  private animationSystem?: AnimationSystem;
  private selectedClass: CharacterClass = CharacterClass.WARRIOR;
  private classButtons: Map<CharacterClass, Phaser.GameObjects.Container> = new Map();
  private classSprites: Map<CharacterClass, Phaser.GameObjects.Sprite> = new Map();
  private confirmButton?: Phaser.GameObjects.Container;

  constructor() {
    super('CharacterSelect');
  }

  async create(): Promise<void> {
    // Setup systems
    this.transitionSystem = new TransitionSystem(this);
    this.animationSystem = new AnimationSystem(this);
    
    // Smooth transition in
    await this.transitionSystem.transitionIn({
      type: 'slide',
      direction: 'right',
      duration: GameConstants.TRANSITION_DURATION_NORMAL
    });
    
    this.createBackground();
    this.createTitle();
    this.createClassSelection();
    this.createConfirmButton();
    this.createBackButton();
    
    // Animate elements entrance
    await this.animateElementsEntrance();
    
    this.refreshLayout();

    // Handle screen resize
    this.scale.on('resize', () => this.refreshLayout());
  }

  private createBackground(): void {
    const { width, height } = this.scale;
    
    // Dark gradient background
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(
      GameConstants.COLORS.BACKGROUND, 
      GameConstants.COLORS.BACKGROUND,
      GameConstants.COLORS.UI_PRIMARY,
      GameConstants.COLORS.UI_PRIMARY
    );
    graphics.fillRect(0, 0, width, height);
  }

  private createTitle(): void {
    const { width } = this.scale;
    
    this.add.text(width / 2, 80, 'Choose Your Class', {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);
  }

  private createClassSelection(): void {
    const { width, height } = this.scale;
    
    const classes = [
      {
        class: CharacterClass.WARRIOR,
        name: 'Warrior',
        description: 'High damage, balanced stats',
        stats: 'ATK: High | DEF: Medium | SPD: Medium',
        color: 0xff4444
      },
      {
        class: CharacterClass.MAGE,
        name: 'Mage',
        description: 'Magical damage, glass cannon',
        stats: 'ATK: Very High | DEF: Low | SPD: High',
        color: 0x4444ff
      },
      {
        class: CharacterClass.ROGUE,
        name: 'Rogue',
        description: '30% critical hit chance',
        stats: 'ATK: Medium | DEF: Low | SPD: Very High',
        color: 0x44ff44
      },
      {
        class: CharacterClass.HEALER,
        name: 'Healer',
        description: 'Support abilities, high defense',
        stats: 'ATK: Low | DEF: High | SPD: Medium',
        color: 0xffff44
      }
    ];

    const startY = height * 0.25;
    const spacing = (height * 0.6) / classes.length;

    classes.forEach((classData, index) => {
      const y = startY + (index * spacing);
      const container = this.createClassButton(classData, width, y);
      this.classButtons.set(classData.class, container);
    });

    // Select warrior by default
    this.selectClass(CharacterClass.WARRIOR);
  }

  private createClassButton(
    classData: { class: CharacterClass; name: string; description: string; stats: string; color: number },
    width: number,
    y: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(width / 2, y);
    
    // Background
    const bg = this.add.rectangle(0, 0, width * 0.8, 80, 0x333333, 0.8);
    bg.setStrokeStyle(3, 0x666666);
    container.add(bg);

    // Character sprite
    const spriteKey = classData.class.toLowerCase();
    const sprite = this.add.sprite(-width * 0.3, 0, spriteKey);
    sprite.setScale(1.5);
    container.add(sprite);
    this.classSprites.set(classData.class, sprite);

    // Class name
    const nameText = this.add.text(-width * 0.15, -20, classData.name, {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);
    container.add(nameText);

    // Description
    const descText = this.add.text(-width * 0.15, 0, classData.description, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#cccccc',
    }).setOrigin(0, 0.5);
    container.add(descText);

    // Stats
    const statsText = this.add.text(-width * 0.15, 20, classData.stats, {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#aaaaaa',
    }).setOrigin(0, 0.5);
    container.add(statsText);

    // Make interactive
    bg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        bg.setStrokeStyle(3, classData.color);
        container.setScale(1.05);
      })
      .on('pointerout', () => {
        if (this.selectedClass !== classData.class) {
          bg.setStrokeStyle(3, 0x666666);
          container.setScale(1);
        }
      })
      .on('pointerdown', () => {
        this.selectClass(classData.class);
      });

    return container;
  }

  private selectClass(characterClass: CharacterClass): void {
    // Deselect previous
    if (this.selectedClass !== characterClass) {
      const prevButton = this.classButtons.get(this.selectedClass);
      if (prevButton) {
        const bg = prevButton.list[0] as Phaser.GameObjects.Rectangle;
        bg.setStrokeStyle(3, 0x666666);
        prevButton.setScale(1);
      }
    }

    // Select new
    this.selectedClass = characterClass;
    const button = this.classButtons.get(characterClass);
    if (button) {
      const bg = button.list[0] as Phaser.GameObjects.Rectangle;
      bg.setStrokeStyle(3, 0xffff00);
      bg.setFillStyle(0x444400, 0.9);
      button.setScale(1.1);
    }

    // Animate selected sprite
    const sprite = this.classSprites.get(characterClass);
    if (sprite && this.animationSystem) {
      this.animationSystem.animateButtonFeedback(button!, 'success');
    }
  }

  private createConfirmButton(): void {
    const { width, height } = this.scale;
    
    const container = this.add.container(width / 2, height * 0.9);
    
    // Button background
    const bg = this.add.rectangle(0, 0, 200, 60, GameConstants.COLORS.BUTTON_ENABLED);
    bg.setStrokeStyle(3, GameConstants.COLORS.TEXT_PRIMARY);
    
    // Button text
    const text = this.add.text(0, 0, 'FIGHT NOW!', {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    container.add([bg, text]);
    
    // Make interactive
    bg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        bg.setFillStyle(GameConstants.COLORS.BUTTON_HOVER);
        container.setScale(1.05);
      })
      .on('pointerout', () => {
        bg.setFillStyle(GameConstants.COLORS.BUTTON_ENABLED);
        container.setScale(1);
      })
      .on('pointerdown', async () => {
        if (this.animationSystem) {
          await this.animationSystem.animateButtonPress(container);
        }
        
        // Store selected class in registry
        this.registry.set('selectedClass', this.selectedClass);
        
        // Transition to Battle scene
        if (this.transitionSystem) {
          this.transitionSystem.zoomTransition('Battle');
        }
      });
    
    this.confirmButton = container;
  }

  private createBackButton(): void {
    const backButton = this.add.text(40, 40, '← Back', {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);
    
    backButton.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        backButton.setColor('#ffff00');
      })
      .on('pointerout', () => {
        backButton.setColor('#ffffff');
      })
      .on('pointerdown', () => {
        if (this.transitionSystem) {
          this.transitionSystem.slideTransition('Splash', 'left');
        }
      });
  }

  private async animateElementsEntrance(): Promise<void> {
    // Collect all UI elements for entrance animation
    const uiElements: Phaser.GameObjects.GameObject[] = [];
    
    this.classButtons.forEach(button => uiElements.push(button));
    if (this.confirmButton) uiElements.push(this.confirmButton);
    
    // Animate UI elements entrance
    if (this.animationSystem && uiElements.length > 0) {
      await this.animationSystem.animateUIEntrance(uiElements);
    }
  }

  private refreshLayout(): void {
    // Handle responsive layout updates
    const { width, height } = this.scale;
    
    // Update camera viewport
    this.cameras.main.setViewport(0, 0, width, height);
    
    // Recreate layout if needed
    // This is a simplified approach - in production you'd update positions
  }
}