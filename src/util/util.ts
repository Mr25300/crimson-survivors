class Util {
  static loadShaderFile(url: string): Promise<string> {
    return fetch(url).then(response => {
      if (!response.ok) throw new Error(`Failed to load shader file: ${url}`);
  
      return response.text();
    });
  }

  static isPowerOf2(n: number): boolean {
    if ((n & (n - 1)) === 0) return true;

    return false;
  }
}

export { Util };