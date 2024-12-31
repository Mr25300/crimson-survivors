import { Vector2 } from "./vector2.js";

export class Util {
  public static loadShaderFile(path: string): Promise<string> {
    return fetch(path).then(response => {
      if (!response.ok) throw new Error(`Failed to load shader file: ${path}`);

      return response.text();
    });
  }

  public static isPowerOf2(n: number): boolean {
    if ((n & (n - 1)) === 0) return true;

    return false;
  }

  public static lerp(n1: number, n2: number, t: number) {
    return n1 + (n2 - n1) * t;
  }

  public static roundUp(n: number, b: number = 1): number {
    const r = Math.abs(n % b);

    if (n < 0) {
      if (r <= b / 2) return n + r;
      else return n + r - b;

    } else {
      if (r >= b / 2) return n - r + b;
      else return n - r;
    }
  }

  public static roundDown(n: number, b: number = 1): number {
    const r = Math.abs(n % b);

    if (n < 0) {
      if (r >= b / 2) return n + r - b;
      else return n + r;

    } else {
      if (r <= b / 2) return n - r;
      else return n - r + b;
    }
  }

  public static cantor(vec: Vector2): number {
    const x = vec.x < 0 ? 2 * vec.x : -2 * vec.x - 1;
    const y = vec.y < 0 ? 2 * vec.y : -2 * vec.y - 1;

    return (x + y) * (x + y + 1) / 2 + y;
  }

  public static inverseCantor(key: number): Vector2 {
    const w = Math.floor((Math.sqrt(8 * key + 1) - 1) / 2);
    const t = w * (w + 1) / 2;

    const x = key - t;
    const y = w - x;

    const decodedX = x % 2 === 0 ? x / 2 : -(x + 1) / 2;
    const decodedY = y % 2 === 0 ? y / 2 : -(y + 1) / 2;

    return new Vector2(decodedX, decodedY);
  }
}