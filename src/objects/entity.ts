import {Vector2} from "../util/vector2.js";
import {SpriteModel} from "../sprites/spritemodel.js";
import { GameObject } from "./gameobject.js";
import { HitBox } from "../collisions/collisions.js";

export class StateMachine {

}

export abstract class State {
  abstract enter(): void;
  abstract update(deltaTime: number): void;
  abstract leave(): void;
}

export class Entity extends GameObject {
  private accelTime: number = 0.1;
  private velocity: Vector2 = new Vector2();

  private moveDirection: Vector2 = new Vector2();
  private faceDirection: Vector2 = new Vector2();

  private health: number;

  constructor(
    sprite: SpriteModel,
    protected width: number,
    protected height: number,
    protected maxHealth: number,
    protected moveSpeed: number
  ) {
    super(sprite);

    this.health = maxHealth;
  }

  public getHitbox(): HitBox {
    return new HitBox(this.position, this.rotation, this.width, this.height);
  }

  public update(deltaTime: number): void {
    const goalVelocity: Vector2 = this.moveDirection.multiply(this.moveSpeed);
    const difference: Vector2 = goalVelocity.subtract(this.velocity);

    const acceleration: Vector2 = difference.divide(this.accelTime);

    const velDisplacement: Vector2 = this.velocity.multiply(deltaTime);
    const accelDisplacement: Vector2 = acceleration.multiply(deltaTime ** 2 / 2);

    this.position = this.position.add(velDisplacement).add(accelDisplacement);
    this.velocity = this.velocity.add(acceleration.multiply(deltaTime));

    this.rotation = this.faceDirection.angle();

    this.updateSprite();
  }

  public setFaceDirection(direction: Vector2): void {
    this.faceDirection = direction.unit();
  }

  public setMoveDirection(direction: Vector2): void {
    this.moveDirection = direction.unit();
  }
}
