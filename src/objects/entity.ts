import { Vector2 } from "../util/vector2.js";
import { SpriteModel } from "../sprites/spritemodel.js";
import { GameObject } from "./gameobject.js";
import { Game } from "../core/game.js";
import { CollisionObject } from "../physics/collisions.js";
import { Team } from "./team.js";
import { Structure } from "./structure.js";
import { Color } from "../util/color.js";
import { Tool } from "./tool.js";
import { Item } from "./item.js";

/** Manages the entity game object and its relevant functionalities. */
export abstract class Entity extends GameObject {
  private ACCEL_TIME: number = 0.25;
  private IMPULSE_DRAG: number = 5;

  private movementVelocity: Vector2 = new Vector2();
  private impulseVelocity: Vector2 = new Vector2();

  private _moveDirection: Vector2 = new Vector2();
  private _faceDirection: Vector2 = new Vector2();

  private _health: number;
  private _dead: boolean = false;
  private _kills: number = 0;
  private _lastAttacker?: Entity;

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

    Game.instance.simulation.entities.add(this);
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

  /**
   * 
   * @param amount The amount of damage.
   * @param attacker The attacker doing the damage.
   * @param color The optional color of the higlight effect.
   */
  public damage(amount: number, attacker?: Entity, color: Color = new Color(255, 0, 0)): void {
    this._health -= amount;
    this._lastAttacker = attacker; // Set last attacker

    // Kill entity if dead
    if (this._health <= 0) {
      this._dead = true;
      this.destroy();

      if (attacker) attacker.giveKill(); // Give attacker kill

      return;
    }

    this.sprite.createHighlightEffect(color); // Do damage highlight effect
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

  public get lastAttacker(): Entity | undefined {
    return this._lastAttacker;
  }

  /**
   * Apply impulse to the entity.
   * @param impulse The impulse vector.
   */
  public applyImpulse(impulse: Vector2): void {
    this.impulseVelocity = this.impulseVelocity.add(impulse);
  }

  public get team(): Team | undefined {
    return this._team;
  }

  /** Set the entity"s team and add them to the member list. */
  public setTeam(team: Team): void {
    this.clearFromTeam();

    this._team = team;
    team.addMember(this);
  }

  /** Removes self from current team. */
  public clearFromTeam(): void {
    if (this._team) this._team.removeMember(this);
  }

  public get tool(): Tool | undefined {
    return this._tool;
  }

  /** Handles unequip action for current tool and equips the new tool. */
  public equipTool(tool: Tool): void {
    if (this._tool) this._tool.unequip(this);

    tool.equip(this);

    this._tool = tool;
  }

  public abstract updateBehaviour(): void;

  public updatePhysics(deltaTime: number): void {
    // Calculate goal movement velocity and acceleration required to get there by the acceleration time
    const goalVelocity: Vector2 = this._moveDirection.multiply(this.moveSpeed);
    const difference: Vector2 = goalVelocity.subtract(this.movementVelocity);
    const acceleration: Vector2 = difference.divide(this.ACCEL_TIME);

    const velDisplacement: Vector2 = this.movementVelocity.multiply(deltaTime); // Calculate the velocity displacement
    const accelDisplacement: Vector2 = acceleration.multiply(deltaTime ** 2 / 2); // Calculate the acceleration displacement

    const impulseDisplacement = this.impulseVelocity.multiply(deltaTime); // Calculate the impulse displacement
    const dragForce = this.impulseVelocity.multiply(-this.IMPULSE_DRAG); // Calculate the drag force (acceleration)
    const dragDisplacement = dragForce.multiply(deltaTime ** 2 / 2); // Calculate the drag acceleration displacement

    // Add the displacement amounts to the position
    this.position = this.position.add(velDisplacement).add(accelDisplacement).add(impulseDisplacement).add(dragDisplacement);
    this.movementVelocity = this.movementVelocity.add(acceleration.multiply(deltaTime)); // Add the acceleration to the movement velocity
    this.impulseVelocity = this.impulseVelocity.add(dragForce.multiply(deltaTime)); // Add the drag deceleration to the impulse velocity

    this.rotation = this._faceDirection.angle(); // Set the rotation of the model to the face direction

    if (this._moveDirection.magnitude() > 0) { // Play the walking animation if the player is moving
      if (!this.sprite.isAnimationPlaying("walking")) this.sprite.playAnimation("walking");

    } else { // Stop the walking animation if the player is not moving
      if (this.sprite.isAnimationPlaying("walking")) this.sprite.stopAnimation("walking");
    }

    this.updateObject(); // Update the object chunks for structure collision

    // Query structure collisions and correct all overlaps
    for (const info of Game.instance.chunkManager.collisionQueryFromObject(this, "Structure", false)) {
      this.position = this.position.add(info.normal.multiply(info.overlap));

      if (info.object) (info.object as Structure).entityCollided(this); // Handle structure on entity collisions on structure"s end
    }

    this.updateObject(); // Reupdate the object chunks

    // Check item collisions and pick them up if entity can pickup items
    if (this.canPickupItems) {
      for (const info of Game.instance.chunkManager.collisionQueryFromObject(this, "Item", true)) {
        (info.object as Item).pickup(this);
      }
    }
  }

  /** Destroy the entity. */
  public destroy(): void {
    super.destroy();

    this.clearFromTeam();
    Game.instance.simulation.entities.delete(this);
  }
}
