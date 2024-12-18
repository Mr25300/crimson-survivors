import { Polygon } from '../physics/collisions.js';
import {SpriteModel} from '../sprites/spritemodel.js';
import {Vector2} from '../util/vector2.js';

export abstract class GameObject {
  public abstract name: string;

  public readonly chunks: Map<number, number[]>; // ask if readonly can be used

  constructor(
    public sprite: SpriteModel,
    public hitShape: Polygon,
    public position: Vector2 = new Vector2(),
    public rotation: number = 0
  ) {
    this.updateSprite();
  }

  public getChunks(): Vector2[] {
    const chunks: Vector2[] = [];

    this.chunks.forEach((column: number[], x: number) => {
      for (const y of column) {
        chunks.push(new Vector2(x, y));
      }
    })

    return chunks;
  }

  public isInChunk(chunk: Vector2): boolean {
    const column = this.chunks.get(chunk.x);

    if (column && column.indexOf(chunk.y) >= 0) return true;

    return false;
  }

  public addChunk(chunk: Vector2): void {
    let column = this.chunks.get(chunk.x);

    if (!column) {
      column = [];

      this.chunks.set(chunk.x, column);
    }

    column.push(chunk.y);
  }

  public removeChunk(chunk: Vector2): void {
    if (this.isInChunk(chunk)) {
      const column = this.chunks.get(chunk.x)!;
      
      column.splice(column.indexOf(chunk.y));

      if (column.length === 0) this.chunks.delete(chunk.x);
    }
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