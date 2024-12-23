import {Entity} from '../entity.js';
import {Tool} from './tool.js';
import {Vector2} from '../../util/vector2.js';
import {SpriteModel} from '../../sprites/spritemodel.js';
import { Game } from '../../core/game.js';
import { Polygon } from '../../physics/collisions.js';

export class Player extends Entity {
  public name: string = "Player"; // testing
  
  private tool: Tool = new Tool('GUN!', 1);
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
      3
    );
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

    // for (let i: number = 0; i < this.tools.length; i++) {
    //   this.tools[i].update(deltaTime);
    // }

    // if (this.controller.isMouseDown()) {
    //   this.attack();
    // }

    // const poly = new HitPoly(this.position, this.rotation,
    //   new Vector2(-0.5, -0.5),
    //   new Vector2(0.5, -0.5),
    //   new Vector2(0, 0.5)
    // );

    // const barriers = [
    //   new HitLine(new Vector2(0, 2), Math.PI, 4),
    //   new HitLine(new Vector2(0, -2), 0, 4),
    //   new HitLine(new Vector2(2, 0), -Math.PI/2, 4),
    //   new HitLine(new Vector2(-2, 0), Math.PI/2, 4)
    // ];

    // for (let i = 0; i < 4; i++) {
    //   const barrier = barriers[i];
    //   const [colliding, overlap] = barrier.checkPolyCollision(poly);

    //   if (colliding) this.position = this.position.add(barrier.getNormal().multiply(overlap));
    // }

    this.updateCoordinates(this.position, this.rotation);
  }

  public input(): void {
    let moveDir = new Vector2();

    if (Game.instance.controller.isControlActive("moveU")) moveDir = moveDir.add(new Vector2(0, 1));
    if (Game.instance.controller.isControlActive("moveD")) moveDir = moveDir.add(new Vector2(0, -1));
    if (Game.instance.controller.isControlActive("moveL")) moveDir = moveDir.add(new Vector2(-1, 0));
    if (Game.instance.controller.isControlActive("moveR")) moveDir = moveDir.add(new Vector2(1, 0));

    const aimDir = Game.instance.controller.getAimPosition().subtract(this.position);

    this.setMoveDirection(moveDir);
    this.setFaceDirection(aimDir);
  }

  public attack(): void {
    this.tool.use(this);
  }
}
