import { Game } from "../../core/game.js";
import { Rectangle } from "../../physics/collisions.js";
import { Vector2 } from "../../util/vector2.js";
import { Structure } from "../structure.js";

/** Creates unrotated rectangular wall structure. */
export class Wall extends Structure {
  constructor(position: Vector2, size: Vector2 = new Vector2(1, 1)) {
    super(
      Game.instance.spriteManager.create("wall", size, true),
      new Rectangle(size.x, size.y),
      position,
      0
    );
  }

  public entityCollided(): void {}
}