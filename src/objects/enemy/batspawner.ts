import { Game } from '../../core/game.js';
import {SpriteModel} from '../../sprites/spritemodel.js';
import {Vector2} from '../../util/vector2.js';
import {Entity} from '../entity.js';
import { Grunt } from './grunt.js';

export class Batspawner extends Entity {
  protected attack(): void {
    throw new Error('Method not implemented.');
  }
  constructor(
    position: Vector2,
    public sprite: SpriteModel
  ) {
    super(sprite, 1, 1, 30, 0.5);
    this.position = position;
    sprite.setTransformation(position, this.rotation);
    this.setFaceDirection(new Vector2(0, 1));
    this.setMoveDirection(new Vector2(0, 0));
  }
  public pathFind(playerLocation: Vector2): void {
    return;
  }
  private spawnBats(): void {
      const model: SpriteModel = Game.instance.spriteManager.create("grunt");
      const randomVector = new Vector2(Math.random(), Math.random());
      const necro: Grunt = new Grunt(this.position.add(randomVector), model);
    }
  public brain(): void {
    this.spawnBats();
  }
}
