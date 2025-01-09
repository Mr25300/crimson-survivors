import {Vector2} from "./vector2.js";

/** Stores and encapsulates the logic of a 3d matrix. */
export class Matrix3 {
  constructor(private values: Float32Array) {}

  /**
   * Creates a matrix3 from a set of values.
   * @param values The input values.
   * @returns A matrix3.
   */
  public static create(...values: number[]): Matrix3 {
    return new Matrix3(new Float32Array(values));
  }

  /**
   * Creates an identity matrix in which there are no transformations.
   * @returns The identity matrix.
   */
  public static identity(): Matrix3 {
    return Matrix3.create(
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    );
  }

  /**
   * Creates a scaling matrix based on scale parameters.
   * @param x The x scale factor.
   * @param y The y scale factor.
   * @returns 
   */
  public static fromScale(x: number, y: number): Matrix3 {
    return Matrix3.create(
      x, 0, 0,
      0, y, 0,
      0, 0, 1
    );
  }

  /**
   * Creates a translation matrix for a 2d vector based on inputted translation parameters.
   * @param x The x translation amount.
   * @param y The y translation amount.
   * @returns The translation matrix.
   */
  public static fromTranslation(x: number, y: number) {
    return Matrix3.create(
      1, 0, x,
      0, 1, y,
      0, 0, 1
    );
  }

  /**
   * Creates a rotation matrix.
   * @param rotation The rotation amount in radians.
   * @returns The rotation matrix.
   */
  public static fromRotation(rotation: number) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    return Matrix3.create(
      cos, sin, 0,
      -sin, cos, 0,
      0, 0, 1
    );
  }

  /**
   * Creates a projection matrix based on a screen scaling factor, aspect ratio and camera position.
   * @param scale The screen height scale.
   * @param aspectRatio The aspect rather between width and height.
   * @param cameraPos The camera position.
   * @returns The projection matrix.
   */
  public static fromProjection(scale: number, aspectRatio: number, cameraPos: Vector2) {
    const translationMatrix = Matrix3.fromTranslation(-cameraPos.x, -cameraPos.y);
    const scaleMatrix = Matrix3.fromScale(scale / aspectRatio, scale);

    // Combines the scaling and translation matrices in that order so that the scaling applies to the translation.
    return scaleMatrix.multiply(translationMatrix);
  }

  /**
   * Creates a transformation matrix for models.
   * @param translation The translation vector.
   * @param rotation The rotation amount.
   * @param scale The scale vector.
   * @returns The transformation matrix.
   */
  public static fromTransformation(
    translation: Vector2 = new Vector2(),
    rotation: number = 0,
    scale: Vector2 = new Vector2(1, 1)
  ): Matrix3 {
    const scaleMatrix = Matrix3.fromScale(scale.x, scale.y);
    const rotationMatrix = Matrix3.fromRotation(rotation);
    const translationMatrix = Matrix3.fromTranslation(translation.x, translation.y);

    // Combines the matrices so that translation, rotation and scaling are done in the following order.
    return translationMatrix.multiply(rotationMatrix).multiply(scaleMatrix);
  }

  /**
   * Multiplies two matrices together.
   * @param matrix The other matrix.
   * @returns The combined matrix.
   */
  public multiply(matrix: Matrix3): Matrix3 {
    const result = new Float32Array(9);

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

  /**
   * Creates a matrix in which the rows and columns are swapped to match webgl standards.
   * @returns The formatted matrix.
   */
  public glFormat(): Float32Array {
    const formatted = new Float32Array(9);

    for (let i = 0; i < 9; i++) {
      formatted[i] = this.values[(i % 3) * 3 + Math.floor(i / 3)];
    }

    return formatted;
  }
}
