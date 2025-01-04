import { Game } from "../core/game.js";
import { GameEvent } from "./gameevent.js";

export class Timer {
  private times: Map<any, number> = new Map();

  public readonly onComplete: GameEvent = new GameEvent();

  constructor(private duration: number) {}

  public start(key: any = "default"): void {
    this.times.set(key, 0);

    if (!Game.instance.timers.has(this)) Game.instance.timers.add(this);
  }

  public update(deltaTime: number): void {
    this.times.forEach((timePassed: number, key: any) => {
      const newTime = timePassed + deltaTime;
      this.times.set(key, newTime);

      if (newTime >= this.duration) {
        this.stop(key);
        this.onComplete.fire(key);
      }
    });
  }

  public stop(key: any = "default"): void {
    this.times.delete(key);

    if (this.times.size === 0) this.remove();
  }

  public isActive(key: any = "default"): boolean {
    return this.times.get(key) !== undefined;
  }

  public getProgress(key: any = "default"): number {
    const timePassed: number | undefined = this.times.get(key);
    if (timePassed) return timePassed / this.duration;

    return 0;
  }

  public remove(): void {
    Game.instance.timers.delete(this)
  }
}