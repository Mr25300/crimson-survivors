import { Game } from "../core/game.js";
import { Polygon } from "../physics/collisions.js";
import { SpriteModel } from "../sprites/spritemodel.js";
import { Vector2 } from "../util/vector2.js";
import { GameObject } from "./gameobject.js";

export class Structure extends GameObject {
  constructor(
    sprite: SpriteModel,
    shape: Polygon,
    public canCollide: boolean,
    position: Vector2,
    rotation: number
  ) {
    super("Structure", sprite, shape, position, rotation);
    
    Game.instance.structures.add(this);
  }

  public override destroy() {
    super.destroy();

    Game.instance.structures.delete(this);
  }
}