import {Vector2} from '../../../util/vector2.js';
import {Canvas} from '../../../rendering/canvas.js';

export class PlayerController {
  private mouseDown: boolean = false;
  private mousePosition: Vector2 = new Vector2();

  private up: boolean = false;
  private down: boolean = false;
  private left: boolean = false;
  private right: boolean = false;

  constructor(
    public canvas: Canvas,
    private upKey: string,
    private leftKey: string,
    private downKey: string,
    private rightKey: string
  ) {
    document.addEventListener('mousedown', () => {
      this.mouseDown = true;
    });

    document.addEventListener('mouseup', () => {
      this.mouseDown = false;
    });

    document.addEventListener('mousemove', (event: MouseEvent) => {
      this.mousePosition = new Vector2(event.clientX, event.clientY);
    });

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      const key: string = event.key.toLowerCase();

      if (key === this.upKey) this.up = true;
      if (key === this.leftKey) this.left = true;
      if (key === this.downKey) this.down = true;
      if (key === this.rightKey) this.right = true;
    });

    document.addEventListener('keyup', (event: KeyboardEvent) => {
      const key: string = event.key.toLowerCase();

      if (key === upKey) this.up = false;
      if (key === leftKey) this.left = false;
      if (key === downKey) this.down = false;
      if (key === rightKey) this.right = false;
    });
  }

  public getMousePosition(): Vector2 {
    return this.canvas.pixelsToCoordinates(this.mousePosition);
  }

  public getMoveDirection(): Vector2 {
    let direction: Vector2 = new Vector2(0, 0);

    if (this.up) direction = direction.add(new Vector2(0, 1));
    if (this.down) direction = direction.subtract(new Vector2(0, 1));
    if (this.left) direction = direction.subtract(new Vector2(1, 0));
    if (this.right) direction = direction.add(new Vector2(1, 0));

    return direction.unit();
  }

  public get isShooting(): boolean {
    return this.mouseDown;
  }
}
