import { Game } from '../core/game.js';
import { Entity } from '../objects/entity.js';
import { GameObject } from '../objects/gameobject.js';
import { Structure } from '../objects/structure.js';
import {Matrix4} from '../util/matrix4.js';
import {Vector2} from '../util/vector2.js';

export abstract class CollisionObject {
  private transformedVertices: Vector2[] = [];

  private showingOnce: boolean = false;
  private vertexBuffer: WebGLBuffer;
  private _vertexCount: number;

  constructor(
    protected vertices: Vector2[],
    protected radius: number = 0,
    protected position: Vector2 = new Vector2(),
    protected rotation: number = 0
  ) {}

  public setTransformation(position: Vector2, rotation: number) {
    this.position = position;
    this.rotation = rotation;
  }

  protected getTransformationMatrix(): Matrix4 {
    return Matrix4.fromTransformation(this.position, this.rotation);
  }

  public getTransformedVertices(): Vector2[] {
    const matrix = this.getTransformationMatrix();
    const transformedVertices: Vector2[] = [];

    for (let i = 0; i < this.vertices.length; i++) {
      transformedVertices[i] = matrix.apply(this.vertices[i]);
    }

    return transformedVertices;
  }

  public getNormals(reference: CollisionObject): Vector2[] {
    const vertices: Vector2[] = this.getTransformedVertices();
    const normals: Vector2[] = [];

    for (let i = 0; i < vertices.length; i++) {
      const vertex1 = vertices[i];

      if (vertices.length > 1) {
        const vertex2 = vertices[(i + 1) % vertices.length];
        const edge = vertex2.subtract(vertex1);
        const normal = edge.perp().unit();
  
        normals.push(normal);
      }

      if (this.radius > 0) {
        const closestRefVertex = reference.getClosestVertex(vertex1);
        const directionAxis = vertex1.subtract(closestRefVertex).unit();

        normals.push(directionAxis);
      }
    }

    return normals;
  }

  public getProjectedRange(axis: Vector2): [number, number] {
    let min = Infinity;
    let max = -Infinity;

    for (const vertex of this.getTransformedVertices()) {
      const dot = vertex.dot(axis);
      const dotMin = dot - this.radius;
      const dotMax = dot + this.radius;

      if (dotMin < min) min = dotMin;
      if (dotMax > max) max = dotMax;
    }

    return [min, max];
  }

  public getBounds(): Rectangle {
    const [minX, maxX] = this.getProjectedRange(new Vector2(1, 0));
    const [minY, maxY] = this.getProjectedRange(new Vector2(0, 1));

    return new Rectangle(new Vector2(minX, minY), new Vector2(maxX, maxY));
  }

  public getCenter(): Vector2 {
    const vertices = this.getTransformedVertices();
    let sum: Vector2 = new Vector2();

    for (const vertex of vertices) {
      sum = sum.add(vertex);
    }

    return sum.divide(vertices.length);
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

  public intersects(object: CollisionObject): [boolean, Vector2, number] {
    const normals1: Vector2[] = this.getNormals(object);
    const normals2: Vector2[] = object.getNormals(this);
    const existingAxes: Vector2[] = [];

    let overlap: number = Infinity;
    let normal: Vector2 = new Vector2();

    // loop through axes and check dot product between them, and get rid of duplicates which have a dot of 1 or -1
    for (const axis of [...normals1, ...normals2]) {
      // const existing: boolean = existingAxes.some((otherAxis: Vector2) => {
      //   return Math.abs(axis.dot(otherAxis)) === 1;
      // });

      // if (existing) continue;

      // existingAxes.push(axis);

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

  public sweep(length?: number): SweptCollisionObject {
    let minWidth: number = Infinity;
    let maxWidth: number = -Infinity;
    let minIndex: number = 0;
    let maxIndex: number = 0;

    const startVertices: Vector2[] = [];
    const endVertices: Vector2[] = [];

    for (let i = 0; i < this.vertices.length; i++) {
      const vertex = this.vertices[i];
      const width = vertex.dot(new Vector2(1, 0));

      if (width < minWidth) {
        minWidth = width;
        minIndex = i;
      }

      if (width > maxWidth) {
        maxWidth = width;
        maxIndex = i;
      }
    }

    let startIndex: number = maxIndex;
    let endIndex: number = minIndex;

    while (true) {
      startVertices.push(this.vertices[startIndex]);
      
      if (startIndex === minIndex) break;
      startIndex = (startIndex + 1) % this.vertices.length;
    }

    while (true) {
      endVertices.push(this.vertices[endIndex]);

      if (endIndex === maxIndex) break;
      endIndex = (endIndex + 1) % this.vertices.length;
    }

    return new SweptCollisionObject(startVertices, endVertices, this.radius, length, this.position, this.rotation);
  }

  public getVerticesForRendering(): Vector2[] {
    return this.vertices;
  }

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
    Game.instance.canvas.shader.setUniformMatrix("modelTransform", Matrix4.fromTransformation(this.position, this.rotation));

    if (this.showingOnce) this.destroy();
  }

  public destroy() {
    this.hide();

    Game.instance.canvas.deleteBuffer(this.vertexBuffer);
  }
}

export class SweptCollisionObject extends CollisionObject {
  constructor(
    private startVertices: Vector2[],
    endVertices: Vector2[],
    radius?: number,
    length: number = 0,
    position?: Vector2,
    rotation?: number
  ) {
    super([], radius, position, rotation);

    for (let i = 0; i < endVertices.length; i++) {
      this.vertices[startVertices.length + i] = endVertices[i];
    }

    this.sweepVertices(length);
  }

  public sweepVertices(length: number): void {
    for (let i = 0; i < this.startVertices.length; i++) {
      this.vertices[i] = this.startVertices[i].subtract(new Vector2(0, length));
    }
  }
}

export class Polygon extends CollisionObject {
  constructor(
    vertices: Vector2[],
    position?: Vector2,
    rotation?: number
  ) {
    super(vertices, 0, position, rotation);
  }

  public static fromRect(width: number, height: number, offset: Vector2 = new Vector2(), position?: Vector2, rotation?: number): Polygon {
    return new Polygon([
      new Vector2(-width/2, -height/2).add(offset),
      new Vector2(-width/2, height/2).add(offset),
      new Vector2(width/2, height/2).add(offset),
      new Vector2(width/2, -height/2).add(offset)

    ], position, rotation);
  }
}

export class RectangleTest extends CollisionObject {
  constructor(
    width: number,
    height: number,
    offset: Vector2 = new Vector2(),
    position?: Vector2,
    rotation?: number
  ) {
    super([
      new Vector2(-width/2, -height/2).add(offset),
      new Vector2(-width/2, height/2).add(offset),
      new Vector2(width/2, height/2).add(offset),
      new Vector2(width/2, -height/2).add(offset)

    ], 0, position, rotation);
  }
}

export class Circle extends CollisionObject {
  constructor(
    radius: number,
    offset: Vector2 = new Vector2(),
    position?: Vector2,
    rotation?: number
  ) {
    super([offset], radius, position, rotation);
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