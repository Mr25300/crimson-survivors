import { Game } from "../../core/game.js";
import { Polygon, Rectangle } from "../../physics/collisions.js";
import { Vector2 } from "../../util/vector2.js";
import { Entity } from "../entity.js";
import { Bot } from "../bot.js";

export class Grunt extends Bot {
  constructor(spawnPosition: Vector2) {
    super(
      Game.instance.spriteManager.create("grunt"),
      new Polygon([
        new Vector2(-0.1, -0.35),
        new Vector2(-0.2, -0.25),
        new Vector2(-0.2, 0.04),
        new Vector2(0.22, 0.04),
        new Vector2(0.22, -0.25),
        new Vector2(0.12, -0.35)
      ]),
      2.5,
      20,
      0.5,
      1,
      spawnPosition
    );
  }

  /** Does a basic melee attack after an animation windup. */
  public attack(): void {
    const attackAnimation = this.sprite.playAnimation("attack")!;

    attackAnimation.markerReached.connect(() => {
      const hitbox = new Rectangle(0.4, 0.5);
      hitbox.setTransformation(this.position, this.faceDirection.angle());

      const attacked: Entity = Game.instance.chunkManager.attackQuery(hitbox, true, this)[0];

      if (attacked) {
        attacked.damage(10, this);
        attacked.applyImpulse(this.faceDirection.multiply(5));
      }

    }, "spawnHitbox");
  }
}
