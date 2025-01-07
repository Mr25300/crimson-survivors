import { Wall } from "../objects/structures/wall.js";
import { Util } from "../util/util.js";
import { Vector2 } from "../util/vector2.js";
import { Barrier, Bounds, CollisionObject, Rectangle } from "./collisions.js";

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

  private mazeGrid: MazeNode[][] = [];
  private mapGrid: boolean[][] = [];
  private mapSize: Vector2;
  public readonly bounds: Bounds;
  public readonly barriers: CollisionObject[] = [];
  private vacancies: Vector2[];

  constructor(private mazeSize: Vector2, private spaceSize: number, private wallSize: number) {
    this.mapSize = this.mazeToTile(mazeSize).subtract(new Vector2(this.wallSize, this.wallSize));
    this.bounds = new Bounds(new Vector2(-0.5, -0.5), this.mapSize.subtract(new Vector2(0.5, 0.5)));

    this.barriers.push(new Barrier(this.bounds.min, 0));
    this.barriers.push(new Barrier(this.bounds.min, Math.PI / 2));
    this.barriers.push(new Barrier(this.bounds.max, Math.PI))
    this.barriers.push(new Barrier(this.bounds.max, -Math.PI / 2));

    this.reset();
  }

  public reset(): void {
    this.mazeGrid = Array.from({ length: this.mazeSize.y }, () => Array.from({ length: this.mazeSize.x }, () => new MazeNode()));
    this.mapGrid = Array.from({ length: this.mapSize.y }, () => new Array(this.mapSize.x).fill(true));
    this.vacancies = [];
  }

  public generateMaze(): void {
    this.reset();

    this.start(new Vector2(
      Util.randomInt(0, this.mazeSize.x - 1),
      Util.randomInt(0, this.mazeSize.y - 1)
    ));

    this.generateTileGrid();
    this.generateStructures();
  }

  private mazeToTile(position: Vector2): Vector2 {
    return position.multiply(this.spaceSize + this.wallSize);
  }

  private searchNeighbors(position: Vector2, visited: boolean): Vector2 | void {
    const node = this.mazeGrid[position.y][position.x];

    const options = this.directions.filter((direction: Vector2) => {
      const optionPos = position.add(direction);

      if (optionPos.x < 0 || optionPos.x >= this.mazeSize.x) return false;
      if (optionPos.y < 0 || optionPos.y >= this.mazeSize.y) return false;

      return this.mazeGrid[optionPos.y][optionPos.x].visited === visited;
    });

    if (options.length === 0) return;

    const randomIndex: number = Util.randomInt(0, options.length - 1);
    const direction: Vector2 = options[randomIndex];
    const neighborPos = position.add(direction);
    const neighborNode = this.mazeGrid[neighborPos.y][neighborPos.x];

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
    this.mazeGrid[position.y][position.x].visited = true;

    const neighborPos = this.searchNeighbors(position, false);

    if (neighborPos) {
      this.start(neighborPos);

    } else {
      const unvisistedPos: Vector2 | void = this.getUnvisitedNode();

      if (unvisistedPos) this.start(unvisistedPos);
    }
  }

  private getUnvisitedNode(): Vector2 | void {
    for (let y = 0; y < this.mazeSize.y; y++) {
      for (let x = 0; x < this.mazeSize.x; x++) {
        const node = this.mazeGrid[y][x];

        if (node.visited) continue;

        const position = new Vector2(x, y);
        const neighborPos = this.searchNeighbors(position, true);

        if (neighborPos) return position;
      }
    }
  }

  private generateTileGrid(): void {
    for (let y = 0; y < this.mazeSize.y; y++) {
      for (let x = 0; x < this.mazeSize.x; x++) {
        const node = this.mazeGrid[y][x];
        const gridPos: Vector2 = new Vector2(x, y);
        const start = this.mazeToTile(gridPos);
  
        for (let dX = 0; dX < this.spaceSize; dX++) {
          for (let dY = 0; dY < this.spaceSize; dY++) {
            const newX = start.x + dX;
            const newY = start.y + dY;
  
            this.mapGrid[newY][newX] = false;
          }
        }

        if (!node.left && x > 0) {
          for (let dY = 0; dY < this.spaceSize; dY++) {
            for (let dX = 0; dX < this.wallSize; dX++) {
              this.mapGrid[start.y + dY][start.x - 1 - dX] = false;
            }
          }
        }
  
        if (!node.bottom && y > 0) {
          for (let dX = 0; dX < this.spaceSize; dX++) {
            for (let dY = 0; dY < this.wallSize; dY++) {
              this.mapGrid[start.y - 1 - dY][start.x + dX] = false;
            }
          }
        }
      }
    }
  }

  public getRandomVacancy(): Vector2 {
    return this.vacancies[Util.randomInt(0, this.vacancies.length - 1)];
  }

  private generateStructures(): void {
    for (let y = 0; y < this.mapGrid.length; y++) {
      for (let x = 0; x < this.mapGrid[y].length; x++) {
        if (!this.mapGrid[y][x]) this.vacancies.push(new Vector2(x, y));
      }
    }

    for (let y = 0; y < this.mapGrid.length; y++) {
      for (let x = 0; x < this.mapGrid[y].length; x++) {
        if (this.mapGrid[y][x]) {
          let sweepUp = 0;
          let sweepRight = 0;

          for (let dY = 1; dY < this.mapSize.y - y; dY++) {
            if (this.mapGrid[y + dY][x]) sweepUp++;
            else break;
          }

          for (let dX = 1; dX < this.mapSize.x - x; dX++) {
            if (this.mapGrid[y][x + dX]) sweepRight++;
            else break;
          }

          // check if going up AND rows will not exceed the wall to the right AND columns will not exceed wall to the left
          if ((sweepUp > sweepRight && sweepRight >= this.wallSize - 1) || sweepUp < this.wallSize - 1) {
            const width: number = this.wallSize;

            new Wall(new Vector2(x + (width - 1) / 2, y + sweepUp / 2), new Vector2(width, 1 + sweepUp));

            for (let dX = 0; dX < width; dX++) {
              for (let dY = 0; dY <= sweepUp; dY++) {
                this.mapGrid[y + dY][x + dX] = false;
              }
            }

          } else {
            const height: number = this.wallSize;

            new Wall(new Vector2(x + sweepRight / 2, y + (height - 1) / 2), new Vector2(1 + sweepRight, height));

            for (let dY = 0; dY < height; dY++) {
              for (let dX = 0; dX <= sweepRight; dX++) {
                this.mapGrid[y + dY][x + dX] = false;
              }
            }
          }
        }
      }
    }
  }
}