import { Game } from "../../core/game.js";
import { CollisionInfo } from "../../physics/chunkmanager.js";
import { Rectangle } from "../../physics/collisions.js";
import { Color } from "../../util/color.js";
import { Vector2 } from "../../util/vector2.js";
import { Entity } from "../entity.js";
import { Projectile } from "../projectile.js";

/** Needle projectile implementation. */
export class Needle extends Projectile {
  constructor(position: Vector2, direction: Vector2, sender: Entity, private damage: number, private knockback: number) {
    super(
      Game.instance.spriteManager.create("playerNeedle"),
      new Rectangle(0.06, 0.12, new Vector2(0.015, 0.09)),
      position,
      direction,
      10,
      0,
      3,
      sender
    );
  }

  /** Damages and knocks back entities that are hit. */
  public handleEntityCollision(entity: Entity): void {
    entity.damage(this.damage, this.sender, new Color(255, 125, 125));
    entity.applyImpulse(this.direction.multiply(this.knockback));

    this.destroy();
  }

  /** Freezes and sticks to walls that it collides with. */
  public handleStructureCollisions(collisions: CollisionInfo[]): void {
    if (collisions.length > 0) this.freeze();

    for (const info of collisions) {
      this.position = this.position.add(info.normal.multiply(info.overlap)); // Correct overlap
    }
  }
}