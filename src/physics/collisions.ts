import { Game } from '../core/game.js';
import { Entity } from '../objects/entity.js';
import { GameObject } from '../objects/gameobject.js';
import {Matrix4} from '../util/matrix4.js';
import {Vector2} from '../util/vector2.js';

export class CollisionHandler {
  public static getEntityAttackList(attacker: Entity, attackShape: Polygon): GameObject[] {
    const entities: Entity[] = [];

    for (const object of Game.instance.gameObjects) {
      if (object.name === "Entity") {
        const entity: Entity = object as Entity;

        if (attacker.team === entity.team) continue;

        entities.push(entity);
      }
    }

    return entities;
  }

  public static getNormals(vertices: Vector2[]): Vector2[] {
    const normals: Vector2[] = [];

    for (let i = 0; i < vertices.length; i++) {
      const vertex1 = vertices[i];
      const vertex2 = vertices[(i + 1) % vertices.length];
      const edgeParallel = vertex2.subtract(vertex1).unit();
      const edgePerpendicular = new Vector2(-edgeParallel.y, edgeParallel.x);

      normals.push(edgePerpendicular);
    }

    return normals;
  }

  public static getProjectedRange(vertices: Vector2[], axis: Vector2): [number, number] {
    let min = Infinity;
    let max = -Infinity;

    for (const vertex of vertices) {
      const dot = vertex.dot(axis);

      min = Math.min(min, dot);
      max = Math.max(max, dot);
    }

    return [min, max];
  }

  public static polygonIntersection(poly1: Polygon, poly2: Polygon): boolean {
    const vertices1 = poly1.getVertices();
    const vertices2 = poly2.getVertices();

    const axes = [...CollisionHandler.getNormals(vertices1), ...CollisionHandler.getNormals(vertices2)];

    for (const axis of axes) {
      const [min1, max1] = CollisionHandler.getProjectedRange(vertices1, axis);
      const [min2, max2] = CollisionHandler.getProjectedRange(vertices2, axis);

      if (min2 > max1 || min1 > max2) {
        return false;
      }
    }

    return true;
  }

  public static linesIntersect(line1: Line, line2: Line): boolean {
    const [a, b] = [line1.start, line1.end];
    const [c, d] = [line2.start, line2.end];

    // Line direction vectors
    const dir1 = b.subtract(a);
    const dir2 = d.subtract(c);

    // Determinant
    const det = dir1.x * dir2.y - dir1.y * dir2.x;

    if (det === 0) return false; // Parallel or collinear

    // Compute t and u
    const t = ((c.x - a.x) * dir2.y - (c.y - a.y) * dir2.x) / det;
    const u = ((c.x - a.x) * dir1.y - (c.y - a.y) * dir1.x) / det;

    // Check if intersection occurs within both segments
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  }
}

export abstract class CollisionObject {
  public abstract objectType: string;

  public show() {
    Game.instance.collisionObjects.add(this);
    // add to array in game to render hitboxes
  }

  public hide() {
    Game.instance.collisionObjects.delete(this);
  }
}

export class HitLine {
  constructor(
    private position: Vector2,
    private rotation: number,
    private length: number
  ) {}

  static fromStartAndEnd(start: Vector2, end: Vector2): HitLine {
    const midPoint: Vector2 = start.add(end).divide(2);
    const difference: Vector2 = start.subtract(end);

    return new HitLine(midPoint, difference.angle() + Math.PI/2, difference.magnitude());
  }

  public getNormal(): Vector2 {
    return Matrix4.fromRotation(this.rotation).apply(new Vector2(0, 1));
  }

  public getVertices(): Vector2[] {
    const rotMatrix: Matrix4 = Matrix4.fromTransformation(this.position, this.rotation);
    const ends = [new Vector2(-this.length/2), new Vector2(this.length/2)];

    for (let i = 0; i < 2; i++) {
      ends[i] = rotMatrix.apply(ends[i]);
    }

    return ends;
  }

  public checkPolyCollision(poly: Polygon): [boolean, number] {
    const rotMatrix: Matrix4 = Matrix4.fromTransformation(undefined, -this.rotation);

    const corners: Vector2[] = poly.getVertices();

    let cornerIndex: number = 0;

    for (let i = 0; i < corners.length; i++) {
      const relativeCorner: Vector2 = rotMatrix.apply(corners[i].subtract(this.position));

      corners[i] = relativeCorner;

      if (i === 0) continue;

      const lastY = corners[cornerIndex].y;

      if (relativeCorner.y < lastY || (relativeCorner.y == lastY && Math.abs(relativeCorner.x) <= this.length/2)) {
        cornerIndex = i;
      }
    }

    const bottomMost = corners[cornerIndex];

    if (bottomMost.y <= 0) {
      if (Math.abs(bottomMost.x) <= this.length/2) {
        return [true, -bottomMost.y];

      } else {
        let cornerX = Math.min(Math.max(bottomMost.x, -this.length/2), this.length/2);
        let adjIndex = cornerIndex;

        if (cornerX < 0) adjIndex--;
        else adjIndex = (adjIndex + 1) % corners.length;
        if (adjIndex < 0) adjIndex += corners.length;

        const adjCorner = corners[adjIndex];

        if (Math.abs(adjCorner.x) <= this.length/2) {
          const m = (bottomMost.y - adjCorner.y) / (bottomMost.x - adjCorner.x);
          const b = bottomMost.y - m * bottomMost.x;
          const cornerY = m * cornerX + b;

          if (cornerY <= 0) return [true, -cornerY];
        }
      }
    }

    return [false, 0];
  }
}

