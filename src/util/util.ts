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
}

export {Util};
