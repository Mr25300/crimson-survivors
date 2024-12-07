import {Weapon} from './weapon.js';
import {Vector2} from './../util/vector2.js';
import {SpriteModel} from '../sprites/spritemodel.js';
import {Canvas} from '../rendering/canvas.js';
export class Entity {
  private velocity: Vector2 = new Vector2();

  private moveDirection: Vector2 = new Vector2();
  private faceDirection: Vector2 = new Vector2();
  public animationState: string = 'idle';

  public isAttacking: boolean = false;

  constructor(
    private health: number,
    private maxHealth: number,
    private moveSpeed: number,
    protected position: Vector2,
    public sprite: SpriteModel
  ) {
    this.update(0);
  }

  public get currentPositionVector(): Vector2 {
    return this.position;
  }

  public update(deltaTime: number): void {
    this.position = this.position.add(this.moveDirection.multiply(deltaTime));

    this.sprite.setTransformation(this.position, this.faceDirection.angle());
    if (this.isAttacking && this.animationState !== 'attacking') {
      this.sprite.playAnimation('shoot', 0.25);
      this.animationState = 'attacking';
    } else if (!this.isAttacking && this.animationState === 'attacking') {
      // if walking
      if (this.moveDirection !== new Vector2(0, 0)) {
        this.sprite.playAnimation('walking', 0.5);
        this.animationState = 'walking';
      } else {
        this.sprite.playAnimation('walking', 0.5);
        this.animationState = 'walking';
      }
      // if idle
    }
  }

  public setFaceDirection(direction: Vector2): void {
    this.faceDirection = direction.unit();
  }

  public setMoveDirection(direction: Vector2): void {
    this.moveDirection = direction.unit();
  }
}

export class Player extends Entity {
  private tool: Weapon | null;
  private tools: Weapon[] = [];
  private maximumTools: number = 0;

  constructor(
    private controller: Controller,
    spriteModel: SpriteModel
  ) {
    super(100, 100, 1, new Vector2(), spriteModel);
  }

  private switchWeapon(index: number): void {
    this.tool = this.tools[index];
  }

  private pickupWeapon(weaponOnFloor: Weapon): void {
    if (this.tools.length <= this.maximumTools) {
      this.tools.push(weaponOnFloor);
    }
  }

  public input(): void {
    const mousePos: Vector2 = this.controller.getMousePosition();

    this.setFaceDirection(mousePos.subtract(this.position).unit());
    this.setMoveDirection(this.controller.getMoveDirection());
    if (this.controller.isShooting) {
      this.isAttacking = true;
    } else {
      this.isAttacking = false;
    }
  }
}

export class Controller {
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
