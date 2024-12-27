import { GameObject } from "../objects/gameobject.js";
import { Util } from "../util/util.js";
import { Vector2 } from "../util/vector2.js";
import { CollisionObject, Polygon, Rectangle } from "./collisions.js";

export class ChunkManager {
  private CHUNK_SIZE = 1;

  private chunks: Map<number, Map<string, Set<GameObject>>> = new Map();
  private chunkCollisionObjects: Map<number, CollisionObject> = new Map();

  public getChunkKey(chunk: Vector2): number {
    // modified cantor function to include negatives
    const x: number = chunk.x < 0 ? 2 * chunk.x : -2 * chunk.x - 1;
    const y: number = chunk.y < 0 ? 2 * chunk.y : -2 * chunk.y - 1;

    return (x + y) * (x + y + 1) / 2 + y;
  }

  public getChunkFromKey(key: number): Vector2 {
    const w = Math.floor((Math.sqrt(8 * key + 1) - 1) / 2);
    const t = w * (w + 1) / 2;

    const x = key - t;
    const y = w - x;

    const decodedX = x % 2 === 0 ? x / 2 : -(x + 1) / 2;
    const decodedY = y % 2 === 0 ? y / 2 : -(y + 1) / 2;

    return new Vector2(decodedX, decodedY);
  }

  public chunkContainsObject(chunk: Vector2, object: CollisionObject): boolean {
    const chunkPos = chunk.multiply(this.CHUNK_SIZE);
    const chunkObject = Polygon.fromRect(chunkPos, 0, this.CHUNK_SIZE, this.CHUNK_SIZE);
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

  public getChunksOfObject(object: CollisionObject): Vector2[] {
    const chunks: Vector2[] = [];

    const bounds: Rectangle = object.getBounds();
    const minChunk = bounds.min.divide(this.CHUNK_SIZE);
    const maxChunk = bounds.max.divide(this.CHUNK_SIZE);

    for (let x = Util.roundDown(minChunk.x); x <= Util.roundUp(maxChunk.x); x++) {
      for (let y = Util.roundDown(minChunk.y); y <= Util.roundUp(maxChunk.y); y++) {
        const chunk = new Vector2(x, y);

        if (this.chunkContainsObject(chunk, object)) chunks.push(chunk);
      }
    }

    return chunks;
  }

  public gameObjectQuery(gameObject: GameObject, searchType: string) {
    const objects: Set<GameObject> = new Set();

    for (const chunkKey of gameObject.chunks) {
      const chunkObjects = this.chunks.get(chunkKey);
      if (!chunkObjects) continue;

      const typeObjects = chunkObjects.get(searchType);
      if (!typeObjects) continue;

      for (const object of typeObjects) {
        objects.add(object);
      }
    }

    return Array.from(objects);
  }

  public collisionObjectQuery(collisionObject: CollisionObject, searchType: string): GameObject[] {
    const objects: Set<GameObject> = new Set();

    for (const chunk of this.getChunksOfObject(collisionObject)) {
      const chunkKey = this.getChunkKey(chunk);

      const chunkObjects = this.chunks.get(chunkKey);
      if (!chunkObjects) continue;

      const typeObjects = chunkObjects.get(searchType);
      if (!typeObjects) continue;

      for (const object of typeObjects) {
        objects.add(object);
      }
    }

    return Array.from(objects);
  }

  public updateObjectChunks(object: GameObject): void {
    for (const chunkKey of object.chunks) {
      const chunk = this.getChunkFromKey(chunkKey);

      if (!this.chunkContainsObject(chunk, object.hitbox)) {
        object.removeChunk(chunkKey);
        this.removeFromChunk(chunkKey, object);
      }
    }

    for (const chunk of this.getChunksOfObject(object.hitbox)) {
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