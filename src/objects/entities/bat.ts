import { Game } from "../../core/game.js";
import { Rectangle } from "../../physics/collisions.js";
import { Vector2 } from "../../util/vector2.js";
import { Bot } from "../bot.js";
import { Entity } from "../entity.js";

export class Bat extends Bot {
  constructor(spawnPosition: Vector2) {
    super(
      Game.instance.spriteManager.create("bat"),
      new Rectangle(0.7, 0.15, new Vector2(0, -0.015)),
      4,
      10,
      0.3,
      0.5,
      spawnPosition
    )
  }

  /** Does a basic damage knockback melee attack. */
  public attack(): void {
    const hitbox = new Rectangle(0.4, 0.3, new Vector2(0, 0.15));
    hitbox.setTransformation(this.position, this.faceDirection.angle());

    const attacked: Entity = Game.instance.chunkManager.attackQuery(hitbox, true, this)[0];

    if (attacked) {
      attacked.damage(2, this);
      attacked.knockback(this.faceDirection.multiply(3));
    }
  }
}
