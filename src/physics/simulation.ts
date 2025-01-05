import { Game } from '../core/game.js';
import { Grunt } from '../objects/entities/grunt.js';
import { Kuranku } from '../objects/entities/kuranku.js';
import { Necromancer } from '../objects/entities/necromancer.js';
import { Patrol } from '../objects/entities/patrol.js';
import { Player } from '../objects/entities/player.js';
import { Entity } from '../objects/entity.js';
import { Item } from '../objects/item.js';
import { Projectile } from '../objects/projectile.js';
import { Structure } from '../objects/structure.js';
import { Wall } from '../objects/structures/wall.js';
import { Team } from '../objects/team.js';
import { ANREItem } from '../objects/tools/ANRE.js';
import { ANRMIItem } from '../objects/tools/ANRMI.js';
import { ANRPI, ANRPIItem } from '../objects/tools/ANRPI.js';
import { Util } from '../util/util.js';
import { Vector2 } from '../util/vector2.js';
import { Bounds, CollisionObject, Line } from './collisions.js';
import { Maze } from './maze.js';

export class Simulation {
  public readonly bounds: Bounds;

  private maze: Maze;
  private mazeSize = new Vector2(8, 8);
  private mazeSpaceSize: number = 3;
  private mazeWallSize: number = 1;

  private spawnLocations: Vector2[];

  private _player: Player;
  public readonly humans: Team = new Team("Human");
  public readonly vampires: Team = new Team("Vampire");

  private entities: Set<Entity> = new Set();
  private projectiles: Set<Projectile> = new Set();
  public readonly barriers: CollisionObject[] = [];

  private wave: number = 0;
  private vampiresPerWave: number = 10;

  private vampireSpawnWeights: Record<string, number> = {
    grunt: 40,
    kuranku: 30,
    patrol: 20,
    necromancer: 10
  };

  private itemSpawnWeights: Record<string, number> = {
    ANRPI: 40,
    ANRE: 40,
    ANRMI: 20
  };

  constructor() {
    this.maze = new Maze(this.mazeSize, this.mazeSpaceSize, this.mazeWallSize);
    this.bounds = new Bounds(new Vector2(-0.5, -0.5), this.maze.tileSize.subtract(new Vector2(0.5, 0.5)));
  }

  public registerEntity(entity: Entity): void {
    this.entities.add(entity);
  }

  public unregisterEntity(entity: Entity): void {
    this.entities.delete(entity);
  }

  public registerProjectile(projectile: Projectile): void {
    this.projectiles.add(projectile);
  }

  public unregisterProjectile(projectile: Projectile): void {
    this.projectiles.delete(projectile);
  }

  public get player(): Player {
    return this._player;
  }

  public get entityCount(): number {
    return this.entities.size;
  }

  public init(): void {
    this.generateMap();

    this._player = new Player(new Vector2());
    this._player.setTeam(this.humans);
    this._player.equipTool(new ANRPI());

    Game.instance.camera.setSubject(this._player);
  }

  public generateMap(): void { // optimize it to minimize structure creation
    this.maze.generate();
    this.spawnLocations = [];

    const floorModel = Game.instance.spriteManager.create("floor", this.bounds.getDimensions(), true);
    floorModel.setTransformation(this.bounds.getCenter(), 0);

    for (let y = 0; y < this.maze.tileGrid.length; y++) {
      for (let x = 0; x < this.maze.tileGrid[y].length; x++) {
        if (!this.maze.tileGrid[y][x]) this.spawnLocations.push(new Vector2(x, y));
      }
    }

    for (let y = 0; y < this.maze.tileGrid.length; y++) {
      for (let x = 0; x < this.maze.tileGrid[y].length; x++) {
        if (this.maze.tileGrid[y][x]) new Wall(new Vector2(x, y));
      }
    }

    // this.barriers.push(new Line(new Vector2(0, 0), new Vector2(1, 0)));
  }

  private getRandomSpawnLocation(): Vector2 {
    return this.spawnLocations[Util.randomInt(0, this.spawnLocations.length - 1)];
  }

  private getRNGOption(optionWeights: Record<string, number>): string {
    const randomPercent: number = Math.random();
    let weightSum: number = 0;
    let rateSum: number = 0;

    for (const name in optionWeights) {
      weightSum += optionWeights[name];
    }

    for (const name in optionWeights) {
      const rate = optionWeights[name] / weightSum;
      rateSum += rate;

      if (randomPercent < rateSum) {
        return name;
      }
    }

    return "";
  }

  private spawnItem(): void {
    const position: Vector2 = this.getRandomSpawnLocation();
    const chosen: string = this.getRNGOption(this.itemSpawnWeights);

    if (chosen === "ANRE") new ANREItem(position);
    else if (chosen === "ANRPI") new ANRPIItem(position);
    else if (chosen === "ANRMI") new ANRMIItem(position);
  }

  private spawnVampire(): void {
    const position: Vector2 = this.getRandomSpawnLocation();
    const chosen: string = this.getRNGOption(this.vampireSpawnWeights);
    let vampire: Entity;

    if (chosen === "grunt") vampire = new Grunt(position);
    else if (chosen === "patrol") vampire = new Patrol(position);
    else if (chosen === "kuranku") vampire = new Kuranku(position);
    else if (chosen === "necromancer") vampire = new Necromancer(position);

    vampire!.setTeam(this.vampires);
  }

  public update(deltaTime: number): void {
    if (this.player.dead) {
      Game.instance.endGame();

      return;
    }

    if (this.vampires.hasNoMembers()) {
      this.wave++;

      for (let i = 0; i < this.wave - 1; i++) {
        this.spawnItem();
      }

      for (let i = 0; i < this.wave * this.vampiresPerWave; i++) {
        this.spawnVampire();
      }
    }

    for (const entity of this.entities) {
      entity.updateBehaviour();
    }

    for (const projectile of this.projectiles) {
      projectile.updatePhysics(deltaTime);
    }

    for (const entity of this.entities) {
      entity.updatePhysics(deltaTime);
    }
  }

  public reset(): void {
    this.humans.removeAll();
    this.vampires.removeAll();

    this.entities.clear();
    this.projectiles.clear();

    this.wave = 0;
  }
}
