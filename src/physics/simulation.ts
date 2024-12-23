import { Game } from '../core/game.js';
import { Batspawner } from '../objects/enemy/batspawner.js';
import { Grunt } from '../objects/enemy/grunt.js';
import { Kronku } from '../objects/enemy/kronku.js';
import { Necro } from '../objects/enemy/necro.js';
import { Patrol } from '../objects/enemy/patrol.js';
import { Structure } from '../objects/structure.js';
import { SpriteModel } from '../sprites/spritemodel.js';
import { Vector2 } from '../util/vector2.js';
import { Rectangle } from './collisions.js';

export class Simulation {
  public readonly bounds: Rectangle = new Rectangle(
    new Vector2(-10, -10),
    new Vector2(10, 10)
  );

  private structures: Structure[] = [];
  private spawnProbability: number = 1;
  private vampireTypes: string[] = ['grunt','necro', 'patrol', 'kronku', 'batspawner'];
  private spawnTimer: number = 0;
  private mandatorySpawnCount: number = 0;

  constructor() {

  }

  private spawnVampire(): void {
    const randomPositionVector: Vector2 = new Vector2(
      this.bounds.min.x + (this.bounds.max.x - this.bounds.min.x) * Math.random(),
      this.bounds.min.y + (this.bounds.max.y - this.bounds.min.y) * Math.random()
    );

    const randomIndex: number = Math.floor(
      Math.random() * this.vampireTypes.length
    );
    const randomVampire: string = this.vampireTypes[randomIndex];
    if (randomVampire === 'grunt') {
      const model: SpriteModel = Game.instance.spriteManager.create("grunt");
      const grunt: Grunt = new Grunt(randomPositionVector, model);
    } else if (randomVampire === 'necro') {
      const model: SpriteModel = Game.instance.spriteManager.create("necro");
      const necro: Necro = new Necro(randomPositionVector, model);
    } else if (randomVampire === 'patrol') {
      const model: SpriteModel = Game.instance.spriteManager.create("patrol");
      const patrol: Patrol = new Patrol(randomPositionVector, model);
    } else if (randomVampire === 'kronku') {
      const model: SpriteModel = Game.instance.spriteManager.create("kronku"); 
      const kronku: Kronku = new Kronku(randomPositionVector, model);
    } else if (randomVampire === 'batspawner') {
      // FIX THIS
      const model: SpriteModel = Game.instance.spriteManager.create("batspawner"); 
      const batspawner : Batspawner = new Batspawner(randomPositionVector, model);
    }
  }

  public update(deltaTime: number): void {
    // this.spawnTimer += deltaTime;
    // if (this.spawnTimer >= 1) {
    //   this.spawnTimer %= 1;

    //   // Increase the vampire spawn chance
    //   this.spawnProbability += 1;

    //   if (this.spawnProbability >= 100) {
    //     this.mandatorySpawnCount++;
    //   }

    //   // Adjust probability to remain within 0-100 range
    //   this.spawnProbability %= 100;

    //   // Spawn mandatory vampires
    //   for (let i: number = 0; i < this.mandatorySpawnCount; i++) {
    //     this.spawnVampire();
    //   }

    //   // Handle additional vampire spawn based on remaining probability
    //   if (Math.random() < this.spawnProbability / 100) {
    //     this.spawnVampire();
    //   }
    //   for (const element of Game.instance.entities){
    //     element.brain();
    //   }
    // }
    // document.title = Game.instance.entities.size.toString();
    // for (const element of Game.instance.entities){
    //   element.pathFind(Game.instance.player.position);
    //   element.update(deltaTime);
    // }


    // do collision for user

    // do melee attack hitboxes and create projectiles from attacks

    // simulate projectile physics and collisions
    // simulate entity physics
    // check structure collisions and reposition entities if colliding
  }
}
