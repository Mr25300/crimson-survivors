import { Game } from "../core/game.js";
import { CollisionObject, Polygon, SweptCollisionObject } from "../physics/collisions.js";
import { SpriteModel } from "../sprites/spritemodel.js";
import { Vector2 } from "../util/vector2.js";
import { Timer } from "./timer.js";
import { GameObject } from "./gameobject.js";
import { Entity } from "./entity.js";
import { Structure } from "./structure.js";
import { Team } from "./team.js";
import { CollisionInfo } from "../physics/chunkmanager.js";

export abstract class Projectile extends GameObject {
  private sweptHitbox: SweptCollisionObject;

  private despawnTimer: Timer;
  
  private frozen: boolean = false;

  private whitelist?: Team;

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

    this.position = this.position.add(this.direction.multiply(this.speed * deltaTime)); // add optional drag
    this.rotation = this.direction.angle();

    this.sweptHitbox.setTransformation(this.position, this.rotation);
    this.sweptHitbox.sweepVertices(this.speed * deltaTime);

    const entityQuery: Entity[] = Game.instance.chunkManager.attackQuery(this.sweptHitbox, true, this.whitelist);
    const structureQuery: CollisionInfo[] = Game.instance.chunkManager.collisionQueryFromHitbox(this.sweptHitbox, "Structure", false);

    if (entityQuery.length > 0) this.handleEntityCollision(entityQuery[0]);
    if (structureQuery.length > 0) this.handleStructureCollisions(structureQuery);

    this.updateObject();
  }

  public abstract handleEntityCollision(collision: Entity): void;
  public abstract handleStructureCollisions(collisions: CollisionInfo[]): void;

  public freeze() {
    this.frozen = true;
  }

  public override destroy() {
    super.destroy();

    Game.instance.projectiles.delete(this);
  }
}