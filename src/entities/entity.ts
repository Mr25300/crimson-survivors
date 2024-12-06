import {Weapon} from './weapon.js';
import {Vector2} from './../util/vector2.js';
export class Entity {
  private moveDirection: Vector2;

  private _currentMovementSpeed: number;
  private _currentVelocity: Vector2;

  constructor(
    private _healthPoints: number,
    private _defaultMovementSpeed: number,
    private _currentPositionVector: Vector2,
  ) {
    this._currentMovementSpeed = _defaultMovementSpeed;
    this._currentVelocity = new Vector2(0, 0);
    this.update(0);
  }

  public update(deltaTime: number){
    let targetPostion = this._currentPositionVector;
    // math bs
    this._currentPositionVector = targetPostion; // upddated final target position
  }

  public setMoveDirection(direction: Vector2) {
    this.moveDirection = direction.unit();
  }

  public get healthPoints(): number {
    return this.healthPoints;
  }

  public dealDamage(damageValue: number): void {
    this._healthPoints -= damageValue;
  }

  public multiplySpeed(multiplier: number): void {
    this._currentMovementSpeed *= multiplier;
  }

  public resetSpeed(): void {
    this._currentMovementSpeed = this._defaultMovementSpeed;
  }
}
export class Player extends Entity {
  private controller: Controller;

  constructor() {
    super(0, 0, new Vector2(0, 0));

    this.controller = new Controller('w', 'a', 's', 'd');
  }

  public input() {
    this.setMoveDirection(this.controller.getMoveDirection());
  }
}

class Controller {
  private up: boolean;
  private down: boolean;
  private left: boolean;
  private right: boolean;

  constructor(
    private upKey: string,
    private leftKey: string,
    private downKey: string,
    private rightKey: string
  ) {
    document.addEventListener("keydown", (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (key == upKey) this.up = true;
      if (key == leftKey) this.left = true;
      if (key == downKey) this.down = true;
      if (key == rightKey) this.right = true;
    });

    document.addEventListener("keyup", (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (key == upKey) this.up = false;
      if (key == leftKey) this.left = false;
      if (key == downKey) this.down = false;
      if (key == rightKey) this.right = false;
    });
  }

  public getMoveDirection() {
    let direction = new Vector2(0, 0);

    if (this.up) direction = direction.add(new Vector2(0, 1));
    if (this.down) direction = direction.subtract(new Vector2(0, 1));
    if (this.left) direction = direction.subtract(new Vector2(1, 0));
    if (this.right) direction = direction.add(new Vector2(1, 0));

    return direction.unit();
  }
}