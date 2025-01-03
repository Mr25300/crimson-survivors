import { Matrix3 } from "../../util/matrix3.js";
import { Vector2 } from "../../util/vector2.js";
import { Entity } from "../entity.js";
import { Needle } from "../projectiles/needle.js";
import { Tool } from "../tool.js";

export class ANRMI extends Tool {
  private damage: number = 5;
  private shootRange: number = 5 * Math.PI / 180;
  private bulletOffset: Vector2 = new Vector2(0.125, 0.2);

  constructor() {
    super("Anti-Necro Remedial Machine Injector", 0.1);
  }

  public useFunctionality(user: Entity): void {
    user.sprite.playAnimation("machineShoot");

    const direction = user.faceDirection;
    const offset = Matrix3.fromRotation(direction.angle()).apply(this.bulletOffset);
    const rotation = -this.shootRange + 2 * this.shootRange * Math.random();
    
    new Needle(user.position.add(offset), direction.rotate(rotation), user, this.damage);
  }
}