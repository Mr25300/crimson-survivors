import { Game } from '../core/game.js';
import { Grunt } from '../objects/enemy/grunt.js';
import { Necro } from '../objects/enemy/necro.js';
import { Structure } from '../objects/structure.js';
import { SpriteModel } from '../sprites/spritemodel.js';
import { Vector2 } from '../util/vector2.js';

export class Simulation {
  private structures: Structure[] = [];
  private spawnProbability: number = 1;
  private vampireTypes: string[] = ['grunt','necro'];
  private necroCount: number = 0;
  private spawnTimer: number = 0;
  private mandatorySpawnCount: number = 0;

  private gameBound: Vector2 = new Vector2(5, 5);

  constructor() {
    for (let i: number = 0; i < 20; i++) {
      this.spawnVampire;
    }
  }

  private spawnVampire(): void {
    const randomPositionVector: Vector2 = new Vector2(
      Math.random() * this.gameBound.x - this.gameBound.x / 2,
      Math.random() * this.gameBound.y - this.gameBound.y / 2
    );

    const randomIndex: number = Math.floor(
      Math.random() * this.vampireTypes.length
    );
    const randomVampire: string = this.vampireTypes[randomIndex];
    if (randomVampire === 'grunt') {
      const model: SpriteModel = Game.instance.spriteManager.create("grunt");
      const grunt: Grunt = new Grunt(randomPositionVector, model);
      // // spawn grunt
      // } else if (randomVampire === 'thrower') {
      // // spawn thrower
      } else if (randomVampire === 'necro') {
      const model: SpriteModel = Game.instance.spriteManager.create("grunt");
      const necro: Necro = new Necro(randomPositionVector, model);
      }
  }

  public update(deltaTime: number): void {
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= 1) {
      this.spawnTimer %= 1;

      // Increase the vampire spawn chance
      this.spawnProbability += 1;

      if (this.spawnProbability >= 100) {
        this.mandatorySpawnCount++;
      }

      // Adjust probability to remain within 0-100 range
      this.spawnProbability %= 100;
      
      // Spawn mandatory vampires
      for (let i: number = 0; i < this.mandatorySpawnCount; i++) {
        this.spawnVampire();
      }

      // Handle additional vampire spawn based on remaining probability
      if (Math.random() < this.spawnProbability / 100) {
        this.spawnVampire();
      }
      for (const element of Game.instance.entities){
        element.brain();
      }
    }
    for (const element of Game.instance.entities){
      element.pathFind(Game.instance.player.position);
      element.update(deltaTime);
    }


    // do collision for user

    // do melee attack hitboxes and create projectiles from attacks

    // simulate projectile physics and collisions
    // simulate entity physics
    // check structure collisions and reposition entities if colliding
  }
}
