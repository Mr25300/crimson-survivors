import { Game } from '../../core/game.js';
import { Polygon } from '../../physics/collisions.js';
import { Vector2 } from '../../util/vector2.js';
import { Bot } from '../bot.js';
import { Rock } from '../projectiles/rock.js';
import { Matrix3 } from '../../util/matrix3.js';

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

  public attack(): void {
    const anim = this.sprite.playAnimation("throw")!;

    anim.markerReached.connect(() => {
      const offset = Matrix3.fromRotation(this.faceDirection.angle()).apply(this.rockOffset);

      new Rock(this.position.add(offset), this.faceDirection, this);

    }, "spawnRock");
  }
}
