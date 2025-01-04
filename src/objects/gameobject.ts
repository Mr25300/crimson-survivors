import { Game } from '../core/game.js';
import { ChunkManager } from '../physics/chunkmanager.js';
import { CollisionObject, Polygon } from '../physics/collisions.js';
import {SpriteModel} from '../sprites/spritemodel.js';
import {Vector2} from '../util/vector2.js';

export abstract class GameObject {
  public readonly chunks: Set<number> = new Set();

  public _destroyed: boolean = false;

  constructor(
    public readonly type: string,
    public readonly sprite: SpriteModel,
    public readonly hitbox: CollisionObject,
    public position: Vector2 = new Vector2(),
    public rotation: number = 0
  ) {
    this.spawnObject();
  }

  public spawnObject(): void {
    this.updateObject();

    this.sprite.showModel();
  }

  public despawnObject(): void {
    Game.instance.chunkManager.clearObjectChunks(this);

    this.sprite.hideModel();
  }

  public updateObject(): void {
    this.hitbox.setTransformation(this.position, this.rotation);
    this.sprite.setTransformation(this.position, this.rotation);

    Game.instance.chunkManager.updateObjectChunks(this);
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

  public get destroyed(): boolean {
    return this._destroyed;
  }
}