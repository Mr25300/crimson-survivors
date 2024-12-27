class Util {
  static loadShaderFile(path: string): Promise<string> {
    return fetch(path).then(response => {
      if (!response.ok) throw new Error(`Failed to load shader file: ${path}`);

      return response.text();
    });
  }

  static isPowerOf2(n: number): boolean {
    if ((n & (n - 1)) === 0) return true;

    return false;
  }

  static lerp(n1: number, n2: number, t: number) {
    return n1 + (n2 - n1) * t;
  }

  static roundUp(n: number): number {
    const r = Math.abs(n % 1);

    if (n < 0) {
      if (r <= 0.5) return n + r;
      else return n + r - 1;

    } else {
      if (r >= 0.5) return n - r + 1;
      else return n - r;
    }
  }

  static roundDown(n: number): number {
    const r = Math.abs(n % 1);

    if (n < 0) {
      if (r >= 0.5) return n + r - 1;
      else return n + r;

    } else {
      if (r <= 0.5) return n - r;
      else return n - r + 1;
    }
  }
}

export {Util};
