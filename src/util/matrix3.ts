import {Vector2} from "./vector2.js";

export class Matrix3 {
  constructor(private values: Float32Array) {}

  public static create(...values: number[]): Matrix3 {
    return new Matrix3(new Float32Array(values));
  }

  public static identity(): Matrix3 {
    return Matrix3.create(
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    );
  }

  public static fromScale(x: number, y: number): Matrix3 {
    return Matrix3.create(
      x, 0, 0,
      0, y, 0,
      0, 0, 1
    );
  }

  public static fromTranslation(x: number, y: number) {
    return Matrix3.create(
      1, 0, x,
      0, 1, y,
      0, 0, 1
    );
  }

  public static fromRotation(rotation: number) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    return Matrix3.create(
      cos, sin, 0,
      -sin, cos, 0,
      0, 0, 1
    );
  }

  public static fromTransformation(translation: Vector2 = new Vector2(), rotation: number = 0, scale: Vector2 = new Vector2(1, 1)): Matrix3 {
    const scaleMatrix = Matrix3.fromScale(scale.x, scale.y);
    const rotationMatrix = Matrix3.fromRotation(rotation);
    const translationMatrix = Matrix3.fromTranslation(translation.x, translation.y);

    return translationMatrix.multiply(rotationMatrix).multiply(scaleMatrix); // translation matrix is first and thus unaffected by rotation which comes after
  }

  public static fromProjection(scale: number, aspectRatio: number, cameraPos: Vector2) {
    const translationMatrix = Matrix3.fromTranslation(-cameraPos.x, -cameraPos.y);
    const scaleMatrix = Matrix3.fromScale(scale / aspectRatio, scale);

    return scaleMatrix.multiply(translationMatrix); // translation matrix is second, thus it is scaled by the scale projection matrix
  }

  public multiply(matrix: Matrix3): Matrix3 {
    const result = new Float32Array(16);

    // dot product of every intersecting vector
    for (let r = 0; r < 3; r++) { // every row of this matrix
      for (let c = 0; c < 3; c++) { // every column of other matrix
        let dotProduct = 0;

        for (let n = 0; n < 3; n++) {
          dotProduct += this.values[n + r * 3] * matrix.values[n * 3 + c];
        }

        result[r * 3 + c] = dotProduct;
      }
    }

    return new Matrix3(result);
  }

  public apply(vector: Vector2) {
    // z = 0, w = 1
    // x' = x * m(0) + y * m(1) + z * m(2) + w * m(3)
    // y' = x * m(4) + y * m(5) + z * m(6) + w * m(7)

    return new Vector2(
      vector.x * this.values[0] + vector.y * this.values[1] + this.values[2],
      vector.x * this.values[3] + vector.y * this.values[4] + this.values[5]
    );
  }

  public glFormat(): Float32Array {
    const formatted = new Float32Array(9);

    for (let i = 0; i < 9; i++) {
      formatted[i] = this.values[(i % 3) * 3 + Math.floor(i / 3)];
    }

    return formatted;
  }
}
