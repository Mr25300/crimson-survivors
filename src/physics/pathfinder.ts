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

  /**
   * Creates a path node with the specified information.
   * @param position The position of the path node.
   * @param gCost The distance from the node to the start.
   * @param hCost The distance from the node to the target.
   * @param parent The origin node which has been traveled from.
   */
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
  private GRID_SCALE: number = 1; // The size of path nodes in game space+

  /** The possible directions a node can travel in. */
  private NEIGHBOR_DIRECTIONS: Vector2[] = [
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
  private processed: Map<number, PathNode> = new Map();
  /** The map of restricted nodes as their cantor keys. */
  private restricted: Set<number> = new Set();

  private gridStart: Vector2;
  private gridGoal: Vector2;

  public readonly waypoints: Vector2[] = [];

  constructor(start: Vector2, goal: Vector2, private arriveRange: number, private travelHitbox: SweptCollisionObject) {
    this.gridStart = start.divide(this.GRID_SCALE).round(); // Round start to nearest path grid position
    this.gridGoal = goal.divide(this.GRID_SCALE).round(); // Round end to nearest path grid position
  }

  public getGoal(): Vector2 {
    return this.gridGoal.multiply(this.GRID_SCALE);
  }

  /** Computes the quickest path from the start to the goal. */
  public computePath(): void {
    const startNode: PathNode = new PathNode(this.gridStart, 0, this.gridStart.distance(this.gridGoal));
    startNode.queued = true;

    // Add the start location to the queue to be processed
    this.priorityQueue.push(startNode);
    this.processed.set(Util.cantor(this.gridStart), startNode);

    while (!this.priorityQueue.isEmpty()) {
      const node: PathNode = this.priorityQueue.pop()!; // Get highest priority node (lowest fScore)

      // End computation and backtrack path if within threshold of target
      if (node.hCost <= this.arriveRange / this.GRID_SCALE) {
        this.backtrackWaypoints(node);

        return;
      }

      // Loop through and check neighbors
      for (const direction of this.NEIGHBOR_DIRECTIONS) {
        this.travelToNeighbor(node, direction);
      }

      node.queued = false;
    }
  }

  /**
   * Travels to and processes the neighbor of the specified node.
   * @param node The origin node.
   * @param direction The direction to travel.
   */
  private travelToNeighbor(node: PathNode, direction: Vector2): void {
    const neighborPos = node.position.add(direction);
    const neighborKey = Util.cantor(neighborPos);

    if (this.restricted.has(neighborKey)) return; // Return if the node is already restricted

    const gCost: number = node.gCost + direction.magnitude();
    const existing = this.processed.get(neighborKey); // Look for existing neighbor

    if (existing) {
      if (gCost < existing.gCost) { // If the new path to the neighbor is more efficient than overwrite it
        existing.gCost = gCost;
        existing.parent = node;

        if (!existing.queued) this.priorityQueue.push(existing); // Queue node to be processed again if not already queued
      }

    } else {
      // Position hitbox going from original node to neighbor node for collision checking
      this.travelHitbox.setTransformation(neighborPos.multiply(this.GRID_SCALE), direction.angle());
      this.travelHitbox.sweepVertices(direction.magnitude() * this.GRID_SCALE);

      if (Game.instance.chunkManager.restrictionQuery(this.travelHitbox)) { // Check for collision and mark as restricted
        this.restricted.add(neighborKey);

        return;
      }

      // Create and queue new neighbor node
      const hCost: number = neighborPos.distance(this.gridGoal);
      const neighborNode: PathNode = new PathNode(neighborPos, gCost, hCost, node);
      neighborNode.queued = true;

      this.processed.set(neighborKey, neighborNode);
      this.priorityQueue.push(neighborNode);
    }
  }

  /**
   * Backtracks through a node and its parents and creates the most efficient path possible.
   * @param endNode The node to arrive at.
   */
  private backtrackWaypoints(endNode: PathNode): void {
    let current: PathNode = endNode;
    let lastWaypoint: Vector2 = current.position;

    this.waypoints.push(lastWaypoint.multiply(this.GRID_SCALE)); // Add end waypoint

    // Backtrack through waypoint ancestry
    while (current.parent) {
      const prev: PathNode = current;

      current = current.parent;

      const difference = lastWaypoint.subtract(current.position);

      // Position hitbox from last valid waypoint to the node being searched
      this.travelHitbox.setTransformation(lastWaypoint.multiply(this.GRID_SCALE), difference.angle());
      this.travelHitbox.sweepVertices(difference.magnitude() * this.GRID_SCALE);

      // Create and start a new waypoint if a straight path from the last waypoint is not possible
      if (Game.instance.chunkManager.restrictionQuery(this.travelHitbox)) {
        lastWaypoint = prev.position;

        this.waypoints.push(lastWaypoint.multiply(this.GRID_SCALE));
      }
    }

    this.waypoints.push(this.gridStart.multiply(this.GRID_SCALE)); // Add start waypoint
    this.waypoints.reverse(); // Flip the waypoints to match the order of travel
  }
}

