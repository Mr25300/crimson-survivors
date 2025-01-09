import { Game } from "../core/game.js";
import { GameObject } from "../objects/gameobject.js";
import { Bounds } from "../physics/collisions.js";
import {Vector2} from "../util/vector2.js";

/** Represents and manages viewpoint of screen. */
export class Camera {
  private _position: Vector2 = new Vector2();

  /** The subject being tracked by the camera. */
  private subject?: GameObject;

  public get position(): Vector2 {
    return this._position;
  }

  /**
   * Sets the camera's subject to the game object passed in.
   * @param subject The subject to be tracked.
   */
  public setSubject(subject: GameObject): void {
    this.subject = subject;
  }

  /** Updates the camera position based on it's subject's position. */
  public update(): void {
    if (this.subject) {
      this._position = this.subject.position;

      // Get the vector amount the screen overlaps the camera
      const range = Game.instance.canvas.getScreenRange();
      const screenBounds = new Bounds(this._position.subtract(range), this._position.add(range));
      const overlap = Game.instance.simulation.map.bounds.getInnerOverlap(screenBounds);

      this._position = this._position.subtract(overlap);
    }
  }
}
