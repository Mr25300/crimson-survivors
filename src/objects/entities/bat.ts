import { Game } from '../../core/game.js';
import { Polygon } from '../../physics/collisions.js';
import {Vector2} from '../../util/vector2.js';
import {Entity} from '../entity.js';

export class Bat extends Entity {
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
      4,
      spawnPosition,
      1
    )
  }
  public pathFind(playerLocation: Vector2): void {
    // we do this at any range
    this.setFaceDirection(playerLocation.subtract(this.position).unit());
    this.setMoveDirection(playerLocation.subtract(this.position).unit());
  }

  public handleBehavior(deltaTime: number): void {
    this.pathFind(Game.instance.player.position);
  }

  public attack(): void {

  }
}
