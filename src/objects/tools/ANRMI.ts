import { Game } from "../../core/game.js";
import { Rectangle } from "../../physics/collisions.js";
import { Vector2 } from "../../util/vector2.js";
import { Entity } from "../entity.js";
import { Item } from "../item.js";
import { Needle } from "../projectiles/needle.js";
import { Tool } from "../tool.js";

/** Implements ANRMI item sprite and functionality. */
export class ANRMIItem extends Item {
  constructor(position: Vector2, rotation?: number) {
    super(
      Game.instance.spriteManager.create("machineInjector"),
      new Rectangle(0.85, 0.23, new Vector2(0, -0.03)),
      60,
      position,
      rotation
    );
  }

  public pickupFunctionality(entity: Entity): void {
    entity.equipTool(new ANRMI());
  }
}

/** Implements ANRMI tool functionality. */
export class ANRMI extends Tool {
  private shootRange: number = 5 * Math.PI / 180;

  constructor() {
    super("Anti-Necro Remedial Machine Injector", 0.1);
  }

  public equip(user: Entity): void {
    user.sprite.setAnimationModifier("machineInjector");
  }

  public useFunctionality(user: Entity): void {
    user.sprite.playAnimation("machineShoot");

    const offset: Vector2 = new Vector2(0.125, 0.2).rotate(user.faceDirection.angle()); // Calculate the projectile offset
    const rotation: number = -this.shootRange + 2 * this.shootRange * Math.random(); // Calculate the random offset rotation for spray
    
    new Needle(user.position.add(offset), user.faceDirection.rotate(rotation), user, 10, 4); // Spawn a new needle with 10 damage and 4 knockback
  }

  public unequip(user: Entity): void {
    user.sprite.stopAnimation("machineShoot");
  }
}