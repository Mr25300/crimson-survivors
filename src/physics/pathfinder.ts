import { Game } from "../core/game.js";
import { Entity } from "../objects/entity.js";
import { Timer } from "../objects/timer.js";
import { Util } from "../util/util.js";
import { Vector2 } from "../util/vector2.js";
import { Point, SweptCollisionObject } from "./collisions.js";

class Node {
  constructor(
    public readonly position: Vector2,
    public gCost: number,
    public readonly hCost: number,
    public readonly restricted: boolean = false,
    public parent?: Node
  ) { }

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

  private openSet: Node[] = []; // try using minheap to optimize
  private processed: Map<number, Node> = new Map();

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
    this.openSet.push(new Node(this.gridStart, 0, this.gridStart.distance(this.gridGoal)));

    while (this.openSet.length > 0) {
      let nodeInd = 0;
      let node = this.openSet[0];

      for (let i = 1; i < this.openSet.length; i++) {
        const nextNode = this.openSet[i];

        if (node.compare(nextNode) > 0) {
          nodeInd = i;
          node = nextNode;
        }
      }

      this.openSet.splice(nodeInd, 1);
      this.processNode(node);

      // new Rectangle(this.gridScale, this.gridScale, undefined, node.position.multiply(this.gridScale)).show();

      if (node.hCost <= this.arriveRange / this.gridScale) {
        this.backtrackWaypoints(node);
      }

      for (const direction of this.neighborDirections) {
        this.travelToNeighbor(node, direction);
      }
    }
  }

  public travelToNeighbor(node: Node, direction: Vector2): void {
    const neighborPos = node.position.add(direction);
    const gCost: number = node.gCost + direction.magnitude();
    const existing = this.getProcessed(neighborPos);

    if (existing) {
      if (existing.restricted) return;

      if (gCost < existing.gCost) {
        existing.gCost = gCost;
        existing.parent = node;
      }

    } else {
      this.travelHitbox.setTransformation(neighborPos.multiply(this.gridScale), direction.angle());
      this.travelHitbox.sweepVertices(direction.magnitude() * this.gridScale);

      const neighborDistanceSum = neighborPos.distance(this.gridStart) + neighborPos.distance(this.gridGoal);
      const goalDistance = this.gridStart.distance(this.gridGoal);
      let restricted: boolean = neighborDistanceSum > goalDistance + 2 * this.searchRange / this.gridScale; // oval shape with min radius of searchrange around each oval focus

      if (!restricted) {
        const realPos = neighborPos.multiply(this.gridScale);

        // cut off for out of bounds
      }

      if (!restricted) {
        restricted = Game.instance.chunkManager.collisionQueryFromHitbox(this.travelHitbox, "Structure", true).length > 0;
      }

      const hCost = neighborPos.distance(this.gridGoal);
      const neighborNode = new Node(neighborPos, gCost, hCost, restricted, node);

      this.processNode(neighborNode);

      if (!neighborNode.restricted) this.openSet.push(neighborNode);
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

      if (Game.instance.chunkManager.collisionQueryFromHitbox(this.travelHitbox, "Structure", true).length > 0) {
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

  private target: Entity = Game.instance.player;

  private currentPath: OptimalPath;
  private currentWaypoint: number

  private _moveDirection: Vector2;
  private _faceDirection: Vector2;
  private _targetInSight: boolean = false;
  private _targetInRange: boolean = false;

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

  public get shouldAttack(): boolean {
    return this.target !== null && this._targetInSight && this.subject.position.distance(this.target.position) <= this.approachRange;
  }

  public update(): void {
    if (!this.target) {
      // do random walking stuff

      return;
    }

    const directPath = this.target.position.subtract(this.subject.position);

    if (directPath.magnitude() <= this.approachRange) {
      this._moveDirection = new Vector2();
      this._faceDirection = directPath.unit();

      return;
    }

    this.lineOfSightHitbox.setTransformation(this.target.position, directPath.angle());
    this.lineOfSightHitbox.sweepVertices(directPath.magnitude());

    if (Game.instance.chunkManager.collisionQueryFromHitbox(this.lineOfSightHitbox, "Structure", true).length === 0) {
      this._targetInSight = true;
      this._moveDirection = this._faceDirection = directPath.unit();

      return;

    } else {
      this._targetInSight = false;
    }

    if (!this.recomputeTimer.active && (!this.currentPath || this.currentPath.getGoal().distance(this.target.position) > this.recomputeDist)) {
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

    this._moveDirection = this._faceDirection = new Vector2();
  }
}