import { Game } from "../../core/game.js";
import { CollisionInfo } from "../../physics/chunkmanager.js";
import { Polygon, Rectangle } from "../../physics/collisions.js";
import { Vector2 } from "../../util/vector2.js";
import { Entity } from "../entity.js";
import { Projectile } from "../projectile.js";

export class Rock extends Projectile {
  private damage: number = 10;

  constructor(position: Vector2, direction: Vector2, sender: Entity) {
    super(
      Game.instance.spriteManager.create("kurankuRock"),
      new Rectangle(0.07, 0.07),
      position,
      direction,
      8,
      0,
      2,
      sender
    );
  }

  public handleEntityCollision(entity: Entity): void {
    entity.damage(this.damage, this.sender);
    entity.knockback(this.direction.multiply(5));

    this.destroy();
  }

  public handleStructureCollisions(collisions: CollisionInfo[]): void {
    if (collisions.length > 0) this.destroy();
  }
}