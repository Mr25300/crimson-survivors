import {SpriteModel} from '../../sprites/spritemodel.js';
import {Vector2} from '../../util/vector2.js';
import {Entity} from '../entity.js';

export class Grunt extends Entity {
  constructor(
    position: Vector2,
    public sprite: SpriteModel
  ) {
    super(30, 0.5, position, sprite);
    this.setFaceDirection(new Vector2(1, 0));
    this.setMoveDirection(new Vector2(1, 0));
    this.isAttacking = true;
    this.animationState = 'idle';
  }
  public pathFind(playerLocation: Vector2): void {
    this.setFaceDirection(playerLocation.subtract(this.position).unit());
    this.setMoveDirection(playerLocation.subtract(this.position).unit());
  }
}
