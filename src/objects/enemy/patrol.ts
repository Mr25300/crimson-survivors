import * as path from 'path';
import { Game } from '../../core/game.js';
import { Polygon } from '../../physics/collisions.js';
import {Vector2} from '../../util/vector2.js';
import { Cooldown } from '../cooldown.js';
import {Entity} from '../entity.js';

export class Patrol extends Entity {
  private attackCooldown: Cooldown;
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
      spawnPosition,
      20
    );
    this.attackCooldown = new Cooldown(2);
  }

  public pathFind(playerLocation: Vector2): void {
    // if in range
    if (
      playerLocation.subtract(this.position).magnitude() <= 5 
    ) {
      this.setFaceDirection(playerLocation.subtract(this.position).unit());
      this.setMoveDirection(playerLocation.subtract(this.position).unit());
    } else {
      this.setMoveDirection(new Vector2(0, 0));
    }
  }

  public handleBehavior(deltaTime: number) {
    this.attackCooldown.update(deltaTime);
    this.pathFind(Game.instance.player.position);
    if (!this.attackCooldown.active) {
      this.attack();
      this.attackCooldown.activate();
    }
  }

  public attack(): void {
    const randomNumber = Math.random();
    // 5% chance we build a wall
    if (randomNumber <= 0.05) {
    this.sprite.playAnimation("deport");
      // build a wall
    }
  }
}
