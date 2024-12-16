import {Matrix4} from '../util/matrix4.js';
import {Vector2} from '../util/vector2.js';

export class HitRay {
  constructor(
    public position: Vector2,
    public direction: Vector2
  ) {}

  public getRadIntersection(circle: HitCircle): [boolean, Vector2?, Vector2?] {
    const relativeRay: Vector2 = this.position.subtract(circle.position);

    const lineM: number = this.direction.y / this.direction.x; // slope of line
    const lineB: number = relativeRay.y - relativeRay.x * lineM; // vertical translation of line

    // (mx + b)^2 = r^2 - x^2 --> 0 = (m^2 + 1)x^2 + (2mb)x + (b^2 - r^2)
    const a: number = lineM ** 2 + 1;
    const b: number = 2 * lineM * lineB;
    const c: number = lineB ** 2 - circle.radius ** 2;
    const discriminant: number = Math.sqrt(b ** 2 - 4 * a * c);

    if (isNaN(discriminant)) return [false];

    const x0: number = (-b - discriminant) / (2 * a);
    const x1: number = (-b + discriminant) / (2 * a);

    const rayX0: number = Math.min(relativeRay.x, relativeRay.x + this.direction.x);
    const rayX1: number = Math.max(relativeRay.x, relativeRay.x + this.direction.x);

    if (x0 >= rayX0 && x1 <= rayX1) {
      const xIntersection: number = this.direction.x < 0 ? x1 : x0;
      const pointIntersection: Vector2 = new Vector2(
        xIntersection,
        xIntersection * lineM + lineB
      );

      return [
        true,
        pointIntersection.add(circle.position),
        pointIntersection.unit()
      ];
    }

    return [false];
  }

  public getBoxIntersection(box: HitBox): [boolean, Vector2?, Vector2?] {
    return [false];
  }
}

export class HitCircle {
  constructor(
    public position: Vector2,
    public radius: number
  ) {}

  public collidesWith(box: HitBox): boolean {
    const corners: Vector2[] = box.getCorners();

    for (let i: number = 0; i < 4; i++) {
      const distance = corners[i].subtract(this.position).magnitude();

      if (distance <= this.radius) return true;
    }

    return false;
  }
}

// Check if a point lies on a line segment
function isPointOnSegment(p: Vector2, a: Vector2, b: Vector2): boolean {
  const crossProduct = (p.y - a.y) * (b.x - a.x) - (p.x - a.x) * (b.y - a.y);
  if (Math.abs(crossProduct) > 1e-8) return false; // Not collinear

  const dotProduct = p.subtract(a).dot(b.subtract(a)); //dot(subtract(p, a), subtract(b, a));
  const segmentLengthSquared = b.subtract(a).dot(b.subtract(a)) //dot(subtract(b, a), subtract(b, a));
  return dotProduct >= 0 && dotProduct <= segmentLengthSquared;
}

