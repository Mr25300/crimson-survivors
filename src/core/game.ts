import { Gameloop } from './gameloop.js';
import { Canvas } from '../rendering/canvas.js';
import { SpriteModel } from '../sprites/spritemodel.js';
import { Camera } from '../rendering/camera.js';
import { Vector2 } from '../util/vector2.js';
import { SpriteSheet } from '../sprites/spritesheet.js';
import { Player } from '../objects/player/player.js';
import { PlayerController } from '../objects/player/controller.js';
import { Tool } from '../objects/player/tool.js';
import { HitLine, HitBox } from '../physics/collisions.js';

class Game extends Gameloop {
  private static _instance: Game;

  private canvas: Canvas;

  private playerChar: Player;

  private constructor() {
    super();

    const camera: Camera = new Camera(new Vector2());

    this.canvas = new Canvas(camera);

    void this.canvas.init().then(() => {
      const sprite: SpriteSheet = this.canvas.createSprite(1, 1, 11, 3, 4, 'res/assets/player.png');
      sprite.createAnimation("idle", [0], 1, true, 0);
      sprite.createAnimation("walking", [6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 4, 5], 1, true, 1);
      sprite.createAnimation("shoot", [0, 1, 2], 0.2, false, 2);

      const model: SpriteModel = sprite.createModel();
      const controller: PlayerController = new PlayerController(this.canvas, 'w', 'a', 's', 'd');

      this.playerChar = new Player(model, controller);
      this.playerChar.giveTool(new Tool("Launcher", 2));
      this.playerChar.holdTool(0);

      const sprite2: SpriteSheet = this.canvas.createSprite(4, 1, 1, 1, 1, "res/assets/WallTile.png");
      const model2: SpriteModel = sprite2.createModel();
      model2.setTransformation(new Vector2(), 0);

      const barrier = HitLine.fromStartAndEnd(new Vector2(-1, 0), new Vector2(1, 0));
      const box = new HitBox(new Vector2(0, 0.5), 0, 2, 2);

      console.log(barrier.checkBoxCollision(box));

      this.start();
    });
  }

  public static get instance(): Game {
    if (!Game._instance) Game._instance = new Game();

    return Game._instance;
  }

  protected update(deltaTime: number): void {
    // handle input
    // pathfinding in seperate input method
    // entity physics
    // hitbox checks for attacks and entites
    // projectile physics
    // animations (canvas update)
    // render

    this.playerChar.input();
    this.playerChar.update(deltaTime);

    this.canvas.update(deltaTime);
  }

  protected render(): void {
    this.canvas.render();
  }
}

class Driver {
  constructor() {
    Game.instance;
  }
}

new Driver();