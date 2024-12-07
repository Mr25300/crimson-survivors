import {Gameloop} from './gameloop.js';
import {Canvas} from '../rendering/canvas.js';
import {Controller, Player} from '../entities/entity.js';
import {Weapon} from '../entities/weapon.js';
import {SpriteModel} from '../sprites/spritemodel.js';
import {Camera} from '../rendering/camera.js';
import {Vector2} from '../util/vector2.js';
import {SpriteSheet} from '../sprites/spritesheet.js';

class Game extends Gameloop {
  private static _instance: Game;

  private canvas: Canvas;

  private playerChar: Player;
  private constructor() {
    super();

    const camera: Camera = new Camera(new Vector2());

    this.canvas = new Canvas(camera);

    void this.canvas.init().then(() => {
      const sprite: SpriteSheet = this.canvas.createSprite(
        1,
        1,
        11,
        3,
        4,
        'res/assets/player.png'
      );

      sprite.createAnimation('walking', [6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 4, 5]);
      sprite.createAnimation('shoot', [0, 1, 2]);

      // for (let i = 0; i < 5; i++) {
      //   const angle = (Math.PI * 2 * i) / 100;
      //   const model = sprite.createModel();

      //   model.setTransformation(Math.sin(angle) * 4, Math.cos(angle) * 4, angle);
      //   model.playAnimation("walking", 1, Math.random());
      // }

      const controller: Controller = new Controller(
        this.canvas,
        'w',
        'a',
        's',
        'd'
      );

      const model: SpriteModel = sprite.createModel();
      model.playAnimation('walking', 1);

      this.playerChar = new Player(controller, model);

      this.start();
    });
  }

  public static get instance(): Game {
    if (!Game._instance) Game._instance = new Game();

    return Game._instance;
  }

  protected update(deltaTime: number): void {
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
