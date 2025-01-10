import { Util } from "./util.js";

/** Represents a vector in 2d space. */
export class Vector2 {
  constructor(
    public readonly x: number = 0,
    public readonly y: number = 0
  ) {}

  /**
   * Returns a vector based on an input angle.
   * @param angle The angle of the vector.
   * @returns The vector with the passed angle.
   */
  public static fromAngle(angle: number): Vector2 {
    return new Vector2(
      Math.sin(angle),
      Math.cos(angle)
    )
  }

  /**
   * Creates a random unit vector.
   * @returns A random unit vector.
   */
  public static randomUnit(): Vector2 {
    return Vector2.fromAngle(Math.random() * 2 * Math.PI);
  }

  /**
   * 
   * @param vector The vector being added.
   * @returns 
   */
  public add(vector: Vector2): Vector2 {
    return new Vector2(this.x + vector.x, this.y + vector.y);
  }

  public subtract(vector: Vector2): Vector2 {
    return new Vector2(this.x - vector.x, this.y - vector.y);
  }

  public multiply(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  public divide(divisor: number): Vector2 {
    return new Vector2(this.x / divisor, this.y / divisor);
  }

  /**
   * Calculates the magnitude of the vector using the pythagoreon theorum.
   * @returns The magnitude of the vector.
   */
  public magnitude(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  /**
   * Calculates the distance between another vector.
   * @param vector The comparison vector.
   * @returns The distance between the vectors.
   */
  public distance(vector: Vector2): number {
    return this.subtract(vector).magnitude();
  }

  /**
   * Returns the normalized vector with a magnitude of 1.
   * @returns The unit vector.
   */
  public unit(): Vector2 {
    const mag: number = this.magnitude();

    if (mag == 0) return new Vector2();

    return this.divide(mag);
  }

  /**
   * Gets the angle of a vector, assuming the vector [0, 1] has angle 0.
   * @returns The angle of the vector.
   */
  public angle(): number {
    return Math.atan2(this.x, this.y);
  }

  /**
   * Calculates the dot product with another vector.
   * @param vector The other vector. 
   * @returns The dot product.
   */
  public dot(vector: Vector2): number {
    return this.x * vector.x + this.y * vector.y;
  }

  // public cross(vector: Vector2): number {
  //   return this.x * vector.y - this.y * vector.x;
  // }

  /**
   * Creates a vector perpendicular to the original vector.
   * @returns The perpendicular vector.
   */
  public perp(): Vector2 {
    return new Vector2(-this.y, this.x);
  }

  /**
   * Rotates the vector about the origin by an angle in radians.
   * @param rotation The amount to rotate.
   * @returns The rotated vector.
   */
  public rotate(rotation: number): Vector2 {
    const cos: number = Math.cos(rotation);
    const sin: number = Math.sin(rotation);

    return new Vector2(
      this.x * cos + this.y * sin,
      this.y * cos - this.x * sin
    );
  }

  /**
   * Linearly interpolates between two vectors based the given progress parameter.
   * @param goal The goal vector
   * @param t The linear progress (0 to 1).
   * @returns The vector along the line.
   */
  public lerp(goal: Vector2, t: number): Vector2 {
    return new Vector2(Util.lerp(this.x, goal.x, t), Util.lerp(this.y, goal.y, t));
  }

  /**
   * Rounds the vector.
   * @returns The rounded vector.
   */
  public round(): Vector2 {
    return new Vector2(Math.round(this.x), Math.round(this.y));
  }
}