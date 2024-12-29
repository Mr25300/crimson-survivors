import { Game } from "../../core/game.js";
import { Polygon } from "../../physics/collisions.js";
import { Color } from "../../util/color.js";
import { Vector2 } from "../../util/vector2.js";
import { Entity } from "../entity.js";
import { Projectile } from "../projectile.js";
import { Structure } from "../structure.js";

export class MedicineModule extends Projectile {
  constructor(position: Vector2, direction: Vector2, sender: Entity) {
    super(
      Game.instance.spriteManager.create("bullet"),
      Polygon.fromRect(0.06, 0.12, new Vector2(0.015, 0.09)),
      position,
      direction,
      5,
      3,
      sender
    );
  }

  public handleEntityCollisions(collisions: Entity[]): void {
    for (const entity of collisions) {
      entity.damage(10, new Color(0, 1, 0));
      entity.knockback(this.direction.multiply(5));

      this.destroy();

      break;
    }
  }

  public handleStructureCollisions(collisions: [Structure, Vector2, number][]): void {
    if (collisions.length > 0) this.freeze();

    for (const [structure, normal, overlap] of collisions) {
      this.position = this.position.add(normal.multiply(overlap));

      break;
    }
  }
}