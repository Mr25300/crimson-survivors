import { Game } from "../core/game.js";
import { EventConnection, GameEvent } from "./gameevent.js";

export class Timer {
  private times: Map<any, number> = new Map();
  
  constructor(private duration: number) {}

  static delay(time: number, callback: (...any: any) => void): EventConnection {
    const timer: Timer = new Timer(time);
    timer.start();

    const connection: EventConnection = Game.instance.onUpdate.connect(() => {
      if (!timer.isActive()) {
        connection.disconnect();

        callback();
      }
    });

    return connection;
  }

  public start(key: any = "default"): void {
    this.times.set(key, Game.instance.elapsedTime);
  }

  public stop(key: any = "default"): void {
    this.times.delete(key);
  }

  public isActive(key: any = "default"): boolean {
    const timePassed: number | undefined = this.times.get(key);
    if (!timePassed) return false;

    return Game.instance.elapsedTime - timePassed < this.duration;
  }

  // public getProgress(key: any = "default"): number {
  //   const startTime: number | undefined = this.times.get(key);
  //   if (startTime) return (Game.instance.elapsedTime - startTime) / this.duration;

  //   return 0;
  // }
}