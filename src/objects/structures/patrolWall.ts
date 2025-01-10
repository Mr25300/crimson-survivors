import { Game } from "../../core/game.js";
import { Rectangle } from "../../physics/collisions.js";
import { Timer } from "../../util/timer.js";
import { Vector2 } from "../../util/vector2.js";
import { Entity } from "../entity.js";
import { Structure } from "../structure.js";

/** Handles patrol wall animations, damage and despawn. */
export class PatrolWall extends Structure {
  private despawnTime: number = 6;
  private hitTimer: Timer = new Timer(0.5);

  constructor(position: Vector2, rotation: number, private creator: Entity) {
    super(
      Game.instance.spriteManager.create("patrolWall", new Vector2(3, 1), true),
      new Rectangle(3, 0.35, new Vector2(0, -0.05)),
      position,
      rotation
    );

    this.sprite.playAnimation("solid");
    this.sprite.playAnimation("appear");

    // Add despawn delay timer
    Timer.delay(this.despawnTime, () => {
      this.despawn();
    });
  }

  /** Damages non-whitelisted entites who collide with the structure. */
  public entityCollided(entity: Entity): void {
    if (entity.team === this.creator.team) return;

    if (!this.hitTimer.isActive(entity)) {
      this.hitTimer.start(entity);

      entity.damage(1, this.creator);
    }
  }

  /** Play the fade animation and destroy the patrol wall. */
  public despawn(): void {
    const anim = this.sprite.playAnimation("disappear")!;

    anim.markerReached.connectOnce(() => {
      this.destroy();

    }, "gone");
  }
}