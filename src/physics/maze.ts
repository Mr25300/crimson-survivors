import { Util } from "../util/util.js";
import { Vector2 } from "../util/vector2.js";

class MazeNode {
  public visited: boolean = false;
  public left: boolean = true;
  public right: boolean = true;
  public top: boolean = true;
  public bottom: boolean = true;
}

export class Maze {
  private directions: Vector2[] = [
    new Vector2(0, 1),
    new Vector2(0, -1),
    new Vector2(1, 0),
    new Vector2(-1, 0)
  ];

  private grid: MazeNode[][] = [];
  private _tileGrid: boolean[][] = [];

  public readonly tileSize: Vector2;

  constructor(private size: Vector2, private spaceSize: number, private wallSize: number) {
    this.tileSize = this.mazeToTile(size).subtract(new Vector2(this.wallSize, this.wallSize));
    this.reset();
  }

  public get tileGrid(): boolean[][] {
    return this._tileGrid;
  }

  public reset(): void {
    this.grid = Array.from({ length: this.size.y }, () => Array.from({ length: this.size.x }, () => new MazeNode()));
    this._tileGrid = Array.from({ length: this.tileSize.y }, () => new Array(this.tileSize.x).fill(true));
  }

  public generate(): void {
    this.reset();

    this.start(new Vector2(
      Util.randomInt(0, this.size.x - 1),
      Util.randomInt(0, this.size.y - 1)
    ));

    this.generateTileGrid();
  }

  private mazeToTile(position: Vector2): Vector2 {
    return position.multiply(this.spaceSize + this.wallSize);
  }

  private searchNeighbors(position: Vector2, visited: boolean): Vector2 | void {
    const node = this.grid[position.y][position.x];

    const options = this.directions.filter((direction: Vector2) => {
      const optionPos = position.add(direction);

      if (optionPos.x < 0 || optionPos.x >= this.size.x) return false;
      if (optionPos.y < 0 || optionPos.y >= this.size.y) return false;

      return this.grid[optionPos.y][optionPos.x].visited === visited;
    });

    if (options.length === 0) return;

    const randomIndex: number = Util.randomInt(0, options.length - 1);
    const direction: Vector2 = options[randomIndex];
    const neighborPos = position.add(direction);
    const neighborNode = this.grid[neighborPos.y][neighborPos.x];

    if (direction.x > 0) {
      node.right = false;
      neighborNode.left = false;

    } else if (direction.x < 0) {
      node.left = false;
      neighborNode.right = false;

    } else if (direction.y > 0) {
      node.top = false;
      neighborNode.bottom = false;

    } else if (direction.y < 0) {
      node.bottom = false;
      neighborNode.top = false;
    }

    return neighborPos;
  }

  private start(position: Vector2) {
    this.grid[position.y][position.x].visited = true;

    const neighborPos = this.searchNeighbors(position, false);

    if (neighborPos) {
      this.start(neighborPos);

    } else {
      const unvisistedPos: Vector2 | void = this.getUnvisitedNode();

      if (unvisistedPos) this.start(unvisistedPos);
    }
  }

  private getUnvisitedNode(): Vector2 | void {
    for (let y = 0; y < this.size.y; y++) {
      for (let x = 0; x < this.size.x; x++) {
        const node = this.grid[y][x];

        if (node.visited) continue;

        const position = new Vector2(x, y);
        const neighborPos = this.searchNeighbors(position, true);

        if (neighborPos) return position;
      }
    }
  }

  private generateTileGrid(): void {
    for (let y = 0; y < this.size.y; y++) {
      for (let x = 0; x < this.size.x; x++) {
        const node = this.grid[y][x];
        const gridPos: Vector2 = new Vector2(x, y);
        const start = this.mazeToTile(gridPos);
  
        for (let dX = 0; dX < this.spaceSize; dX++) {
          for (let dY = 0; dY < this.spaceSize; dY++) {
            const newX = start.x + dX;
            const newY = start.y + dY;
  
            this._tileGrid[newY][newX] = false;
          }
        }

        if (!node.left && x > 0) {
          for (let dY = 0; dY < this.spaceSize; dY++) {
            for (let dX = 0; dX < this.wallSize; dX++) {
              this._tileGrid[start.y + dY][start.x - 1 - dX] = false;
            }
          }
        }
  
        if (!node.bottom && y > 0) {
          for (let dX = 0; dX < this.spaceSize; dX++) {
            for (let dY = 0; dY < this.wallSize; dY++) {
              this._tileGrid[start.y - 1 - dY][start.x + dX] = false;
            }
          }
        }
      }
    }
  }
}