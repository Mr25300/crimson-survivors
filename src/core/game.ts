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
import { Simulation } from '../physics/simulation.js';
import { GameObject } from '../objects/gameobject.js';
import { ChunkManager } from '../physics/chunkmanager.js';

type SpriteName = "player" | "grunt" | "wall" | "floor";

export class SpriteManager {
  private sprites: Record<SpriteName, SpriteSheet>;

  constructor() {
    const player: SpriteSheet = new SpriteSheet(1, 1, 11, 3, 4, "res/assets/Player.png");
    player.createAnimation("idle", [0], 1, true, 0);
    player.createAnimation("walking", [6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 4, 5], 1, true, 1);
    player.createAnimation("shoot", [0, 1, 2, 1], 0.3, false, 2);

    const grunt: SpriteSheet = new SpriteSheet(1, 1, 11, 5, 6, "res/assets/Grunt.png");
    grunt.createAnimation("idle", [0], 1, true, 0);
    grunt.createAnimation("walking", [3, 2, 1, 0, 1, 2, 3, 4, 5, 6, 5, 4], 1, true, 1);
    // grunt.createAnimation("attack")

    const floor: SpriteSheet = new SpriteSheet(1, 1, 1, 1, 1, "res/assets/FloorTile.png");
    const wall: SpriteSheet = new SpriteSheet(1, 1, 1, 1, 1, "res/assets/WallTile.png");

    this.sprites = {
      player: player,
      grunt: grunt,
      floor: floor,
      wall: wall
    }
  }

  public get(name: SpriteName): SpriteSheet {
    return this.sprites[name];
  }

  public create(name: SpriteName): SpriteModel {
    return this.get(name).createModel();
  }
}

export class Game extends Gameloop {
  private static _instance: Game;

  public readonly spriteModels: Map<SpriteSheet, Set<SpriteModel>> = new Map();
  public readonly gameObjects: GameObject[] = [];
  public readonly entities: Entity[] = [];
  public readonly teams: string[] = [];
  public readonly structures: Structure[] = [];

  public readonly spriteManager: SpriteManager = new SpriteManager();
  public readonly simulation: Simulation = new Simulation();
  public readonly chunkManager: ChunkManager = new ChunkManager();
  public readonly canvas: Canvas = new Canvas();
  public readonly camera: Camera = new Camera();

  private constructor() {
    super();

    // create all classes as necessary
    // add init methods for canvas, shader, and all sprites


    this.canvas.init().then(() => {
      this.init();
      this.start();
    });
  }

  public static get instance(): Game {
    if (!Game._instance) Game._instance = new Game();

    return Game._instance;
  }

  private async init(): Promise<void> {
    const model: SpriteModel = this.spriteManager.create("player");
    const controller: PlayerController = new PlayerController(this.canvas, "w", "a", "s", "d");

    const wall: SpriteModel = this.spriteManager.create("wall");

    new Player(model, controller);
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
