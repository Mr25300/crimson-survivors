class Vector {
  constructor(
    private x: number,
    private y: number
  ) {}

  public add(vec: Vector): Vector {
    return new Vector(this.x + vec.x, this.y + vec.y);
  }

  public subtract(vec: Vector): Vector {
    return new Vector(this.x - vec.x, this.y - vec.y);
  }

  public multiply(scalar: number): Vector {
    return new Vector(this.x*scalar, this.y*scalar);
  }

  public divide(scalar: number): Vector {
    return new Vector(this.x/scalar, this.y/scalar);
  }

  public magnitude(): number {
    return Math.sqrt(this.x**2 + this.y**2);
  }

  public unit(): Vector {
    const mag: number = this.magnitude();

    if (mag == 0) return new Vector(0, 0);

    return this.divide(mag);
  }
}