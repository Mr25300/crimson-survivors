import { Game } from "../../core/game.js";
import { Rectangle } from "../../physics/collisions.js";
import { Vector2 } from "../../util/vector2.js";
import { Structure } from "../structure.js";

export class PatrolWall extends Structure {
  constructor(position: Vector2, rotation: number) {
    super(
      Game.instance.spriteManager.create("patrolWall", new Vector2(3, 1), true),
      new Rectangle(3, 0.35, new Vector2(0, -0.05)),
      position,
      rotation
    );

    this.hitbox.show();

    this.sprite.playAnimation("appear");
  }

  public despawn(): void {
    const anim = this.sprite.playAnimation("disappear")!;

    anim.markerReached("gone", () => {
      this.destroy();
    });
  }
}