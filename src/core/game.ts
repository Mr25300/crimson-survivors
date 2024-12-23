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

type SpriteName = "player" | "grunt" | "kronku" | "necro" | "patrol" | "batspawner" | "wall" | "floor";

export class SpriteManager {
  private sprites: Record<SpriteName, SpriteSheet>;

  constructor() {
    const player: SpriteSheet = new SpriteSheet(1, 1, 11, 3, 4, "res/assets/Player.png", 2);
    player.createAnimation("idle", [0], 1, true, 0);
    player.createAnimation("walking", [6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 4, 5], 1, true, 1);
    player.createAnimation("shoot", [0, 1, 2, 1], 0.3, false, 2);

    const grunt: SpriteSheet = new SpriteSheet(1, 1, 11, 5, 6, "res/assets/Grunt.png", 1);
    grunt.createAnimation("idle", [0], 1, true, 0);
    grunt.createAnimation("walking", [3, 2, 1, 0, 1, 2, 3, 4, 5, 6, 5, 4], 1, true, 1);
    // grunt.createAnimation("attack")

    const floor: SpriteSheet = new SpriteSheet(1, 1, 1, 1, 1, "res/assets/FloorTile.png", 0);
    const wall: SpriteSheet = new SpriteSheet(1, 1, 1, 1, 1, "res/assets/WallTile.png", 0);

    const kronku: SpriteSheet = new SpriteSheet(1, 1, 15, 4, 4, "res/assets/Kronku.png", 1);
    kronku.createAnimation("idle", [2], 1, true, 0);
    kronku.createAnimation("walking", [2,1,0,1,2,3,4,3,2], 1, true, 1);
    kronku.createAnimation("throwing", [6,7,8,9,10,11,12,13,14], 1, false, 2);

    const necro: SpriteSheet = new SpriteSheet(1, 1, 13, 4, 4, "res/assets/Necromancer.png", 1);
    necro.createAnimation("walking", [0], 1, true, 1);
    necro.createAnimation("idle", [0], 1, true, 0);
    necro.createAnimation("spawning", [0,1,2,3,4,5,6], 1, false, 2);

    const patrol: SpriteSheet = new SpriteSheet(1,1, 29,5,6, "res/assets/Patrol.png", 1);
    patrol.createAnimation("idle", [3], 1, true, 0);
    patrol.createAnimation("walking", [3,2,1,0,1,2,3,4,5,6,5,4,3], 1, true, 1);
    patrol.createAnimation("deport", [9,10,11,12,13,14,15,16,17,18,19,20,21], 1, false, 2);

    const batspawner: SpriteSheet = new SpriteSheet(1, 1, 1, 1, 1, "res/assets/Spawner.png", 1);
    batspawner.createAnimation("idle", [0], 1, true, 0);
    batspawner.createAnimation("walking", [0], 1, true, 1);


    this.sprites = {
      player: player,
      grunt: grunt,
      kronku: kronku,
      necro: necro,
      patrol: patrol,
      batspawner: batspawner,
      floor: floor,
      wall: wall
    }
  }

  public init(): void {
    for (const name in this.sprites) {
      this.sprites[name as SpriteName].init();
    }
  }

  public create(name: SpriteName): SpriteModel {
    return this.sprites[name].createModel();
  }
}

export class Game extends Gameloop {
  private static _instance: Game;

  public readonly spriteModels: Map<SpriteSheet, Set<SpriteModel>> = new Map();
  public readonly gameObjects: Set<GameObject> = new Set();
  public readonly entities: Set<Entity> = new Set();
  public readonly teams: Set<string> = new Set();
  public readonly structures: Set<Structure> = new Set();

  public readonly canvas: Canvas;
  public readonly camera: Camera;
  public readonly spriteManager: SpriteManager;
  public readonly simulation: Simulation;
  public readonly chunkManager: ChunkManager;

  public player: Player;

  private constructor() {
    super();

    this.canvas = new Canvas();
    this.camera = new Camera();
    this.spriteManager = new SpriteManager();
    this.simulation = new Simulation();
    this.chunkManager = new ChunkManager();

    // create all classes as necessary
    // add init methods for canvas, shader, and all sprites

    this.init();
  }

  public static get instance(): Game {
    if (!Game._instance) Game._instance = new Game();

    return Game._instance;
  }

  private async init(): Promise<void> {
    await this.canvas.init();

    this.spriteManager.init();

    this.start();

    const model: SpriteModel = this.spriteManager.create("player");
    const controller: PlayerController = new PlayerController(this.canvas, "w", "a", "s", "d");

    const floorWidth = 10; // Number of tiles wide
    const floorHeight = 10; // Number of tiles high

    // Loop through each row and column to create the floor tiles
    for (let x = 0; x < floorWidth; x++) {
      for (let y = 0; y < floorHeight; y++) {
        const tile: SpriteModel = this.spriteManager.create("floor");
        // Set the position for each tile based on its index
        tile.setTransformation(new Vector2(x - floorWidth / 2 + 0.5, y - floorHeight / 2 + 0.5), 0);
      }
    }

    this.player = new Player(model, controller);
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