// Check if two line segments intersect
function segmentsIntersect(a1: Vector2, a2: Vector2, b1: Vector2, b2: Vector2): boolean {
  const d1 = a2.subtract(a1);
  const d2 = b2.subtract(b1);
  const delta = b1.subtract(a1);

  const denominator = d1.cross(d2);
  if (Math.abs(denominator) < 1e-8) return false; // Parallel or collinear

  const t = delta.cross(d2) / denominator;
  const u = delta.cross(d1) / denominator;

  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

function checkPolygonLineSegmentIntersectionAndResolve(
  lineStart: Vector2, // Start of the line segment
  lineEnd: Vector2, // End of the line segment
  normalVector: Vector2, // Normal vector of the line
  polygon: Vector2[] // Array of polygon corners
): [boolean, number] {
  let minDistance = Infinity;
  let intersects = false;

  // Calculate the segment direction vector
  const segmentDirection = lineEnd.subtract(lineStart);
  const segmentLengthSquared = segmentDirection.dot(segmentDirection);

  // Check all polygon vertices
  for (const vertex of polygon) {
    // Signed distance to the infinite line
    const distance = (vertex.x - lineStart.x) * normalVector.x + (vertex.y - lineStart.y) * normalVector.y;

    // Project onto the segment
    const t = vertex.subtract(lineStart).dot(segmentDirection) / segmentLengthSquared;

    // Check if the vertex is within the bounds of the line segment
    if (t >= 0 && t <= 1) {
      // Vertex intersects the infinite line within segment bounds
      if (distance < 0) {
        intersects = true;
        minDistance = Math.min(minDistance, distance);
      }
    } else {
      // Check distance to segment endpoints
      const closestPoint = t < 0 ? lineStart : lineEnd;
      const delt = vertex.subtract(closestPoint);
      const endpointDistance = delt.magnitude();
      if (endpointDistance < 0) {
        intersects = true;
        minDistance = Math.min(minDistance, -endpointDistance);
      }
    }
  }

  // Check all polygon edges
  for (let i = 0; i < polygon.length; i++) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % polygon.length];

    if (segmentsIntersect(lineStart, lineEnd, p1, p2)) {
      intersects = true;
      minDistance = Math.min(minDistance, 0); // Exact overlap detected
    }
  }

  // If intersecting, calculate translation to resolve
  const translation = intersects ? -minDistance : 0;

  return [intersects, translation];
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

  public getVertices(): Vector2[] {
    const rotMatrix: Matrix4 = Matrix4.fromTransformation(undefined, this.rotation);
    const ends = [new Vector2(-this.length/2), new Vector2(this.length/2)];

    for (let i = 0; i < 2; i++) {
      ends[i] = rotMatrix.multiply(ends[i]).add(this.position);
    }

    return ends;
  }

  public checkLineCollision(barrier: HitLine): [boolean, Vector2?, number?] {
    const rotMatrix: Matrix4 = Matrix4.fromTransformation(undefined, -this.rotation);
    const vertices: Vector2[] = barrier.getVertices();

    for (let i = 0; i < 2; i++) {
      const vertex: Vector2 = vertices[i];
      const relVertex: Vector2 = rotMatrix.multiply(vertex.subtract(this.position));

      vertices[i] = relVertex;
    }

    let bottomMost: Vector2 = vertices[0];
    let topMost: Vector2 = vertices[1];

    if (topMost.y < bottomMost.y || (topMost.y === bottomMost.y && Math.abs(topMost.x) <= this.length / 2)) {
      [bottomMost, topMost] = [topMost, bottomMost];
    }

    if (bottomMost.y <= 0) {
      const normal = rotMatrix.multiply(new Vector2(0, 1));

      if (Math.abs(bottomMost.x) <= this.length/2) {
        const overlap = Math.abs(bottomMost.y);
  
        return [true, normal, overlap];
  
      } else {
        const cornerX = Math.min(Math.max(bottomMost.x, -this.length/2), this.length/2);

        if (cornerX < 0 && bottomMost.x > cornerX || cornerX > 0 && bottomMost.x < cornerX) {
          const m = (bottomMost.y - topMost.y) / (bottomMost.x - topMost.x);
          const b = bottomMost.y - m * bottomMost.x;
          const cornerY = m * cornerX + b;

          if (cornerY <= 0) {
            const overlap = Math.abs(cornerY);

            return [true, normal, overlap];
          }
        }
      }
    }

    return [false];
  }

  public checkBoxCollision(box: HitBox): [boolean, Vector2?, number?] {
    const rotMatrix: Matrix4 = Matrix4.fromTransformation(undefined, -this.rotation);

    const corners: Vector2[] = box.getCorners();

    let cornerIndex: number = 0;

    for (let i = 0; i < 4; i++) {
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
      const normal = rotMatrix.multiply(new Vector2(0, 1));

      if (Math.abs(bottomMost.x) <= this.length/2) {
        const overlap = Math.abs(bottomMost.y);
  
        return [true, normal, overlap];

      } else {
        let cornerX = Math.min(Math.max(bottomMost.x, -this.length/2), this.length/2);

        for (let i = 0; i < 2; i++) {
          const direction = i*2 - 1;

          let adjIndex = (cornerIndex + direction) % 4;
          if (adjIndex < 0) adjIndex += 4;

          const adjCorner = corners[adjIndex];

          if ((cornerX < 0 && adjCorner.x < cornerX) || (cornerX > 0 && adjCorner.x > cornerX)) continue;

          const m = (bottomMost.y - adjCorner.y) / (bottomMost.x - adjCorner.x);
          const b = bottomMost.y - m * bottomMost.x;
          const cornerY = m * cornerX + b;

          if (cornerY <= 0) {
            const overlap = Math.abs(cornerY);

            return [true, normal, overlap];
          }
        }
      }
    }

    return [false];
  }

  public newBoxCollision(box: HitBox): [boolean, Vector2?, number?] {
    const normal = Matrix4.fromTransformation(undefined, this.rotation).multiply(new Vector2(0, 1));
    const ends = this.getVertices();

    const [collided, overlap] = checkPolygonLineSegmentIntersectionAndResolve(ends[0], ends[1], normal, box.getCorners());

    return [collided, normal, overlap];
  }
}

export class HitPoly {
  private corners: Vector2[];

  constructor(
    private position: Vector2,
    private rotation: number,
    ...corners: Vector2[]
  ) {
    this.corners = corners;
  }

  public getLines(): Vector2[] {
    const rotMatrix = Matrix4.fromTransformation(this.position, this.rotation);
    const positions: Vector2[] = [];

    for (let i = 0; i < this.corners.length; i++) {
      positions[i] = rotMatrix.multiply(this.corners[i]);
    }

    return positions;
  }

  public checkLineCollision() {
    
  }
}

export class HitBox {
  constructor(
    private _position: Vector2,
    private _rotation: number,
    private _width: number,
    private _height: number
  ) {}

  public get position(): Vector2 {
    return this._position;
  }

  public getCorners(): Vector2[] {
    const corners: Vector2[] = [
      new Vector2(-this._width / 2, -this._height / 2),
      new Vector2(this._width / 2, -this._height / 2),
      new Vector2(this._width / 2, this._height / 2),
      new Vector2(-this._width / 2, this._height / 2)
    ];

    const rotationMatrix: Matrix4 = Matrix4.fromTransformation(undefined, this._rotation);

    for (let i: number = 0; i < 4; i++) {
      corners[i] = rotationMatrix.multiply(corners[i]).add(this.position);
    }

    return corners;
  }
}