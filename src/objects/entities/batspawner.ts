import { Game } from '../../core/game.js';
import { Polygon } from '../../physics/collisions.js';
import { Vector2 } from '../../util/vector2.js';
import { Timer } from '../timer.js';
import { Entity } from '../entity.js';
import { Bat } from './bat.js';

export class Batspawner extends Entity {
  private attackCooldown: Timer = new Timer(1);
  constructor(spawnPosition: Vector2) {
    super(
      Game.instance.spriteManager.create("batspawner"),
      new Polygon([
        new Vector2(-0.3, -0.4),
        new Vector2(-0.3, 0),
        new Vector2(-0.1, 0.3),
        new Vector2(0.1, 0.3),
        new Vector2(0.3, 0),
        new Vector2(0.3, -0.4)
      ]),
      2,
      spawnPosition,
      1
    );
  }

  private spawnBats(): void {
    const randomVector = new Vector2(Math.random(), Math.random());
    new Bat(this.position.add(randomVector));
  }

  public handleBehavior(deltaTime: number): void {
   this.attackCooldown.update(deltaTime);
    if (!this.attackCooldown.active) {
      this.attackCooldown.activate();
      this.spawnBats();
    }
  }

  public attack(): void {
    throw new Error('Method not implemented.');
  }
}
