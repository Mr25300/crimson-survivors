import {Matrix4} from '../util/matrix4.js';
import {Vector2} from '../util/vector2.js';

export class CollisionHandler {
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
}

export class HitObject {
  public visualize() {
    
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
    return Matrix4.fromTransformation(undefined, this.rotation).multiply(new Vector2(0, 1));
  }

  public getVertices(): Vector2[] {
    const rotMatrix: Matrix4 = Matrix4.fromTransformation(undefined, this.rotation);
    const ends = [new Vector2(-this.length/2), new Vector2(this.length/2)];

    for (let i = 0; i < 2; i++) {
      ends[i] = rotMatrix.multiply(ends[i]).add(this.position);
    }

    return ends;
  }

  public checkPolyCollision(poly: Polygon): [boolean, number] {
    const rotMatrix: Matrix4 = Matrix4.fromTransformation(undefined, -this.rotation);

    const corners: Vector2[] = poly.getVertices();

    let cornerIndex: number = 0;

    for (let i = 0; i < corners.length; i++) {
      const relativeCorner: Vector2 = rotMatrix.multiply(corners[i].subtract(this.position));

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

export class Polygon {
  constructor(
    private position: Vector2,
    private rotation: number,
    private vertices: Vector2[]
  ) {}

  public static fromRect(position: Vector2, rotation: number, width: number, height: number): Polygon {
    const vertices = [
      new Vector2(-width/2, -height/2),
      new Vector2(-width/2, height/2),
      new Vector2(width/2, height/2),
      new Vector2(width/2, -height/2)
    ];

    return new Polygon(position, rotation, vertices);
  }

  public setTransformation(position: Vector2, rotation: number) {
    this.position = position;
    this.rotation = rotation;
  }

  public getVertices(): Vector2[] {
    const transformation = Matrix4.fromTransformation(this.position, this.rotation);
    const vertices: Vector2[] = [];

    for (let i = 0; i < this.vertices.length; i++) {
      vertices[i] = transformation.multiply(this.vertices[i]);
    }

    return vertices;
  }

  public getBounds(): Rectangle {
    const vertices = this.getVertices();

    let min = new Vector2(Infinity, Infinity);
    let max = new Vector2(-Infinity, -Infinity);

    for (const vertex of vertices) {
      if (vertex.x < min.x) min = new Vector2(vertex.x, min.y);
      if (vertex.x > max.x) max = new Vector2(vertex.x, min.y);
      if (vertex.y < min.y) min = new Vector2(min.x, vertex.y);
      if (vertex.y > max.y) max = new Vector2(max.x, vertex.y);
    }

    return new Rectangle(min, max);
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
}