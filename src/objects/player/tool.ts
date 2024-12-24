import { Cooldown } from "../cooldown.js";
import { Entity } from "../entity.js";

export class Tool {
  private cooldown: Cooldown;

  constructor(
    private name: string,
    cooldownDuration: number = 0,
  ) {
    this.cooldown = new Cooldown(cooldownDuration);
  }

  public update(deltaTime: number) {
    this.cooldown.update(deltaTime);
  }

  public use(user: Entity): void {
    if (!this.cooldown.active) {
      this.cooldown.activate();

      user.sprite.playAnimation("shoot");
    }
  }
}