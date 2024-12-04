class Util {
  static isPowerOf2(n: number): boolean {
    if ((n & (n - 1)) === 0) return true;

    return false;
  }
}

export { Util };