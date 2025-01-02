import { Game } from '../../core/game.js';
import { Polygon, Rectangle } from '../../physics/collisions.js';
import {Vector2} from '../../util/vector2.js';
import { Timer } from '../timer.js';
import {Entity} from '../entity.js';
import { Pathfinder } from '../../physics/pathfinder.js';
import { Bot } from '../bot.js';
import { CollisionInfo } from '../../physics/chunkmanager.js';

export class Grunt extends Bot {
  constructor(spawnPosition: Vector2) {
    super(
      Game.instance.spriteManager.create("grunt"),
      new Polygon([
        new Vector2(-0.2, -0.35),
        new Vector2(-0.2, 0),
        new Vector2(0.2, 0),
        new Vector2(0.2, -0.35)
      ]),
      2,
      30,
      0.6,
      1,
      spawnPosition
    );

    this.setTeam("Vampire");
  }

  public attack(): void {
    const attackAnimation = this.sprite.playAnimation("attack")!;

    attackAnimation.markerReached("spawnHitbox", () => {
      const hitbox = new Rectangle(0.4, 0.5);
      hitbox.setTransformation(this.position, this.faceDirection.angle());

      const attacked: Entity = Game.instance.chunkManager.attackQuery(hitbox, true, this.team)[0];
  
      if (attacked) {
        attacked.damage(10);
        attacked.knockback(this.faceDirection.multiply(10));
      }
    })
  }
}
