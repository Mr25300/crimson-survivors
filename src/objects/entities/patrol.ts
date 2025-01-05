import { Game } from '../../core/game.js';
import { Polygon } from '../../physics/collisions.js';
import { Vector2 } from '../../util/vector2.js';
import { Timer } from '../../util/timer.js';
import { Bot } from '../bot.js';
import { PatrolWall } from '../structures/patrolWall.js';

export class Patrol extends Bot {
  private wallDespawnTimer: Timer = new Timer(6);

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

  public attack(): void {
    const anim = this.sprite.playAnimation("create")!;

    anim.markerReached.connect(() => {
      const newWall = new PatrolWall(this.position.add(this.faceDirection.multiply(1)), this.faceDirection.angle(), this);

      this.wallDespawnTimer.onComplete.connect(() => {
        newWall.despawn();

      }, newWall);

      this.wallDespawnTimer.start(newWall);

    }, "spawnWall");
  }
}
