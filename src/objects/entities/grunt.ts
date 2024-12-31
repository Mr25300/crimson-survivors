import { Game } from '../../core/game.js';
import { Polygon } from '../../physics/collisions.js';
import {Vector2} from '../../util/vector2.js';
import { Timer } from '../timer.js';
import {Entity} from '../entity.js';
import { Pathfinder } from '../../physics/pathfinder.js';

export class Grunt extends Entity {
  private attackCooldown: Timer = new Timer(1);
  private pathfinder: Pathfinder;

  constructor(spawnPosition: Vector2) {
    super(
      Game.instance.spriteManager.create("grunt"),
      new Polygon([
        new Vector2(-0.3, -0.4),
        new Vector2(-0.3, 0),
        new Vector2(-0.1, 0.3),
        new Vector2(0.1, 0.3),
        new Vector2(0.3, 0),
        new Vector2(0.3, -0.4)
      ]),
      2,
      spawnPosition,
      50
    );

    this.pathfinder = new Pathfinder(this);
  }

  public handleBehavior(deltaTime: number): void {
    this.pathfinder.setTarget(Game.instance.player.position);

    const direction = this.pathfinder.getDirection();

    this.setMoveDirection(direction);
    if (direction.magnitude() > 0) this.setFaceDirection(direction);
  }

  public attack(): void {

  }
}
