import {Entity} from './entity.js';
import {Weapon} from './weapon.js';
import {Vector2} from '../util/vector2.js';
import {SpriteModel} from '../sprites/spritemodel.js';
import {Controller} from './controller.js';

export class Player extends Entity {
  private tool: Weapon | null;
  private tools: Weapon[] = [];
  private maximumTools: number = 0;

  constructor(
    private controller: Controller,
    spriteModel: SpriteModel
  ) {
    super(100, 100, 3, new Vector2(), spriteModel);
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
