import { SpriteModel } from "../sprites/spritemodel";
import { Vector2 } from "../util/vector2";
import { GameObject } from "./gameobject";

export class Structure extends GameObject {
  constructor(
    sprite: SpriteModel,
    position: Vector2,
    public width: number,
    public height: number,
    public canCollide: boolean
  ) {
    super(sprite, width, height);

    this.position = position;
  }
}