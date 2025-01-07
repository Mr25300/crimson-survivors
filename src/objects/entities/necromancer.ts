import { Game } from '../../core/game.js';
import { Circle, Polygon } from '../../physics/collisions.js';
import {Vector2} from '../../util/vector2.js';
import { Bat } from './bat.js';
import { Util } from '../../util/util.js';
import { Bot } from '../bot.js';

export class Necromancer extends Bot {
  constructor(spawnPosition: Vector2) {
    super(
      Game.instance.spriteManager.create("necromancer"),
      new Circle(0.45, new Vector2(-0.01, 0.05)),
      1,
      80,
      10,
      10,
      spawnPosition
    );
  }

  public attack(): void {
    const spawnCount: number = Util.randomInt(2, 3);

    const anim = this.sprite.playAnimation("spawn")!;

    anim.markerReached.connectOnce(() => {
      for (let i = 0; i < spawnCount; i++) {
        const spawnOffset: Vector2 = Vector2.randomUnit().multiply(0.8);
  
        new Bat(this.position.add(spawnOffset)).setTeam(Game.instance.simulation.vampires);
      }

    }, "spawnBats");
  }
}
