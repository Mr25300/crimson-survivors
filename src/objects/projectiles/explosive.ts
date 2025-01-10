import { Game } from "../../core/game.js";
import { CollisionInfo } from "../../physics/chunkmanager.js";
import { Circle } from "../../physics/collisions.js";
import { Color } from "../../util/color.js";
import { EventConnection } from "../../util/gameevent.js";
import { Timer } from "../../util/timer.js";
import { Vector2 } from "../../util/vector2.js";
import { Entity } from "../entity.js";
import { Projectile } from "../projectile.js";

export class Explosive extends Projectile {
  private detonated: boolean = false;

  private detonationDelay: number = 2;
  private detonationConnection: EventConnection;

  private bounceCooldown: Timer = new Timer(0.05);

  constructor(position: Vector2, direction: Vector2, sender: Entity) {
    super(
      Game.instance.spriteManager.create("playerExplosive"),
      new Circle(0.09, new Vector2(0.015, 0.015)),
      position,
      direction,
      8,
      0.6,
      0,
      sender
    );

    this.sprite.playAnimation("beeping");

    // Start detonation timer
    this.detonationConnection = Timer.delay(this.detonationDelay, () => {
      this.detonate();
    });
  }

  /** Detonates the explosive and damages nearby enemies. */
  public detonate(): void {
    if (this.detonated) return;

    this.detonated = true;
    this.detonationConnection.disconnect();
    
    // Play animation and listen to marker events for hitbox and despawn
    const anim = this.sprite.playAnimation("explode")!;

    anim.markerReached.connect(() => {
      this.freeze();

      // Create hitbox and damage entities who collide with it
      const hitbox = new Circle(1.5, undefined, this.position);
      const entities: Entity[] = Game.instance.chunkManager.attackQuery(hitbox, false, this.sender);

      for (const entity of entities) {
        const direction = entity.position.subtract(this.position).unit();

        entity.damage(50, this.sender, new Color(255, 125, 125));
        entity.knockback(direction.multiply(15));
      }

    }, "spawnHitbox");

    anim.markerReached.connectOnce(() => {
      this.destroy();

    }, "despawn");
  }

  /** Detonate the explosive when it collides with entities. */
  public handleEntityCollision(): void {
    this.detonate();
  }

  /** Deflect the explosive off walls it collides with. */
  public handleStructureCollisions(collisions: CollisionInfo[]): void {
    let averageNormal: Vector2 = new Vector2();

    for (const info of collisions) {
      averageNormal = averageNormal.add(info.normal);

      this.position = this.position.add(info.normal.multiply(info.overlap));
    }

    if (!this.bounceCooldown.isActive()) {
      this.bounceCooldown.start();

      averageNormal = averageNormal.unit();
  
      this.direction = this.direction.subtract(averageNormal.multiply(this.direction.dot(averageNormal) * 2));
    }
  }
}