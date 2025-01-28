import { Wall } from "../objects/structures/wall.js";
import { Util } from "../util/util.js";
import { Vector2 } from "../util/vector2.js";
import { Barrier, Bounds, CollisionObject } from "./collisions.js";

/** Stores all information of a maze cell. */
class MazeNode {
  public visited: boolean = false;
  public left: boolean = true;
  public right: boolean = true;
  public top: boolean = true;
  public bottom: boolean = true;
}

/** Manages maze creation, extension and wall structure creation. */
export class Maze {
  /** Possible directions the maze algorithm can go in. */
  private DIRECTIONS: Vector2[] = [
    new Vector2(0, 1),
    new Vector2(0, -1),
    new Vector2(1, 0),
    new Vector2(-1, 0)
  ];

  /** The grid of maze nodes. */
  private mazeGrid: MazeNode[][] = [];
  /** The full tile map based on the size of spaces and walls. */
  private mapGrid: boolean[][] = [];
  private mapSize: Vector2;
  private vacancies: Vector2[];

  public readonly bounds: Bounds;
  public readonly barriers: CollisionObject[] = [];

  constructor(private mazeSize: Vector2, private spaceSize: number, private wallSize: number) {
    this.mapSize = this.mazeToTile(mazeSize).subtract(new Vector2(this.wallSize, this.wallSize));
    this.bounds = new Bounds(new Vector2(-0.5, -0.5), this.mapSize.subtract(new Vector2(0.5, 0.5)));

    // Create surrounding barriers
    this.barriers.push(new Barrier(this.bounds.min, 0));
    this.barriers.push(new Barrier(this.bounds.min, Math.PI / 2));
    this.barriers.push(new Barrier(this.bounds.max, Math.PI))
    this.barriers.push(new Barrier(this.bounds.max, -Math.PI / 2));

    this.reset();
  }

  /** Create/reset all maze information. */
  private reset(): void {
    this.mazeGrid = Array.from({ length: this.mazeSize.y }, () => Array.from({ length: this.mazeSize.x }, () => new MazeNode()));
    this.mapGrid = Array.from({ length: this.mapSize.y }, () => new Array(this.mapSize.x).fill(true));
    this.vacancies = [];
  }

  /** Generate the maze and its wall structures. */
  public generateMaze(): void {
    this.reset();

    // Start the maze creation algorithm at a random node
    this.start(new Vector2(
      Util.randomInt(0, this.mazeSize.x - 1),
      Util.randomInt(0, this.mazeSize.y - 1)
    ));

    this.generateTileGrid();
    this.generateStructures();
  }

  /**
   * Converts a maze node position to a tile position in map space.
   * @param position The maze node position.
   * @returns The tile position.
   */
  private mazeToTile(position: Vector2): Vector2 {
    return position.multiply(this.spaceSize + this.wallSize);
  }

