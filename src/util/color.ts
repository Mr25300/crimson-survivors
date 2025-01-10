/** Represents an RGB color. */
export class Color {
  constructor(
    private _r: number,
    private _g: number,
    private _b: number
  ) {}

  /**
   * Converts the color into format for a webgl uniform.
   * @returns A data array.
   */
  public toArray(): Float32Array {
    return new Float32Array([this._r / 255, this._g / 255, this._b / 255]);
  }
}