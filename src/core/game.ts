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
import { Timer } from '../util/timer.js';
import { Wall } from '../objects/structures/wall.js';
import { OptimalPath } from '../physics/pathfinder.js';
import { Grunt } from '../objects/entities/grunt.js';
import { Kuranku } from '../objects/entities/kuranku.js';
import { Patrol } from '../objects/entities/patrol.js';
import { GameEvent } from '../util/gameevent.js';
import { UIManager } from '../rendering/uimanager.js';
import { ANRE, ANREItem } from '../objects/tools/ANRE.js';
import { ANRPI, ANRPIItem } from '../objects/tools/ANRPI.js';
import { ANRMI, ANRMIItem } from '../objects/tools/ANRMI.js';

export class Game extends Gameloop {
  private static _instance: Game;

  public readonly timers: Set<Timer> = new Set();
  public readonly spriteModels: Map<SpriteSheet, Set<SpriteModel>> = new Map();
  public readonly collisionObjects: Set<CollisionObject> = new Set();

  private _canvas: Canvas;
  private _camera: Camera;
  private _controller: Controller;
  private _spriteManager: SpriteManager;
  private _chunkManager: ChunkManager;
  private _simulation: Simulation;
  private uiManager: UIManager;

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
    this.uiManager = new UIManager();

    await this._canvas.init();

    this.uiManager.displayTitleScreen();
  }

  public startGame(): void {
    this._simulation.init();

    this.start();
  }

  public endGame(): void {
    this.timers.clear();
    this.spriteModels.clear();
    this.collisionObjects.clear();
    this._chunkManager.reset();
    this._simulation.reset();

    this.stop();

    this.uiManager.displayEndScreen();
  }

  protected update(deltaTime: number): void {
    for (const timer of this.timers) {
      timer.update(deltaTime);
    }

    this.spriteModels.forEach((models: Set<SpriteModel>) => {
      for (const model of models) {
        model.updateAnimation(deltaTime);
      }
    });

    this._simulation.update(deltaTime);
    this._camera.update(deltaTime);

    if (1 / deltaTime < 50) console.log(`FPS DROPPED TO ${1 / deltaTime}`);
  }

  protected render(): void {
    this.uiManager.displayGameInfo();
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