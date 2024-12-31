import { Game } from "../core/game.js";
import { Entity } from "../objects/entity.js";
import { Structure } from "../objects/structure.js";
import { Util } from "../util/util.js";
import { Vector2 } from "../util/vector2.js";
import { Circle, CollisionObject, Line, Polygon, Rectangle, SweptCollisionObject } from "./collisions.js";

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

  private radialHitbox: SweptCollisionObject;

  constructor(start: Vector2, end: Vector2, radialSpace: number) {
    this.gridStart = start.divide(this.gridScale).round();
    this.gridGoal = end.divide(this.gridScale).round();

    this.radialHitbox = new Circle(radialSpace).sweep();
  }

  public getKey(position: Vector2): number {
    return Util.cantor(position);
  }

  public processNode(node: Node) {
    this.processed.set(this.getKey(node.position), node);
  }

  public getProcessed(position: Vector2): Node | undefined {
    return this.processed.get(this.getKey(position));
  }

  public computePath(): Vector2[] | void {
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

      if (node.hCost < 0.01) {
        return this.backtrackWaypoints(node);
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
      this.radialHitbox.setTransformation(neighborPos.multiply(this.gridScale), direction.angle());
      this.radialHitbox.sweepVertices(direction.magnitude() * this.gridScale);

      const structureQuery: [Structure, Vector2, number][] = Game.instance.chunkManager.queryObjectsWithHitbox(this.radialHitbox, "Structure") as [Structure, Vector2, number][];
      let structureInWay: boolean = structureQuery.some(([, , overlap]) => overlap > 0);

      const hCost = neighborPos.distance(this.gridGoal);
      const neighborNode = new Node(neighborPos, gCost, hCost, structureInWay, node);

      this.processNode(neighborNode);

      if (!neighborNode.restricted) this.openSet.push(neighborNode);
    }
  }

  public backtrackWaypoints(endNode: Node): Vector2[] {
    let current: Node = endNode;
    let lastWaypoint: Vector2 = current.position;

    const waypoints: Vector2[] = [lastWaypoint.multiply(this.gridScale)];

    while (current.parent) {
      const prev = current;

      current = current.parent;

      const difference = lastWaypoint.subtract(current.position);

      this.radialHitbox.setTransformation(lastWaypoint.multiply(this.gridScale), difference.angle());
      this.radialHitbox.sweepVertices(difference.magnitude() * this.gridScale);

      const structureQuery: [Structure, Vector2, number][] = Game.instance.chunkManager.queryObjectsWithHitbox(this.radialHitbox, "Structure") as [Structure, Vector2, number][];
      let structureInWay: boolean = structureQuery.some(([, , overlap]) => overlap > 0);

      if (structureInWay) {
        lastWaypoint = prev.position;

        waypoints.push(lastWaypoint.multiply(this.gridScale));
      }
    }

    return waypoints;
  }
}

export class Pathfinder {
  private recomputeDistance: number = 2;

  private radialBound: number;
  private radialHitbox: SweptCollisionObject;

  private target: Vector2;
  private waypoints: Vector2[] | null = null;
  
  private polies: CollisionObject[] = [];

  constructor(private subject: Entity) {
    this.radialBound = 0.25;//subject.hitbox.getRadialBound();
    this.radialHitbox = new Circle(this.radialBound).sweep();
  }

  public setTarget(position: Vector2) {
    this.target = position;
  }

  public getDirection(): Vector2 {
    const directPath = this.target.subtract(this.subject.position);

    this.radialHitbox.setTransformation(this.target, directPath.angle());
    this.radialHitbox.sweepVertices(directPath.magnitude());

    const structureQuery: [Structure, Vector2, number][] = Game.instance.chunkManager.queryObjectsWithHitbox(this.radialHitbox, "Structure") as [Structure, Vector2, number][];
    let structureInWay: boolean = structureQuery.some(([, , overlap]) => overlap > 0);

    if (!structureInWay) return directPath.unit();

    if (!this.waypoints || this.target.distance(this.waypoints[0]) >= this.recomputeDistance) {
      const path = new OptimalPath(this.subject.position, this.target, 0.5);
      const waypoints = path.computePath();

      this.waypoints = waypoints || [];

      if (waypoints) {
        const stuff = [...waypoints, this.subject.position];

        for (let i = 0; i < stuff.length - 1; i++) {
          const shape = new Polygon([stuff[i], stuff[i + 1]]);
          shape.show();
          this.polies.push(shape);
        }

      } else {
        for (const poly of this.polies) {
          poly.destroy();
          poly.hide();
        }
        this.polies.length = 0;
      }
    }

    let current = this.waypoints[this.waypoints.length - 1];

    if (current && this.subject.position.distance(current) < this.radialBound) {
      this.waypoints.length--;
      
      current = this.waypoints[this.waypoints.length - 1];

      if (!current) this.waypoints = null;
    }

    if (current) return current.subtract(this.subject.position).unit();

    return new Vector2();
  }
}