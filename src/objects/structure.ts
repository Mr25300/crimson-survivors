import { Game } from "../core/game.js";
import { CollisionObject } from "../physics/collisions.js";
import { SpriteModel } from "../sprites/spritemodel.js";
import { Vector2 } from "../util/vector2.js";
import { Entity } from "./entity.js";
import { GameObject } from "./gameobject.js";

/** Handles structure game object. */
export abstract class Structure extends GameObject {
  constructor(sprite: SpriteModel, hitbox: CollisionObject, position: Vector2, rotation: number) {
    super("Structure", sprite, hitbox, position, rotation);

    Game.instance.simulation.structures.add(this); // Add structure to simulation
  }

  public abstract entityCollided(entity: Entity): void;

  public override destroy(): void {
    super.destroy();

    Game.instance.simulation.structures.delete(this); // Remove structure from simulation
  }
}