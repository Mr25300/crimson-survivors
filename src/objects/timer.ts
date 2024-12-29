import { Game } from "../core/game.js";

export class Timer { // alternatively called Timer
  private timePassed: number = 0;
  private _active: boolean = false;

  constructor(private duration: number) {}

  public update(deltaTime: number): void {
    if (!this._active) return;

    this.timePassed += deltaTime;

    if (this.timePassed >= this.duration) {
      this.stop();
    }
  }

  public start(): void {
    this.timePassed = 0;
    this._active = true;

    Game.instance.timers.add(this);
  }

  public stop(): void {
    this._active = false;

    Game.instance.timers.delete(this);
  }

  public get active(): boolean {
    return this._active;
  }

  public get progress(): number {
    return this.timePassed / this.duration;
  }
}

// const attackCd = new Cooldown(2);

// attackCd.activate();

// if (attackCd.active) {
  // do attack
// }