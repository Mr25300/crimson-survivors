import {Vector2} from '../util/vector2.js';
import {SpriteModel} from '../sprites/spritemodel.js';
import {GameObject} from './gameobject.js';
import {Game} from '../core/game.js';
import { Polygon } from '../physics/collisions.js';

export abstract class Entity extends GameObject {
  private accelTime: number = 0.2;
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
    const biden = new Polygon(new Vector2(0,0), 0, [new Vector2(-0.5, -0.5), new Vector2(-0.5, 0.5), new Vector2(0.5, 0.5), new Vector2(0.5, -0.5)]);
    super(sprite, biden);

    this.sprite.playAnimation('idle');

    this.health = maxHealth;

    Game.instance.entities.add(this);
  }

  // public getHitbox(): HitBox {
  //   return new HitBox(this.position, this.rotation, this.width, this.height);
  // }

  public update(deltaTime: number): void {
    const goalVelocity: Vector2 = this.moveDirection.multiply(this.moveSpeed);
    const difference: Vector2 = goalVelocity.subtract(this.velocity);

    const acceleration: Vector2 = difference.divide(this.accelTime);

    const velDisplacement: Vector2 = this.velocity.multiply(deltaTime);
    const accelDisplacement: Vector2 = acceleration.multiply(
      deltaTime ** 2 / 2
    );

    this.position = this.position.add(velDisplacement).add(accelDisplacement);
    this.velocity = this.velocity.add(acceleration.multiply(deltaTime));

    this.rotation = this.faceDirection.angle();

    if (this.moveDirection.magnitude() > 0) {
      if (!this.sprite.isAnimationPlaying('walking')) {
        this.sprite.playAnimation('walking');
      }
    } else {
      if (this.sprite.isAnimationPlaying('walking')) {
        this.sprite.stopAnimation('walking');
      }
    }

    for (const structure of Game.instance.structures) {

    }

    this.updateSelf();
  }

  public setFaceDirection(direction: Vector2): void {
    this.faceDirection = direction.unit();
  }

  public setMoveDirection(direction: Vector2): void {
    this.moveDirection = direction.unit();
  }

  protected abstract attack(): void;

  public destroy(): void {
    Game.instance.entities.delete(this);
  }
}
