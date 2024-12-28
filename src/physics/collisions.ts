import { Game } from '../core/game.js';
import { Entity } from '../objects/entity.js';
import { GameObject } from '../objects/gameobject.js';
import { Structure } from '../objects/structure.js';
import {Matrix4} from '../util/matrix4.js';
import {Vector2} from '../util/vector2.js';

export class CollisionHandler {
  public static getCollidingStructures(polygon: Polygon): Structure[] {
    const structures: Structure[] = [];

    return structures;
  }

  public static getEntityAttackList(attacker: Entity, attackShape: Polygon): Entity[] {
    const entities: Entity[] = [];

    for (const object of Game.instance.gameObjects) {
      if (object.type === "Entity") {
        const entity: Entity = object as Entity;

        if (attacker.team === entity.team) continue;

        entities.push(entity);
      }
    }

    return entities;
  }
}

export abstract class CollisionObject {
  protected matrixOutdated: boolean = true;
  protected verticesOutdated: boolean = true;
  private _transformationMatrix: Matrix4;

  private showingOnce: boolean = false;
  private vertexBuffer: WebGLBuffer;
  private _vertexCount: number;

  constructor(
    public readonly type: string,
    protected position: Vector2 = new Vector2(),
    protected rotation: number = 0
  ) {}

  public setTransformation(position: Vector2, rotation: number) {
    this.position = position;
    this.rotation = rotation;
    this.matrixOutdated = true;
    this.verticesOutdated = true;
  }

  protected getTransformationMatrix(): Matrix4 {
    if (this.matrixOutdated) {
      this.matrixOutdated = false;

      this._transformationMatrix = Matrix4.fromTransformation(this.position, this.rotation);
    }

    return this._transformationMatrix;
  }

  public getBounds(): Rectangle {
    const [minX, maxX] = this.getProjectedRange(new Vector2(1, 0));
    const [minY, maxY] = this.getProjectedRange(new Vector2(0, 1));

    return new Rectangle(new Vector2(minX, minY), new Vector2(maxX, maxY));
  }

  public abstract getNormals(reference: CollisionObject): Vector2[];
  public abstract getProjectedRange(axis: Vector2): [number, number];
  public abstract getCenter(): Vector2;

  public intersects(object: CollisionObject): [boolean, Vector2, number] {
    const normals1 = this.getNormals(object);
    const normals2 = object.getNormals(this);

    let overlap: number = Infinity;
    let normal: Vector2 = new Vector2();

    // loop through axes and check dot product between them, and get rid of duplicates which have a dot of 1 or -1
    for (const axis of [...normals1, ...normals2]) {
      const [min1, max1] = this.getProjectedRange(axis);
      const [min2, max2] = object.getProjectedRange(axis);

      if (min2 > max1 || min1 > max2) return [false, new Vector2(), 0];

      const axisOverlap = Math.min(max2 - min1, max1 - min2);

      if (axisOverlap < overlap) {
        overlap = axisOverlap;
        normal = axis;
      }
    }

    const direction = this.getCenter().subtract(object.getCenter());
    if (direction.dot(normal) < 0) normal = normal.multiply(-1);

    return [true, normal, overlap];
  } 

  public abstract getVerticesForRendering(): Vector2[];

  public get vertexCount(): number {
    return this._vertexCount;
  }

  public show(): void {
    if (!this.vertexBuffer) {
      const vertices = this.getVerticesForRendering();
      const vertexArray = new Float32Array(vertices.length * 2);
  
      for (let i = 0; i < vertices.length; i++) {
        const vertex = vertices[i];
  
        vertexArray[i * 2] = vertex.x;
        vertexArray[i * 2 + 1] = vertex.y;
      }
  
      this.vertexBuffer = Game.instance.canvas.createBuffer(vertexArray);
      this._vertexCount = vertices.length;
    }

    Game.instance.collisionObjects.add(this);
  }

  public showOnce(): void {
    this.showingOnce = true;
    this.show();
  }

  public hide(): void {
    Game.instance.collisionObjects.delete(this);
  }

  public bind(): void {
    Game.instance.canvas.shader.setAttribBuffer("vertexPos", this.vertexBuffer, 2, 0, 0);
    Game.instance.canvas.shader.setUniformMatrix4("modelTransform", Matrix4.fromTransformation(this.position, this.rotation));

    if (this.showingOnce) this.destroy();
  }

  public destroy() {
    this.hide();

    Game.instance.canvas.deleteBuffer(this.vertexBuffer);
  }
}

export class Circle extends CollisionObject {
  constructor(
    private radius: number,
    private offset: Vector2,
    position?: Vector2,
    rotation?: number
  ) {
    super("Circle", position, rotation);
  }

  public getCenter(): Vector2 {
    return this.getTransformationMatrix().apply(this.offset);
  }

  public getNormals(reference: CollisionObject): Vector2[] {
    const normals: Vector2[] = [];

    if (reference.type === "Circle") {
      const circle: Circle = reference as Circle;

      normals.push(this.getCenter().subtract(circle.getCenter()));

    } else if (reference.type === "Polygon") {
      const poly: Polygon = reference as Polygon;

      normals.push(poly.getClosestVertex(this.getCenter()));
    }

    return normals;
  }

