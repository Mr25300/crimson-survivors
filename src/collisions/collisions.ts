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

export class HitBox {
  constructor(
    private position: Vector2 = new Vector2(),
    private rotation: number = 0,
    private width: number,
    private height: number
  ) {}

  public setCoordinates(position: Vector2, rotation: number): void {
    this.position = position;
    this.rotation = rotation;
  }

  public getCorners(): Vector2[] {
    const corners: Vector2[] = [
      new Vector2(-this.width / 2, -this.height / 2),
      new Vector2(this.width / 2, -this.height / 2),
      new Vector2(-this.width / 2, this.height / 2),
      new Vector2(this.width / 2, this.height / 2)
    ];

    const rotationMatrix: Matrix4 = Matrix4.fromTransformation(
      undefined,
      this.rotation
    );

    for (let i: number = 0; i < 4; i++) {
      corners[i] = rotationMatrix.multiply(corners[i]).add(this.position);
    }

    return corners;
  }

  public collidesWith(box: HitBox): boolean {
    return false;
  }
}
