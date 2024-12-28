import { Game } from '../../core/game.js';
import { Polygon } from '../../physics/collisions.js';
import {Vector2} from '../../util/vector2.js';
import { Timer } from '../timer.js';
import {Entity} from '../entity.js';

export class Kronku extends Entity {
  private attackCooldown: Timer;
  constructor(spawnPosition: Vector2) {
    super(
      Game.instance.spriteManager.create("kronku"),
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
      5
    );
    this.attackCooldown = new Timer(1);
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

  public handleBehavior(deltaTime: number): void {
    this.attackCooldown.update(deltaTime);
    if (!this.attackCooldown.active) {
      this.attackCooldown.activate();
      this.attack();
    }
    this.pathFind(Game.instance.player.position);
  }


  public attack(): void {
    // 50 50 chance we throw a pebble
    if (
      Game.instance.player.position.subtract(this.position).magnitude() <= 5 
    ){
      const randomChance = Math.random();
      if (randomChance <= 0.5) {
        // throw pebble
        this.sprite.playAnimation("throwing");
      }
    }
  }
}
