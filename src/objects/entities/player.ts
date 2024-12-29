import { Entity } from '../entity.js';
import { Tool } from '../tool.js';
import { Vector2 } from '../../util/vector2.js';
import { Game } from '../../core/game.js';
import { Polygon } from '../../physics/collisions.js';
import { ANRM } from '../tools/ANRM.js';

export class Player extends Entity {
  private tool: Tool;
  private tools: Tool[] = [];
  private maximumTools: number = 1;

  constructor() {
    super(
      Game.instance.spriteManager.create("player"),
      new Polygon([
        new Vector2(-0.2, -0.3),
        new Vector2(-0.2, 0),
        new Vector2(-0.05, 0.15),
        new Vector2(0.05, 0.15),
        new Vector2(0.2, 0),
        new Vector2(0.2, -0.3)
      ]),
      3,
      new Vector2(),
      100
    );

    this.giveTool(new ANRM());
    this.holdTool(0);

    this.setTeam("Human");
  }

  public giveTool(tool: Tool): void {
    if (this.tools.length <= this.maximumTools) {
      this.tools.push(tool);
    }
  }

  public holdTool(index: number): void {
    this.tool = this.tools[index];
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
