import { Game } from '../core/game.js';
import { Matrix3 } from '../util/matrix3.js';
import { Util } from '../util/util.js';
import { Vector2 } from '../util/vector2.js';

export class CollisionObject {
  private _transformedVertices: Vector2[] = [];
  private _normals: Vector2[] = [];
  private _bounds: Bounds;
  protected verticesOutdated: boolean = true;
  protected normalsOutdated: boolean = true;
  protected boundsOutdated: boolean = true;

  private showingOnce: boolean = false;
  private vertexBuffer: WebGLBuffer | null = null;
  private _vertexCount: number;

  constructor(
    protected vertices: Vector2[],
    protected radius: number = 0,
    protected _position: Vector2 = new Vector2(),
    protected _rotation: number = 0
  ) {}

  public get position(): Vector2 {
    return this._position;
  }

  public get rotation(): number {
    return this._rotation;
  }

  public setTransformation(position: Vector2, rotation: number) {
    this._position = position;
    this._rotation = rotation;

    this.verticesOutdated = true;
    this.normalsOutdated = true;
    this.boundsOutdated = true;
  }

  public getTransformedVertices(): Vector2[] {
    if (this.verticesOutdated) {
      const matrix = Matrix3.fromTransformation(this._position, this._rotation);

      for (let i = 0; i < this.vertices.length; i++) {
        this._transformedVertices[i] = matrix.apply(this.vertices[i]);
      }

      this.verticesOutdated = false;
    }

    return this._transformedVertices;
  }

