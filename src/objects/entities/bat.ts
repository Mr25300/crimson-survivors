import { Game } from '../../core/game.js';
import { Polygon, Rectangle } from '../../physics/collisions.js';
import {Vector2} from '../../util/vector2.js';
import { Bot } from '../bot.js';
import {Entity} from '../entity.js';

export class Bat extends Bot {
  constructor(spawnPosition: Vector2) {
    super(
      Game.instance.spriteManager.create("bat"),
      new Polygon([
        new Vector2(-0.3, -0.4),
        new Vector2(-0.3, 0),
        new Vector2(-0.1, 0.3),
        new Vector2(0.1, 0.3),
        new Vector2(0.3, 0),
        new Vector2(0.3, -0.4)
      ]),
      4,
      10,
      0.3,
      0.5,
      spawnPosition
    )
  }

  public attack(): void {
    const hitbox = new Rectangle(0.4, 0.3);
    hitbox.setTransformation(this.position, this.faceDirection.angle());

    const attacked: Entity = Game.instance.chunkManager.attackQuery(hitbox, true, this.team)[0];

    if (attacked) {
      attacked.damage(2, this);
      attacked.knockback(this.faceDirection.multiply(3));
    }
  }
}
