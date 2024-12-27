import {Vector2} from '../util/vector2.js';
import {SpriteModel} from '../sprites/spritemodel.js';
import {GameObject} from './gameobject.js';
import {Game} from '../core/game.js';
import { Polygon } from '../physics/collisions.js';
import { Team } from './team.js';
import { Structure } from './structure.js';

export abstract class Entity extends GameObject {
  private accelTime: number = 0.2;
  private knockbackDrag: number = 0.5;
  private velocity: Vector2 = new Vector2();
  private knockbackVelocity: Vector2 = new Vector2();

  private _moveDirection: Vector2 = new Vector2();
  private _faceDirection: Vector2 = new Vector2();

  private _team: Team | null = null;

  constructor(
    sprite: SpriteModel,
    hitShape: Polygon,
    private moveSpeed: number,
    position: Vector2,
    private health: number
  ) {
    super("Entity", sprite, hitShape, position);

    this.sprite.playAnimation('idle');

    Game.instance.entities.add(this);
  }

  // public getHitbox(): HitBox {
  //   return new HitBox(this.position, this.rotation, this.width, this.height);
  // }

  public update(deltaTime: number): void {
    const goalVelocity: Vector2 = this._moveDirection.multiply(this.moveSpeed);
    const difference: Vector2 = goalVelocity.subtract(this.velocity);

    const acceleration: Vector2 = difference.divide(this.accelTime);

    const velDisplacement: Vector2 = this.velocity.multiply(deltaTime);
    const accelDisplacement: Vector2 = acceleration.multiply(deltaTime ** 2 / 2);

    this.position = this.position.add(velDisplacement).add(accelDisplacement);
    this.velocity = this.velocity.add(acceleration.multiply(deltaTime));

    this.rotation = this._faceDirection.angle(); // WHY IS THIS CRASHING??!?!?!

    if (this._moveDirection.magnitude() > 0) {
      if (!this.sprite.isAnimationPlaying("walking")) {
        this.sprite.playAnimation("walking");
      }

    } else {
      if (this.sprite.isAnimationPlaying("walking")) {
        this.sprite.stopAnimation("walking");
      }
    }

    // use existing chunk list of gameobject
    // getObjectsInPolygon is stupid, make it more general name

    this.updateCoordinates(this.position, this.rotation);

    const structure = Game.instance.struct;
    // for (const structure of Game.instance.chunkManager.getObjectsInPolygon(this.shape, "Structure") as Structure[]) {
      const [collides, normal, overlap] = this.hitbox.intersects(structure.hitbox);

      if (collides) this.position = this.position.add(normal.multiply(overlap));
    // }

    this.updateCoordinates(this.position, this.rotation);
  }

  public get faceDirection(): Vector2 {
    return this._faceDirection;
  }

  public get moveDirection(): Vector2 {
    return this._moveDirection;
  }

  public setFaceDirection(direction: Vector2): void {
    this._faceDirection = direction.unit();
  }

  public setMoveDirection(direction: Vector2): void {
    this._moveDirection = direction.unit();
  }

  public abstract handleBehavior(deltaTime: number): void;
  public abstract attack(): void;

  public get team(): Team | null {
    return this._team;
  }

  public setTeam(name: string) {
    this._team = Game.instance.teams.get(name)!;
  }

  public override destroy(): void {
    super.destroy();

    Game.instance.entities.delete(this);
  }
}
