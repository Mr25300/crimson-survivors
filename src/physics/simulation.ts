import { Game } from "../core/game.js";
import { Grunt } from "../objects/entities/grunt.js";
import { Kuranku } from "../objects/entities/kuranku.js";
import { Necromancer } from "../objects/entities/necromancer.js";
import { Patrol } from "../objects/entities/patrol.js";
import { Player } from "../objects/entities/player.js";
import { Entity } from "../objects/entity.js";
import { Item } from "../objects/item.js";
import { Projectile } from "../objects/projectile.js";
import { Structure } from "../objects/structure.js";
import { Team } from "../objects/team.js";
import { ANREItem } from "../objects/tools/ANRE.js";
import { ANRMIItem } from "../objects/tools/ANRMI.js";
import { ANRPI, ANRPIItem } from "../objects/tools/ANRPI.js";
import { SpriteModel } from "../sprites/spritemodel.js";
import { Vector2 } from "../util/vector2.js";
import { Maze } from "./maze.js";

export class Simulation {
  /** Amount of vampires to spawn every wave. */
  private VAMPS_PER_WAVE: number = 10;
  /** Amount of items to spawn every wave. */
  private ITEMS_PER_WAVE: number = 3;

  private VAMP_SPAWN_WEIGHTS: Record<string, number> = {
    grunt: 40,
    kuranku: 30,
    patrol: 20,
    necromancer: 10
  };

  private ITEM_SPAWN_WEIGHTS: Record<string, number> = {
    ANRPI: 40,
    ANRE: 30,
    ANRMI: 20
  };
  
  public readonly map: Maze;

  public readonly humans: Team = new Team("Human");
  public readonly vampires: Team = new Team("Vampire");

  private _player: Player;
  public readonly entities: Set<Entity> = new Set();
  public readonly projectiles: Set<Projectile> = new Set();
  public readonly structures: Set<Structure> = new Set();
  public readonly items: Set<Item> = new Set();

  private _wave: number = 0;

  constructor() {
    this.map = new Maze(new Vector2(8, 8), 4, 1);

    // Create floor model to occupy map bounds
    const floorModel: SpriteModel = Game.instance.spriteManager.create("floor", this.map.bounds.getDimensions(), true);
    floorModel.setTransformation(this.map.bounds.getCenter(), 0);
  }

  public get player(): Player {
    return this._player;
  }

  public get wave(): number {
    return this._wave;
  }

  /** Initializes map and player. */
  public init(): void {
    this.map.generateMaze();

    this._player = new Player(new Vector2());
    this._player.setTeam(this.humans);
    this._player.equipTool(new ANRPI());

    Game.instance.camera.setSubject(this._player);
  }

  /**
   * Randomly selects an option based on a record of weights.
   * @param optionWeights The record of options and their weights.
   * @returns The selected option name.
   */
  private getRNGOption(optionWeights: Record<string, number>): string {
    const randomPercent: number = Math.random();
    let weightSum: number = 0;
    let percentSum: number = 0; 

    // Loop through weights and sum them up
    for (const name in optionWeights) {
      weightSum += optionWeights[name];
    }

    for (const name in optionWeights) {
      const rate = optionWeights[name] / weightSum; // Divide by the weight sum to ensure total weights add to one
      percentSum += rate;

      // Check if the random value lies within the percent range of the option's rate
      if (randomPercent < percentSum) return name;
    }

    return "";
  }

  /** Spawn a random item in a map vacancy. */
  private spawnItem(): void {
    const position: Vector2 = this.map.getRandomVacancy();
    const chosen: string = this.getRNGOption(this.ITEM_SPAWN_WEIGHTS);

    if (chosen === "ANRE") new ANREItem(position);
    else if (chosen === "ANRPI") new ANRPIItem(position);
    else if (chosen === "ANRMI") new ANRMIItem(position);
  }

  /** Spawn a random vampire in a map vacancy. */
  private spawnVampire(): void {
    const position: Vector2 = this.map.getRandomVacancy();
    const chosen: string = this.getRNGOption(this.VAMP_SPAWN_WEIGHTS);
    let vampire: Entity;

    if (chosen === "grunt") vampire = new Grunt(position);
    else if (chosen === "patrol") vampire = new Patrol(position);
    else if (chosen === "kuranku") vampire = new Kuranku(position);
    else if (chosen === "necromancer") vampire = new Necromancer(position);

    vampire!.setTeam(this.vampires); // Ensure vampires are on vampire team
  }

  /**
   * Handles and updates all entity and projectile physics and wave logic.
   * @param deltaTime The time passed.
   */
  public update(deltaTime: number): void {
    // Spawn vampires and items if wave has been cleared
    if (this.vampires.hasNoMembers()) {
      this._wave++;

      // Ensure no items spawn on first wave
      for (let i: number = 0; i < (this._wave - 1) * this.ITEMS_PER_WAVE; i++) {
        this.spawnItem();
      }

      for (let i: number = 0; i < this._wave * this.VAMPS_PER_WAVE; i++) {
        this.spawnVampire();
      }
    }

    // Update projectile physics
    for (const projectile of this.projectiles) {
      projectile.updatePhysics(deltaTime);
    }

    // Update entity behaviour (input and pathfinding)
    for (const entity of this.entities) {
      entity.updateBehaviour();
    }

    // Update entity physics
    for (const entity of this.entities) {
      entity.updatePhysics(deltaTime);
    }
  }

  /** Destroy and entities, projectile and structures and reset to first wave. */
  public reset(): void {
    for (const entity of this.entities) {
      entity.destroy();
    }

    for (const projectile of this.projectiles) {
      projectile.destroy();
    }

    for (const structure of this.structures) {
      structure.destroy();
    }

    for (const item of this.items) {
      item.destroy();
    }

    this._wave = 0;
  }
}