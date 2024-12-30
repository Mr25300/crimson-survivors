import { Util } from "./util.js";

/**
 * Represents a vector in 2d space.
 */
export class Vector2 {
  constructor(
    private _x: number = 0,
    private _y: number = 0
  ) {}

  public static fromAngle(angle: number) {
    return new Vector2(
      Math.sin(angle),
      Math.cos(angle)
    )
  }

  public get x() {
    return this._x;
  }

  public get y() {
    return this._y;
  }

  public add(vec: Vector2): Vector2 {
    return new Vector2(this._x + vec._x, this._y + vec._y);
  }

  public subtract(vec: Vector2): Vector2 {
    return new Vector2(this._x - vec._x, this._y - vec._y);
  }

  public multiply(scalar: number): Vector2 {
    return new Vector2(this._x * scalar, this._y * scalar);
  }

  public divide(divisor: number): Vector2 {
    return new Vector2(this._x / divisor, this._y / divisor);
  }

  /**
   * Calculates the magnitude of the vector using the pytagoreon theorum.
   * @returns The magnitude of the vector.
   */
  public magnitude(): number {
    return Math.sqrt(this._x ** 2 + this._y ** 2);
  }
  
  public distance(vec: Vector2): number {
    return this.subtract(vec).magnitude();
  }

  /**
   * Calculates the unit vector, having a magnitude of 1.
   * @returns The unit vector.
   */
  public unit(): Vector2 {
    const mag: number = this.magnitude();

    if (mag == 0) return new Vector2();

    return this.divide(mag);
  }

  public angle(): number {
    return Math.atan2(this._x, this._y);
  }

  public dot(vec: Vector2): number {
    return this._x * vec._x + this._y * vec._y;
  }

  public cross(vec: Vector2): number {
    return this._x * vec._y - this._y * vec._x;
  }

  public perp(): Vector2 {
    return new Vector2(-this._y, this._x);// try making y not negative
  }

  public rotate(rotation: number) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    return new Vector2(
      this._x * cos + this._y * sin,
      this._y * cos - this._x * sin
    );
  }

  public lerp(goal: Vector2, t: number) {
    return new Vector2(Util.lerp(this._x, goal._x, t), Util.lerp(this._y, goal._y, t));
  }
}