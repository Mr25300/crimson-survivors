import { Game } from "../../core/game.js";
import { CollisionObject, Polygon, Rectangle } from "../../physics/collisions.js";
import { Vector2 } from "../../util/vector2.js";
import { Entity } from "../entity.js";
import { Structure } from "../structure.js";

export class Wall extends Structure {
  constructor(position: Vector2) {
    super(
      Game.instance.spriteManager.create("wall"),
      new Rectangle(1, 1),
      position,
      0
    );
  }

  public entityCollided(entity: Entity): void {}
}