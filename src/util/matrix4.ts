import {Vector2} from './vector2.js';

export class Matrix4 {
  public values: Float32Array;

  constructor(...values: number[]) {
    this.values = new Float32Array(values);
  }

  public static identity(): Matrix4 {
    return new Matrix4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }

  public static fromScale(xScale: number, yScale: number): Matrix4 {
    return new Matrix4(
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
    );
  }

  public static fromTransformation(x: number, y: number, rot: number): Matrix4 {
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);

    return new Matrix4(cos, -sin, 0, 0, sin, cos, 0, 0, 0, 0, 1, 0, x, y, 0, 1);
  }

  public apply(vector: Vector2) {
    const values = this.values;

    return new Vector2(
      vector.x * values[0] +
        vector.y * values[1] +
        0 * values[2] +
        1 * values[3],
      vector.x * values[4] +
        vector.y * values[5] +
        0 * values[6] +
        1 * values[7]
    );
  }
}
