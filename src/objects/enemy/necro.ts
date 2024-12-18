import {SpriteModel} from '../../sprites/spritemodel.js';
import {Vector2} from '../../util/vector2.js';
import {Entity} from '../entity.js';

export class Necro extends Entity {
  protected attack(): void {
    throw new Error('Method not implemented.');
  }
  private detectionRadius: number = 5;
  constructor(
    position: Vector2,
    public sprite: SpriteModel
  ) {
    super(sprite, 1, 1, 30, 0.5);
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
      this.setFaceDirection(playerLocation.subtract(this.position).unit());
      this.setMoveDirection(playerLocation.subtract(this.position).unit());
    } else {
      this.setMoveDirection(new Vector2(0, 0));
    }
  }
}
