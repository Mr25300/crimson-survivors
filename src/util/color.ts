export class Color {
  constructor(
    private _r: number,
    private _g: number,
    private _b: number
  ) {}

  public toArray(): Float32Array {
    return new Float32Array([this._r, this._g, this._b]);
  }
}