import { Game } from "../../core/game.js";
import {Vector2} from "../../util/vector2.js";

const CONTROLS = ["moveU", "moveD", "moveL", "moveR"] as const;

type Control = typeof CONTROLS[number];

export class Controller {
  private controlKeys: Record<Control, string> = {
    moveU: "w",
    moveD: "s",
    moveL: "a",
    moveR: "d",
  }

  private activeControls: Map<Control, boolean> = new Map();
  private mouseDown: boolean = false;
  private mousePosition: Vector2 = new Vector2();

  constructor() {
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

  private handleKeyEvent(event: KeyboardEvent, pressed: boolean) {
    const key: string = event.key.toLowerCase();

    for (const control of CONTROLS) {
      const controlKey = this.controlKeys[control];

      if (controlKey == key) {
        this.activeControls.set(control, pressed);
      }
    }
  }

  public isControlActive(control: Control): boolean {
    return this.activeControls.get(control) == true;
  }

  public isMouseDown(): boolean {
    return this.mouseDown;
  }

  public getAimPosition(): Vector2 {
    return Game.instance.canvas.pixelsToCoordinates(this.mousePosition);
  }
}