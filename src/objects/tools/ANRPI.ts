import { Game } from "../../core/game.js";
import { Polygon, Rectangle } from "../../physics/collisions.js";
import { Vector2 } from "../../util/vector2.js";
import { Entity } from "../entity.js";
import { Item } from "../item.js";
import { Needle } from "../projectiles/needle.js";
import { Tool } from "../tool.js";

export class ANRPIItem extends Item {
  constructor(position: Vector2, rotation?: number) {
    super(
      Game.instance.spriteManager.create("projectileInjector"),
      new Rectangle(0.35, 0.25, new Vector2(0, -0.03)),
      30,
      position,
      rotation
    );
  }

  public pickupFunctionality(entity: Entity): void {
    entity.equipTool(new ANRPI());
  }
}

export class ANRPI extends Tool {
  constructor() {
    super("Anti-Necro Remedial Projectile Injector", 0.5);
  }

  public equip(user: Entity): void {
    user.sprite.setAnimationModifier("injector");
  }

  public useFunctionality(user: Entity): void {
    user.sprite.playAnimation("projectileShoot");
    
    new Needle(user.position.add(user.faceDirection.multiply(0.3)), user.faceDirection, user, 20, 10);
  }

  public unequip(user: Entity): void {
    user.sprite.stopAnimation("projectileShoot");
  }
}