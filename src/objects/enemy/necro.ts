import { Game } from '../../core/game.js';
import { Polygon } from '../../physics/collisions.js';
import {Vector2} from '../../util/vector2.js';
import { Cooldown } from '../cooldown.js';
import {Entity} from '../entity.js';
import { Batspawner } from './batspawner.js';
import { Grunt } from './grunt.js';
import { Kronku } from './kronku.js';
import { Patrol } from './patrol.js';

export class Necro extends Entity {
  private spawningCooldown: Cooldown;
  constructor(spawnPosition: Vector2) {
    super(
      Game.instance.spriteManager.create("necro"),
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
      60
    );
    this.spawningCooldown = new Cooldown(3);
  }

  private spawnRandom() {
    const spawningIndex = Math.random();
    const randomVector = new Vector2(Math.random(), Math.random());
    const randomPosition = this.position.add(randomVector);

    if (spawningIndex <= 0.1) {
      const necro: Necro = new Necro(randomPosition);
    } else if (spawningIndex <= 0.35) {
      const patrol: Patrol = new Patrol(randomPosition);
    } else if (spawningIndex <= 0.6) {
      const kronku : Kronku = new Kronku(randomPosition);
    } else {
      // MAKE THIS BATS LATER
      const bat : Grunt = new Grunt(randomPosition);
    }
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
    this.pathFind(Game.instance.player.position);
    this.spawningCooldown.update(deltaTime);
    if (!this.spawningCooldown.active) {
      this.spawningCooldown.activate()
      this.spawnRandom();
      this.sprite.playAnimation("spawning");
    }
  }

  public attack(): void {

  }
}
