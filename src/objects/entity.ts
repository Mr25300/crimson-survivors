import {Vector2} from '../util/vector2.js';
import {SpriteModel} from '../sprites/spritemodel.js';
import {GameObject} from './gameobject.js';
import {Game} from '../core/game.js';
import { CollisionObject, Polygon } from '../physics/collisions.js';
import { Team } from './team.js';
import { Structure } from './structure.js';
import { Timer } from './timer.js';
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

  private maxHealth: number;

  private damageEffectTimer: Timer = new Timer(0.25);

  constructor(
    sprite: SpriteModel,
    hitShape: CollisionObject,
    private moveSpeed: number,
    private health: number,
    position: Vector2 = new Vector2()
  ) {
    super("Entity", sprite, hitShape, position);

    this.maxHealth = health;

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
    this._faceDirection = direction.unit();
  }

  protected setMoveDirection(direction: Vector2): void {
    this._moveDirection = direction.unit();
  }

  public get team(): Team | undefined {
    return this._team;
  }

  public setTeam(name: string) {
    this._team = Game.instance.teams.get(name)!;
  }

  public damage(amount: number, highlightColor: Color = new Color(1, 0, 0)) {
    this.health -= amount;

    if (this.health <= 0) this.destroy();

    this.sprite.setHighlight(highlightColor);
    this.sprite.setHighlightOpacity(1);

    this.damageEffectTimer.start();
  }

  public knockback(impulse: Vector2) {
    this.knockbackVelocity = this.knockbackVelocity.add(impulse);
  }

  public abstract updateBehaviour(deltaTime: number): void;

  public updatePhysics(deltaTime: number): void {
    const goalVelocity: Vector2 = this._moveDirection.multiply(this.moveSpeed);
    const difference: Vector2 = goalVelocity.subtract(this.velocity);

    const acceleration: Vector2 = difference.divide(this.accelTime);

    const velDisplacement: Vector2 = this.velocity.multiply(deltaTime);
    const accelDisplacement: Vector2 = acceleration.multiply(deltaTime ** 2 / 2);

    this.position = this.position.add(velDisplacement).add(accelDisplacement);
    this.velocity = this.velocity.add(acceleration.multiply(deltaTime));

    const knockbackDisplacement = this.knockbackVelocity.multiply(deltaTime);
    const dragForce = knockbackDisplacement.multiply(-this.knockbackDrag);
    const dragDisplacement = dragForce.multiply(deltaTime ** 2 / 2);

    this.position = this.position.add(knockbackDisplacement).add(dragDisplacement);
    this.knockbackVelocity = this.knockbackVelocity.add(dragForce);

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
    }

    this.updateObject();

    if (this.damageEffectTimer.active) {
      this.sprite.setHighlightOpacity(1 - this.damageEffectTimer.progress);

    } else {
      this.sprite.setHighlightOpacity(0);
    }
  }

  public override destroy(): void {
    super.destroy();

    Game.instance.entities.delete(this);
  }
}
