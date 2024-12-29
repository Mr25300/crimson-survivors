import { Game } from "../../core/game.js";
import { Polygon } from "../../physics/collisions.js";
import { Vector2 } from "../../util/vector2.js";
import { Structure } from "../structure.js";

export class Wall extends Structure {
  constructor(position: Vector2) {
    super(
      Game.instance.spriteManager.create("wall"),
      Polygon.fromRect(1, 1),
      true,
      position,
      0
    );
  }
}