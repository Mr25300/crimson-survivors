import { Game } from '../core/game.js';
import { Grunt } from '../objects/entities/grunt.js';
import { Kronku } from '../objects/entities/kronku.js';
import { Necromancer } from '../objects/entities/necromancer.js';
import { Patrol } from '../objects/entities/patrol.js';
import { Vector2 } from '../util/vector2.js';
import { Bounds } from './collisions.js';

export class Simulation {
  public readonly bounds: Bounds = new Bounds(
    new Vector2(-15, -15),
    new Vector2(15, 15)
  );

  private spawnProbability: number = 0;

  private spawnWeights: Record<string, number> = {
    grunt: 10,
    kronku: 7,
    patrol: 5,
    necromancer: 3
  };

  private spawnTimer: number = 0;

  public spawnVampire(): void {
    const randomPosition: Vector2 = new Vector2(
      this.bounds.min.x + (this.bounds.max.x - this.bounds.min.x) * Math.random(),
      this.bounds.min.y + (this.bounds.max.y - this.bounds.min.y) * Math.random()
    );

    const randomPercent: number = Math.random();
    let weightSum: number = 0;
    let rateSum: number = 0;
    let chosen: string = "";

    for (const name in this.spawnWeights) {
      weightSum += this.spawnWeights[name];
    }

    for (const name in this.spawnWeights) {
      const rate = this.spawnWeights[name] / weightSum;
      rateSum += rate;

      if (randomPercent < rateSum) {
        chosen = name;

        break;
      }
    }

    if (chosen === "grunt") new Grunt(randomPosition);
    else if (chosen === "patrol") new Patrol(randomPosition);
    else if (chosen === "kronku") new Kronku(randomPosition);
    else if (chosen === "necromancer") new Necromancer(randomPosition);
  }

  public update(deltaTime: number): void {
    this.spawnTimer += deltaTime;

    while (this.spawnTimer >= 1) {
      this.spawnTimer -= 1;
      this.spawnProbability += 1 / 100;

      let spawnCount = Math.floor(this.spawnProbability);

      if (Math.random() < (this.spawnProbability % 1)) spawnCount++;

      for (let i: number = 0; i < spawnCount; i++) {
        // this.spawnVampire();
      }
    }

    for (const projectile of Game.instance.projectiles) {
      projectile.update(deltaTime);
    }

    for (const entity of Game.instance.entities) {
      entity.updateBehaviour(deltaTime);
    }

    for (const entity of Game.instance.entities) {
      entity.updatePhysics(deltaTime);
    }

    // do collision for user

    // do melee attack hitboxes and create projectiles from attacks

    // simulate projectile physics and collisions
    // simulate entity physics
    // check structure collisions and reposition entities if colliding
  }
}
