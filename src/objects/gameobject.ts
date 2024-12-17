import {SpriteModel} from '../sprites/spritemodel.js';
import {Vector2} from '../util/vector2.js';

export class GameObject {
  protected position: Vector2 = new Vector2();
  protected rotation: number = 0;

  constructor(
    protected sprite: SpriteModel,
    protected width: number,
    protected height: number
  ) {
    this.updateSprite();
  }

  public updateSprite(): void {
    this.sprite.setTransformation(this.position, this.rotation);
  }
}
