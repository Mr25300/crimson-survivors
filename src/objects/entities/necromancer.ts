import { Game } from '../../core/game.js';
import { Polygon } from '../../physics/collisions.js';
import {Vector2} from '../../util/vector2.js';
import { Timer } from '../timer.js';
import {Entity} from '../entity.js';
import { Grunt } from './grunt.js';
import { Kronku } from './kronku.js';
import { Patrol } from './patrol.js';
import { Bat } from './bat.js';
import { Util } from '../../util/util.js';

export class Necromancer extends Entity {
  private spawningCooldown: Timer = new Timer(5);
  private spawnRadius: number = 1;

  constructor(spawnPosition: Vector2) {
    super(
      Game.instance.spriteManager.create("necromancer"),
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
  }

  private spawnBats() {
    const spawnCount: number = Util.randomInt(2, 3);

    for (let i = 0; i < spawnCount; i++) {
      const spawnOffset: Vector2 = Vector2.randomUnit().multiply(Math.random() * this.spawnRadius);

      new Bat(this.position.add(spawnOffset));
    }
  }

  public handleBehavior(deltaTime: number): void {
    if (!this.spawningCooldown.active) {
      this.spawningCooldown.start();

      this.sprite.playAnimation("spawning");
      this.spawnBats(); 
    }
  }

  public attack(): void {

  }
}
