import { Game } from '../../core/game.js';
import { Polygon } from '../../physics/collisions.js';
import {Vector2} from '../../util/vector2.js';
import { Timer } from '../timer.js';
import {Entity} from '../entity.js';
import { Bot } from '../bot.js';
import { Rock } from '../projectiles/rock.js';

export class Kuranku extends Bot {
  private attackCooldown: Timer = new Timer(1);

  constructor(spawnPosition: Vector2) {
    super(
      Game.instance.spriteManager.create("kuranku"),
      new Polygon([
        new Vector2(-0.3, -0.4),
        new Vector2(-0.3, 0),
        new Vector2(-0.1, 0.3),
        new Vector2(0.1, 0.3),
        new Vector2(0.3, 0),
        new Vector2(0.3, -0.4)
      ]),
      1.5,
      40,
      5,
      2,
      spawnPosition
    );

    this.setTeam("Vampire");
  }

  public attack(): void {
    this.sprite.playAnimation("throw");

    new Rock(this.position, this.faceDirection, this);
  }
}
