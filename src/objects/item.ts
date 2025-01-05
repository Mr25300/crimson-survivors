import { CollisionObject } from "../physics/collisions.js";
import { Vector2 } from "../util/vector2.js";
import { Timer } from "../util/timer.js";
import { Entity } from "./entity.js";
import { GameObject } from "./gameobject.js";
import { SpriteModel } from "../sprites/spritemodel.js";

export abstract class Item extends GameObject {
  private despawnTimer: Timer;

  constructor(
    sprite: SpriteModel,
    hitbox: CollisionObject,
    despawnTime: number,
    position: Vector2,
    rotation: number = 0
  ) {
    super("Item", sprite, hitbox, position, rotation);

    this.despawnTimer = new Timer(despawnTime);
    this.despawnTimer.onComplete.connectOnce(() => {
      this.destroy();
    });

    this.despawnTimer.start();
  }

  public abstract pickupFunctionality(entity: Entity): void;

  public pickup(entity: Entity): void {
    this.destroy();
    this.pickupFunctionality(entity);
  }

  public override destroy(): void {
    super.destroy();
    this.despawnTimer.stop();
  }
}