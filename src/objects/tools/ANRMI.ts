import { Game } from "../../core/game.js";
import { Rectangle } from "../../physics/collisions.js";
import { Matrix3 } from "../../util/matrix3.js";
import { Vector2 } from "../../util/vector2.js";
import { Entity } from "../entity.js";
import { Item } from "../item.js";
import { Needle } from "../projectiles/needle.js";
import { Tool } from "../tool.js";

export class ANRMIItem extends Item {
  constructor(position: Vector2, rotation?: number) {
    super(
      Game.instance.spriteManager.create("machineInjector"),
      new Rectangle(0.85, 0.23, new Vector2(0, -0.03)),
      35,
      position,
      rotation
    );
  }

  public pickupFunctionality(entity: Entity): void {
    entity.equipTool(new ANRMI());
  }
}

export class ANRMI extends Tool {
  private shootRange: number = 5 * Math.PI / 180;
  private bulletOffset: Vector2 = new Vector2(0.125, 0.2);

  constructor() {
    super("Anti-Necro Remedial Machine Injector", 0.1);
  }

  public equip(user: Entity): void {
    user.sprite.setAnimationModifier("machineInjector");
  }

  public useFunctionality(user: Entity): void {
    user.sprite.playAnimation("machineShoot");

    const offset: Vector2 = new Vector2(0.125, 0.2).rotate(user.faceDirection.angle());
    const rotation: number = -this.shootRange + 2 * this.shootRange * Math.random();
    
    new Needle(user.position.add(offset), user.faceDirection.rotate(rotation), user, 10, 4);
  }

  public unequip(user: Entity): void {
    user.sprite.stopAnimation("machineShoot");
  }
}