export class Cooldown {
  private timePassed = 0;

  private _active = false;

  constructor(private duration: number) {}

  public update(deltaTime: number) {
    if (this._active) {
      this.timePassed += deltaTime;

      if (this.timePassed >= this.duration) {
        this._active = false
      }
    }
  }

  public activate(): void {
    this._active = true;
  }

  public get active(): boolean {
    return this._active;
  }
}

// const attackCd = new Cooldown(2);

// attackCd.activate();

// if (attackCd.active) {
  // do attack
// }