import {Matrix4} from '../util/matrix4.js';
import {Vector2} from '../util/vector2.js';

export class HitObject {
  public visualize() {
    
  } 
}

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
}

export class HitRadius {
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

  public checkPolyCollision(poly: HitPoly): [boolean, number] {
    const rotMatrix: Matrix4 = Matrix4.fromTransformation(undefined, -this.rotation);

    const corners: Vector2[] = poly.getCorners();

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

export class HitPoly {
  private corners: Vector2[];

  constructor(
    private position: Vector2,
    private rotation: number,
    ...corners: Vector2[]
  ) {
    this.corners = corners;
  }

  public getCorners(): Vector2[] {
    const rotMatrix = Matrix4.fromTransformation(this.position, this.rotation);
    const corners: Vector2[] = [];

    for (let i = 0; i < this.corners.length; i++) {
      corners[i] = rotMatrix.multiply(this.corners[i]);
    }

    return corners;
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
      new Vector2(-this._width / 2, this._height / 2),
      new Vector2(this._width / 2, this._height / 2),
      new Vector2(this._width / 2, -this._height / 2)
    ];

    const rotationMatrix: Matrix4 = Matrix4.fromTransformation(undefined, this._rotation);

    for (let i: number = 0; i < 4; i++) {
      corners[i] = rotationMatrix.multiply(corners[i]).add(this.position);
    }

    return corners;
  }
}