import { Game } from '../../core/game.js';
import { Polygon } from '../../physics/collisions.js';
import {Vector2} from '../../util/vector2.js';
import { Timer } from '../../util/timer.js';
import {Entity} from '../entity.js';
import { Bot } from '../bot.js';
import { Rock } from '../projectiles/rock.js';
import { Matrix3 } from '../../util/matrix3.js';

export class Kuranku extends Bot {
  private rockOffset: Vector2 = new Vector2(0.15, 0.1);

  constructor(spawnPosition: Vector2) {
    super(
      Game.instance.spriteManager.create("kuranku"),
      new Polygon([
        new Vector2(-0.3, -0.4),
        new Vector2(-0.3, 0),
        new Vector2(-0.1, 0.3),
        new Vector2(0.1, 0.3),
        new Vector2(0.3, 0),
        new Vector2(0.3, -0.4)
      ]),
      2,
      40,
      5,
      2,
      spawnPosition
    );

    this.setTeam("Vampire");
  }

  public attack(): void {
    const anim = this.sprite.playAnimation("throw")!;

    anim.markerReached.connect(() => {
      const offset = Matrix3.fromRotation(this.faceDirection.angle()).apply(this.rockOffset);

      new Rock(this.position.add(offset), this.faceDirection, this);

    }, "spawnRock");
  }
}
