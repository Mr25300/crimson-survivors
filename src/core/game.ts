import {Gameloop} from './gameloop.js';
import {Canvas} from '../rendering/canvas.js';
import {SpriteModel} from '../sprites/spritemodel.js';
import {Camera} from '../rendering/camera.js';
import {Vector2} from '../util/vector2.js';
import {SpriteSheet} from '../sprites/spritesheet.js';
import {Player} from '../objects/player.js';
import {PlayerController} from '../objects/enemies/controllers/player-controller.js';
import {Grunt} from '../objects/enemies/grunt.js';

class Game extends Gameloop {
  private static _instance: Game;

  private canvas: Canvas;

  private playerChar: Player;
  private enemeyChar: Grunt;
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
      const enemySprite: SpriteSheet = this.canvas.createSprite(
        1,
        1,
        11,
        3,
        4,
        'res/assets/player.png'
      );

      sprite.createAnimation('walking', [6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 4, 5]);
      sprite.createAnimation('shoot', [0, 1, 2]);

      enemySprite.createAnimation(
        'walking',
        [6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 4, 5]
      );
      enemySprite.createAnimation('shoot', [0, 1, 2]);

      // for (let i = 0; i < 5; i++) {
      //   const angle = (Math.PI * 2 * i) / 100;
      //   const model = sprite.createModel();

      //   model.setTransformation(Math.sin(angle) * 4, Math.cos(angle) * 4, angle);
      //   model.playAnimation("walking", 1, Math.random());
      // }

      const controller: PlayerController = new PlayerController(
        this.canvas,
        'w',
        'a',
        's',
        'd'
      );

      const model: SpriteModel = sprite.createModel();
      const badModel: SpriteModel = enemySprite.createModel();
      model.playAnimation('walking', 1);
      badModel.playAnimation('walking', 1);

      this.playerChar = new Player(controller, model);
      this.enemeyChar = new Grunt(new Vector2(0, 0), badModel);

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
    this.enemeyChar.pathFind(this.playerChar.currentPositionVector);
    this.enemeyChar.update(deltaTime);

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
