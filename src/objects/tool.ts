export class Tool {
  constructor(
    private _minDamage: number,
    private _maxDamage: number,
    private _name: string,
    private _cooldown: number
  ) {}

  /*
   * @returns The cooldown in ms
   * */
  public get cooldown(): number {
    return this._cooldown;
  }

  public get name(): string {
    return this._name;
  }

  public calculateDamage(): number {
    return Math.round(
      this._minDamage + Math.random() * (this._maxDamage - this._minDamage)
    );
  }
}
