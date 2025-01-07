import { Game } from '../core/game.js';
import { ChunkManager } from '../physics/chunkmanager.js';
import { CollisionObject, Polygon } from '../physics/collisions.js';
import {SpriteModel} from '../sprites/spritemodel.js';
import {Vector2} from '../util/vector2.js';

export abstract class GameObject {
  public readonly chunks: Set<number> = new Set();

  constructor(
    public readonly type: string,
    public readonly sprite: SpriteModel,
    public readonly hitbox: CollisionObject,
    public position: Vector2 = new Vector2(),
    public rotation: number = 0
  ) {
    this.updateObject();
  }

  public updateObject(): void {
    this.hitbox.setTransformation(this.position, this.rotation);
    this.sprite.setTransformation(this.position, this.rotation);

    Game.instance.chunkManager.updateObjectChunks(this);
  }

  public destroy(): void {
    Game.instance.chunkManager.clearObjectChunks(this);
    this.sprite.destroy();
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
}