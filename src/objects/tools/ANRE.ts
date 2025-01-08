import { Game } from "../../core/game.js";
import { Circle } from "../../physics/collisions.js";
import { Matrix3 } from "../../util/matrix3.js";
import { Vector2 } from "../../util/vector2.js";
import { Entity } from "../entity.js";
import { Item } from "../item.js";
import { Explosive } from "../projectiles/explosive.js";
import { Tool } from "../tool.js";

export class ANREItem extends Item {
  constructor(position: Vector2, rotation?: number) {
    super(
      Game.instance.spriteManager.create("playerExplosive"),
      new Circle(0.09, new Vector2(0.015, 0.015)),
      40,
      position,
      rotation
    );
  }

  public pickupFunctionality(entity: Entity): void {
    entity.equipTool(new ANRE());
  }
}

export class ANRE extends Tool {
  private explosiveOffset: Vector2 = new Vector2(0.15, 0.12);

  constructor() {
    super("Anti-Necro Remedial Explosive", 1.5);
  }

  public equip(user: Entity): void {
    user.sprite.setAnimationModifier("explosive");
  }

  public useFunctionality(user: Entity): void {
    const anim = user.sprite.playAnimation("explosiveThrow")!;

    anim.markerReached.connect(() => {
      const offset = Matrix3.fromRotation(user.faceDirection.angle()).apply(this.explosiveOffset);

      new Explosive(user.position.add(offset), user.faceDirection, user);

    }, "spawnExplosive");
  }

  public unequip(user: Entity): void {
    user.sprite.stopAnimation("explosiveThrow");
  }
}