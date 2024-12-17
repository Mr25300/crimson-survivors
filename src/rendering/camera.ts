import {Vector2} from "../util/vector2.js";

export class Camera {
  private _position: Vector2 = new Vector2();

  public get position(): Vector2 {
    return this._position;
  }
}