  public getProjectedRange(axis: Vector2): [number, number] {
    const dotPosition = this.getCenter().dot(axis);

    const min = dotPosition - this.radius;
    const max = dotPosition + this.radius;

    return [min, max];
  }

  public getVerticesForRendering(): Vector2[] {
    const resolution: number = 20;
    const vertices: Vector2[] = new Array(resolution);

    for (let i = 0; i < resolution; i++) {
      const angle = Math.PI * 2 * i / resolution;
      const circlePoint = Matrix4.fromRotation(angle).apply(new Vector2(0, 1));
      const vertex = circlePoint.add(this.offset);
    }

    return vertices;
  }
}

export class Polygon extends CollisionObject {
  private _transformedVertices: Vector2[] = [];

  constructor(
    private vertices: Vector2[],
    position?: Vector2,
    rotation?: number
  ) {
    super("Polygon", position, rotation);
  }

  public static fromRect(position: Vector2, rotation: number, width: number, height: number): Polygon {
    return new Polygon([
      new Vector2(-width/2, -height/2),
      new Vector2(-width/2, height/2),
      new Vector2(width/2, height/2),
      new Vector2(width/2, -height/2)

    ], position, rotation);
  }

  public getTransformedVertices(): Vector2[] {
    if (this.verticesOutdated) {
      for (let i = 0; i < this.vertices.length; i++) {
        this._transformedVertices[i] = this.getTransformationMatrix().apply(this.vertices[i]);
      }

      this.verticesOutdated = false;
    }

    return this._transformedVertices;
  }

  public getCenter(): Vector2 {
    const vertices = this.getTransformedVertices();
    let sum: Vector2 = new Vector2();

    for (const vertex of vertices) {
      sum = sum.add(vertex);
    }

    return sum.divide(vertices.length);
  }

  public getNormals(): Vector2[] {
    const vertices: Vector2[] = this.getTransformedVertices();
    const normals: Vector2[] = [];

    for (let i = 0; i < vertices.length; i++) {
      const vertex1 = vertices[i];
      const vertex2 = vertices[(i + 1) % vertices.length];
      const edge = vertex2.subtract(vertex1);
      const normal = edge.perp().unit();

      normals.push(normal);
    }

    return normals;
  }

  public getProjectedRange(axis: Vector2): [number, number] {
    let min = Infinity;
    let max = -Infinity;

    for (const vertex of this.getTransformedVertices()) {
      const dot = vertex.dot(axis);

      if (dot < min) min = dot;
      if (dot > max) max = dot;
    }

    return [min, max];
  }

  public getClosestVertex(point: Vector2): Vector2 {
    let minDistance: number = Infinity;
    let closestVertex: Vector2 = new Vector2();

    for (const vertex of this.getTransformedVertices()) {
      const distance: number = vertex.distance(point);

      if (distance < minDistance) {
        minDistance = distance;
        closestVertex = vertex;
      }
    }

    return closestVertex;
  }

  public getVerticesForRendering(): Vector2[] {
    return this.vertices;
  }

  // public intersects(polygon: Polygon): [boolean, Vector2, number] {
  //   const normals1 = this.getNormals();
  //   const normals2 = polygon.getNormals();

  //   let overlap: number = Infinity;
  //   let normal: Vector2 = new Vector2();

  //   for (const axis of [...normals2, ...normals1]) {
  //     const [min1, max1] = this.getProjectedRange(axis);
  //     const [min2, max2] = polygon.getProjectedRange(axis);

  //     if (min2 > max1 || min1 > max2) return [false, new Vector2(), 0];

  //     const axisOverlap = Math.min(max2 - min1, max1 - min2);

  //     if (axisOverlap < overlap) {
  //       overlap = axisOverlap;
  //       normal = axis;
  //     }
  //   }

  //   const direction = this.getCenter().subtract(polygon.getCenter());
  //   if (direction.dot(normal) < 0) normal = normal.multiply(-1);

  //   return [true, normal, overlap];
  // }
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

  public getRotation(): number {
    return this._end.subtract(this._start).angle();
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

  public intersectsPolygon(polygon: Polygon): boolean {
    const vertices = polygon.getTransformedVertices();

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

    for (let i = 0; i < vertices.length; i++) {
      const vertex1: Vector2 = vertices[i];
      const vertex2: Vector2 = vertices[(i + 1) % vertices.length];
      const polyEdge: Line = new Line(vertex1, vertex2);

      for (let i = 0; i < 4; i++) {
        const corner1 = rectVertices[i];
        const corner2 = rectVertices[(i + 1) % 4];
        const rectEdge: Line = new Line(corner1, corner2);
  
        if (polyEdge.intersects(rectEdge)) return true;

        if (i === 0) {
          const linePos = corner1.add(corner2).divide(2);
          const rotMatrix = Matrix4.fromRotation(polyEdge.getRotation())
          const relCorner = rotMatrix.apply(corner1.subtract(linePos));

          if (relCorner.y <= 0) return true;
        }
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