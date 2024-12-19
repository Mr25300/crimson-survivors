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
    const x = chunk.x < 0 ? 2 * chunk.x : -2 * chunk.x - 1;
    const y = chunk.y < 0 ? 2 * chunk.y : -2 * chunk.y - 1;

    return (x + y) * (x + y + 1) / 2 + y;
  }

  public chunkContainsPolygon(chunk: Vector2, polygon: Polygon): boolean {
    const chunkPos = chunk.multiply(this.CHUNK_SIZE);

    const chunkRect = new Rectangle(
      chunkPos.subtract(new Vector2(this.CHUNK_SIZE / 2, this.CHUNK_SIZE / 2)),
      chunkPos.add(new Vector2(this.CHUNK_SIZE / 2, this.CHUNK_SIZE / 2))
    );

    return chunkRect.containsPolygon(polygon);
  }

  public addToChunk(chunk: Vector2, object: GameObject): void {
    const key = this.getChunkKey(chunk);
    let objects = this.chunks.get(key);

    if (!objects) {
      objects = new Set();

      this.chunks.set(key, objects);
    }

    objects.add(object);
  }

  public removeFromChunk(chunk: Vector2, object: GameObject): void {
    const key = this.getChunkKey(chunk);
    const objects = this.chunks.get(key);

    if (objects) {
      objects.delete(object);

      if (objects.size === 0) this.chunks.delete(key);
    }
  }

  public updateObjectChunks(object: GameObject) {
    const polygon: Polygon = object.hitShape;

    for (const chunk of object.getChunks()) {
      if (!this.chunkContainsPolygon(chunk, polygon)) {
        object.removeChunk(chunk);
      }
    }

    const bounds: Rectangle = polygon.getBounds();
    const minChunk = bounds.min.divide(this.CHUNK_SIZE).round();
    const maxChunk = bounds.max.divide(this.CHUNK_SIZE).round();

    for (let x = minChunk.x; x <= maxChunk.x; x++) {
      for (let y = minChunk.y; y <= maxChunk.y; y++) {
        const chunk = new Vector2(x, y);

        if (object.isInChunk(chunk) || !this.chunkContainsPolygon(chunk, polygon)) continue;

        object.addChunk(chunk);
      }
    }
  }
}