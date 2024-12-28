import { Game } from "../core/game.js";
import { CollisionObject } from "../physics/collisions.js";
import { SpriteModel } from "../sprites/spritemodel.js";
import { Vector2 } from "../util/vector2.js";
import { Timer } from "./timer.js";
import { GameObject } from "./gameobject.js";
import { Entity } from "./entity.js";
import { Structure } from "./structure.js";

export abstract class Projectile extends GameObject {
  private despawnTimer: Timer;

  constructor(
    sprite: SpriteModel,
    hitbox: CollisionObject,
    position: Vector2,
    private direction: Vector2,
    private speed: number,
    despawnTime: number
  ) {
    super("Projectile", sprite, hitbox, position, direction.angle());

    this.despawnTimer = new Timer(despawnTime);
    this.despawnTimer.start();

    Game.instance.projectiles.add(this);
  }

  public update(deltaTime: number) {
    if (!this.despawnTimer.active) {
      this.destroy();

      return;
    }

    this.position = this.position.add(this.direction.multiply(this.speed * deltaTime));
    this.rotation = this.direction.angle();

    const [min, max] = this.hitbox.getProjectedRange(this.direction.perp());
    const widthSpan = Math.abs(max - min);

    this.updateObject();

    for (const structure of Game.instance.chunkManager.gameObjectQuery(this, "Structure")) {
      const [collides, normal, overlap] = this.hitbox.intersects(structure.hitbox);
      
      if (collides) {
        this.destroy();

        break;
      }
    }
  }

  public abstract hitEntity(entity: Entity): void;
  public abstract hitStructure(structure: Structure, normal: Vector2, overlap: number): void;

  public override destroy() {
    super.destroy();

    Game.instance.projectiles.delete(this);
  }
}