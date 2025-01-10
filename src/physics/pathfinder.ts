import { Game } from "../core/game.js";
import { Entity } from "../objects/entity.js";
import { Timer } from "../util/timer.js";
import { Util } from "../util/util.js";
import { Vector2 } from "../util/vector2.js";
import { SweptCollisionObject } from "./collisions.js";

/** Stores items in binary tree with values increasing as depth increases. */
class MinHeap<T> {
  private heap: T[] = [];
  private size: number = 0;

  /**
   * Creates a minheap with a custom comparison callback.
   * @param compareCallback The custom callback function to compare two values.
   */
  constructor(private compareCallback: (a: T, b: T) => number) {}

  /**
   * Swaps the values of two indices in the heap.
   * @param a Index a.
   * @param b Index b.
   */
  private swap(a: number, b: number): void {
    const temp: T = this.heap[a];

    this.heap[a] = this.heap[b];
    this.heap[b] = temp;
  }

  /**
   * 
   * @param a Index a.
   * @param b Index b.
   * @returns The comparison value which is:
   * - Negative if a < b
   * - Zero if a = b
   * - Positive if a > b
   */
  private compare(a: number, b: number): number {
    return this.compareCallback(this.heap[a], this.heap[b]);
  }

  /**
   * Adds and sorts a value into the minheap.
   * @param value The value to add.
   */
  public push(value: T): void {
    this.heap[this.size++] = value;

    this.heapifyUp();
  }

  /**
   * Gets the minimum value in the heap and reorders it.
   * @returns The minimum value.
   */
  public pop(): T | undefined {
    if (this.size === 0) return undefined;

    const item = this.heap[0];

    this.heap[0] = this.heap[this.size-- - 1]; // Set first value to the last value
    this.heap.length = this.size; // Shrink heap

    this.heapifyDown();

    return item;
  }

  public isEmpty(): boolean {
    return this.size === 0;
  }

  /** Traverses and reorders the array from the newly added bottom parent node is lesser than itself. */
  private heapifyUp(): void {
    let index: number = this.size - 1;

    while (true) {
      const parent: number = Math.floor((index - 1) / 2); // Get parent index

      // If parent exists and it is greater than the current index than swap them and continue traversing
      if (parent >= 0 && this.compare(parent, index) > 0) {
        this.swap(parent, index);

        index = parent;

      } else {
        break;
      }
    }
  }

  /** Traverses and reorders the array from the newly replaced top node, ensuring none of its children are lesser than itself. */
  private heapifyDown(): void {
    let index: number = 0;
    
    while (true) {
      const left: number = index * 2; // Get left child
      const right: number = index * 2 + 1; // Get right child

      if (left >= this.size) break;

      let smallestChild: number = left;

      if (right < this.size && this.compare(right, left) < 0) { // Compare left and right to select smallest child
        smallestChild = right;
      }

      // Compare node and node's smallest child and swap them if the child is less than itself
      if (this.compare(index, smallestChild) > 0) {
        this.swap(index, smallestChild);

        index = smallestChild;

      } else {
        break;
      }
    }
  }
}

/** Represents a pathfinding node and its heuristic costs. */
class PathNode {
  public queued: boolean = false;

  constructor(
    public readonly position: Vector2,
    public gCost: number,
    public readonly hCost: number,
    public parent?: PathNode
  ) {}

  public get fCost(): number {
    return this.gCost + this.hCost;
  }

  /**
   * Compares this and another node based on fCost and hCost.
   * @param node The comparison node.
   * @returns The comparison value which is:
   * - Negative if this is less than other node
   * - Zero if equal
   * - Positive if this is greater than other node
   */
  public compare(node: PathNode): number {
    const diff: number = this.fCost - node.fCost;

    return diff !== 0 ? diff : this.hCost - node.hCost;
  }
}

/** Handles the search for an optimal path between two points. */
export class OptimalPath {
  private gridScale: number = 1;

  /** The possible directions a node can travel in. */
  private neighborDirections: Vector2[] = [
    new Vector2(0, 1),
    new Vector2(1, 1),
    new Vector2(1, 0),
    new Vector2(1, -1),
    new Vector2(0, -1),
    new Vector2(-1, -1),
    new Vector2(-1, 0),
    new Vector2(-1, 1),
  ];

  /** The ordered queue of possible nodes ordered from lowest to highest fScore. */
  private priorityQueue: MinHeap<PathNode> = new MinHeap((a: PathNode, b: PathNode) => a.compare(b));
  /** The map of processed nodes with the cantor output of their position as keys. */
  private processed: PathNode[][] = [];
  /** The map of restricted nodes as their cantor keys. */
  private restricted: boolean[][] = [];

  private gridStart: Vector2;
  private gridGoal: Vector2;

  public readonly waypoints: Vector2[] = [];

  constructor(start: Vector2, goal: Vector2, private searchRange: number, private arriveRange: number, private travelHitbox: SweptCollisionObject) {
    this.gridStart = start.divide(this.gridScale).round();
    this.gridGoal = goal.divide(this.gridScale).round();
  }

  public getGoal(): Vector2 {
    return this.gridGoal.multiply(this.gridScale);
  }

  private getKey(position: Vector2): number {
    return Util.cantor(position);
  }

  private addToArray<T>(array: T[][], position: Vector2, value: T) {
    const y: number = Util.positiveMap(position.x);
    const x: number = Util.positiveMap(position.y);

    const row: T[] = array[y] || [];
    if (row.length === 0) array[y] = row;

    row[x] = value;
  }

  private getFromArray<T>(array: T[][], position: Vector2): T | undefined {
    const y: number = Util.positiveMap(position.x);
    const x: number = Util.positiveMap(position.y);

    const row: T[] = array[y];
    if (!row) return;

    return row[x];
  }

