import { Game } from "../core/game.js";
import { GameObject } from "../objects/gameobject.js";
import { Bounds } from "../physics/collisions.js";
import {Vector2} from "../util/vector2.js";

export class Camera {
  private lerpAlpha: number = 10;
  private _position: Vector2 = new Vector2();
  private goalPosition: Vector2 = new Vector2();

  private subject: GameObject | null = null;

  public get position(): Vector2 {
    return this._position;
  }

  public setSubject(subject: GameObject): void {
    this.subject = subject;
    this._position = subject.position;
  }

  public update(deltaTime: number) {
    const alpha = 1 - Math.exp(-this.lerpAlpha * deltaTime);

    if (this.subject) {
      this.goalPosition = this.subject.position;

      const range = Game.instance.canvas.getScreenRange();

      const screenBounds = new Bounds(this.goalPosition.subtract(range), this.goalPosition.add(range));
      const overlap = Game.instance.simulation.bounds.getInnerOverlap(screenBounds);

      this.goalPosition = this.goalPosition.subtract(overlap);
    }

    this._position = this._position.lerp(this.goalPosition, alpha);
  }
}
