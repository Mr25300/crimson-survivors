import { Entity } from "../entity.js";
import { Vector2 } from "../../util/vector2.js";
import { Game } from "../../core/game.js";
import { Polygon } from "../../physics/collisions.js";

/** Player entity implementation with input handling in behaviour. */
export class Player extends Entity {
  constructor(position: Vector2) {
    super(
      Game.instance.spriteManager.create("player"),
      new Polygon([
        new Vector2(-0.2, -0.3),
        new Vector2(-0.2, 0),
        new Vector2(-0.05, 0.15),
        new Vector2(0.05, 0.15),
        new Vector2(0.2, 0),
        new Vector2(0.2, -0.3)
      ]),
      3,
      100,
      true,
      position
    );
  }

  public updateBehaviour(): void {
    // Get move direction based on game controller input
    let moveDir = new Vector2();
    if (Game.instance.controller.isControlActive("moveU")) moveDir = moveDir.add(new Vector2(0, 1));
    if (Game.instance.controller.isControlActive("moveD")) moveDir = moveDir.add(new Vector2(0, -1));
    if (Game.instance.controller.isControlActive("moveL")) moveDir = moveDir.add(new Vector2(-1, 0));
    if (Game.instance.controller.isControlActive("moveR")) moveDir = moveDir.add(new Vector2(1, 0));

    // Get aim direction as direction from player to mouse
    const aimDir = Game.instance.controller.getAimPosition().subtract(this.position);

    this.setMoveDirection(moveDir);
    this.setFaceDirection(aimDir);

    // Use tool if mouse is held down
    if (this.tool && Game.instance.controller.isMouseDown()) this.tool.use(this);
  }
}
