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
import { Tool } from './tool.js';
import { Item } from './item.js';

export abstract class Entity extends GameObject {
  private accelTime: number = 0.25;
  private knockbackDrag: number = 5;
  private velocity: Vector2 = new Vector2();
  private knockbackVelocity: Vector2 = new Vector2();

  private _moveDirection: Vector2 = new Vector2();
  private _faceDirection: Vector2 = new Vector2();

  private _health: number;
  private _dead: boolean = false;
  private _kills: number = 0;

  private _team?: Team;
  private _tool?: Tool;

  constructor(
    sprite: SpriteModel,
    hitShape: CollisionObject,
    private moveSpeed: number,
    public readonly maxHealth: number,
    private canPickupItems: boolean,
    position: Vector2 = new Vector2()
  ) {
    super("Entity", sprite, hitShape, position);

    this._health = maxHealth;
    this.sprite.playAnimation("idle");

    Game.instance.simulation.registerEntity(this);
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

  public damage(amount: number, attacker?: Entity, color: Color = new Color(1, 0, 0)) {
    this._health -= amount;

    if (this._health <= 0) {
      this._dead = true;
      this.destroy();

      if (attacker) attacker.giveKill();

      return;
    }

    if (this._health > this.maxHealth) this._health = this.maxHealth;

    this.sprite.createHighlightEffect(color);
  }

  public giveKill(): void {
    this._kills++;
  } 

  public get health(): number {
    return this._health;
  }

  public get dead(): boolean {
    return this._dead;
  }

  public get kills(): number {
    return this._kills;
  }

  public knockback(impulse: Vector2) {
    this.knockbackVelocity = this.knockbackVelocity.add(impulse);
  }

  public get team(): Team | undefined {
    return this._team;
  }

  public setTeam(team: Team) {
    this.clearFromTeam();

    this._team = team;
    team.addMember(this);
  }

  public clearFromTeam(): void {
    if (this._team) this._team.removeMember(this);
  }

  public get tool(): Tool | undefined {
    return this._tool;
  }

  public equipTool(tool: Tool) {
    if (this._tool) this._tool.unequip(this);

    tool.equip(this);

    this._tool = tool;
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

    this.rotation = this._faceDirection.angle();

    if (this._moveDirection.magnitude() > 0) {
      if (!this.sprite.isAnimationPlaying("walking")) this.sprite.playAnimation("walking");
    } else {
      if (this.sprite.isAnimationPlaying("walking")) this.sprite.stopAnimation("walking");
    }

    this.updateObject();

    for (const info of Game.instance.chunkManager.collisionQueryFromObject(this, "Structure", false)) {
      this.position = this.position.add(info.normal.multiply(info.overlap));

      if (info.object) (info.object as Structure).entityCollided(this);
    }

    this.updateObject();

    if (this.canPickupItems) {
      for (const info of Game.instance.chunkManager.collisionQueryFromObject(this, "Item", true)) {
        (info.object as Item).pickup(this);
      }
    }
  }

  public destroy(): void {
    super.destroy();

    this.clearFromTeam();
    Game.instance.simulation.unregisterEntity(this);
  }
}
