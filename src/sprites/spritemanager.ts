import { SpriteModel } from "../sprites/spritemodel.js";
import { SpriteSheet } from "../sprites/spritesheet.js";

type SpriteName =
"player" | "playerNeedle" | "playerExplosive" |
"grunt" |
"kuranku" | "kurankuRock" |
"patrol" | "patrolWall" |
"necromancer" | "bat" |
"floor" | "wall";

export class SpriteManager {
  private sprites: Record<SpriteName, SpriteSheet>;

  constructor() { // make sure this is all correct
    const player: SpriteSheet = new SpriteSheet("res/assets/PlayerWithLauncher.png", 1, 1, 11, 3, 4, 2);
    player.createAnimation("idle", [0], 1, true, 0);
    player.createAnimation("walking", [7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 5, 6], 1, true, 1);
    player.createAnimation("projectileShoot", [0, 1, 2, 3], 0.3, false, 2);

    const playerNeedle: SpriteSheet = new SpriteSheet("res/assets/PlayerNeedle.png", 1, 1, 1, 1, 1, 3);
    const playerExplosive: SpriteSheet = new SpriteSheet("res/assets/PlayerExplosive.png", 1, 1, 1, 1, 1, 3);

    const grunt: SpriteSheet = new SpriteSheet("res/assets/Grunt.png", 1, 1, 30, 5, 6, 1);
    grunt.createAnimation("idle", [3], 1, true, 0);
    grunt.createAnimation("walking", [3, 2, 1, 0, 1, 2, 3, 4, 5, 6, 5, 4], 1, true, 1);
    const gruntAttackAnim = grunt.createAnimation("attack", [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29], 0.5, false, 2);
    gruntAttackAnim.addMarker("spawnHitbox", 16);
    
    const kuranku: SpriteSheet = new SpriteSheet("res/assets/Kuranku.png", 1, 1, 15, 4, 4, 1);
    kuranku.createAnimation("idle", [2], 1, true, 0);
    kuranku.createAnimation("walking", [2, 1, 0, 1, 2, 3, 4, 3, 2], 1, true, 1);
    kuranku.createAnimation("throw", [5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 1, false, 2);

    const kurankuRock: SpriteSheet = new SpriteSheet("res/assets/KurankuRock.png", 1, 1, 1, 1, 1, 3);

    const patrol: SpriteSheet = new SpriteSheet("res/assets/Patrol.png", 1, 1, 22, 5, 5, 1);
    patrol.createAnimation("idle", [3], 1, true, 0);
    patrol.createAnimation("walking", [3, 2, 1, 0, 1, 2, 3, 4, 5, 6, 5, 4, 3], 1, true, 1);
    patrol.createAnimation("create", [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], 2, false, 2);

    const patrolWall: SpriteSheet = new SpriteSheet("res/assets/PatrolWall.png", 1, 1, 7, 3, 3, 1);
    patrolWall.createAnimation("appear", [6, 5, 4, 3, 2, 1, 0], 1, false, 1);
    patrolWall.createAnimation("disappear", [0, 1, 2, 3, 4, 5, 6], 1, false, 2);

    const necromancer: SpriteSheet = new SpriteSheet("res/assets/Necromancer.png", 1, 1, 7, 3, 3, 1);
    necromancer.createAnimation("idle", [0], 1, true, 0);
    necromancer.createAnimation("walking", [0], 1, true, 1);
    necromancer.createAnimation("spawn", [0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1], 1, false, 2);

    const bat: SpriteSheet = new SpriteSheet("res/assets/Bat.png", 1, 1, 6, 2, 3, 1);
    bat.createAnimation("idle", [0], 1, true, 0);
    bat.createAnimation("walking", [0, 1, 2, 3, 4, 5], 1, true, 1);
    
    const floor: SpriteSheet = new SpriteSheet("res/assets/FloorTile.png", 1, 1, 1, 1, 1, -1);
    const wall: SpriteSheet = new SpriteSheet("res/assets/WallTile.png", 1, 1, 1, 1, 1, 0);

    this.sprites = {
      player: player,
      playerNeedle: playerNeedle,
      playerExplosive: playerExplosive,
      grunt: grunt,
      kuranku: kuranku,
      kurankuRock: kurankuRock,
      patrol: patrol,
      patrolWall: patrolWall,
      necromancer: necromancer,
      bat: bat,
      floor: floor,
      wall: wall
    }
  }

  public create(name: SpriteName, width?: number, height?: number, tiling?: boolean): SpriteModel {
    const sprite = this.sprites[name];

    if (!sprite) throw new Error(`Sprite "${name}" does not exist.`);

    return new SpriteModel(sprite, width, height, tiling);
  }
}