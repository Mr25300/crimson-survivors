import {Vector2} from '../util/vector2.js';
import {SpriteModel} from '../sprites/spritemodel.js';
import {GameObject} from './gameobject.js';
import {Game} from '../core/game.js';
import { CollisionObject, Polygon } from '../physics/collisions.js';
import { Team } from './team.js';
import { Structure } from './structure.js';
import { Timer } from '../util/timer.js';
import { Color } from '../util/color.js';
import { CollisionInfo } from '../physics/chunkmanager.js';

export abstract class Entity extends GameObject {
  private accelTime: number = 0.25;
  private knockbackDrag: number = 5;
  private velocity: Vector2 = new Vector2();
  private knockbackVelocity: Vector2 = new Vector2();

  private _moveDirection: Vector2 = new Vector2();
  private _faceDirection: Vector2 = new Vector2();

  private _team?: Team;

  private _health: number;
  private _dead: boolean = false;

  private damageEffectTimer: Timer = new Timer(0.3);

  constructor(
    sprite: SpriteModel,
    hitShape: CollisionObject,
    private moveSpeed: number,
    public readonly maxHealth: number,
    position: Vector2 = new Vector2()
  ) {
    super("Entity", sprite, hitShape, position);

    this._health = maxHealth;

    this.sprite.playAnimation("idle");

    Game.instance.entities.add(this);
  }

  public get faceDirection(): Vector2 {
    return this._faceDirection;
  }

  public get moveDirection(): Vector2 {
    return this._moveDirection;
  }

  protected setFaceDirection(direction: Vector2): void {
    if (direction.magnitude() === 0) this._faceDirection = new Vector2(0, 1);
    else this._faceDirection = direction.unit();
  }

  protected setMoveDirection(direction: Vector2): void {
    this._moveDirection = direction.unit();
  }

  public get team(): Team | undefined {
    return this._team;
  }

  public setTeam(name: string) {
    this._team = Game.instance.teams.get(name);
  }

  public damage(amount: number, attacker?: Entity, color: Color = new Color(1, 0, 0)) {
    this._health -= amount;

    if (this._health <= 0) {
      this._dead = true;
      this.destroy();
    }

    this.sprite.setHighlight(color);
    this.sprite.setHighlightOpacity(1);

    this.damageEffectTimer.start();
  }

  public get health(): number {
    return this._health;
  }

  public get dead(): boolean {
    return this._dead;
  }

  public knockback(impulse: Vector2) {
    this.knockbackVelocity = this.knockbackVelocity.add(impulse);
  }

  public abstract updateBehaviour(): void;

  public updatePhysics(deltaTime: number): void {
    const goalVelocity: Vector2 = this._moveDirection.multiply(this.moveSpeed);
    const difference: Vector2 = goalVelocity.subtract(this.velocity);

    const acceleration: Vector2 = difference.divide(this.accelTime);

    const velDisplacement: Vector2 = this.velocity.multiply(deltaTime);
    const accelDisplacement: Vector2 = acceleration.multiply(deltaTime ** 2 / 2);

    this.position = this.position.add(velDisplacement).add(accelDisplacement);
    this.velocity = this.velocity.add(acceleration.multiply(deltaTime));

    const knockbackDisplacement = this.knockbackVelocity.multiply(deltaTime);
    const dragForce = this.knockbackVelocity.multiply(-this.knockbackDrag);
    const dragDisplacement = dragForce.multiply(deltaTime ** 2 / 2);

    this.position = this.position.add(knockbackDisplacement).add(dragDisplacement);
    this.knockbackVelocity = this.knockbackVelocity.add(dragForce.multiply(deltaTime));

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

    this.updateObject();

    for (const info of Game.instance.chunkManager.collisionQueryFromObject(this, "Structure", false)) {
      this.position = this.position.add(info.normal.multiply(info.overlap));

      const structure: Structure = info.object as Structure;
      structure.entityCollided(this);
    }

    this.updateObject();

    if (this.damageEffectTimer.isActive()) this.sprite.setHighlightOpacity(1 - this.damageEffectTimer.getProgress());
    else this.sprite.setHighlightOpacity(0);
  }

  public destroy(): void {
    super.despawnObject();

    Game.instance.entities.delete(this);
  }
}
