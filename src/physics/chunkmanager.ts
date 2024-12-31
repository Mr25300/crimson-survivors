import { GameObject } from "../objects/gameobject.js";
import { Util } from "../util/util.js";
import { Vector2 } from "../util/vector2.js";
import { Bounds, CollisionObject, Polygon, Rectangle } from "./collisions.js";

export class ChunkManager {
  private CHUNK_SIZE = 1;

  private chunks: Map<number, Map<string, Set<GameObject>>> = new Map();
  private chunkCollisionObjects: Map<number, CollisionObject> = new Map();

  public getChunkKey(chunk: Vector2): number {
    return Util.cantor(chunk);
  }

  public getChunkFromKey(key: number): Vector2 {
    return Util.inverseCantor(key);
  }

  public chunkContainsObject(chunk: Vector2, object: CollisionObject): boolean {
    const chunkPos = chunk.multiply(this.CHUNK_SIZE);
    const chunkObject = new Rectangle(this.CHUNK_SIZE, this.CHUNK_SIZE, new Vector2(), chunkPos, 0);
    const [collided] = object.intersects(chunkObject);

    return collided;
  }

  public addToChunk(chunkKey: number, object: GameObject): void {
    const objects: Map<string, Set<GameObject>> = this.chunks.get(chunkKey) || new Map();
    if (objects.size === 0) this.chunks.set(chunkKey, objects);

    const typeObjects: Set<GameObject> = objects.get(object.type) || new Set();
    if (typeObjects.size === 0) objects.set(object.type, typeObjects);

    typeObjects.add(object);
  }

  public removeFromChunk(chunkKey: number, object: GameObject): void {
    const objects = this.chunks.get(chunkKey)!;
    const typeObjects: Set<GameObject> = objects.get(object.type)!;

    typeObjects.delete(object);
    
    if (typeObjects.size === 0) objects.delete(object.type);
    if (objects.size === 0) this.chunks.delete(chunkKey);
  }

  public getChunksOfHitbox(hitbox: CollisionObject): Vector2[] {
    const chunks: Vector2[] = [];

    const bounds: Bounds = hitbox.getBounds();
    const minChunk = bounds.min.divide(this.CHUNK_SIZE);
    const maxChunk = bounds.max.divide(this.CHUNK_SIZE);

    for (let x = Util.roundDown(minChunk.x); x <= Util.roundUp(maxChunk.x); x++) {
      for (let y = Util.roundDown(minChunk.y); y <= Util.roundUp(maxChunk.y); y++) {
        const chunk = new Vector2(x, y);

        if (this.chunkContainsObject(chunk, hitbox)) chunks.push(chunk);
      }
    }

    return chunks;
  }

  private queryObjectsWithChunks(chunks: number[], hitbox: CollisionObject, searchType: string): [GameObject, Vector2, number][] {
    const objects: Set<GameObject> = new Set();
    const info: [GameObject, Vector2, number][] = [];

    for (const chunkKey of chunks) {
      const chunkObjects = this.chunks.get(chunkKey);
      if (!chunkObjects) continue;

      const typeObjects = chunkObjects.get(searchType);
      if (!typeObjects) continue;

      for (const object of typeObjects) {
        if (objects.has(object)) continue;

        objects.add(object);

        const [collided, normal, overlap] = hitbox.intersects(object.hitbox);

        if (collided) info.push([object, normal, overlap]);
      }
    }

    return info;
  }

  public queryObjectsWithObject(gameObject: GameObject, searchType: string): [GameObject, Vector2, number][] {
    return this.queryObjectsWithChunks(Array.from(gameObject.chunks), gameObject.hitbox, searchType);
  }

  public queryObjectsWithHitbox(collisionObject: CollisionObject, searchType: string): [GameObject, Vector2, number][] {
    const chunkKeys: number[] = [];

    for (const chunk of this.getChunksOfHitbox(collisionObject)) {
      chunkKeys.push(this.getChunkKey(chunk));
    }

    return this.queryObjectsWithChunks(chunkKeys, collisionObject, searchType);
  }

  public updateObjectChunks(object: GameObject): void {
    // optimize this as much as possible
    for (const chunkKey of object.chunks) {
      const chunk = this.getChunkFromKey(chunkKey);

      if (!this.chunkContainsObject(chunk, object.hitbox)) { // check if out of bounds first
        object.removeChunk(chunkKey);
        this.removeFromChunk(chunkKey, object);
      }
    }

    for (const chunk of this.getChunksOfHitbox(object.hitbox)) {
      const chunkKey = this.getChunkKey(chunk);

      if (object.isInChunk(chunkKey)) continue;

      object.addChunk(chunkKey);
      this.addToChunk(chunkKey, object);
    }
  }

  public clearObjectChunks(object: GameObject): void {
    for (const chunkKey of object.chunks) {
      object.removeChunk(chunkKey);
      this.removeFromChunk(chunkKey, object);
    }
  }
}