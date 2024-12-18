import { Game } from "../core/game";
import { Entity } from "../objects/entity";
import { Vector2 } from "../util/vector2";
import { CollisionHandler, Polygon, Rectangle } from "./collisions";

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
    ]
  }
}

class ChunkManager {
  private CHUNK_SIZE = 2;

  private chunks: Record<string, Set<Entity>> = {};

  constructor() {

  }

  public updateChunks() {
    for (const object of Game.instance.gameObjects) {
      const polygon: Polygon = object.hitShape;
      const bounds: Rectangle = polygon.getBounds();
      
      const minChunk = bounds.min.divide(this.CHUNK_SIZE).round();
      const maxChunk = bounds.max.divide(this.CHUNK_SIZE).round();

      for (let x = minChunk.x; x <= maxChunk.x; x++) {
        for (let y = minChunk.y; y <= maxChunk.y; y++) {
          const chunkPos = new Vector2(x, y);
          const chunkPoly = Polygon.fromRect(chunkPos.multiply(this.CHUNK_SIZE), 0, this.CHUNK_SIZE, this.CHUNK_SIZE);
          const collides = CollisionHandler.polygonIntersection(polygon, chunkPoly);

          if (collides) {
            
          }
        }
      }
    }
  }

  public getIntersectingChunks() {

  }
}