import { SpriteModel } from "../sprites/spritemodel.js";
import { Vector2 } from "../util/vector2.js";

export class GameObject {
  public position: Vector2 = new Vector2();
  public rotation: number = 0;

  constructor(
    public sprite: SpriteModel,
    public width: number,
    public height: number
  ) {
    this.updateSprite();
  }

  public updateSprite(): void {
    this.sprite.setTransformation(this.position, this.rotation);
  }
}