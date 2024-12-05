export class Matrix4 {
  public static fromScale(xScale: number, yScale: number): Float32Array {
    return new Float32Array([
      xScale, 0, 0, 0,
      0, yScale, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }

  public static fromTransformation(translationX: number, translationY: number, rotation: number): Float32Array {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    return new Float32Array([
      cos, -sin, 0, 0,
      sin, cos, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }
}