import { Game } from '../../core/game.js';
import { Polygon } from '../../physics/collisions.js';
import {Vector2} from '../../util/vector2.js';
import {Entity} from '../entity.js';

export class Kronku extends Entity {
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
      5
    );
  }

  public handleBehavior(): void {
    this.attack();
  }

  public attack(): void {
    // 50 50 chance we throw a pebble
    const randomChance = Math.random();
    if (randomChance <= 0.5) {
      // throw pebble
      this.sprite.playAnimation("throwing");
    }
  }
}
