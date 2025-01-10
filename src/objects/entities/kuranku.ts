import { Game } from "../../core/game.js";
import { Polygon } from "../../physics/collisions.js";
import { SpriteAnimation } from "../../sprites/spritemodel.js";
import { Vector2 } from "../../util/vector2.js";
import { Bot } from "../bot.js";
import { Rock } from "../projectiles/rock.js";

export class Kuranku extends Bot {
  private rockOffset: Vector2 = new Vector2(0.15, 0.1);

  constructor(spawnPosition: Vector2) {
    super(
      Game.instance.spriteManager.create("kuranku"),
      new Polygon([
        new Vector2(-0.1, -0.35),
        new Vector2(-0.2, -0.25),
        new Vector2(-0.2, 0.04),
        new Vector2(0.22, 0.04),
        new Vector2(0.22, -0.25),
        new Vector2(0.12, -0.35)
      ]),
      2,
      30,
      5,
      2,
      spawnPosition
    );
  }

  /** Spawns rock projectile after windup animation. */
  public attack(): void {
    const anim: SpriteAnimation = this.sprite.playAnimation("throw")!;

    anim.markerReached.connect(() => {
      const offset = this.rockOffset.rotate(this.faceDirection.angle());

      new Rock(this.position.add(offset), this.faceDirection, this);

    }, "spawnRock");
  }
}
