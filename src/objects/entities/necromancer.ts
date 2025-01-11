import { Game } from "../../core/game.js";
import { Circle } from "../../physics/collisions.js";
import { Vector2 } from "../../util/vector2.js";
import { Bat } from "./bat.js";
import { Util } from "../../util/util.js";
import { Bot } from "../bot.js";
import { SpriteAnimation } from "../../sprites/spritemodel.js";

export class Necromancer extends Bot {
  constructor(spawnPosition: Vector2) {
    super(
      Game.instance.spriteManager.create("necromancer"),
      new Circle(0.45, new Vector2(-0.01, 0.05)),
      1,
      80,
      12,
      10,
      spawnPosition
    );
  }

  /** Spawns 2-3 bats nearby after windup animation. */
  public attack(): void {
    const spawnCount: number = Util.randomInt(2, 3);

    const anim: SpriteAnimation = this.sprite.playAnimation("spawn")!;

    anim.markerReached.connectOnce(() => {
      for (let i: number = 0; i < spawnCount; i++) {
        const spawnOffset: Vector2 = Vector2.randomUnit().multiply(0.7); // Get random offset in circle around necromancer

        new Bat(this.position.add(spawnOffset)).setTeam(Game.instance.simulation.vampires);
      }

    }, "spawnBats");
  }
}
