import { Game } from '../../core/game.js';
import {SpriteModel} from '../../sprites/spritemodel.js';
import {Vector2} from '../../util/vector2.js';
import {Entity} from '../entity.js';

export class Patrol extends Entity {
  protected attack(): void {
    throw new Error('Method not implemented.');
  }
  private detectionRadius: number = 5;
  constructor(
    position: Vector2,
    public sprite: SpriteModel
  ) {
    super(sprite, 1, 1, 50, 1);
    this.position = position;
    sprite.setTransformation(position, this.rotation);
    this.setFaceDirection(new Vector2(1, 0));
    this.setMoveDirection(new Vector2(1, 0));
  }
  public pathFind(playerLocation: Vector2): void {
    // if in range
    if (
      playerLocation.subtract(this.position).magnitude() <= this.detectionRadius
    ) {
      this.setFaceDirection(playerLocation.subtract(this.position).unit());
      this.setMoveDirection(playerLocation.subtract(this.position).unit());
    } else {
      this.setMoveDirection(new Vector2(0, 0));
    }
  }
  private buildWall(playerLocation: Vector2): void {
    const randomNumber = Math.random();
    // 5% chance we build a wall
    if (randomNumber <= 0.05) {
    this.sprite.playAnimation("deport");
      // build a wall
    }

  }
  public brain() {
    this.buildWall(Game.instance.player.position);
  }
}
