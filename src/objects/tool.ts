import { Game } from "../core/game.js";
import { Polygon } from "../physics/collisions.js";
import { Vector2 } from "../util/vector2.js";
import { Timer } from "./timer.js";
import { Entity } from "./entity.js";
import { Projectile } from "./projectile.js";

export class Tool {
  private cooldown: Timer;

  constructor(
    private name: string,
    cooldownDuration: number = 0,
  ) {
    this.cooldown = new Timer(cooldownDuration);
  }

  public use(user: Entity): void {
    if (this.cooldown.active) return;

    this.cooldown.start();

    user.sprite.playAnimation("shoot");

    // new Projectile(
    //   Game.instance.spriteManager.create("bullet"),
    //   Polygon.fromRect(new Vector2(), 0, 0.1, 0.1),
    //   user.position.add(user.faceDirection.multiply(0.3)),
    //   user.faceDirection,
    //   5,
    //   1
    // );
  }
}