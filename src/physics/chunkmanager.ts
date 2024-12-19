import { GameObject } from "../objects/gameobject.js";
import { Vector2 } from "../util/vector2.js";
import { Polygon, Rectangle } from "./collisions.js";

class Quad {
  constructor(
    private start: Vector2,
    private end: Vector2,
  ) {}

  public getSubdivisions(): Quad[] {
    const middleX = (this.start.x + this.end.x) / 2;
    const middleY = (this.start.y + this.end.y) / 2;

    return [
      new Quad(this.start, new Vector2(middleX, middleY)),
      new Quad(this.start, new Vector2())
    ];
  }
}

export class ChunkManager {
  private CHUNK_SIZE = 1;

  private chunks: Map<number, Set<GameObject>> = new Map();

  public getChunkKey(chunk: Vector2): number {
    // modified cantor function to include negatives
    const x: number = chunk.x < 0 ? 2 * chunk.x : -2 * chunk.x - 1;
    const y: number = chunk.y < 0 ? 2 * chunk.y : -2 * chunk.y - 1;

    return (x + y) * (x + y + 1) / 2 + y;
  }

  public getChunkFromKey(key: number): Vector2 {
    const w = Math.floor((Math.sqrt(8 * key + 1) - 1) / 2);
    const t = w * (w + 1) / 2;

    const y = key - t;
    const x = w - y;

    const decodedX = x % 2 === 0 ? x / 2 : -(x + 1) / 2;
    const decodedY = y % 2 === 0 ? y / 2 : -(y + 1) / 2;

    return new Vector2(decodedX, decodedY);
  }

  public chunkContainsPolygon(chunk: Vector2, polygon: Polygon): boolean {
    const chunkPos = chunk.multiply(this.CHUNK_SIZE);

    const chunkRect = new Rectangle(
      chunkPos.subtract(new Vector2(this.CHUNK_SIZE / 2, this.CHUNK_SIZE / 2)),
      chunkPos.add(new Vector2(this.CHUNK_SIZE / 2, this.CHUNK_SIZE / 2))
    );

    return chunkRect.containsPolygon(polygon);
  }

  public addToChunk(chunkKey: number, object: GameObject): void {
    const objects: Set<GameObject> = this.chunks.get(chunkKey) || new Set();

    if (objects.size === 0) this.chunks.set(chunkKey, objects);

    objects.add(object);
  }

  public removeFromChunk(chunkKey: number, object: GameObject): void {
    const objects = this.chunks.get(chunkKey)!;

    objects.delete(object);
    
    if (objects.size === 0) this.chunks.delete(chunkKey);
  }

  public updateObjectChunks(object: GameObject): void {
    const polygon: Polygon = object.hitShape;

    for (const chunkKey of object.chunks) {
      const chunk = this.getChunkFromKey(chunkKey);

      if (!this.chunkContainsPolygon(chunk, polygon)) {
        object.removeChunk(chunkKey);
        this.removeFromChunk(chunkKey, object);
      }
    }

    const bounds: Rectangle = polygon.getBounds();
    const minChunk = bounds.min.divide(this.CHUNK_SIZE).round();
    const maxChunk = bounds.max.divide(this.CHUNK_SIZE).round();

    for (let x = minChunk.x; x <= maxChunk.x; x++) {
      for (let y = minChunk.y; y <= maxChunk.y; y++) {
        const chunk = new Vector2(x, y);
        const chunkKey = this.getChunkKey(chunk);

        if (object.isInChunk(chunkKey) || !this.chunkContainsPolygon(chunk, polygon)) continue;

        object.addChunk(chunkKey);
        this.addToChunk(chunkKey, object);
      }
    }
  }

  public clearObjectChunks(object: GameObject): void {
    for (const chunkKey of object.chunks) {
      object.removeChunk(chunkKey);
      this.removeFromChunk(chunkKey, object);
    }
  }
}