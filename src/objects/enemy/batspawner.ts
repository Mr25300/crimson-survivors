import { Game } from '../../core/game.js';
import { Polygon } from '../../physics/collisions.js';
import { SpriteModel } from '../../sprites/spritemodel.js';
import { Vector2 } from '../../util/vector2.js';
import { Entity } from '../entity.js';
import { Grunt } from './grunt.js';

export class Batspawner extends Entity {
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

  private spawnBats(): void {
    const model: SpriteModel = Game.instance.spriteManager.create("grunt");
    const randomVector = new Vector2(Math.random(), Math.random());

    new Grunt(randomVector);
  }

  public handleBehavior(): void {
    this.spawnBats();
  }

  public attack(): void {
    throw new Error('Method not implemented.');
  }
}
