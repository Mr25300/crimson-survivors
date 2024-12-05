import { Weapon } from "./weapon";
export class Entity {
  private _currentMovementSpeed: number;
  private _currentVelocity: Vector2;
  constructor(
    private _healthPoints: number,
    private _defaultMovementSpeed: number,
    private _currentPositionVector: Vector2,
  ) {
    this._currentMovementSpeed = _defaultMovementSpeed;
    this._currentVelocity.x = 0;
    this._currentVelocity.y = 0;
  }
  public get currentVelocity(): Vector2 {
    return this._currentVelocity;
  }
  public get currentMovementSpeed(): number {
    return this._currentMovementSpeed;
  }
  public get healthPoints(): number {
    return this.healthPoints;
  }
  public dealDamage(damageValue: number): void {
    this._healthPoints -= damageValue;
  }
  public multiplySpeed(multiplier: number): void {
    this._currentMovementSpeed *= multiplier;
  };
  public resetSpeed(): void {
    this._currentMovementSpeed = this._defaultMovementSpeed;
  };




}


