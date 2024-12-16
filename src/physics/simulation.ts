import { Grunt } from '../objects/enemy/grunt.js';
import {Entity} from '../objects/entity.js';
import {Player} from '../objects/player/player.js';
import {Structure} from '../objects/structure.js';
import {Canvas} from '../rendering/canvas.js';
import {Vector2} from '../util/vector2.js';

class Simulation {
  private structures: Structure[] = [];
  private entityList: Entity[] = [];
  private spawnProbability: number = 1;
  private vampireTypes: string[] = ["grunt"];

  constructor(
    private canvas: Canvas,
    private userCharacter: Player,
    private gameBound: Vector2
  ) {
    for (let i: number = 0; i < 20; i++) {
      this.spawnVampire;
    }
  }

  private spawnVampire(): void {
    const randomPositionVector: Vector2 = new Vector2(
      Math.random() * this.gameBound.x - this.gameBound.x / 2,
      Math.random() * this.gameBound.y - this.gameBound.y / 2
    );

    const randomIndex = Math.floor(Math.random() * this.vampireTypes.length);
    const randomVampire = this.vampireTypes[randomIndex];
    if (randomVampire === "grunt") {
      // spawn grunt
    }

  }

  public update(deltaTime: number): void {
    // increase the vampire spawn chance
    this.spawnProbability += 1;
    // spawn the ones that are mandatory
    const mandatorySpawnCount: number = Math.floor(this.spawnProbability / 100);
    this.spawnProbability = (this.spawnProbability % 100) / 100;
    for (let i: number = 0; i < mandatorySpawnCount; i++) {
      this.spawnVampire();
    }
    if (Math.random() < this.spawnProbability) {
      this.spawnVampire();
    }

    // read input
    // do melee attack hitboxes and create projectiles from attacks
    // simulate projectile physics and collisions
    // simulate entity physics
    // check structure collisions and reposition entities if colliding
  }
}
