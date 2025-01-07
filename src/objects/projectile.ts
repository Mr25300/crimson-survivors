import { Game } from "../core/game.js";
import { CollisionObject, Polygon, SweptCollisionObject } from "../physics/collisions.js";
import { SpriteModel } from "../sprites/spritemodel.js";
import { Vector2 } from "../util/vector2.js";
import { Timer } from "../util/timer.js";
import { GameObject } from "./gameobject.js";
import { Entity } from "./entity.js";
import { Structure } from "./structure.js";
import { Team } from "./team.js";
import { CollisionInfo } from "../physics/chunkmanager.js";
import { EventConnection } from "../util/gameevent.js";

export abstract class Projectile extends GameObject {
  private sweptHitbox: SweptCollisionObject;

  private despawnTimer?: Timer;
  
  private frozen: boolean = false;

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

    if (despawnTime > 0) {
      this.despawnTimer = new Timer(despawnTime);
      this.despawnTimer.onComplete.connectOnce(() => {
        this.destroy();
      });

      this.despawnTimer.start();
    }

    Game.instance.simulation.registerProjectile(this);
  }

  public freeze() {
    this.frozen = true;
  }

  public updatePhysics(deltaTime: number) {
    if (this.frozen) return;
    
    const velocityDisplacement: Vector2 = this.direction.multiply(this.speed * deltaTime);
    const drag: number = this.speed * this.drag;
    const dragDisplacement: Vector2 = this.direction.multiply(-drag * deltaTime ** 2 / 2);
    const dragDeceleration: number = drag * deltaTime;

    this.position = this.position.add(velocityDisplacement).add(dragDisplacement);
    this.rotation = this.direction.angle();
    this.speed = this.speed - drag * dragDeceleration;

    this.sweptHitbox.setTransformation(this.position, this.rotation);
    this.sweptHitbox.sweepVertices(this.speed * deltaTime);

    const entityQuery: Entity[] = Game.instance.chunkManager.attackQuery(this.sweptHitbox, true, this.sender);
    const structureQuery: CollisionInfo[] = Game.instance.chunkManager.collisionQueryFromHitbox(this.sweptHitbox, "Structure", false);

    if (structureQuery.length > 0) this.handleStructureCollisions(structureQuery);
    if (entityQuery.length > 0) this.handleEntityCollision(entityQuery[0]);

    this.updateObject();
  }

  public abstract handleEntityCollision(entity: Entity): void;
  public abstract handleStructureCollisions(collisions: CollisionInfo[]): void;

  public destroy(): void {
    super.destroy();

    if (this.despawnTimer) this.despawnTimer.stop();

    Game.instance.simulation.unregisterProjectile(this);
  }
}