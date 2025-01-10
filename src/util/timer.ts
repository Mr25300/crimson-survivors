import { Game } from "../core/game.js";
import { EventConnection } from "./gameevent.js";

/** Manages timer and delay logic for attacks and cooldowns. */
export class Timer {
  private times: Map<any, number> = new Map();
  
  constructor(private duration: number) {}

  /**
   * Calls the passed in function after the specified delay time.
   * @param time The amount of time to delay by.
   * @param callback The function to be called.
   * @returns The connection to the update event.
   */
  public static delay(time: number, callback: (...any: any) => void): EventConnection {
    const timer: Timer = new Timer(time);
    timer.start();

    // Connect a handler to the game update event to see when the timer is no longer active
    const connection: EventConnection = Game.instance.onUpdate.connect(() => {
      if (!timer.isActive()) {
        connection.disconnect();

        callback();
      }
    });

    return connection;
  }

  /**
   * Starts the timer.
   * @param key The optional timer key.
   */
  public start(key: any = "default"): void {
    this.times.set(key, Game.instance.elapsedTime);
  }

  /**
   * Stops and clears the timer.
   * @param key The optional key.
   */
  public stop(key: any = "default"): void {
    this.times.delete(key);
  }

  /**
   * Checks whether or not the timer is active.
   * @param key The optional key.
   * @returns True if active, false if not.
   */
  public isActive(key: any = "default"): boolean {
    const timePassed: number | undefined = this.times.get(key);
    if (timePassed === undefined) return false;

    return (Game.instance.elapsedTime - timePassed) < this.duration;
  }
}