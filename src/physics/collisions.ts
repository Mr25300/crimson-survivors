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

export class HitBarrier {
  constructor(
    private position: Vector2,
    private rotation: number,
    private length: number
  ) {}

  static fromStartAndEnd(start: Vector2, end: Vector2): HitBarrier {
    const midPoint = start.add(end).divide(2);
    const difference = start.subtract(end);

    return new HitBarrier(midPoint, difference.angle() + Math.PI/2, difference.magnitude());
  }

  public checkBoxCollision(box: HitBox): [boolean, Vector2?, number?] {
    const rotMatrix = Matrix4.fromTransformation(undefined, -this.rotation);

    const corners = box.getCorners();

    let cornerIndex: number = 0;

    for (let i = 0; i < 4; i++) {
      const relativeCorner = rotMatrix.multiply(corners[i].subtract(this.position));

      corners[i] = relativeCorner;

      if (i == 0) continue;

      const lastY = corners[cornerIndex].y;

      if (relativeCorner.y < lastY || (relativeCorner.y == lastY && Math.abs(relativeCorner.x) <= this.length/2)) {
        cornerIndex = i;
      }
    }

    const bottomMost = corners[cornerIndex];

    if (bottomMost.y <= 0) {
      const normal = rotMatrix.multiply(new Vector2(0, 1));

      console.log(bottomMost.x);

      if (Math.abs(bottomMost.x) <= this.length/2) {
        const overlap = Math.abs(bottomMost.y);
  
        return [true, normal, overlap];

      } else {
        console.log("CORNER OUTSIDE");
        let cornerX = Math.max(Math.min(bottomMost.x, -this.length/2), this.length/2);

        for (let i = 0; i < 2; i++) {
          const direction = i*2 - 1;

          let adjIndex = (cornerIndex + direction) % 4;
          if (adjIndex < 0) adjIndex += 4;

          const adjCorner = corners[adjIndex];

          const m = (bottomMost.y - adjCorner.y) / (bottomMost.x - adjCorner.x);
          const b = bottomMost.y - m * bottomMost.x;
          const cornerY = m * cornerX + b;
          const overlap = Math.abs(cornerY);

          const lineMinY = Math.min(bottomMost.y, adjCorner.y)
          const lineMaxY = Math.max(bottomMost.y, adjCorner.y);

          if (cornerY > lineMinY && cornerY < lineMaxY) {
            return [true, normal, overlap];
          }
        }
      }
    }

    return [false];
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
      new Vector2(-this._width / 2, this._height / 2),
      new Vector2(this._width / 2, this._height / 2)
    ];

    const rotationMatrix: Matrix4 = Matrix4.fromTransformation(undefined, this._rotation);

    for (let i: number = 0; i < 4; i++) {
      corners[i] = rotationMatrix.multiply(corners[i]).add(this.position);
    }

    return corners;
  }
}
