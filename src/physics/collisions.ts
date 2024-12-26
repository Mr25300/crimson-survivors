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

  private vertexBuffer: WebGLBuffer;
  private _vertexCount: number;

  constructor(
    private type: string,
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

  public abstract getNormals(): Vector2[];
  public abstract getProjectedRange(axis: Vector2): [number, number];
  public abstract getCenter(): Vector2;

  public intersects(object: CollisionObject): [boolean, Vector2, number] {
    const normals1 = this.getNormals();
    const normals2 = object.getNormals();

    let overlap: number = Infinity;
    let normal: Vector2 = new Vector2();

    for (const axis of [...normals2, ...normals1]) {
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

  public hide(): void {
    Game.instance.collisionObjects.delete(this);
  }

  public bind(): void {
    Game.instance.canvas.shader.setAttribBuffer("vertexPos", this.vertexBuffer, 2, 0, 0);
    Game.instance.canvas.shader.setUniformMatrix4("modelTransform", Matrix4.fromTransformation(this.position, this.rotation));
  }
}

export class Circle extends CollisionObject {
  // use direction of center of circle towards the nearest vertex as another axis to check for SAT
}

export class Polygon extends CollisionObject {
  private _transformedVertices: Vector2[] = [];

  constructor(
    private _vertices: Vector2[],
    position?: Vector2,
    rotation?: number
  ) {
    super(position, rotation);

    this.show();
  }

  public static fromRect(position: Vector2, rotation: number, width: number, height: number): Polygon {
    return new Polygon([
      new Vector2(-width/2, -height/2),
      new Vector2(-width/2, height/2),
      new Vector2(width/2, height/2),
      new Vector2(width/2, -height/2)

    ], position, rotation);
  }

  public get vertices(): Vector2[] {
    return this._vertices;
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

  public getNearestVertex(point: Vector2): Vector2 {

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

  public getAveragePosition(): Vector2 {
    const vertices = this.getTransformedVertices();
    let sum: Vector2 = new Vector2();

    for (const vertex of vertices) {
      sum = sum.add(vertex);
    }

    return sum.divide(vertices.length);
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

  public intersects(polygon: Polygon): [boolean, Vector2, number] {
    const normals1 = this.getNormals();
    const normals2 = polygon.getNormals();

    let overlap: number = Infinity;
    let normal: Vector2 = new Vector2();

    for (const axis of [...normals2, ...normals1]) {
      const [min1, max1] = this.getProjectedRange(axis);
      const [min2, max2] = polygon.getProjectedRange(axis);

      if (min2 > max1 || min1 > max2) return [false, new Vector2(), 0];

      const axisOverlap = Math.min(max2 - min1, max1 - min2);

      if (axisOverlap < overlap) {
        overlap = axisOverlap;
        normal = axis;
      }
    }

    const direction = this.getAveragePosition().subtract(polygon.getAveragePosition());
    if (direction.dot(normal) < 0) normal = normal.multiply(-1);

    return [true, normal, overlap];
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