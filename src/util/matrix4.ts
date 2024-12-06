export class Matrix4 {
  public static identity(): Float32Array {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }

  public static fromScale(xScale: number, yScale: number): Float32Array {
    return new Float32Array([
      xScale,
      0,
      0,
      0,
      0,
      yScale,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ]);
  }

  public static fromTransformation(
    x: number,
    y: number,
    rot: number
  ): Float32Array {
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);

    return new Float32Array([
      cos,
      -sin,
      0,
      0,
      sin,
      cos,
      0,
      0,
      0,
      0,
      1,
      0,
      x,
      y,
      0,
      1
    ]);
  }
}
