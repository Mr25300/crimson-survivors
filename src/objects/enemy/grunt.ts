import {SpriteModel} from "../../sprites/spritemodel.js";
import {Vector2} from "../../util/vector2.js";
import {Entity} from "../entity.js";

export class Grunt extends Entity {
  private detectionRadius: number = 5;
  constructor(
    position: Vector2,
    public sprite: SpriteModel
  ) {
    super(30, 0.5, position, sprite);
    this.setFaceDirection(new Vector2(1, 0));
    this.setMoveDirection(new Vector2(1, 0));
    this.isAttacking = false;
    this.animationState = "idle";
  }
  public pathFind(playerLocation: Vector2): void {
    // if in range
    if (
      playerLocation.subtract(this.position).magnitude() <= this.detectionRadius
    ) {
      this.setFaceDirection(playerLocation.subtract(this.position).unit());
      this.setMoveDirection(playerLocation.subtract(this.position).unit());
      this.isAttacking = true;
    } else {
      this.setMoveDirection(new Vector2(0, 0));
      this.isAttacking = false;
    }
  }
}
