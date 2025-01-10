import { CollisionObject } from "../physics/collisions.js";
import { Vector2 } from "../util/vector2.js";
import { Timer } from "../util/timer.js";
import { Entity } from "./entity.js";
import { GameObject } from "./gameobject.js";
import { SpriteModel } from "../sprites/spritemodel.js";
import { EventConnection } from "../util/gameevent.js";
import { Game } from "../core/game.js";

/** Manages item functionality, pickup and despawn. */
export abstract class Item extends GameObject {
  private despawnConnection: EventConnection;

  constructor(
    sprite: SpriteModel,
    hitbox: CollisionObject,
    despawnTime: number,
    position: Vector2,
    rotation: number = 0
  ) {
    super("Item", sprite, hitbox, position, rotation);

    // Set despawn timer
    this.despawnConnection = Timer.delay(despawnTime, () => {
      this.destroy();
    });

    Game.instance.simulation.items.add(this); // Add item to the simulation
  }

  public abstract pickupFunctionality(entity: Entity): void;

  /**
   * Handles the pickup logic for the item.
   * @param entity The entity picking up the event.
   */
  public pickup(entity: Entity): void {
    this.destroy();
    this.pickupFunctionality(entity);
  }

  public override destroy(): void {
    super.destroy();

    this.despawnConnection.disconnect(); // Stop listening to the item despawn

    Game.instance.simulation.items.delete(this); // Remove item from the simulation
  }
}