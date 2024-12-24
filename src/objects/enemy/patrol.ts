import { Game } from '../../core/game.js';
import { Polygon } from '../../physics/collisions.js';
import {SpriteModel} from '../../sprites/spritemodel.js';
import {Vector2} from '../../util/vector2.js';
import {Entity} from '../entity.js';

export class Patrol extends Entity {
  constructor(spawnPosition: Vector2) {
    super(
      Game.instance.spriteManager.create("grunt"),
      new Polygon([
        new Vector2(-0.3, -0.4),
        new Vector2(-0.3, 0),
        new Vector2(-0.1, 0.3),
        new Vector2(0.1, 0.3),
        new Vector2(0.3, 0),
        new Vector2(0.3, -0.4)
      ]),
      2,
      spawnPosition
    );
  }

  public handleBehavior() {
    this.attack();
  }

  public attack(): void {
    const randomNumber = Math.random();
    // 5% chance we build a wall
    if (randomNumber <= 0.05) {
    this.sprite.playAnimation("deport");
      // build a wall
    }
  }
}
