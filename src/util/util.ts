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

  public static roundUp(n: number): number {
    const r = Math.abs(n % 1);

    if (n < 0) {
      if (r <= 0.5) return n + r;
      else return n + r - 1;

    } else {
      if (r >= 0.5) return n - r + 1;
      else return n - r;
    }
  }

  public static roundDown(n: number): number {
    const r = Math.abs(n % 1);

    if (n < 0) {
      if (r >= 0.5) return n + r - 1;
      else return n + r;

    } else {
      if (r <= 0.5) return n - r;
      else return n - r + 1;
    }
  }

  public static cantor(x: number, y: number): number {
    x = x < 0 ? 2 * x : -2 * x - 1;
    y = y < 0 ? 2 * y : -2 * y - 1;

    return (x + y) * (x + y + 1) / 2 + y;
  }

  public static inverseCantor(key: number): [number, number] {
    const w = Math.floor((Math.sqrt(8 * key + 1) - 1) / 2);
    const t = w * (w + 1) / 2;

    const x = key - t;
    const y = w - x;

    const decodedX = x % 2 === 0 ? x / 2 : -(x + 1) / 2;
    const decodedY = y % 2 === 0 ? y / 2 : -(y + 1) / 2;

    return [decodedX, decodedY];
  }
}