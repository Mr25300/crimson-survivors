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
import { Structure } from '../objects/barrier.js';
import { Simulation } from '../physics/simulation.js';
import { GameObject } from '../objects/gameobject.js';

export class Assets {
  private _playerSprite: SpriteSheet;
  private _wallTile: SpriteSheet;

  private assets: Map<string, SpriteSheet> = new Map();

  constructor() {
    const player: SpriteSheet = new SpriteSheet(
      1,
      1,
      11,
      3,
      4,
      'res/assets/player.png'
    );
    player.createAnimation('idle', [0], 1, true, 0);
    player.createAnimation(
      'walking',
      [6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 4, 5],
      1,
      true,
      1
    );
    player.createAnimation('shoot', [0, 1, 2, 1], 0.3, false, 2);
    this.assets.set('player', player);

    this.assets.set('grunt', player);

    const wall: SpriteSheet = new SpriteSheet(
      4,
      4,
      1,
      1,
      1,
      'res/assets/WallTile.png'
    );
    this.assets.set('wall', wall);
  }

  public getSprite(name: string): SpriteSheet {
    return this.assets.get(name)!;
  }
}

export class Game extends Gameloop {
  private static _instance: Game;

  private simulation: Simulation;
  private _canvas: Canvas = new Canvas();
  private _camera: Camera = new Camera();
  private _assets: Assets;

  private _spriteModels: Map<SpriteSheet, SpriteModel[]> = new Map();
  private _gameObjects: GameObject[] = [];
  private _player: Player;
  private _entities: Entity[] = [];
  private _structures: Structure[] = [];

  private constructor() {
    super();

    this.canvas.init().then(() => {
      this.init();
      this.start();
    });
  }

  private init(): void {
    this._assets = new Assets();

    const model: SpriteModel = this._assets.getSprite('player').createModel();
    const controller: PlayerController = new PlayerController(
      this.canvas,
      'w',
      'a',
      's',
      'd'
    );

    const testModel: SpriteModel = this._assets.getSprite('wall').createModel();

    this._player = new Player(model, controller);

    this.simulation = new Simulation(new Vector2(1, 1));
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

  public get assets(): Assets {
    return this._assets;
  }

  public get spriteModels(): Map<SpriteSheet, SpriteModel[]> {
    return this._spriteModels;
  }

  public get gameObjects(): GameObject[] {
    return this._gameObjects;
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
    this.simulation.update(deltaTime);
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
