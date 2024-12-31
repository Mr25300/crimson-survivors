import { Gameloop } from './gameloop.js';
import { Canvas } from '../rendering/canvas.js';
import { SpriteModel } from '../sprites/spritemodel.js';
import { Camera } from '../rendering/camera.js';
import { Vector2 } from '../util/vector2.js';
import { SpriteSheet } from '../sprites/spritesheet.js';
import { Player } from '../objects/entities/player.js';
import { Controller } from './controller.js';
import { Entity } from '../objects/entity.js';
import { Structure } from '../objects/structure.js';
import { Simulation } from '../physics/simulation.js';
import { GameObject } from '../objects/gameobject.js';
import { ChunkManager } from '../physics/chunkmanager.js';
import { CollisionObject, Polygon } from '../physics/collisions.js';
import { Team } from '../objects/team.js';
import { SpriteManager } from '../sprites/spritemanager.js';
import { Util } from '../util/util.js';
import { Projectile } from '../objects/projectile.js';
import { Timer } from '../objects/timer.js';
import { Wall } from '../objects/structures/wall.js';
import { OptimalPath } from '../physics/pathfinder.js';
import { Grunt } from '../objects/entities/grunt.js';

export class Game extends Gameloop {
  private static _instance: Game;

  public readonly timers: Set<Timer> = new Set();
  public readonly spriteModels: Map<SpriteSheet, Set<SpriteModel>> = new Map();
  public readonly collisionObjects: Set<CollisionObject> = new Set();
  public readonly gameObjects: Set<GameObject> = new Set();
  public readonly entities: Set<Entity> = new Set();
  public readonly teams: Map<string, Team> = new Map();
  public readonly projectiles: Set<Projectile> = new Set();
  public readonly structures: Set<Structure> = new Set();

  private _canvas: Canvas;
  private _camera: Camera;
  private _controller: Controller;
  private _spriteManager: SpriteManager;
  private _chunkManager: ChunkManager;
  private _simulation: Simulation;
  public player: Player; // REMOVE

  private testPath: OptimalPath;

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

    new Team("Human");
    new Team("Vampire");

    new Wall(new Vector2(1, 0));
    new Wall(new Vector2(0, 1));
    new Wall(new Vector2(1, 1));
    new Wall(new Vector2(1, -1));
    new Wall(new Vector2(0, -1));
    new Wall(new Vector2(-1, 2));
    new Wall(new Vector2(0, 3));

    const player: Player = new Player();
    this.player = player;
    this.player.position = new Vector2(0, 2);
    this._camera.setSubject(this.player);

    const path = new OptimalPath(new Vector2(5, 0), new Vector2(0, 0), 0.5);
    const waypoints = path.computePath();

    if (waypoints) {
      const stuff = [...waypoints, new Vector2(5, 0)];

      for (let i = 0; i < stuff.length - 1; i++) {
        const shape = new Polygon([stuff[i], stuff[i + 1]]);
        shape.show();
      }
    }

    // new Grunt(new Vector2(5, 0));

    this.start();
  }

  protected update(deltaTime: number): void {
    for (const timer of this.timers) {
      timer.update(deltaTime);
    }

    this._simulation.update(deltaTime);
    this._camera.update(deltaTime);
    this._canvas.update(deltaTime);

    if (1 / deltaTime < 50) console.log(`FPS DROPPED TO ${1 / deltaTime}`);

    document.getElementById("fps-display")!.innerText = (1 / deltaTime).toFixed(1);
    document.getElementById("entity-count-display")!.innerText = "0";
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