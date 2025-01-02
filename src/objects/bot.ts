import { CollisionObject } from "../physics/collisions.js";
import { Pathfinder } from "../physics/pathfinder.js";
import { SpriteModel } from "../sprites/spritemodel.js";
import { Vector2 } from "../util/vector2.js";
import { Entity } from "./entity.js";
import { Timer } from "./timer.js";

export abstract class Bot extends Entity {
  private pathfinder: Pathfinder;
  private attackTimer: Timer;

  constructor(sprite: SpriteModel, hitbox: CollisionObject, moveSpeed: number, health: number, attackRange: number, attackCooldown: number, location: Vector2) {
    super(sprite, hitbox, moveSpeed, health, location);

    this.pathfinder = new Pathfinder(this, attackRange);
    this.attackTimer = new Timer(attackCooldown);  
  }

  public abstract attack(): void;

  public updateBehaviour(deltaTime: number): void {
    this.pathfinder.update();

    this.setMoveDirection(this.pathfinder.moveDirection);
    this.setFaceDirection(this.pathfinder.faceDirection);

    if (this.pathfinder.shouldAttack() && !this.attackTimer.active) {
      this.attackTimer.start();

      this.attack();
    }
  }
}