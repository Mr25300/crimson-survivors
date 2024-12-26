import { Gameloop } from './gameloop.js';
import { Canvas } from '../rendering/canvas.js';
import { SpriteModel } from '../sprites/spritemodel.js';
import { Camera } from '../rendering/camera.js';
import { Vector2 } from '../util/vector2.js';
import { SpriteSheet } from '../sprites/spritesheet.js';
import { Player } from '../objects/player/player.js';
import { Controller } from '../objects/player/controller.js';
import { Entity } from '../objects/entity.js';
import { Structure } from '../objects/structure.js';
import { Simulation } from '../physics/simulation.js';
import { GameObject } from '../objects/gameobject.js';
import { ChunkManager } from '../physics/chunkmanager.js';
import { CollisionObject, Polygon } from '../physics/collisions.js';
import { Team } from '../objects/team.js';
import { SpriteManager } from './spritemanager.js';

export class Game extends Gameloop {
  private static _instance: Game;

  public readonly collisionObjects: Set<CollisionObject> = new Set();
  public readonly spriteModels: Map<SpriteSheet, Set<SpriteModel>> = new Map();
  public readonly gameObjects: Set<GameObject> = new Set();
  public readonly entities: Set<Entity> = new Set();
  public readonly teams: Map<string, Team> = new Map();
  public readonly structures: Set<Structure> = new Set();

  private _canvas: Canvas;
  private _camera: Camera;
  private _controller: Controller;
  private _spriteManager: SpriteManager;
  private _chunkManager: ChunkManager;
  private _simulation: Simulation;
  public player: Player; // REMOVE
  public struct: Structure;

  private constructor() {
    super();
  }

  public static get instance(): Game {
    if (!Game._instance) Game._instance = new Game();

    return Game._instance;
  }

  public async init(): Promise<void> {
    this._canvas = new Canvas();
    this._camera = new Camera();
    this._controller = new Controller();
    this._spriteManager = new SpriteManager();
    this._chunkManager = new ChunkManager();
    this._simulation = new Simulation();

    await this._canvas.init();

    const player: Player = new Player();
    this.player = player;
    this._camera.setSubject(player);

    this.struct = new Structure(
      this._spriteManager.create("floor"),
      new Polygon([
        new Vector2(-0.5, -0.5),
        new Vector2(-0.5, 0.5),
        new Vector2(0.5, 0.5),
        new Vector2(0.5, -0.5)
      ]),
      true,
      new Vector2(2, 0),
      0
    );

    this.start();
  }

  protected update(deltaTime: number): void {
    this._simulation.update(deltaTime);
    this._camera.update(deltaTime);
    this._canvas.update(deltaTime);
  }

  protected render(): void {
    this._canvas.render();
  }

  public get canvas(): Canvas {
    return this._canvas;
  }

  public get camera(): Camera {
    return this._camera;
  }

  public get controller(): Controller {
    return this._controller;
  }

  public get spriteManager(): SpriteManager {
    return this._spriteManager;
  }

  public get chunkManager(): ChunkManager {
    return this._chunkManager;
  }

  public get simulation(): Simulation {
    return this._simulation;
  }
}

class Driver {
  constructor() {
    // MUST CREATE GAME FIRST, THEN INITIALIZE OTHERWISE SUB CLASSES WILL TRY TO ACCESS IT BEFORE IT IS SET AND CREATE MORE GAME CLASSES
    const game = Game.instance;
    game.init();
  }
}

new Driver();