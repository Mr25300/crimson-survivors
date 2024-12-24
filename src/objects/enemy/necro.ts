import { Game } from '../../core/game.js';
import { Polygon } from '../../physics/collisions.js';
import {SpriteModel} from '../../sprites/spritemodel.js';
import {Vector2} from '../../util/vector2.js';
import {Entity} from '../entity.js';
import { Batspawner } from './batspawner.js';
import { Grunt } from './grunt.js';
import { Kronku } from './kronku.js';
import { Patrol } from './patrol.js';

export class Necro extends Entity {
  constructor(spawnPosition: Vector2) {
    super(
      Game.instance.spriteManager.create("batspawner"),
      new Polygon([
        new Vector2(-0.3, -0.4),
        new Vector2(-0.3, 0),
        new Vector2(-0.1, 0.3),
        new Vector2(0.1, 0.3),
        new Vector2(0.3, 0),
        new Vector2(0.3, -0.4)
      ]),
      2,
      spawnPosition
    );
  }

  private spawnRandom() {
    const spawningIndex = Math.random() * 100;
    const randomVector = new Vector2(Math.random(), Math.random());
    const randomPosition = this.position.add(randomVector);

    if (spawningIndex <= 0.1) {
      const necro: Necro = new Necro(randomPosition);

    } else if (spawningIndex <= 0.35) {
      const patrol: Patrol = new Patrol(randomPosition);

    } else if (spawningIndex <= 0.6) {
      const kronku : Kronku = new Kronku(randomPosition);

    } else {
      const batspawner : Batspawner = new Batspawner(randomPosition);
    }
  }

  public handleBehavior(): void {
    this.spawnRandom();
    this.sprite.playAnimation("spawning");
  }

  public attack(): void {

  }
}
