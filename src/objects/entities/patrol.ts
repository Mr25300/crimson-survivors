import { Game } from '../../core/game.js';
import { Polygon } from '../../physics/collisions.js';
import {Vector2} from '../../util/vector2.js';
import { Timer } from '../timer.js';
import {Entity} from '../entity.js';
import { Bot } from '../bot.js';
import { PatrolWall } from '../structures/patrolWall.js';

export class Patrol extends Bot {
  private attackCooldown: Timer = new Timer(2);
  private lastWall?: PatrolWall;

  constructor(spawnPosition: Vector2) {
    super(
      Game.instance.spriteManager.create("patrol"),
      new Polygon([
        new Vector2(-0.3, -0.4),
        new Vector2(-0.3, 0),
        new Vector2(-0.1, 0.3),
        new Vector2(0.1, 0.3),
        new Vector2(0.3, 0),
        new Vector2(0.3, -0.4)
      ]),
      2,
      50,
      3,
      5,
      spawnPosition
    );

    this.setTeam("Vampire");
  }

  public attack(): void {
    if (this.lastWall) this.lastWall.despawn();

    this.lastWall = new PatrolWall(this.position.add(this.faceDirection.multiply(1)), this.faceDirection.angle());
  }
}
