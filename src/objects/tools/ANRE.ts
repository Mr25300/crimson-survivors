import { Game } from "../../core/game.js";
import { Circle } from "../../physics/collisions.js";
import { SpriteAnimation } from "../../sprites/spritemodel.js";
import { Vector2 } from "../../util/vector2.js";
import { Entity } from "../entity.js";
import { Item } from "../item.js";
import { Explosive } from "../projectiles/explosive.js";
import { Tool } from "../tool.js";

/** Implements ANRE item sprite and functionality. */
export class ANREItem extends Item {
  constructor(position: Vector2, rotation?: number) {
    super(
      Game.instance.spriteManager.create("playerExplosive"),
      new Circle(0.09, new Vector2(0.015, 0.015)),
      50,
      position,
      rotation
    );
  }

  public pickupFunctionality(entity: Entity): void {
    entity.equipTool(new ANRE());
  }
}

/** Implements ANRE tool functionality. */
export class ANRE extends Tool {
  constructor() {
    super("Anti-Necro Remedial Explosive", 1.5);
  }

  public equip(user: Entity): void {
    user.sprite.setAnimationModifier("explosive");
  }

  public useFunctionality(user: Entity): void {
    // Play the tool throw animation and wait for the marker event
    const anim: SpriteAnimation = user.sprite.playAnimation("explosiveThrow")!;

    anim.markerReached.connect(() => {
      const offset: Vector2 = new Vector2(0.15, 0.12).rotate(user.faceDirection.angle()); // Calculate the projectile spawn offset

      new Explosive(user.position.add(offset), user.faceDirection, user); // Spawn the explosive

    }, "spawnExplosive");
  }

  public unequip(user: Entity): void {
    user.sprite.stopAnimation("explosiveThrow");
  }
}