import { Vector2 } from "./vector2.js";

/** Stores widely and commonly used utility functions. */
export class Util {
  /**
   * Loads a shader file from its path.
   * @param path The path to the shader file.
   * @returns A promise returning the content of the file.
   */
  public static loadShaderFile(path: string): Promise<string> {
    return fetch(path).then(response => {
      if (!response.ok) throw new Error(`Failed to load shader file: ${path}`);

      return response.text();
    });
  }

  /**
   * Linearly interpolates between two values based on the progress parameter.
   * @param n1 The first number.
   * @param n2 The second number.
   * @param t The linear progress.
   * @returns The interpolated value.
   */
  public static lerp(n1: number, n2: number, t: number): number {
    return n1 + (n2 - n1) * t;
  }

  /**
   * Rounds a number to a specified base rounding up or down in the middle as specified.
   * @param n 
   * @param b 
   * @param up 
   * @returns 
   */
  public static round(n: number, b: number = 1, up: boolean = true): number {
    const r: number = Math.abs(n % b);
    const halfB: number = b / 2;

    if (n < 0) {
      if (r < halfB || (up && r === halfB)) return n + r;
      else return n + r - b;

    } else {
      if (r > halfB || (up && r === halfB)) return n - r + b;
      else return n - r;
    }
  }

  /**
   * Returns a unique number key for any given 2d coordinate.
   * @param vec The 2d coordinate.
   * @returns A unique number output.
   */
  public static cantor(vec: Vector2): number {
    // Format components to be positive and unconflicting.
    const x: number = vec.x < 0 ? 2 * vec.x : -2 * vec.x - 1;
    const y: number = vec.y < 0 ? 2 * vec.y : -2 * vec.y - 1;

    return (x + y) * (x + y + 1) / 2 + y;
  }

  /**
   * Inverse of the cantor function, returns a unique 2d coordinate for any given number input.
   * @param key The number input.
   * @returns A unique 2d coordinate.
   */
  public static inverseCantor(key: number): Vector2 {
    const w: number = Math.floor((Math.sqrt(8 * key + 1) - 1) / 2);
    const t: number = w * (w + 1) / 2;

    const x: number = key - t;
    const y: number = w - x;

    // Decode the values into positive or negative.
    const decodedX: number = x % 2 === 0 ? x / 2 : -(x + 1) / 2;
    const decodedY: number = y % 2 === 0 ? y / 2 : -(y + 1) / 2;

    return new Vector2(decodedX, decodedY);
  }

  /**
   * Generates a random integer within a range.
   * @param min The minimum of the range.
   * @param max The maximum of the range.
   * @returns The random integer.
   */
  public static randomInt(min: number, max: number) {
    return Math.floor(min + (max - min + 1) * Math.random());
  }
}