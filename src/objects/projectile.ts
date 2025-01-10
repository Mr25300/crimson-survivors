import { Game } from "../core/game.js";
import { CollisionObject, SweptCollisionObject } from "../physics/collisions.js";
import { SpriteModel } from "../sprites/spritemodel.js";
import { Vector2 } from "../util/vector2.js";
import { Timer } from "../util/timer.js";
import { GameObject } from "./gameobject.js";
import { Entity } from "./entity.js";
import { CollisionInfo } from "../physics/chunkmanager.js";
import { EventConnection } from "../util/gameevent.js";

/** Represents and handles projectile logic and physics. */
export abstract class Projectile extends GameObject {
  private sweptHitbox: SweptCollisionObject;
  
  private frozen: boolean = false;

  private despawnConnection?: EventConnection;

  constructor(
    sprite: SpriteModel,
    hitbox: CollisionObject,
    position: Vector2,
    protected direction: Vector2,
    private speed: number,
    private drag: number = 0,
    despawnTime: number,
    protected sender: Entity
  ) {
    super("Projectile", sprite, hitbox, position, direction.angle());

    this.sweptHitbox = hitbox.sweep();

    // Add despawn timer if despawn time is specified
    if (despawnTime > 0) {
      this.despawnConnection = Timer.delay(despawnTime, () => {
        this.destroy();
      });
    }

    Game.instance.simulation.projectiles.add(this); // Add projectile to simulation
  }

  /** Freeze the physics simulation of the projectile. */
  public freeze(): void {
    this.frozen = true;
  }

  /**
   * Handle physics and collisions of a projectile for a frame.
   * @param deltaTime The time passed since the last frame.
   */
  public updatePhysics(deltaTime: number): void {
    if (this.frozen) return; // Skip physics if frozen

    const velocityDisplacement: Vector2 = this.direction.multiply(this.speed * deltaTime); // Calculate the velocity displacement of the projectile
    const dragForce: number = this.speed * this.drag; // Get the drag force based on the speed
    const dragDisplacement: Vector2 = this.direction.multiply(-dragForce * deltaTime ** 2 / 2); // Calculate the drag deceleration displacement

    this.position = this.position.add(velocityDisplacement).add(dragDisplacement); // Add the velocity and drag displacement to the position
    this.rotation = this.direction.angle(); // Set the angle of the projectile to its movement direction
    this.speed = this.speed - dragForce * deltaTime; // Apply drag force to decelerate speed

    // Sweep projectile hitbox between its current and previous frame
    this.sweptHitbox.setTransformation(this.position, this.rotation);
    this.sweptHitbox.sweepVertices(this.speed * deltaTime);

    // Query entities, structures and handle their collisions
    const entityQuery: Entity[] = Game.instance.chunkManager.attackQuery(this.sweptHitbox, true, this.sender);
    const structureQuery: CollisionInfo[] = Game.instance.chunkManager.collisionQueryFromHitbox(this.sweptHitbox, "Structure", false);

    if (structureQuery.length > 0) this.handleStructureCollisions(structureQuery);
    if (entityQuery.length > 0) this.handleEntityCollision(entityQuery[0]);

    this.updateObject();
  }
  
  public abstract handleEntityCollision(entity: Entity): void;
  public abstract handleStructureCollisions(collisions: CollisionInfo[]): void;

  /** Destroys the projectile. */
  public destroy(): void {
    super.destroy();

    if (this.despawnConnection) this.despawnConnection.disconnect(); // Disconnect the despawn connection

    Game.instance.simulation.projectiles.delete(this); // Remove projectile from the simulation
  }
}