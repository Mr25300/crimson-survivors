import {Vector2} from '../util/vector2.js';
import {SpriteModel} from '../sprites/spritemodel.js';
import {GameObject} from './gameobject.js';
import {Game} from '../core/game.js';
import { Polygon } from '../physics/collisions.js';
import { Team } from './team.js';

export abstract class Entity extends GameObject {
  private accelTime: number = 0.2;
  private velocity: Vector2 = new Vector2();

  private moveDirection: Vector2 = new Vector2();
  private faceDirection: Vector2 = new Vector2();

  private _team: Team | null = null;

  constructor(
    sprite: SpriteModel,
    hitShape: Polygon,
    private moveSpeed: number
  ) {
    super(sprite, hitShape);

    this.sprite.playAnimation('idle');

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
    const accelDisplacement: Vector2 = acceleration.multiply(deltaTime ** 2 / 2);

    this.position = this.position.add(velDisplacement).add(accelDisplacement);
    this.velocity = this.velocity.add(acceleration.multiply(deltaTime));

    this.rotation = this.faceDirection.angle(); // WHY IS THIS CRASHING??!?!?!

    if (this.moveDirection.magnitude() > 0) {
      if (!this.sprite.isAnimationPlaying('walking')) {
        this.sprite.playAnimation('walking');
      }
    } else {
      if (this.sprite.isAnimationPlaying('walking')) {
        this.sprite.stopAnimation('walking');
      }
    }

    this.updateCoordinates(this.position, this.rotation);
  }

  public setFaceDirection(direction: Vector2): void {
    this.faceDirection = direction.unit();
  }

  public setMoveDirection(direction: Vector2): void {
    this.moveDirection = direction.unit();
  }

  public abstract attack(): void;

  public get team(): Team | null {
    return this._team;
  }

  public setTeam(name: string) {
    this._team = Game.instance.teams.get(name)!;
  }

  public destroy(): void {
    Game.instance.entities.delete(this);
  }


}