/** Handles and manages bot pathfinding and */
export class Pathfinder {
  /** The global path recompute timer to limit computation frequency. */
  private static globalRecomputeTimer: Timer = new Timer(0.1);

  /** Distance threshold for automatic linear tracking. */
  private autoFollowDist: number = 2;
  /** Distance threshold for the entity to travel before recomputing a path. */
  private recomputeDist: number = 2;

  private target?: Entity;

  private pathfindHitbox: SweptCollisionObject;

  private currentPath: OptimalPath;
  private currentWaypoint: number

  private _moveDirection: Vector2 = new Vector2();
  private _faceDirection: Vector2 = new Vector2();
  private _targetDistance: number;

  constructor(private subject: Entity, private approachRange: number) {
    this.pathfindHitbox = subject.hitbox.sweep();
  }

  public setTarget(target: Entity): void {
    this.target = target;
  }

  public get moveDirection(): Vector2 {
    return this._moveDirection;
  }

  public get faceDirection(): Vector2 {
    return this._faceDirection;
  }

  /**
   * Determines whether or not the subject should attack.
   * @returns True if should attack, false otherwise.
   */
  public shouldAttack(): boolean {
    return this.target !== null && this._targetDistance <= this.approachRange;
  }

  /** Updates the pathfinder's move and face directions and computes a new path if necessary. */
  public update(): void {
    if (!this.target) return;

    const directPath: Vector2 = this.target.position.subtract(this.subject.position);
    
    this._targetDistance = directPath.magnitude();

    if (this._targetDistance <= this.approachRange) { // Stop movement and track face direction if within range
      this._moveDirection = new Vector2();
      this._faceDirection = directPath.unit();

      return;

    } else if (this._targetDistance <= this.autoFollowDist) { // Follow target in a straight line if in auto follow range and not within approach range
      this._moveDirection = this._faceDirection = directPath.unit();

      return;
    }

    // Recompute path if timer is not active and entity has moved more than the recompute distance since the last path
    if (!Pathfinder.globalRecomputeTimer.isActive() && (!this.currentPath || this.currentPath.getGoal().distance(this.target.position) > this.recomputeDist)) {
      Pathfinder.globalRecomputeTimer.start();

      this.currentPath = new OptimalPath(this.subject.position, this.target.position, this.approachRange, this.pathfindHitbox);
      this.currentPath.computePath();
      this.currentWaypoint = 1;
    }

    if (this.currentPath) {
      // Loop through the waypoints
      while (this.currentWaypoint < this.currentPath.waypoints.length) {
        const waypoint: Vector2 = this.currentPath.waypoints[this.currentWaypoint];
        const lastWaypoint: Vector2 = this.currentPath.waypoints[this.currentWaypoint - 1];
        const pathDirection = waypoint.subtract(lastWaypoint).unit();
  
        // Project waypoint and entity position onto direction axis between waypoints
        const dotWaypoint = pathDirection.dot(waypoint); 
        const dotPosition = pathDirection.dot(this.subject.position);

        if (dotPosition > dotWaypoint) { // Go to the next waypoint if the entity has passed the current one
          this.currentWaypoint++;
  
          continue;
        }

        // Combine direction along waypoint axis and direct path to waypoint for move direction
        const waypointDirection = waypoint.subtract(this.subject.position).unit();
        const finalDirection = pathDirection.add(waypointDirection).unit();
  
        this._moveDirection = this._faceDirection = finalDirection;
  
        return; // Break loop if direction was set
      }
    }

    this._moveDirection = this._faceDirection = directPath.unit(); // Set to straight line follow by default
  }
}