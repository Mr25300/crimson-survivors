import { CollisionObject } from "../physics/collisions.js";
import { Pathfinder } from "../physics/pathfinder.js";
import { SpriteModel } from "../sprites/spritemodel.js";
import { Vector2 } from "../util/vector2.js";
import { Entity } from "./entity.js";
import { Timer } from "../util/timer.js";

/** Handles enemy bot attacks and pathfinding. */
export abstract class Bot extends Entity {
  private pathfinder: Pathfinder;
  private attackTimer: Timer;

  constructor(sprite: SpriteModel, hitbox: CollisionObject, moveSpeed: number, health: number, attackRange: number, attackCooldown: number, location: Vector2) {
    super(sprite, hitbox, moveSpeed, health, false, location);

    this.pathfinder = new Pathfinder(this, attackRange); // Instantiate pathfinder with attack range
    this.attackTimer = new Timer(attackCooldown); // Create timer for attacking cooldown
  }

  public abstract attack(): void;

  /** Update move and face direction based on pathfinder and attack if within range. */
  public updateBehaviour(): void {
    this.pathfinder.update();

    // Set move and face directions
    this.setMoveDirection(this.pathfinder.moveDirection);
    this.setFaceDirection(this.pathfinder.faceDirection);

    // Handle bot attack
    if (this.pathfinder.shouldAttack() && !this.attackTimer.isActive()) {
      this.attackTimer.start();

      this.attack();
    }
  }
}