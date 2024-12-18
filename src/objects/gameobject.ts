import { Polygon } from '../physics/collisions.js';
import {SpriteModel} from '../sprites/spritemodel.js';
import {Vector2} from '../util/vector2.js';

export abstract class GameObject {
  public abstract name: string;

  constructor(
    public sprite: SpriteModel,
    public hitShape: Polygon,
    public position: Vector2 = new Vector2(),
    public rotation: number = 0
  ) {
    this.updateSprite();
  }

  public updateChunkLocations(): void {

  }

  public updateSprite(): void {
    this.hitShape.setTransformation(this.position, this.rotation);
    this.sprite.setTransformation(this.position, this.rotation);
  }

  public destroy(): void {

  }
}