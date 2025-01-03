import { Entity } from "../entity";
import { Tool } from "../tool";

class ANRE extends Tool {
  constructor() {
    super("Anti-Necro Remedial Explosive", 3);
  }

  public useFunctionality(user: Entity): void {
    user.sprite.playAnimation("throwExplosive");
  }
}