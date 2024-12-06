/**
 * Represents a vector in 2d space.
 */
export class Vector2 {
  constructor(
    public x: number,
    public y: number
  ) {}

  public add(vec: Vector2): Vector2 {
    return new Vector2(this.x + vec.x, this.y + vec.y);
  }

  public subtract(vec: Vector2): Vector2 {
    return new Vector2(this.x - vec.x, this.y - vec.y);
  }

  public multiply(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  public divide(scalar: number): Vector2 {
    return new Vector2(this.x / scalar, this.y / scalar);
  }

  /**
   * Calculates the magnitude of the vector using the pytagoreon theorum.
   * @returns The magnitude of the vector.
   */
  public magnitude(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  /**
   * Calculates the unit vector, having a magnitude of 1.
   * @returns The unit vector.
   */
  public unit(): Vector2 {
    const mag: number = this.magnitude();

    if (mag == 0) return new Vector2(0, 0);

    return this.divide(mag);
  }
}
