import {Entity} from "../entity.js";
import {Tool} from "./tool.js";
import {Vector2} from "../../util/vector2.js";
import {SpriteModel} from "../../sprites/spritemodel.js";
import {PlayerController} from "./controller.js";
import { HitLine, HitBox, HitPoly } from "../../physics/collisions.js";

export class Player extends Entity {
  private tool: Tool = new Tool("GUN!", 1);
  private tools: Tool[] = [];
  private maximumTools: number = 1;

  constructor(
    sprite: SpriteModel,
    private controller: PlayerController
  ) {
    super(sprite, 0.4, 0.6, 100, 2);

    this.position = new Vector2(0, 2);
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

    const poly = new HitPoly(this.position, this.rotation,
      new Vector2(-0.5, -0.5),
      new Vector2(-0.5, 0.5),
      new Vector2(0.5, 0.5),
      new Vector2(0.5, -0.5)
    );

    const barriers = [
      new HitLine(new Vector2(0, 2), Math.PI, 4),
      new HitLine(new Vector2(0, -2), 0, 4),
      new HitLine(new Vector2(2, 0), -Math.PI/2, 4),
      new HitLine(new Vector2(-2, 0), Math.PI/2, 4)
    ];

    for (let i = 0; i < 4; i++) {
      const barrier = barriers[i];
      const [colliding, overlap] = barrier.checkPolyCollision(poly);

      if (colliding) this.position = this.position.add(barrier.getNormal().multiply(overlap));
    }

    this.updateSprite();
  }

  protected attack(): void {
    this.tool.use();
    this.sprite.playAnimation("shoot");
  }
}
