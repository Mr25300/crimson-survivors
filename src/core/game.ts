import { Gameloop } from './gameloop.js';
import { Canvas } from '../rendering/canvas.js';
import { SpriteModel } from '../sprites/spritemodel.js';
import { Camera } from '../rendering/camera.js';
import { Vector2 } from '../util/vector2.js';
import { SpriteSheet } from '../sprites/spritesheet.js';
import { Player } from '../objects/player/player.js';
import { PlayerController } from '../objects/player/controller.js';
import { Tool } from '../objects/player/tool.js';
import { Entity } from '../objects/entity.js';
import { Structure } from '../objects/structure.js';

export class Game extends Gameloop {
  private static _instance: Game;

  private _canvas: Canvas = new Canvas();
  private _camera: Camera = new Camera();

  private _spriteModels: Map<SpriteSheet, SpriteModel[]> = new Map();
  private _player: Player;
  private _entities: Entity[] = [];
  private _structures: Structure[] = [];

  private constructor() {
    super();

    this.canvas.init().then(() => {
      const sprite: SpriteSheet = new SpriteSheet(1, 1, 11, 3, 4, 'res/assets/player.png');
      sprite.createAnimation("idle", [0], 1, true, 0);
      sprite.createAnimation("walking", [6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 4, 5], 1, true, 1);
      sprite.createAnimation("shoot", [0, 1, 2, 1], 0.3, false, 2);

      const model: SpriteModel = sprite.createModel();
      const controller: PlayerController = new PlayerController(this.canvas, 'w', 'a', 's', 'd');

      this._player = new Player(model, controller);

      const sprite2: SpriteSheet = new SpriteSheet(4, 4, 1, 1, 1, "res/assets/WallTile.png");
      const model2: SpriteModel = sprite2.createModel();
      model2.setTransformation(new Vector2(), 0);

      this.start();
    });
  }

  public static get instance(): Game {
    if (!Game._instance) Game._instance = new Game();

    return Game._instance;
  }

  public get canvas(): Canvas {
    return this._canvas;
  }

  public get camera(): Camera {
    return this._camera;
  }

  public get spriteModels(): Map<SpriteSheet, SpriteModel[]> {
    return this._spriteModels;
  }

  public get player(): Player {
    return this._player;
  }

  public get entities(): Entity[] {
    return this._entities;
  }

  public get structures(): Structure[] {
    return this._structures;
  }

  protected update(deltaTime: number): void {
    this._player.input();
    this._player.update(deltaTime);

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