import { Game } from "../core/game.js";
import { Entity } from "../objects/entity.js";
import { GameObject } from "../objects/gameobject.js";
import { Team } from "../objects/team.js";
import { Util } from "../util/util.js";
import { Vector2 } from "../util/vector2.js";
import { Bounds, CollisionObject } from "./collisions.js";

type ChunkObjects = Map<string, Set<GameObject>>;

export interface CollisionInfo {
  object?: GameObject;
  normal: Vector2;
  overlap: number;
}

export class ChunkManager {
  private CHUNK_SIZE = 2;

  private chunks: Map<number, ChunkObjects> = new Map();

  /**
   * Add an object's reference to a chunk.
   * @param chunkKey The chunk key.
   * @param object The object being added.
   */
  private addToChunk(chunkKey: number, object: GameObject): void {
    const objects: ChunkObjects = this.chunks.get(chunkKey) || new Map();
    if (objects.size === 0) this.chunks.set(chunkKey, objects);

    const typeObjects: Set<GameObject> = objects.get(object.type) || new Set();
    if (typeObjects.size === 0) objects.set(object.type, typeObjects);

    typeObjects.add(object);
  }

  /**
   * Remove an object's reference from a chunk.
   * @param chunkKey The chunk key.
   * @param object The object being removed.
   * @returns 
   */
  private removeFromChunk(chunkKey: number, object: GameObject): void {
    const objects: ChunkObjects | undefined = this.chunks.get(chunkKey);
    if (!objects) return;

    const typeObjects: Set<GameObject> | undefined = objects.get(object.type);
    if (!typeObjects) return;

    typeObjects.delete(object);
    
    if (typeObjects.size === 0) objects.delete(object.type);
    if (objects.size === 0) this.chunks.delete(chunkKey);
  }

  /**
   * Gets all the chunks contained in a range.
   * @param bounds The bound range to search.
   * @returns An array of chunk keys.
   */
  private getChunksOfBounds(bounds: Bounds): number[] {
    const chunks: number[] = [];

    // Round minimum down to nearest chunk
    const minChunk: Vector2 = new Vector2(
      Util.round(bounds.min.x / this.CHUNK_SIZE, 1, false),
      Util.round(bounds.min.y / this.CHUNK_SIZE, 1, false)
    );

    // Round maximum up to nearest chunk
    const maxChunk: Vector2 = new Vector2(
      Util.round(bounds.max.x / this.CHUNK_SIZE),
      Util.round(bounds.max.y / this.CHUNK_SIZE)
    );

    // Loop between min and max chunk
    for (let x = minChunk.x; x <= maxChunk.x; x++) {
      for (let y = minChunk.y; y <= maxChunk.y; y++) {
        chunks.push(Util.cantor(new Vector2(x, y)));
      }
    }

    return chunks;
  }

  /**
   * Queries for collisions based on a hitbox and given parameters.
   * @param searchChunks Chunks to search.
   * @param hitbox The hitbox.
   * @param searchType The object type to search for.
   * @param single Whether or not it should stop after finding a single collision.
   * @param whitelist The optional team whitelist for entities.
   * @param blacklisted An optional specific object blacklist.
   * @returns An array of information for all of the collisions.
   */
  public collisionQuery(searchChunks: number[], hitbox: CollisionObject, searchType: string, single: boolean, whitelist?: Team, blacklisted?: GameObject): CollisionInfo[] {
    const info: CollisionInfo[] = [];
    const objects: Set<GameObject> = new Set();

    for (const chunkKey of searchChunks) {
      const chunkObjects = this.chunks.get(chunkKey);
      if (!chunkObjects) continue;

      const typeObjects = chunkObjects.get(searchType);
      if (!typeObjects) continue;

      // Loop through the specific type objects
      for (const object of typeObjects) {
        if (object === blacklisted) continue; // Skip if object is blacklisted
        if (whitelist && object instanceof Entity && object.team === whitelist) continue; // Skip if object is an entity and part of whitelist

        if (objects.has(object)) continue; // Skip if already checked
        objects.add(object);

        const [collided, normal, overlap] = hitbox.intersects(object.hitbox); // Get collision between hitboxes

        if (collided && overlap > 0) {
          info.push({object, normal, overlap}); // Add collision info to info array

          if (single) break; // Break loop if only checking for a single object
        }
      }
    }

    // Add map barriers to the query return if searching for structures
    if (searchType === "Structure" && (!single || info.length === 0)) {
      for (const barrier of Game.instance.simulation.map.barriers) {
        const [collided, normal, overlap] = hitbox.intersects(barrier);

        if (collided && overlap > 0) {
          info.push({normal, overlap});
        }
      }
    }

    return info;
  }

