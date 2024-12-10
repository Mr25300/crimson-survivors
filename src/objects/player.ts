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
    private controller: PlayerController
  ) {
    super(sprite, 0.5, 0.8, 100, 2);
  }

  private giveTool(tool: Tool): void {
    if (this.tools.length <= this.maximumTools) {
      this.tools.push(tool);
    }
  }

  private switchTool(index: number): void {
    this.tool = this.tools[index];
  }

  public input(): void {
    const mousePos: Vector2 = this.controller.getMousePosition();

    this.setFaceDirection(mousePos.subtract(this.position).unit());
    this.setMoveDirection(this.controller.getMoveDirection());
  }

  protected attack(): void {
    if (this.tool) {
      this.tool.use();
    }
  }
}
