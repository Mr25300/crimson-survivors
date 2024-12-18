import { Game } from "../core/game";
import { Entity } from "../objects/entity";
import { GameObject } from "../objects/gameobject";
import { Vector2 } from "../util/vector2";
import { CollisionHandler, Polygon, Rectangle } from "./collisions";

class Quad {
  constructor(
    private start: Vector2,
    private end: Vector2,
  ) { }

  public getSubdivisions(): Quad[] {
    const middleX = (this.start.x + this.end.x) / 2;
    const middleY = (this.start.y + this.end.y) / 2;

    return [
      new Quad(this.start, new Vector2(middleX, middleY)),
      new Quad(this.start, new Vector2())
    ]
  }
}

class ChunkManager {
  private CHUNK_SIZE = 1;

  private chunks: Record<string, Set<Entity>> = {};

  constructor() {

  }

  public chunkContainsPolygon(chunk: Vector2, polygon: Polygon): boolean {
    const chunkPos = chunk.multiply(this.CHUNK_SIZE);
    const chunkRect = new Rectangle(
      chunkPos.subtract(new Vector2(this.CHUNK_SIZE/2, this.CHUNK_SIZE/2)),
      chunkPos.add(new Vector2(this.CHUNK_SIZE/2, this.CHUNK_SIZE/2))
    )

    return chunkRect.containsPolygon(polygon);
  }

  public updateObjectChunks(object: GameObject) {
    const polygon: Polygon = object.hitShape;

    for (const chunk of object.getChunks()) {
      if (!this.chunkContainsPolygon(chunk, polygon)) object.removeChunk(chunk);
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