  private removeFromArray<T>(array: T[][], position: Vector2) {
    const y: number = Util.positiveMap(position.x);
    const x: number = Util.positiveMap(position.y);

    const row: T[] = array[y];
    if (!row) return;

    delete row[x];
    if (row.length === 0) delete array[y];
  }

  public computePath(): void {
    const startNode = new PathNode(this.gridStart, 0, this.gridStart.distance(this.gridGoal));
    startNode.queued = true;

    this.priorityQueue.push(startNode);
    // this.processed.set(this.getKey(this.gridStart), startNode);

    this.addToArray(this.processed, this.gridStart, startNode);

    while (!this.priorityQueue.isEmpty()) {
      const node = this.priorityQueue.pop()!;

      if (node.hCost <= this.arriveRange / this.gridScale) {
        this.backtrackWaypoints(node);

        return;
      }

      for (const direction of this.neighborDirections) {
        this.travelToNeighbor(node, direction);
      }

      node.queued = false;
    }
  }

  public travelToNeighbor(node: PathNode, direction: Vector2): void {
    const neighborPos = node.position.add(direction);
    const neighborKey = this.getKey(neighborPos);

    if (this.getFromArray(this.restricted, neighborPos)) return;
    
    const gCost: number = node.gCost + direction.magnitude();
    const existing = this.getFromArray(this.processed, neighborPos);

    if (existing) {
      if (gCost < existing.gCost) {
        existing.gCost = gCost;
        existing.parent = node;

        if (!existing.queued) this.priorityQueue.push(existing); // add a boolean to mark whether or not a node is in the priority queue and dont queue it if it already is
      }

    } else {
      this.travelHitbox.setTransformation(neighborPos.multiply(this.gridScale), direction.angle());
      this.travelHitbox.sweepVertices(direction.magnitude() * this.gridScale);

      const restricted: boolean = Game.instance.chunkManager.restrictionQuery(this.travelHitbox);

      if (restricted) {
        this.addToArray(this.restricted, neighborPos, true);

        return;
      }

      const hCost = neighborPos.distance(this.gridGoal);;
      const neighborNode = new PathNode(neighborPos, gCost, hCost, node);
      neighborNode.queued = true;

      this.addToArray(this.processed, neighborPos, neighborNode);
      this.priorityQueue.push(neighborNode);
    }
  }

  public backtrackWaypoints(endNode: PathNode): void {
    let current: PathNode = endNode;
    let lastWaypoint: Vector2 = current.position;

    this.waypoints.push(lastWaypoint.multiply(this.gridScale));

    while (current.parent) {
      const prev = current;

      current = current.parent;

      const difference = lastWaypoint.subtract(current.position);

      this.travelHitbox.setTransformation(lastWaypoint.multiply(this.gridScale), difference.angle());
      this.travelHitbox.sweepVertices(difference.magnitude() * this.gridScale);

      if (Game.instance.chunkManager.restrictionQuery(this.travelHitbox)) {
        lastWaypoint = prev.position;

        this.waypoints.push(lastWaypoint.multiply(this.gridScale));
      }
    }

    this.waypoints.push(this.gridStart.multiply(this.gridScale));
    this.waypoints.reverse();
  }
}

export class Pathfinder {
  private followDist: number = 1;
  private recomputeDist: number = 1;
  private recomputeTimer: Timer = new Timer(1);

  private target: Entity = Game.instance.simulation.player;

  private pathfindHitbox: SweptCollisionObject;

  private currentPath: OptimalPath;
  private currentWaypoint: number

  private _moveDirection: Vector2 = new Vector2();
  private _faceDirection: Vector2 = new Vector2();
  private _targetInSight: boolean = false;
  private _targetDistance: number;

  constructor(
    private subject: Entity,
    private approachRange: number
  ) {
    this.pathfindHitbox = subject.hitbox.sweep();
  }

  public setTarget(target: Entity) {
    this.target = target;
  }

  public get moveDirection(): Vector2 {
    return this._moveDirection;
  }

  public get faceDirection(): Vector2 {
    return this._faceDirection;
  }

  public shouldAttack(): boolean {
    return this.target !== null && this._targetDistance <= this.approachRange;
  }

  public update(): void {
    if (!this.target) return;

    const directPath = this.target.position.subtract(this.subject.position);
    
    this._targetDistance = directPath.magnitude();

    if (this._targetDistance <= this.followDist) {
      this._moveDirection = this._faceDirection = directPath.unit();

      return;
    }

    if (!this.recomputeTimer.isActive() && (!this.currentPath || this.currentPath.getGoal().distance(this.target.position) > this.recomputeDist)) {
      this.recomputeTimer.start();

      this.currentPath = new OptimalPath(this.subject.position, this.target.position, 4, this.approachRange, this.pathfindHitbox);
      this.currentPath.computePath();
      this.currentWaypoint = 1;
    }

    if (this.currentPath) {
      while (this.currentWaypoint < this.currentPath.waypoints.length) {
        const waypoint: Vector2 = this.currentPath.waypoints[this.currentWaypoint];
        const lastWaypoint: Vector2 = this.currentPath.waypoints[this.currentWaypoint - 1];
        const pathDirection = waypoint.subtract(lastWaypoint).unit();
  
        const dotWaypoint = pathDirection.dot(waypoint);
        const dotPosition = pathDirection.dot(this.subject.position);

        if (dotPosition > dotWaypoint) {
          this.currentWaypoint++;
  
          continue;
        }
  
        const waypointDirection = waypoint.subtract(this.subject.position).unit();
        const finalDirection = pathDirection.add(waypointDirection).unit();
  
        this._moveDirection = this._faceDirection = finalDirection;
  
        return;
      }
    }

    this._moveDirection = new Vector2();
  }
}