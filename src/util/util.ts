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
   * Map an integer to a whole number for arrays.
   * @param input The number to map.
   * @returns The positive map output.
   */
  public static positiveMap(input: number): number {
    return input < 0 ? 2 * input : -2 * input - 1;
  }

  /**
   * Inverse of the positive map function, mapping a whole number to an integer
   * @param output The output from the positive map function.
   * @returns The integer output.
   */
  public static inversePositiveMap(output: number): number {
    return output % 2 === 0 ? output / 2 : -(output + 1) / 2;
  }

  /**
   * Returns a unique number key for any given 2d integer coordinate.
   * @param vec The 2d coordinate.
   * @returns A unique number output.
   */
  public static cantor(vec: Vector2): number {
    // Format components to be positive and unconflicting.
    const x: number = this.positiveMap(vec.x);
    const y: number = this.positiveMap(vec.y);

    return (x + y) * (x + y + 1) / 2 + y;
  }

  /**
   * Inverse of the cantor function, returns a unique 2d integer coordinate for any given integer input.
   * @param key The number input.
   * @returns A unique 2d coordinate.
   */
  public static inverseCantor(key: number): Vector2 {
    const w: number = Math.floor((Math.sqrt(8 * key + 1) - 1) / 2);
    const t: number = w * (w + 1) / 2;

    const x: number = key - t;
    const y: number = w - x;

    // Decode the values into positive or negative
    return new Vector2(this.inversePositiveMap(x), this.inversePositiveMap(y));
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

  /**
   * Fills the start of a string with a default character.
   * @param str The input string.
   * @param fill The character to fill it with.
   * @param length The length to fill to.
   * @returns The filled string.
   */
  public static padStart(str: string, fill: string, length: number): string {
    if (str.length >= length) return str;

    return fill.repeat(length - str.length) + str;
  }

  /**
   * Seperates the inputted time in seconds into its second, minute and hour components.
   * @param time The time passed in seconds.
   * @returns A tuple composed of seconds, minutes and hours.
   */
  public static getTimeComponents(time: number): [number, number, number] {
    const seconds = Math.floor(time) % 60;
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor(time / 3600);

    return [seconds, minutes, hours];
  }
}