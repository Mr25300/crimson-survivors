import { Game } from '../../core/game.js';
import {SpriteModel} from '../../sprites/spritemodel.js';
import {Vector2} from '../../util/vector2.js';
import {Entity} from '../entity.js';

export class Kronku extends Entity {
  private detectionRadius: number = 10;
  constructor(
    position: Vector2,
    public sprite: SpriteModel
  ) {
    super(sprite, 1, 1, 10, 0.4);
    this.position = position;
    sprite.setTransformation(position, this.rotation);
    this.setFaceDirection(new Vector2(1, 0));
    this.setMoveDirection(new Vector2(1, 0));
  }
  public pathFind(playerLocation: Vector2): void {
    // if in range
    if (
      playerLocation.subtract(this.position).magnitude() <= this.detectionRadius
    ) {
      // if we are too close, don't do anything

      this.setFaceDirection(playerLocation.subtract(this.position).unit());
      this.setMoveDirection(playerLocation.subtract(this.position).unit());

    } else {
      this.setMoveDirection(new Vector2(0, 0));
    }
  }
  protected attack(): void {
    // 50 50 chance we throw a pebble
    const randomChance = Math.random();
    if (randomChance <= 0.5) {
      // throw pebble
      this.sprite.playAnimation("throwing");
    }

  }
  public brain(): void {
    this.pathFind(Game.instance.player.position);
    this.attack();
  }
}
