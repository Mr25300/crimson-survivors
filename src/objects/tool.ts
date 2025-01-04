import { Game } from "../core/game.js";
import { Polygon } from "../physics/collisions.js";
import { Vector2 } from "../util/vector2.js";
import { Timer } from "../util/timer.js";
import { Entity } from "./entity.js";
import { Projectile } from "./projectile.js";

export abstract class Tool {
  private cooldown: Timer;

  constructor(
    public readonly name: string,
    cooldownDuration: number = 0,
  ) {
    this.cooldown = new Timer(cooldownDuration);
  }

  public use(user: Entity): void {
    if (this.cooldown.isActive()) return;

    this.cooldown.start();

    this.useFunctionality(user);
  }

  public abstract useFunctionality(user: Entity): void;
}