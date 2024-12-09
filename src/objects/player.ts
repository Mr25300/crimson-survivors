import {Entity} from "./entity.js";
import {Tool} from "./tool.js";
import {Vector2} from "../util/vector2.js";
import {SpriteModel} from "../sprites/spritemodel.js";
import {PlayerController} from "./enemies/controllers/player-controller.js";

export class Player extends Entity {
  private tool: Tool | null;
  private tools: Tool[] = [];
  private maximumTools: number = 0;

  constructor(
    sprite: SpriteModel,
    width: number,
    height: number,
    private controller: PlayerController
  ) {
    super(sprite, width, height, 100, 2);
  }

  private switchWeapon(index: number): void {
    this.tool = this.tools[index];
  }

  private pickupWeapon(weaponOnFloor: Tool): void {
    if (this.tools.length <= this.maximumTools) {
      this.tools.push(weaponOnFloor);
    }
  }

  public input(): void {
    const mousePos: Vector2 = this.controller.getMousePosition();

    this.setFaceDirection(mousePos.subtract(this.position).unit());
    this.setMoveDirection(this.controller.getMoveDirection());
  }
}
