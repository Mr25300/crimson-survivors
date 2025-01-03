import { Game } from "../core/game.js";

export class Timer {
  private timePassed: number = 0;
  private _active: boolean = false;

  private callback: (() => any) | null = null;

  constructor(private duration: number) {}

  public update(deltaTime: number): void {
    if (!this._active) return;

    this.timePassed += deltaTime;

    if (this.timePassed >= this.duration) {
      this.stop();

      if (this.callback) {
        this.callback();
        this.callback = null;
      }
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

  public onComplete(callback: () => any) {
    this.callback = callback;
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