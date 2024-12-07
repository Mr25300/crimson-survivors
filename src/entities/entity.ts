import {Weapon} from './weapon.js';
import {Vector2} from './../util/vector2.js';
import {SpriteModel} from '../sprites/spritemodel.js';
export class Entity {
  private moveDirection: Vector2 = new Vector2(0, 0);
  private _currentMovementSpeed: number;
  private _currentVelocity: Vector2;
  public isAttacking: boolean = false;

  constructor(
    private _healthPoints: number,
    private _defaultMovementSpeed: number,
    private _currentPositionVector: Vector2,
    public lookAngle: number = 0,
    public sprite: SpriteModel
  ) {
    this._currentMovementSpeed = _defaultMovementSpeed;
    this._currentVelocity = new Vector2(0, 0);
    this.update(0);
  }

  public get currentPositionVector(): Vector2 {
    return this._currentPositionVector;
  }

  public update(deltaTime: number): void {
    this._currentPositionVector.x += this.moveDirection.x * deltaTime;
    this._currentPositionVector.y += this.moveDirection.y * deltaTime;
    if (this.isAttacking) {
      this.sprite.playAnimation('shoot', 0.5);
    } else {
      this.sprite.playAnimation('walking', 0.5);
    }
    this.sprite.setTransformation(
      this._currentPositionVector.x,
      this._currentPositionVector.y,
      this.lookAngle
    );
  }

  public setMoveDirection(direction: Vector2): void {
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
  private maximumWeaponCount: number;
  private _allWeapons: Weapon[];
  constructor(
    private _currentWeapon: Weapon,
    maximumWeaponCount: number,
    private spriteModel: SpriteModel
  ) {
    super(100, 1, new Vector2(0, 0), 0, spriteModel);
    this.controller = new Controller('w', 'a', 's', 'd');
    this.maximumWeaponCount = maximumWeaponCount;
    this._allWeapons = new Array(this.maximumWeaponCount);
    this._allWeapons.push(_currentWeapon);
  }

  private switchWeapon(index: number): void {
    this._currentWeapon = this._allWeapons[index];
  }

  private pickupWeapon(weaponOnFloor: Weapon): void {
    if (this._allWeapons.length <= this.maximumWeaponCount) {
      this._allWeapons.push(weaponOnFloor);
    }
  }

  public input(): void {
    this.setMoveDirection(this.controller.getMoveDirection());
    const dx: number =
      this.controller.getMouseLocation().x - this.currentPositionVector.x;
    const dy: number =
      this.controller.getMouseLocation().y - this.currentPositionVector.y;
    this.isAttacking = this.controller.isShooting;

    // Add canvas method to convert mouse to x, y position and use facing direction vector instead of look angle
    // Calculate look angle every frame and multiply movedirection by rotation matrix of look angle
    this.lookAngle = Math.atan2(dy, dx) + Math.PI / 2;
  }
}

class Controller {
  private up: boolean;
  private down: boolean;
  private left: boolean;
  private right: boolean;
  private _isShooting: boolean = false;
  private mousePosition: Vector2 = new Vector2(0, 0);

  constructor(
    private upKey: string,
    private leftKey: string,
    private downKey: string,
    private rightKey: string
  ) {
    document.addEventListener('mousedown', () => {
      this._isShooting = true;
    });

    document.addEventListener('mouseup', () => {
      this._isShooting = false;
    });

    document.addEventListener('mousemove', event => {
      const centerX: number = window.innerWidth / 2;
      const centerY: number = window.innerHeight / 2;
      this.mousePosition.x = event.pageX - centerX;
      this.mousePosition.y = event.pageY - centerY;
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

  public getMoveDirection(): Vector2 {
    let direction: Vector2 = new Vector2(0, 0);

    if (this.up) direction = direction.add(new Vector2(0, 1));
    if (this.down) direction = direction.subtract(new Vector2(0, 1));
    if (this.left) direction = direction.subtract(new Vector2(1, 0));
    if (this.right) direction = direction.add(new Vector2(1, 0));

    return direction.unit();
  }

  public get isShooting(): boolean {
    return this._isShooting;
  }

  public getMouseLocation(): Vector2 {
    return this.mousePosition;
  }
}
