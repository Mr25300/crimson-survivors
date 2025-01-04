import { Game } from "../../core/game.js";
import { CollisionInfo } from "../../physics/chunkmanager.js";
import { Polygon, Rectangle } from "../../physics/collisions.js";
import { Color } from "../../util/color.js";
import { Vector2 } from "../../util/vector2.js";
import { Entity } from "../entity.js";
import { Projectile } from "../projectile.js";
import { Structure } from "../structure.js";

export class Needle extends Projectile {
  constructor(position: Vector2, direction: Vector2, private sender: Entity, private damage: number) {
    super(
      Game.instance.spriteManager.create("playerNeedle"),
      new Rectangle(0.06, 0.12, new Vector2(0.015, 0.09)),
      position,
      direction,
      10,
      0,
      3,
      sender,
    );
  }

  public handleEntityCollision(entity: Entity): void {
    entity.damage(this.damage, this.sender, new Color(255 / 255, 148 / 255, 148 / 255));
    entity.knockback(this.direction.multiply(5));

    this.destroy();
  }

  public handleStructureCollisions(collisions: CollisionInfo[]): void {
    if (collisions.length > 0) this.freeze();

    for (const info of collisions) {
      this.position = this.position.add(info.normal.multiply(info.overlap));
    }
  }
}