import { Game } from "../core/game.js";
import { ChunkManager } from "../physics/chunkmanager.js";
import { CollisionObject, Polygon } from "../physics/collisions.js";
import {SpriteModel} from "../sprites/spritemodel.js";
import {Vector2} from "../util/vector2.js";

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

  /** Update the hitbox and sprite transformations and the object chunks. */
  public updateObject(): void {
    this.hitbox.setTransformation(this.position, this.rotation);
    this.sprite.setTransformation(this.position, this.rotation);

    Game.instance.chunkManager.updateObjectChunks(this);
  }

  /**
   * Adds the chunk to the object.
   * @param chunkKey The chunk key.
   */
  public addChunk(chunkKey: number): void {
    this.chunks.add(chunkKey);
  }

  /**
   * Checks whether the object is inside of a chunk from its key.
   * @param chunkKey The chunk key.
   * @returns True if inside, false otherwise.
   */
  public isInChunk(chunkKey: number): boolean {
    return this.chunks.has(chunkKey);
  }

  /**
   * Removes the chunk from the object.
   * @param chunkKey The chunk key.
   */
  public removeChunk(chunkKey: number): void {
    this.chunks.delete(chunkKey);
  }

  /** Destroy the game object and clear it from its chunks. */
  public destroy(): void {
    Game.instance.chunkManager.clearObjectChunks(this);
    this.sprite.destroy();
  }
}