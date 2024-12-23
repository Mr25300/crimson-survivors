import {Vector2} from "./vector2.js";

export class Matrix4 {
  constructor(private values: Float32Array) {}

  public static create(...values: number[]): Matrix4 {
    return new Matrix4(new Float32Array(values));
  }

  public static identity(): Matrix4 {
    return Matrix4.create(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );
  }

  public static fromScale(x: number, y: number): Matrix4 {
    return Matrix4.create(
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );
  }

  public static fromTranslation(x: number, y: number, z: number) {
    return Matrix4.create(
      1, 0, 0, x,
      0, 1, 0, y,
      0, 0, 1, z,
      0, 0, 0, 1
    );
  }

  public static fromRotation(rotation: number) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    return Matrix4.create(
      cos, sin, 0, 0,
      -sin, cos, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );
  }

  public static fromSpriteInfo(xScale: number, yScale: number, zOrder: number): Matrix4 {
    const zTranslateMatrix = Matrix4.fromTranslation(0, 0, -Math.tanh(zOrder));
    const scaleMatrix = Matrix4.fromScale(xScale, yScale);

    return zTranslateMatrix.multiply(scaleMatrix);
  }

  public static fromTransformation(translation: Vector2 = new Vector2(), rotation: number = 0): Matrix4 {
    const rotationMatrix = Matrix4.fromRotation(rotation);
    const translationMatrix = Matrix4.fromTranslation(translation.x, translation.y, 0);

    return translationMatrix.multiply(rotationMatrix); // translation matrix is first and thus unaffected by rotation which comes after
  }

  public static fromProjection(scale: number, aspectRatio: number, cameraPos: Vector2) {
    const translationMatrix = Matrix4.fromTranslation(-cameraPos.x, -cameraPos.y, 0);
    const scaleMatrix = Matrix4.fromScale(scale / aspectRatio, scale);

    return scaleMatrix.multiply(translationMatrix); // translation matrix is second, thus it is scaled by the scale projection matrix
  }

  public multiply(matrix: Matrix4): Matrix4 {
    const result = new Float32Array(16);

    // dot product of every intersecting vector
    for (let r = 0; r < 4; r++) { // every row of this matrix
      for (let c = 0; c < 4; c++) { // every column of other matrix
        let dotProduct = 0;

        for (let n = 0; n < 4; n++) {
          dotProduct += this.values[n + r * 4] * matrix.values[n * 4 + c];
        }

        result[r * 4 + c] = dotProduct;
      }
    }

    return new Matrix4(result);
  }

  public apply(vector: Vector2) {
    // z = 0, w = 1
    // x' = x * m(0) + y * m(1) + z * m(2) + w * m(3)
    // y' = x * m(4) + y * m(5) + z * m(6) + w * m(7)

    return new Vector2(
      vector.x * this.values[0] + vector.y * this.values[1] + this.values[3],
      vector.x * this.values[4] + vector.y * this.values[5] + this.values[7]
    );
  }

  public glFormat(): Float32Array {
    const formatted = new Float32Array(16);

    for (let i = 0; i < 16; i++) {
      formatted[i] = this.values[(i % 4) * 4 + Math.floor(i / 4)];
    }

    return formatted;
  }
}
