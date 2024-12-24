import {Entity} from '../entity.js';
import {Tool} from './tool.js';
import {Vector2} from '../../util/vector2.js';
import { Game } from '../../core/game.js';
import { Polygon } from '../../physics/collisions.js';

export class Player extends Entity {
  private tool: Tool;
  private tools: Tool[] = [];
  private maximumTools: number = 1;

  constructor() {
    super(
      Game.instance.spriteManager.create("player"),
      new Polygon([
        new Vector2(-0.3, -0.4),
        new Vector2(-0.3, 0),
        new Vector2(-0.1, 0.3),
        new Vector2(0.1, 0.3),
        new Vector2(0.3, 0),
        new Vector2(0.3, -0.4)
      ]),
      3,
      new Vector2(),
      100
    );

    this.giveTool(new Tool("Gun", 1));
    this.holdTool(0);
  }

  public giveTool(tool: Tool): void {
    if (this.tools.length <= this.maximumTools) {
      this.tools.push(tool);
    }
  }

  public holdTool(index: number): void {
    this.tool = this.tools[index];
  }

  override update(deltaTime: number): void {
    super.update(deltaTime);

    for (let i: number = 0; i < this.tools.length; i++) {
      this.tools[i].update(deltaTime);
    }

    this.updateCoordinates(this.position, this.rotation);
  }

  public handleBehavior(): void {
    let moveDir = new Vector2();

    if (Game.instance.controller.isControlActive("moveU")) moveDir = moveDir.add(new Vector2(0, 1));
    if (Game.instance.controller.isControlActive("moveD")) moveDir = moveDir.add(new Vector2(0, -1));
    if (Game.instance.controller.isControlActive("moveL")) moveDir = moveDir.add(new Vector2(-1, 0));
    if (Game.instance.controller.isControlActive("moveR")) moveDir = moveDir.add(new Vector2(1, 0));

    const aimDir = Game.instance.controller.getAimPosition().subtract(this.position);

    this.setMoveDirection(moveDir);
    this.setFaceDirection(aimDir);

    if (Game.instance.controller.isMouseDown()) {
      this.attack();
    }
  }

  public attack(): void {
    this.tool.use(this);
  }
}
