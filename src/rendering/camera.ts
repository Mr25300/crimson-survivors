import { Game } from "../core/game.js";
import { GameObject } from "../objects/gameobject.js";
import { Bounds } from "../physics/collisions.js";
import {Vector2} from "../util/vector2.js";

export class Camera {
  private _position: Vector2 = new Vector2();

  private subject?: GameObject;

  public get position(): Vector2 {
    return this._position;
  }

  public setSubject(subject: GameObject): void {
    this.subject = subject;
    this._position = subject.position;
  }

  public update(deltaTime: number) {
    if (this.subject) {
      this._position = this.subject.position;

      const range = Game.instance.canvas.getScreenRange();
      const screenBounds = new Bounds(this._position.subtract(range), this._position.add(range));
      const overlap = Game.instance.simulation.map.bounds.getInnerOverlap(screenBounds);

      this._position = this._position.subtract(overlap);
    }
  }
}
