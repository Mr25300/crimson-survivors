import { Timer } from "../util/timer.js";
import { Entity } from "./entity.js";

export abstract class Tool {
  private cooldown: Timer;

  constructor(
    public readonly name: string,
    cooldownDuration: number
  ) {
    this.cooldown = new Timer(cooldownDuration);
  }

  public abstract equip(user: Entity): void;
  public abstract useFunctionality(user: Entity): void;
  public abstract unequip(user: Entity): void;

  public use(user: Entity): void {
    if (this.cooldown.isActive()) return;
    this.cooldown.start();

    this.useFunctionality(user);
  }
}