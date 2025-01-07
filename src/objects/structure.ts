import { Game } from "../core/game.js";
import { CollisionObject, Polygon } from "../physics/collisions.js";
import { SpriteModel } from "../sprites/spritemodel.js";
import { Vector2 } from "../util/vector2.js";
import { Entity } from "./entity.js";
import { GameObject } from "./gameobject.js";

export abstract class Structure extends GameObject {
  constructor(
    sprite: SpriteModel,
    hitbox: CollisionObject,
    position: Vector2,
    rotation: number
  ) {
    super("Structure", sprite, hitbox, position, rotation);
  }

  public abstract entityCollided(entity: Entity): void;
}