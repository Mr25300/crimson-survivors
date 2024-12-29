import { Entity } from "../entity.js";
import { MedicineModule } from "../projectiles/medicinemodule.js";
import { Tool } from "../tool.js";

export class ANRM extends Tool {
  constructor() {
    super("Anti-Necro Remedial Module", 0.5);
  }

  public useFunctionality(user: Entity): void {
    user.sprite.playAnimation("shoot");

    new MedicineModule(user.position.add(user.faceDirection.multiply(0.3)), user.faceDirection, user);
  }
}