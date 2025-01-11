import { Game } from "../../core/game.js";
import { CollisionInfo } from "../../physics/chunkmanager.js";
import { Rectangle } from "../../physics/collisions.js";
import { Vector2 } from "../../util/vector2.js";
import { Entity } from "../entity.js";
import { Projectile } from "../projectile.js";

/** Rock projectile implementation. */
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
  
  /** Damages and knocks back collided entities. */
  public handleEntityCollision(entity: Entity): void {
    entity.damage(this.damage, this.sender);
    entity.applyImpulse(this.direction.multiply(5));

    this.destroy();
  }

  /** Despawns projectile upon structure collision. */
  public handleStructureCollisions(collisions: CollisionInfo[]): void {
    if (collisions.length > 0) this.destroy();
  }
}