import { SpriteModel } from "../sprites/spritemodel.js";
import { SpriteSheet } from "../sprites/spritesheet.js";

const SPRITE_LIST: string[] = [
  "player",
  "bullet",
  "grunt",
  "kronku",
  "necro",
  "patrol",
  "batspawner",
  "wall",
  "floor"
] as const; // fix this type checking

export class SpriteManager {
  private sprites: Record<typeof SPRITE_LIST[number], SpriteSheet>;

  constructor() {
    const player: SpriteSheet = new SpriteSheet("res/assets/Player.png", 1, 1, 11, 3, 4, 2);
    player.createAnimation("idle", [0], 1, true, 0);
    player.createAnimation("walking", [6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 4, 5], 1, true, 1);
    player.createAnimation("shoot", [0, 1, 2, 1], 0.3, false, 2);

    const bullet: SpriteSheet = new SpriteSheet("res/assets/Bullet.png", 1, 1, 1, 1, 1, 3);

    const grunt: SpriteSheet = new SpriteSheet("res/assets/Grunt.png", 1, 1, 11, 5, 6, 1);
    grunt.createAnimation("idle", [0], 1, true, 0);
    grunt.createAnimation("walking", [3, 2, 1, 0, 1, 2, 3, 4, 5, 6, 5, 4], 1, true, 1);
    // grunt.createAnimation("attack")

    const kronku: SpriteSheet = new SpriteSheet("res/assets/Kronku.png", 1, 1, 15, 4, 4, 1);
    kronku.createAnimation("idle", [2], 1, true, 0);
    kronku.createAnimation("walking", [2, 1, 0, 1, 2, 3, 4, 3, 2], 1, true, 1);
    kronku.createAnimation("throwing", [6, 7, 8, 9, 10, 11, 12, 13, 14], 1, false, 2);

    const necro: SpriteSheet = new SpriteSheet("res/assets/Necromancer.png", 1, 1, 13, 4, 4, 1);
    necro.createAnimation("walking", [0], 1, true, 1);
    necro.createAnimation("idle", [0], 1, true, 0);
    necro.createAnimation("spawning", [0, 1, 2, 3, 4, 5, 6], 1, false, 2);

    const patrol: SpriteSheet = new SpriteSheet("res/assets/Patrol.png", 1, 1, 29, 5, 6, 1);
    patrol.createAnimation("idle", [3], 1, true, 0);
    patrol.createAnimation("walking", [3, 2, 1, 0, 1, 2, 3, 4, 5, 6, 5, 4, 3], 1, true, 1);
    patrol.createAnimation("deport", [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], 1, false, 2);

    const batspawner: SpriteSheet = new SpriteSheet("res/assets/Spawner.png", 1, 1, 1, 1, 1, 1);
    batspawner.createAnimation("idle", [0], 1, true, 0);
    batspawner.createAnimation("walking", [0], 1, true, 1);

    const floor: SpriteSheet = new SpriteSheet("res/assets/FloorTile.png", 1, 1, 1, 1, 1, 0);
    const wall: SpriteSheet = new SpriteSheet("res/assets/WallTile.png", 1, 1, 1, 1, 1, 0);

    this.sprites = {
      player: player,
      bullet: bullet,
      grunt: grunt,
      kronku: kronku,
      necro: necro,
      patrol: patrol,
      batspawner: batspawner,
      floor: floor,
      wall: wall
    };
  }

  public create(name: typeof SPRITE_LIST[number]): SpriteModel {
    if (SPRITE_LIST.indexOf(name) < 0) console.error(`Sprite "${name}" does not exist.`);

    return this.sprites[name].createModel();
  }
}