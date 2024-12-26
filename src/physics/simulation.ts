import { Game } from '../core/game.js';
import { Batspawner } from '../objects/enemy/batspawner.js';
import { Grunt } from '../objects/enemy/grunt.js';
import { Kronku } from '../objects/enemy/kronku.js';
import { Necro } from '../objects/enemy/necro.js';
import { Patrol } from '../objects/enemy/patrol.js';
import { Vector2 } from '../util/vector2.js';
import { Rectangle } from './collisions.js';

export class Simulation {
  public readonly bounds: Rectangle = new Rectangle(
    new Vector2(-15, -15),
    new Vector2(15, 15)
  );

  private spawnProbability: number = 0;
  private vampireTypes: string[] = ['grunt','necro', 'patrol', 'kronku', 'batspawner'];
  private spawnTimer: number = 0;

  private spawnVampire(): void {
    const randomPosition: Vector2 = new Vector2(
      this.bounds.min.x + (this.bounds.max.x - this.bounds.min.x) * Math.random(),
      this.bounds.min.y + (this.bounds.max.y - this.bounds.min.y) * Math.random()
    );

    const randomIndex: number = Math.floor(
      Math.random() * this.vampireTypes.length
    );
    const randomVampire: string = this.vampireTypes[randomIndex];

    if (randomVampire === "grunt") new Grunt(randomPosition);
    else if (randomVampire === 'necro') new Necro(randomPosition);
    else if (randomVampire === 'patrol') new Patrol(randomPosition);
    else if (randomVampire === 'kronku') new Kronku(randomPosition);
    else if (randomVampire === 'batspawner') new Batspawner(randomPosition);
  }

  public update(deltaTime: number): void {
    this.spawnTimer += deltaTime;

    while (this.spawnTimer >= 1) {
      this.spawnTimer -= 1;
      this.spawnProbability += 1 / 100;

      let spawnCount = Math.floor(this.spawnProbability);

      if (Math.random() < (this.spawnProbability % 1)) spawnCount++;

      for (let i: number = 0; i < spawnCount; i++) {
        this.spawnVampire();
      }
    }

    for (const element of Game.instance.entities){
      element.handleBehavior(deltaTime);
    }

    for (const element of Game.instance.entities){
      element.update(deltaTime);
    }

    // do collision for user

    // do melee attack hitboxes and create projectiles from attacks

    // simulate projectile physics and collisions
    // simulate entity physics
    // check structure collisions and reposition entities if colliding
  }
}