  public getNormals(reference: CollisionObject): Vector2[] {
    const radialNormals: Vector2[] = [];
    
    if (this.normalsOutdated) {
      if (this.vertices.length > 1) {
        const vertices: Vector2[] = this.getTransformedVertices();

        for (let i = 0; i < vertices.length; i++) {
          const vertex1 = vertices[i];
          const vertex2 = vertices[(i + 1) % vertices.length];
          const edge = vertex2.subtract(vertex1);
          const normal = edge.perp().unit();
  
          this._normals[i] = normal;
        }
      }

      this.normalsOutdated = false;
    }

    if (this.radius > 0) {
      for (const vertex of this.getTransformedVertices()) {
        const closestRefVertex = reference.getClosestVertex(vertex);
        const directionAxis = vertex.subtract(closestRefVertex).unit();

        radialNormals.push(directionAxis);
      }
    }

    return [...this._normals, ...radialNormals];
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

  public getBounds(): Bounds {
    if (this.boundsOutdated) {
      const [minX, maxX] = this.getProjectedRange(new Vector2(1, 0));
      const [minY, maxY] = this.getProjectedRange(new Vector2(0, 1));

      this._bounds = new Bounds(new Vector2(minX, minY), new Vector2(maxX, maxY));
      this.boundsOutdated = false;
    }

    return this._bounds;
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

  public getRadialBound(): number {
    let maxRadius: number = -Infinity;

    for (const vertex of this.vertices) {
      const distance = vertex.magnitude();

      if (distance > maxRadius) maxRadius = distance;
    }

    return maxRadius + this.radius;
  }

  public intersects(object: CollisionObject): [boolean, Vector2, number] {
    const normals1: Vector2[] = this.getNormals(object);
    const normals2: Vector2[] = object.getNormals(this);
    const existingAxes: Set<number> = new Set();

    let overlap: number = Infinity;
    let normal: Vector2 = new Vector2();

    // loop through axes and check dot product between them, and get rid of duplicates which have a dot of 1 or -1
    for (const axis of [...normals1, ...normals2]) {
      const cantorKey: number = Util.cantor(axis);
      const oppositeKey: number = Util.cantor(axis.multiply(-1));

      if (existingAxes.has(cantorKey) || existingAxes.has(oppositeKey)) continue;

      existingAxes.add(cantorKey);

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

  private getRenderingVertices(circleResolution: number = 30): Vector2[] {
    const renderingVertices: Vector2[] = [];

    for (let i = 0; i < this.vertices.length; i++) {
      const vertex = this.vertices[i];
      const nextVertex = this.vertices[(i + 1) % this.vertices.length];

      if (this.radius > 0) {
        const prevIndex = i == 0 ? this.vertices.length - 1 : i - 1;
        const prevVertex = this.vertices[prevIndex];

        let startAngle = vertex.subtract(prevVertex).angle() - Math.PI / 2;
        let endAngle = nextVertex.subtract(vertex).angle() - Math.PI / 2;

        if (endAngle < startAngle) endAngle += 2 * Math.PI;

        if (this.vertices.length === 1) {
          startAngle = 0;
          endAngle = 2 * Math.PI;
        }

        let resolutionLoops = Math.ceil(circleResolution * (endAngle - startAngle) / (Math.PI * 2));

        if (this.vertices.length === 1) resolutionLoops -= 1;

        for (let j = 0; j < resolutionLoops; j++) {
          const angle = startAngle + (endAngle - startAngle) * j / (resolutionLoops - 1);
          const offset = Vector2.fromAngle(angle).multiply(this.radius);

          renderingVertices.push(vertex.add(offset));
        }

      } else {
        renderingVertices.push(vertex);
      }
    }

    return renderingVertices;
  }

  public show(once?: boolean, circleResolution?: number): void {
    if (once) this.showingOnce = true;

    if (!this.vertexBuffer) {
      const vertices: Vector2[] = this.getRenderingVertices(circleResolution);
      const vertexArray: Float32Array = new Float32Array(vertices.length * 2);

      for (let i = 0; i < vertices.length; i++) {
        const vertex: Vector2 = vertices[i];

        vertexArray[i * 2] = vertex.x;
        vertexArray[i * 2 + 1] = vertex.y;
      }

      this.vertexBuffer = Game.instance.canvas.createBuffer(vertexArray);
      this._vertexCount = vertices.length;
    }

    Game.instance.collisionObjects.add(this);
  }

  public hide(): void {
    Game.instance.collisionObjects.delete(this);
  }

  public get vertexCount(): number {
    return this._vertexCount;
  }

  public bind(): void {
    if (!this.vertexBuffer) return;

    Game.instance.canvas.shader.setAttribBuffer("vertexPos", this.vertexBuffer, 2, 0, 0);
    Game.instance.canvas.shader.setUniformMatrix("modelTransform", Matrix3.fromTransformation(this.position, this.rotation));

    if (this.showingOnce) {
      this.destroyBuffer();
    }
  }

  public destroyBuffer(): void {
    this.hide();

    if (this.vertexBuffer) {
      Game.instance.canvas.deleteBuffer(this.vertexBuffer);

      this.vertexBuffer = null;
    }
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

    this.verticesOutdated = true;
    this.normalsOutdated = true;
    this.boundsOutdated = true;
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
}

export class Rectangle extends CollisionObject {
  constructor(
    width: number,
    height: number,
    offset: Vector2 = new Vector2(),
    position?: Vector2,
    rotation?: number
  ) {
    super([
      new Vector2(-width / 2, -height / 2).add(offset),
      new Vector2(-width / 2, height / 2).add(offset),
      new Vector2(width / 2, height / 2).add(offset),
      new Vector2(width / 2, -height / 2).add(offset)

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

export class Line extends CollisionObject {
  constructor(start: Vector2, end: Vector2) {
    const center = start.add(end).divide(2);
    const direction = end.subtract(start);
    const length = direction.magnitude();

    super([
      new Vector2(0, -length / 2),
      new Vector2(0, length / 2)

    ], 0, center, direction.angle());
  }
}

export class Point extends CollisionObject {
  constructor(
    position: Vector2
  ) {
    super([new Vector2()], 0, position, 0);
  }
}

export class Bounds {
  constructor(
    private _min: Vector2,
    private _max: Vector2
  ) { }

  public get min(): Vector2 {
    return this._min;
  }

  public get max(): Vector2 {
    return this._max;
  }

  public getDimensions(): Vector2 {
    return this._max.subtract(this._min);
  }

  public overlaps(bounds: Bounds): boolean {
    const xOverlap = this._max.x > bounds._min.x && this._min.x < bounds._max.x;
    const yOverlap = this._max.y > bounds._min.y && this._min.y < bounds._max.y;
    
    return xOverlap && yOverlap;
  }

  public getInnerOverlap(innerRect: Bounds): Vector2 {
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