  /**
   * Queries for collisions based on an existing object and its chunks.
   * @param object The object to query for.
   * @param searchType The object type being searched.
   * @param single Whether searching for a single object or not.
   * @param whitelist The collision whitelist.
   * @returns An array of collision information.
   */
  public collisionQueryFromObject(object: GameObject, searchType: string, single: boolean, whitelist?: Team): CollisionInfo[] {
    return this.collisionQuery(Array.from(object.chunks), object.hitbox, searchType, single, whitelist, object);
  }

  /**
   * Queries for collisions from a hitbox.
   * @param hitbox The collision hitbox.
   * @param searchType The object type to search for.
   * @param single Whether only a single object is required.
   * @param whitelist The entity team whitelist.
   * @param blacklisted The blacklisted object.
   * @returns An array of collision info.
   */
  public collisionQueryFromHitbox(hitbox: CollisionObject, searchType: string, single: boolean, whitelist?: Team, blacklisted?: GameObject): CollisionInfo[] {
    const chunks = this.getChunksOfBounds(hitbox.getBounds());

    return this.collisionQuery(chunks, hitbox, searchType, single, whitelist, blacklisted);
  }

  /**
   * Queries for entities colliding with an attacker's hitbox.
   * @param hitbox The collision hitbox.
   * @param single Whether only a single hit is required.
   * @param attacker The attacker to use for whitelist and blacklist.
   * @returns The entities colliding with the hitbox.
   */
  public attackQuery(hitbox: CollisionObject, single: boolean, attacker: Entity): Entity[] {
    const query: CollisionInfo[] = this.collisionQueryFromHitbox(hitbox, "Entity", single, attacker.team, attacker);
    const entities: Entity[] = [];

    for (const info of query) {
      entities.push(info.object as Entity);
    }

    return entities;
  }

  /**
   * Queries for any structure collisions with a hitbox.
   * @param hitbox The hitbox.
   * @returns True if a structure collides with the hitbox, false otherwise.
   */
  public restrictionQuery(hitbox: CollisionObject): boolean {
    return this.collisionQueryFromHitbox(hitbox, "Structure", true).length > 0;
  }

  /**
   * Updates an object's chunk references and removes its old ones.
   * @param object The object being updated.
   */
  public updateObjectChunks(object: GameObject): void {
    const hitboxBounds = object.hitbox.getBounds();

    // Loop through old chunks
    for (const chunkKey of object.chunks) {
      const chunk = Util.inverseCantor(chunkKey);

      const chunkRange = new Vector2(this.CHUNK_SIZE / 2, this.CHUNK_SIZE / 2);
      const chunkBounds = new Bounds(chunk.subtract(chunkRange), chunk.add(chunkRange));

      // Remove if not overlapping with hitbox bounding box
      if (!hitboxBounds.overlaps(chunkBounds)) {
        object.removeChunk(chunkKey);
        this.removeFromChunk(chunkKey, object);
      }
    }

    // Loop through chunks of hitbox bounding box
    for (const chunkKey of this.getChunksOfBounds(hitboxBounds)) {
      if (object.isInChunk(chunkKey)) continue; // If already logged then skip

      object.addChunk(chunkKey);
      this.addToChunk(chunkKey, object);
    }
  }

  /**
   * Removes all chunk references from an object.
   * @param object The object being cleared.
   */
  public clearObjectChunks(object: GameObject): void {
    for (const chunkKey of object.chunks) {
      object.removeChunk(chunkKey);
      this.removeFromChunk(chunkKey, object);
    }
  }
}