  /**
   * Searches the neighbors of a maze node and checks for validity.
   * @param position The position of the maze node.
   * @param visitRequirement Whether or not neighbors must be visited or unvisited. 
   * @returns The position of the neighbor selected if any is selected.
   */
  private searchNeighbors(position: Vector2, visitRequirement: boolean): Vector2 | undefined {
    const node: MazeNode = this.mazeGrid[position.y][position.x];

    // Filter possible directions based on them being out of bounds or not meeting the visit requirement
    const options: Vector2[] = this.DIRECTIONS.filter((direction: Vector2) => {
      const optionPos = position.add(direction);

      if (optionPos.x < 0 || optionPos.x >= this.mazeSize.x) return false;
      if (optionPos.y < 0 || optionPos.y >= this.mazeSize.y) return false;

      return this.mazeGrid[optionPos.y][optionPos.x].visited === visitRequirement;
    });

    if (options.length === 0) return;

    // Pick random option out of the possible neighbors
    const randomIndex: number = Util.randomInt(0, options.length - 1);
    const direction: Vector2 = options[randomIndex];
    const neighborPos: Vector2 = position.add(direction);
    const neighborNode: MazeNode = this.mazeGrid[neighborPos.y][neighborPos.x];

    // Clear the maze walls based on the direction traveled
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

  /**
   * Continue traversing/creating the maze at a given node position.
   * @param position The position of the node.
   */
  private start(position: Vector2): void {
    this.mazeGrid[position.y][position.x].visited = true;

    const neighborPos: Vector2 | undefined = this.searchNeighbors(position, false);

    if (neighborPos) { // Start again at the neighbor
      this.start(neighborPos);

    } else {
      const unvisistedPos: Vector2 | undefined = this.getUnvisitedNode();

      if (unvisistedPos) this.start(unvisistedPos);
    }
  }

  /**
   * Scan through the maze nodes for a valid node to start on.
   * @returns The position of the valid node if existant.
   */
  private getUnvisitedNode(): Vector2 | undefined {
    // Scan through the maze nodes
    for (let y: number = 0; y < this.mazeSize.y; y++) {
      for (let x: number = 0; x < this.mazeSize.x; x++) {
        const node = this.mazeGrid[y][x];

        // Check if the node is unvisited and has a visited neighbor to connect to
        if (node.visited) continue;

        const position = new Vector2(x, y);
        const neighborPos = this.searchNeighbors(position, true);

        if (neighborPos) return position;
      }
    }
  }

  /** Expand the maze node grid to the tile grid with the given space and wall size. */
  private generateTileGrid(): void {
    // Loop through the maze nodes
    for (let y: number = 0; y < this.mazeSize.y; y++) {
      for (let x: number = 0; x < this.mazeSize.x; x++) {
        const node: MazeNode = this.mazeGrid[y][x];
        const gridPos: Vector2 = new Vector2(x, y);
        const start: Vector2 = this.mazeToTile(gridPos);

        // Clear out spaces of the maze nodes from the tile grid
        for (let dX: number = 0; dX < this.spaceSize; dX++) {
          for (let dY: number = 0; dY < this.spaceSize; dY++) {
            const newX = start.x + dX;
            const newY = start.y + dY;

            this.mapGrid[newY][newX] = false;
          }
        }

        // Clear out the tiles to the left if the wall is missing
        if (!node.left && x > 0) {
          for (let dY: number = 0; dY < this.spaceSize; dY++) {
            for (let dX: number = 0; dX < this.wallSize; dX++) {
              this.mapGrid[start.y + dY][start.x - 1 - dX] = false;
            }
          }
        }

        // Clear out the tiles to the right if the wall is missing
        if (!node.bottom && y > 0) {
          for (let dX: number = 0; dX < this.spaceSize; dX++) {
            for (let dY: number = 0; dY < this.wallSize; dY++) {
              this.mapGrid[start.y - 1 - dY][start.x + dX] = false;
            }
          }
        }
      }
    }
  }

  /**
   * Gets a random vacant tile of the maze.
   * @returns The position of the random vacancy.
   */
  public getRandomVacancy(): Vector2 {
    return this.vacancies[Util.randomInt(0, this.vacancies.length - 1)];
  }

  /** Generate the structures and vacancies based on the maze tile grid. */
  private generateStructures(): void {
    // Set vacancies
    for (let y: number = 0; y < this.mapGrid.length; y++) {
      for (let x: number = 0; x < this.mapGrid[y].length; x++) {
        if (!this.mapGrid[y][x]) this.vacancies.push(new Vector2(x, y));
      }
    }

    // Loop through tile grid from bottom left corner
    for (let y: number = 0; y < this.mapGrid.length; y++) {
      for (let x: number = 0; x < this.mapGrid[y].length; x++) {
        if (!this.mapGrid[y][x]) continue;

        // Traverse up and right to find other grids to group into one structure
        let sweepUp = 0;
        let sweepRight = 0;

        for (let dY: number = 1; dY < this.mapSize.y - y; dY++) {
          if (this.mapGrid[y + dY][x]) sweepUp++;
          else break;
        }

        for (let dX: number = 1; dX < this.mapSize.x - x; dX++) {
          if (this.mapGrid[y][x + dX]) sweepRight++;
          else break;
        }

        // Check if there is a greater group upwards AND the rows will not exceed the wall to the right
        // OR also sweep up if the columns from sweeping right will exceed the sweep up
        if ((sweepUp > sweepRight && sweepRight >= this.wallSize - 1) || sweepUp < this.wallSize - 1) {
          new Wall(new Vector2(x + (this.wallSize - 1) / 2, y + sweepUp / 2), new Vector2(this.wallSize, 1 + sweepUp));

          for (let dX: number = 0; dX < this.wallSize; dX++) {
            for (let dY: number = 0; dY <= sweepUp; dY++) {
              this.mapGrid[y + dY][x + dX] = false;
            }
          }

        } else {
          new Wall(new Vector2(x + sweepRight / 2, y + (this.wallSize - 1) / 2), new Vector2(1 + sweepRight, this.wallSize));

          for (let dY: number = 0; dY < this.wallSize; dY++) {
            for (let dX: number = 0; dX <= sweepRight; dX++) {
              this.mapGrid[y + dY][x + dX] = false;
            }
          }
        }
      }
    }
  }
}