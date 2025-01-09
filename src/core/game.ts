import { Gameloop } from './gameloop.js';
import { Canvas } from '../rendering/canvas.js';
import { SpriteModel } from '../sprites/spritemodel.js';
import { Camera } from '../rendering/camera.js';
import { SpriteSheet } from '../sprites/spritesheet.js';
import { Controller } from '../input/controller.js';
import { Simulation } from '../physics/simulation.js';
import { ChunkManager } from '../physics/chunkmanager.js';
import { CollisionObject, Polygon } from '../physics/collisions.js';
import { SpriteManager } from '../sprites/spritemanager.js';
import { Timer } from '../util/timer.js';
import { UIManager } from '../rendering/uimanager.js';
import { GameEvent } from '../util/gameevent.js';

export class Game extends Gameloop {
  private static _instance: Game;

  public readonly spriteModels: Map<SpriteSheet, Set<SpriteModel>> = new Map();
  public readonly collisionObjects: Set<CollisionObject> = new Set();

  private _canvas: Canvas;
  private _camera: Camera;
  private _controller: Controller;
  private _spriteManager: SpriteManager;
  private _chunkManager: ChunkManager;
  private _simulation: Simulation;
  private uiManager: UIManager;

  public readonly onUpdate: GameEvent = new GameEvent();

  public static get instance(): Game {
    if (!Game._instance) Game._instance = new Game();

    return Game._instance;
  }

  /** Initialize all game instances and wait for canvas initialization before displaying title screen. */
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

  /** Start the game loop and initialize the simulation. */
  public startGame(): void {
    this._simulation.init();

    this.start();
  }

  /** Reset and clear all game information and display end screen. */
  public endGame(): void {
    this.spriteModels.clear();
    this.collisionObjects.clear();
    this._chunkManager.reset();
    this._simulation.reset();

    this.stop();

    this.uiManager.displayEndScreen();
  }

  /** Update timers, animations and simulate physics. */
  protected update(deltaTime: number): void {
    this.onUpdate.fire(deltaTime);

    this._simulation.update(deltaTime);
  }

  /** Update camera, draw all objects in canvas and display ui updates. */
  protected render(): void {
    this._camera.update();
    this._canvas.render();
    this.uiManager.displayGameInfo();
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
    const game = Game.instance;
    game.init();
  }
}

new Driver();