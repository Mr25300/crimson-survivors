import { Entity } from "../entity.js";
import { Needle } from "../projectiles/needle.js";
import { Tool } from "../tool.js";

export class ANRPI extends Tool {
  private damage: number = 10;

  constructor() {
    super("Anti-Necro Remedial Projectile Injector", 0.5);
  }

  public useFunctionality(user: Entity): void {
    user.sprite.playAnimation("projectileShoot");
    
    new Needle(user.position.add(user.faceDirection.multiply(0.3)), user.faceDirection, user, this.damage);
  }
}