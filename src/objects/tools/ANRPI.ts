import { Game } from "../../core/game.js";
import { Rectangle } from "../../physics/collisions.js";
import { Vector2 } from "../../util/vector2.js";
import { Entity } from "../entity.js";
import { Item } from "../item.js";
import { Needle } from "../projectiles/needle.js";
import { Tool } from "../tool.js";

/** Implements ANRPI item sprite and functionality. */
export class ANRPIItem extends Item {
  constructor(position: Vector2, rotation?: number) {
    super(
      Game.instance.spriteManager.create("projectileInjector"),
      new Rectangle(0.35, 0.25, new Vector2(0, -0.03)),
      40,
      position,
      rotation
    );
  }

  public pickupFunctionality(entity: Entity): void {
    entity.equipTool(new ANRPI());
  }
}

/** Implements ANRPI tool functionality. */
export class ANRPI extends Tool {
  constructor() {
    super("Anti-Necro Remedial Projectile Injector", 0.5);
  }

  public equip(user: Entity): void {
    user.sprite.setAnimationModifier("injector");
  }

  public useFunctionality(user: Entity): void {
    user.sprite.playAnimation("projectileShoot");

    const offset: Vector2 = new Vector2(0, 0.3).rotate(user.faceDirection.angle()); // Calculate projectile spawn offset
    
    new Needle(user.position.add(offset), user.faceDirection, user, 20, 10); // Spawn a needle with 20 damage and 10 knockback
  }

  public unequip(user: Entity): void {
    user.sprite.stopAnimation("projectileShoot");
  }
}