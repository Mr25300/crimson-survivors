import { Game } from "../core/game.js";
import { Entity } from "../objects/entity.js";
import { Rectangle } from "../physics/collisions.js";
import {Vector2} from "../util/vector2.js";

export class Camera {
  private _position: Vector2 = new Vector2();

  private subject: Entity | null = null;

  public get position(): Vector2 {
    return this._position;
  }

  public setSubject(subject: Entity): void {
    this.subject = subject;
  }

  public update(deltaTime: number) {
    if (this.subject) {
      this._position = this.subject.position;

      const range = Game.instance.canvas.getScreenRange();

      const screenBounds = new Rectangle(this._position.subtract(range), this._position.add(range));
      const overlap = Game.instance.simulation.bounds.getInnerRectOverlap(screenBounds);

      // console.log(new Rectangle(new Vector2(-5, -3), new Vector2(5, 3)).getInnerRectOverlap(new Rectangle(new Vector2(-1, 1), new Vector2(4, 4))));

      // console.log(screenBounds.min, screenBounds.max, overlap);
      this._position = this._position.subtract(overlap);
    }
  }
}
