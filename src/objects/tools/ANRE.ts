import { Matrix3 } from "../../util/matrix3.js";
import { Timer } from "../../util/timer.js";
import { Vector2 } from "../../util/vector2.js";
import { Entity } from "../entity.js";
import { Explosive } from "../projectiles/explosive.js";
import { Tool } from "../tool.js";

export class ANRE extends Tool {
  private explosiveOffset: Vector2 = new Vector2(0.15, 0.12);

  private existingExplosive?: Explosive;
  private detonationTimer: Timer = new Timer(2);

  constructor() {
    super("Anti-Necro Remedial Explosive", 2);
  }

  public useFunctionality(user: Entity): void {
    const anim = user.sprite.playAnimation("explosiveThrow")!;

    anim.markerReached.connect(() => {
      const offset = Matrix3.fromRotation(user.faceDirection.angle()).apply(this.explosiveOffset);

      new Explosive(user.position.add(offset), user.faceDirection, user);

    }, "spawnExplosive");
  }
}