import { Game } from "../core/game.js";
import { CollisionObject, Polygon, SweptCollisionObject } from "../physics/collisions.js";
import { SpriteModel } from "../sprites/spritemodel.js";
import { Vector2 } from "../util/vector2.js";
import { Timer } from "./timer.js";
import { GameObject } from "./gameobject.js";
import { Entity } from "./entity.js";
import { Structure } from "./structure.js";
import { Team } from "./team.js";

export abstract class Projectile extends GameObject {
  private sweptHitbox: SweptCollisionObject;

  private despawnTimer: Timer;
  
  private frozen: boolean = false;

  private whitelist: Team | null = null;

  constructor(
    sprite: SpriteModel,
    hitbox: CollisionObject,
    position: Vector2,
    protected direction: Vector2,
    protected speed: number,
    despawnTime: number,
    sender: Entity
  ) {
    super("Projectile", sprite, hitbox, position, direction.angle());

    this.sweptHitbox = hitbox.sweep();

    this.despawnTimer = new Timer(despawnTime);
    this.despawnTimer.start();

    this.whitelist = sender.team;

    Game.instance.projectiles.add(this);
  }

  public update(deltaTime: number) {
    if (!this.despawnTimer.active) {
      this.destroy();

      return;
    }

    if (this.frozen) return;

    this.position = this.position.add(this.direction.multiply(this.speed * deltaTime));
    this.rotation = this.direction.angle();

    this.sweptHitbox.setTransformation(this.position, this.rotation);
    this.sweptHitbox.sweepVertices(this.speed * deltaTime);

    const entityCollisions: Entity[] = [];
    const structureCollisions: [Structure, Vector2, number][] = [];

    for (const entity of Game.instance.chunkManager.queryObjectsWithHitbox(this.sweptHitbox, "Entity") as Entity[]) {
      if (entity.team === this.whitelist) continue;

      const [collides] = this.sweptHitbox.intersects(entity.hitbox);

      if (collides) entityCollisions.push(entity);
    }

    for (const structure of Game.instance.chunkManager.queryObjectsWithHitbox(this.sweptHitbox, "Structure") as Structure[]) {
      const [collides, normal, overlap] = this.sweptHitbox.intersects(structure.hitbox);

      if (collides) structureCollisions.push([structure, normal, overlap]);
    }

    this.handleEntityCollisions(entityCollisions);
    this.handleStructureCollisions(structureCollisions);

    this.updateObject();
  }

  public abstract handleEntityCollisions(entity: Entity[]): void;
  public abstract handleStructureCollisions(collisions: [Structure, Vector2, number][]): void;

  public freeze() {
    this.frozen = true;
  }

  public override destroy() {
    super.destroy();

    Game.instance.projectiles.delete(this);
  }
}