import { Game } from "../../core/game.js";
import { Rectangle } from "../../physics/collisions.js";
import { Timer } from "../../util/timer.js";
import { Vector2 } from "../../util/vector2.js";
import { Entity } from "../entity.js";
import { Structure } from "../structure.js";
import { Team } from "../team.js";

export class PatrolWall extends Structure {
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
  }

  public entityCollided(entity: Entity): void {
    if (entity.team === this.creator.team) return;

    if (!this.hitTimer.isActive(entity)) {
      this.hitTimer.start(entity);

      entity.damage(1, this.creator);
    }
  }

  public despawn(): void {
    const anim = this.sprite.playAnimation("disappear")!;

    anim.markerReached.connectOnce(() => {
      this.destroy();

    }, "gone");
  }
}