import { Game } from "../core/game.js";
import { Entity } from "../objects/entity.js";
import { Timer } from "../util/timer.js";
import { Util } from "../util/util.js";
import { Vector2 } from "../util/vector2.js";
import { Point, Rectangle, SweptCollisionObject } from "./collisions.js";

class MinHeap<T> {
  private heap: T[] = [];
  private size: number = 0;

  constructor(private compareCallback: (a: T, b: T) => number) {}

  private swap(a: number, b: number): void {
    const temp: T = this.heap[a];

    this.heap[a] = this.heap[b];
    this.heap[b] = temp;
  }

  private compare(a: number, b: number): number {
    return this.compareCallback(this.heap[a], this.heap[b]);
  }

  public push(value: T): void {
    this.heap[this.size++] = value;

    this.heapifyUp();
  }

  public pop(): T | undefined {
    if (this.size === 0) return undefined;

    const item = this.heap[0];

    this.heap[0] = this.heap[this.size - 1];
    delete this.heap[this.size-- - 1];

    this.heapifyDown();

    return item;
  }

  public peek(): T | undefined {
    return this.heap[0];
  }

  public isEmpty(): boolean {
    return this.size === 0;
  }

  private heapifyUp(): void {
    let index: number = this.size - 1;

    while (true) {
      const parent = Math.floor((index - 1) / 2);

      if (parent >= 0 && this.compare(parent, index) > 0) {
        this.swap(parent, index);

        index = parent;

      } else {
        break;
      }
    }
  }

  private heapifyDown(): void {
    let index: number = 0;

    while (true) {
      const left: number = index * 2;
      const right: number = index * 2 + 1;

      if (left >= this.size) break;

      let smallestChild: number = left;

      if (right < this.size && this.compare(right, left) < 0) {
        smallestChild = right;
      }

      if (this.compare(index, smallestChild) > 0) {
        this.swap(index, smallestChild);

        index = smallestChild;

      } else {
        break;
      }
    }
  }
}

class Node {
  constructor(
    public readonly position: Vector2,
    public gCost: number,
    public readonly hCost: number,
    public readonly restricted: boolean = false,
    public parent?: Node
  ) {}

  public get fCost(): number {
    return this.gCost + this.hCost;
  }

  public compare(node: Node): number {
    const diff = this.fCost - node.fCost;

    return diff !== 0 ? diff : this.hCost - node.hCost
  }
}

export class OptimalPath {
  private gridScale: number = 0.25;

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

  private priorityQueue: MinHeap<Node> = new MinHeap((a: Node, b: Node) => a.compare(b)); // try using minheap to optimize
  private processed: Map<number, Node> = new Map();
  private restricted: Set<number> = new Set();

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

  private processNode(node: Node) {
    this.processed.set(this.getKey(node.position), node);
  }

  private getProcessed(position: Vector2): Node | undefined {
    return this.processed.get(this.getKey(position));
  }

  public computePath(): void {
    // fails when path is impossible because of hitbox size, figure out how to fix (with help from gpt)
    this.priorityQueue.push(new Node(this.gridStart, 0, this.gridStart.distance(this.gridGoal)));
    this.processed.set(this.getKey(this.gridStart), this.priorityQueue.peek()!);

    while (!this.priorityQueue.isEmpty()) {
      const node = this.priorityQueue.pop()!;

      // new Rectangle(this.gridScale, this.gridScale, undefined, node.position.multiply(this.gridScale)).show();

      if (node.hCost <= this.arriveRange / this.gridScale) {
        this.backtrackWaypoints(node);

        return;
      }

      for (const direction of this.neighborDirections) {
        this.travelToNeighbor(node, direction);
      }
    }
  }

  public travelToNeighbor(node: Node, direction: Vector2): void {
    const neighborPos = node.position.add(direction);
    const neighborKey = this.getKey(neighborPos);

    if (this.restricted.has(neighborKey)) return;

    const gCost: number = node.gCost + direction.magnitude();
    const existing = this.processed.get(neighborKey);

    if (existing) {
      if (gCost < existing.gCost) {
        existing.gCost = gCost;
        existing.parent = node;

        this.priorityQueue.push(existing);

        // this.openSet.push(existing);
      }

    } else {
      const goalDistance = neighborPos.distance(this.gridGoal);
      const totalDistance = this.gridStart.distance(this.gridGoal);
      const neighborDistanceSum = neighborPos.distance(this.gridStart) + goalDistance;
      let restricted: boolean = neighborDistanceSum > totalDistance + 2 * this.searchRange / this.gridScale; // oval shape with min radius of searchrange around each oval focus

      if (!restricted) {
        // cut off for out of bounds
      }

      if (!restricted) {
        this.travelHitbox.setTransformation(neighborPos.multiply(this.gridScale), direction.angle());
        this.travelHitbox.sweepVertices(direction.magnitude() * this.gridScale);

        restricted = Game.instance.chunkManager.restrictionQuery(this.travelHitbox);
      }

      if (restricted) {
        this.restricted.add(neighborKey);

        return;
      }

      const hCost = goalDistance;
      const neighborNode = new Node(neighborPos, gCost, hCost, restricted, node);

      this.processed.set(neighborKey, neighborNode);
      this.priorityQueue.push(neighborNode);
    }
  }

  public backtrackWaypoints(endNode: Node): void {
    let current: Node = endNode;
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
  private recomputeDist: number = 1;
  private recomputeTimer: Timer = new Timer(1);
  
  private lineOfSightHitbox: SweptCollisionObject;
  private pathfindHitbox: SweptCollisionObject;

  private target: Entity = Game.instance.simulation.player;

  private currentPath: OptimalPath;
  private currentWaypoint: number

  private _moveDirection: Vector2 = new Vector2();
  private _faceDirection: Vector2 = new Vector2();
  private _targetInSight: boolean = false;
  private _targetDistance: number;

  constructor(private subject: Entity, private approachRange: number) {
    this.lineOfSightHitbox = new Point(new Vector2()).sweep();
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
    return this.target !== null && this._targetInSight && this._targetDistance <= this.approachRange;
  }

  public update(): void {
    if (!this.target) {
      // do random walking stuff

      return;
    }

    const directPath = this.target.position.subtract(this.subject.position);

    this.lineOfSightHitbox.setTransformation(this.target.position, directPath.angle());
    this.lineOfSightHitbox.sweepVertices(directPath.magnitude());
    this._targetInSight = !Game.instance.chunkManager.restrictionQuery(this.lineOfSightHitbox);
    this._targetDistance = directPath.magnitude();

    if (this._targetDistance <= this.approachRange) {
      this._moveDirection = new Vector2();
      this._faceDirection = directPath.unit();

      return;
    }

    if (this._targetInSight) {
      this._moveDirection = this._faceDirection = directPath.unit();

      return;
    }

    if (!this.recomputeTimer.isActive() && (!this.currentPath || this.currentPath.getGoal().distance(this.target.position) > this.recomputeDist)) {
      this.recomputeTimer.start();

      this.currentPath = new OptimalPath(this.subject.position, this.target.position, 4, this.approachRange, this.pathfindHitbox);
      this.currentPath.computePath();
      this.currentWaypoint = 1;
    }

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

    this._moveDirection = new Vector2();
  }
}