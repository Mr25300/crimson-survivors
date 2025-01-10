import { Game } from "../core/game.js";
import {Vector2} from "../util/vector2.js";

const CONTROLS = ["moveU", "moveD", "moveL", "moveR", "reset"] as const;

type Control = typeof CONTROLS[number];

/** Handles key and mouse controls. */
export class Controller {
  /** Record of every control and its key. */
  private controlKeys: Record<Control, string> = {
    moveU: "w",
    moveD: "s",
    moveL: "a",
    moveR: "d",
    reset: "x"
  };

  private activeControls: Map<Control, boolean> = new Map();
  private mouseDown: boolean = false;
  private mousePosition: Vector2 = new Vector2();

  constructor() {
    // Setup event listeners
    document.addEventListener("mousedown", () => {
      this.mouseDown = true;
    });

    document.addEventListener("mouseup", () => {
      this.mouseDown = false;
    });

    document.addEventListener("mousemove", (event: MouseEvent) => {
      this.mousePosition = new Vector2(event.clientX, event.clientY);
    });

    document.addEventListener("keydown", (event: KeyboardEvent) => {
      this.handleKeyEvent(event, true);
    });

    document.addEventListener("keyup", (event: KeyboardEvent) => {
      this.handleKeyEvent(event, false);
    });
  }

  /**
   * Handle a keyboard event from an event listener.
   * @param event The keyboard event.
   * @param pressed Whether or not the key has been released or pressed.
   */
  private handleKeyEvent(event: KeyboardEvent, pressed: boolean): void {
    const key: string = event.key.toLowerCase();

    // Loop through controls and set as active/inactive if the input matches
    for (const control of CONTROLS) {
      const controlKey: string = this.controlKeys[control];

      if (controlKey === key) {
        this.activeControls.set(control, pressed);
      }
    }
  }

  /**
   * Checks whether or not a control is actively being pressed.
   * @param control The control name.
   * @returns True if being pressed, false if not.
   */
  public isControlActive(control: Control): boolean {
    return this.activeControls.get(control) == true;
  }

  /**
   * Checks if the mouse is being held down.
   * @returns True if pressed, false if not.
   */
  public isMouseDown(): boolean {
    return this.mouseDown;
  }

  /**
   * Gets the position of the mouse in game space.
   * @returns The game position of the mouse.
   */
  public getAimPosition(): Vector2 {
    return Game.instance.canvas.pixelsToCoordinates(this.mousePosition);
  }
}