import { Entity } from "../objects/entity.js";
import { GameObject } from "../objects/gameobject.js";
import { Team } from "../objects/team.js";
import { Util } from "../util/util.js";
import { Vector2 } from "../util/vector2.js";
import { Bounds, CollisionObject, Polygon, Rectangle } from "./collisions.js";

export interface CollisionInfo {
  object: GameObject;
  normal: Vector2;
  overlap: number;
}

export class ChunkManager {
  private CHUNK_SIZE = 1;

  private chunks: Map<number, Map<string, Set<GameObject>>> = new Map();

  public getChunkKey(chunk: Vector2): number {
    return Util.cantor(chunk);
  }

  public getChunkFromKey(key: number): Vector2 {
    return Util.inverseCantor(key);
  }

  // public chunkContainsObject(chunk: Vector2, object: CollisionObject): boolean {
  //   const chunkPos = chunk.multiply(this.CHUNK_SIZE);
  //   const chunkObject = new Rectangle(this.CHUNK_SIZE, this.CHUNK_SIZE, new Vector2(), chunkPos, 0);
  //   const [collided] = object.intersects(chunkObject);

  //   return collided;
  // }

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

  public getChunksOfBounds(bounds: Bounds): number[] {
    const chunks: number[] = [];

    const minChunk = bounds.min.divide(this.CHUNK_SIZE);
    const maxChunk = bounds.max.divide(this.CHUNK_SIZE);

    for (let x = Util.roundDown(minChunk.x); x <= Util.roundUp(maxChunk.x); x++) {
      for (let y = Util.roundDown(minChunk.y); y <= Util.roundUp(maxChunk.y); y++) {
        chunks.push(this.getChunkKey(new Vector2(x, y)));
      }
    }

    return chunks;
  }

  public collisionQuery(searchChunks: number[], hitbox: CollisionObject, searchType: string, single: boolean, whitelist?: Team): CollisionInfo[] {
    const info: CollisionInfo[] = [];
    const objects: Set<GameObject> = new Set();

    for (const chunkKey of searchChunks) {
      const chunkObjects = this.chunks.get(chunkKey);
      if (!chunkObjects) continue;

      const typeObjects = chunkObjects.get(searchType);
      if (!typeObjects) continue;

      for (const object of typeObjects) {
        if (whitelist && object instanceof Entity && object.team === whitelist) continue;
        if (objects.has(object)) continue;

        objects.add(object);

        const [collided, normal, overlap] = hitbox.intersects(object.hitbox);

        if (collided && overlap > 0) { // maybe change hitbox code to ignore overlaps that are equal to zero
          info.push({object, normal, overlap});

          if (single) break;
        }
      }
    }

    return info;
  }

  public collisionQueryFromObject(object: GameObject, searchType: string, single: boolean, whitelist?: Team): CollisionInfo[] {
    return this.collisionQuery(Array.from(object.chunks), object.hitbox, searchType, single);
  }

  public collisionQueryFromHitbox(hitbox: CollisionObject, searchType: string, single: boolean, whitelist?: Team): CollisionInfo[] {
    const chunks = this.getChunksOfBounds(hitbox.getBounds());

    return this.collisionQuery(chunks, hitbox, searchType, single, whitelist);
  }

  public attackQuery(hitbox: CollisionObject, single: boolean, whitelist?: Team): Entity[] {
    const query: CollisionInfo[] = this.collisionQueryFromHitbox(hitbox, "Entity", single, whitelist);
    const entities: Entity[] = [];

    for (const info of query) {
      entities.push(info.object as Entity);
    }

    return entities;
  }

  public restrictionQuery(hitbox: CollisionObject): boolean {
    return this.collisionQueryFromHitbox(hitbox, "Structure", true).length > 0;
  }

  public updateObjectChunks(object: GameObject): void {
    const hitboxBounds = object.hitbox.getBounds();

    // optimize this as much as possible
    for (const chunkKey of object.chunks) {
      const chunk = this.getChunkFromKey(chunkKey);

      const chunkRange = new Vector2(this.CHUNK_SIZE / 2, this.CHUNK_SIZE / 2);
      const chunkBounds = new Bounds(chunk.subtract(chunkRange), chunk.add(chunkRange));

      if (!hitboxBounds.overlaps(chunkBounds)) { // clean up this code
        object.removeChunk(chunkKey);
        this.removeFromChunk(chunkKey, object);
      }

      // if (!this.chunkContainsObject(chunk, object.hitbox)) { // check if out of bounds first
      //   object.removeChunk(chunkKey);
      //   this.removeFromChunk(chunkKey, object);
      // }
    }

    for (const chunkKey of this.getChunksOfBounds(hitboxBounds)) {
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

  public reset(): void {
    this.chunks.clear();
  }
}