export class Polygon extends CollisionObject {
  public objectType: string = "Polygon";

  constructor(
    private vertices: Vector2[],
    private position: Vector2 = new Vector2(),
    private rotation: number = 0
  ) {
    super();
  }

  public static fromRect(position: Vector2, rotation: number, width: number, height: number): Polygon {
    const vertices = [
      new Vector2(-width/2, -height/2),
      new Vector2(-width/2, height/2),
      new Vector2(width/2, height/2),
      new Vector2(width/2, -height/2)
    ];

    return new Polygon(vertices, position, rotation);
  }

  public setTransformation(position: Vector2, rotation: number) {
    this.position = position;
    this.rotation = rotation;
  }

  public getVertices(): Vector2[] {
    const matrix = Matrix4.fromTransformation(this.position, this.rotation);
    const vertices: Vector2[] = [];

    for (let i = 0; i < this.vertices.length; i++) {
      vertices[i] = matrix.apply(this.vertices[i]);
    }

    return vertices;
  }

  public getBounds(): Rectangle {
    const vertices = this.getVertices();

    let min = new Vector2(Infinity, Infinity);
    let max = new Vector2(-Infinity, -Infinity);

    for (const vertex of vertices) {
      if (vertex.x < min.x) min = new Vector2(vertex.x, min.y);
      if (vertex.x > max.x) max = new Vector2(vertex.x, max.y);
      if (vertex.y < min.y) min = new Vector2(min.x, vertex.y);
      if (vertex.y > max.y) max = new Vector2(max.x, vertex.y);
    }

    return new Rectangle(min, max);
  }
}

export class Line {
  constructor(
    private _start: Vector2,
    private _end: Vector2
  ) {}

  public get start(): Vector2 {
    return this._start;
  }

  public get end(): Vector2 {
    return this._end;
  }

  public intersects(line: Line): boolean {
    const [a, b] = [this._start, this._end];
    const [c, d] = [line._start, line._end];

    // Line direction vectors
    const dir1 = b.subtract(a);
    const dir2 = d.subtract(c);

    // Determinant
    const det = dir1.x * dir2.y - dir1.y * dir2.x;

    if (det === 0) return false; // Parallel or collinear

    // Compute t and u
    const t = ((c.x - a.x) * dir2.y - (c.y - a.y) * dir2.x) / det;
    const u = ((c.x - a.x) * dir1.y - (c.y - a.y) * dir1.x) / det;

    // Check if intersection occurs within both segments
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  }
}

export class Rectangle {
  constructor(
    private _min: Vector2,
    private _max: Vector2
  ) {}

  public get min(): Vector2 {
    return this._min;
  }

  public get max(): Vector2 {
    return this._max;
  }

  public getVertices(): Vector2[] {
    return [
      this._min,
      new Vector2(this._min.x, this._max.y),
      this._max,
      new Vector2(this._max.x, this._min.x)
    ];
  }

  public containsPoint(point: Vector2) {
    return point.x >= this._min.x && point.x <= this._min.x && point.y >= this._min.y && point.y <= this._max.y;
  }

  public simpleContainCheck(polygon: Polygon): boolean {
    const vertices = polygon.getVertices();

    for (const vertex of vertices) {
      if (this.containsPoint(vertex)) return true;
    }

    return false;
  }

  public containsPolygon(polygon: Polygon): boolean {
    const vertices = polygon.getVertices();

    for (const vertex of vertices) {
      if (this.containsPoint(vertex)) return true;
    }

    const rectVertices = this.getVertices();

    for (let i = 0; i < 4; i++) {
      const corner1 = rectVertices[i];
      const corner2 = rectVertices[(i + 1) % 4];
      const rectEdge: Line = new Line(corner1, corner2);

      for (let i = 0; i < vertices.length; i++) {
        const vertex1: Vector2 = vertices[i];
        const vertex2: Vector2 = vertices[(i + 1) % vertices.length];
        const line: Line = new Line(vertex1, vertex2);
  
        if (line.intersects(rectEdge)) return true;
      }
    }

    return false;
  }

  public getInnerRectOverlap(innerRect: Rectangle): Vector2 {
    let overlap: Vector2 = new Vector2();

    const minDiff = innerRect._min.subtract(this._min);
    const maxDiff = innerRect._max.subtract(this._max);

    if (minDiff.x < 0) overlap = overlap.add(new Vector2(minDiff.x, 0));
    if (maxDiff.x > 0) overlap = overlap.add(new Vector2(maxDiff.x, 0));
    if (minDiff.y < 0) overlap = overlap.add(new Vector2(0, minDiff.y));
    if (maxDiff.y > 0) overlap = overlap.add(new Vector2(0, maxDiff.y));

    return overlap;
  }
}