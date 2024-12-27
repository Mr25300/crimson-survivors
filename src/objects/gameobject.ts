import { Game } from '../core/game.js';
import { ChunkManager } from '../physics/chunkmanager.js';
import { CollisionObject, Polygon } from '../physics/collisions.js';
import {SpriteModel} from '../sprites/spritemodel.js';
import {Vector2} from '../util/vector2.js';

export abstract class GameObject {
  public readonly chunks: Set<number> = new Set();

  public prevBounds: CollisionObject;

  constructor(
    public readonly type: string,
    public readonly sprite: SpriteModel,
    public readonly hitbox: CollisionObject,
    public position: Vector2 = new Vector2(),
    public rotation: number = 0
  ) {
    this.hitbox.show();
    this.updateCoordinates(position, rotation); // fix order of priority here
  }

  public updateCoordinates(position: Vector2, rotation: number): void {
    this.position = position;
    this.rotation = rotation;

    this.hitbox.setTransformation(position, rotation);
    this.sprite.setTransformation(position, rotation);

    Game.instance.chunkManager.updateObjectChunks(this);

    const bounds = this.hitbox.getBounds();

    if (this.prevBounds) this.prevBounds.destroy();
    this.prevBounds = Polygon.fromRect(bounds.min.add(bounds.max).divide(2), 0, bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y);
  }

  public isInChunk(chunkKey: number): boolean {
    return this.chunks.has(chunkKey);
  }

  public addChunk(chunkKey: number): void {
    this.chunks.add(chunkKey);
  }

  public removeChunk(chunkKey: number): void {
    this.chunks.delete(chunkKey);
  }

  public destroy(): void {
    Game.instance.chunkManager.clearObjectChunks(this);
  }
}