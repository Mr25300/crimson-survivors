import {Entity} from "../entity.js";
import {Tool} from "./tool.js";
import {Vector2} from "../../util/vector2.js";
import {SpriteModel} from "../../sprites/spritemodel.js";
import {PlayerController} from "./controller.js";

export class Player extends Entity {
  private tool: Tool | null;
  private tools: Tool[] = [];
  private maximumTools: number = 1;

  constructor(
    sprite: SpriteModel,
    private controller: PlayerController
  ) {
    super(sprite, 0.5, 0.8, 100, 2);
  }

  public giveTool(tool: Tool): void {
    if (this.tools.length <= this.maximumTools) {
      this.tools.push(tool);
    }
  }

  public holdTool(index: number): void {
    this.tool = this.tools[index];
  }

  public input(): void {
    const mousePos: Vector2 = this.controller.getMousePosition();

    this.setFaceDirection(mousePos.subtract(this.position).unit());
    this.setMoveDirection(this.controller.getMoveDirection());
  }

  override update(deltaTime: number): void {
    super.update(deltaTime);

    for (let i = 0; i < this.tools.length; i++) {
      this.tools[i].update(deltaTime);
    }

    if (this.controller.isMouseDown()) {
      this.attack();
    }
  }

  protected attack(): void {
    if (this.tool) {
      this.tool.use();
    }
  }
}
