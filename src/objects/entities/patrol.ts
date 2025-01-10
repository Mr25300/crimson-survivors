import { Game } from "../../core/game.js";
import { Polygon } from "../../physics/collisions.js";
import { SpriteAnimation } from "../../sprites/spritemodel.js";
import { Vector2 } from "../../util/vector2.js";
import { Bot } from "../bot.js";
import { PatrolWall } from "../structures/patrolWall.js";

export class Patrol extends Bot {
  constructor(spawnPosition: Vector2) {
    super(
      Game.instance.spriteManager.create("patrol"),
      new Polygon([
        new Vector2(-0.1, -0.35),
        new Vector2(-0.2, -0.25),
        new Vector2(-0.2, 0.04),
        new Vector2(0.22, 0.04),
        new Vector2(0.22, -0.25),
        new Vector2(0.12, -0.35)
      ]),
      1.5,
      50,
      3,
      4,
      spawnPosition
    );
  }

  /** Creates patrol wall after windup animation. */
  public attack(): void {
    const anim: SpriteAnimation = this.sprite.playAnimation("create")!;

    anim.markerReached.connect(() => {
      new PatrolWall(this.position.add(this.faceDirection.multiply(1)), this.faceDirection.angle(), this);

    }, "spawnWall");
  }
}
