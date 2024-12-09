import {Vector2} from "../util/vector2.js";
import {SpriteModel} from "../sprites/spritemodel.js";

export class StateMachine {

}

export abstract class State {
  abstract enter(): void;
  abstract update(deltaTime: number): void;
  abstract leave(): void;
}

export class Entity {
  private velocity: Vector2 = new Vector2();

  private moveDirection: Vector2 = new Vector2();
  private faceDirection: Vector2 = new Vector2();
  public animationState: string = "idle";
  private health: number;

  public isAttacking: boolean = false;

  constructor(
    private maxHealth: number,
    private moveSpeed: number,
    protected position: Vector2,
    public sprite: SpriteModel
  ) {
    this.health = maxHealth;
  }

  public get currentPositionVector(): Vector2 {
    return this.position;
  }

  public update(deltaTime: number): void {
    this.position = this.position.add(
      this.moveDirection.multiply(deltaTime).multiply(this.moveSpeed)
    );

    this.sprite.setTransformation(this.position, this.faceDirection.angle());
    if (this.isAttacking && this.animationState !== "attacking") {
      this.sprite.playAnimation("shoot", false, 0.25);
      this.animationState = "attacking";
    } else if (!this.isAttacking && this.animationState === "attacking") {
      // if walking
      if (this.moveDirection !== new Vector2(0, 0)) {
        this.sprite.playAnimation("walking", true, 0.5);
        this.animationState = "walking";
      } else {
        this.sprite.playAnimation("walking", true, 0.5);
        this.animationState = "walking";
      }
      // if idle
    }
  }

  public setFaceDirection(direction: Vector2): void {
    this.faceDirection = direction.unit();
  }

  public setMoveDirection(direction: Vector2): void {
    this.moveDirection = direction.unit();
  }
}
