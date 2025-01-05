import { SpriteModel } from "../sprites/spritemodel.js";
import { SpriteSheet } from "../sprites/spritesheet.js";
import { Vector2 } from "../util/vector2.js";

export type SpriteName =
"player" | "playerNeedle" | "playerExplosive" |
"projectileInjector" | "machineInjector" |
"grunt" |
"kuranku" | "kurankuRock" |
"patrol" | "patrolWall" |
"necromancer" | "bat" |
"floor" | "wall";

export class SpriteManager {
  private sprites: Record<SpriteName, SpriteSheet>;

  constructor() { // make sure this is all correct
    const player: SpriteSheet = new SpriteSheet("res/assets/Player.png", 1, 1, new Vector2(7, 7), 3);
    const playerIdle = player.createAnimation("idle", [7], 1, true, 0);
    playerIdle.createModifier("injector", 0);
    playerIdle.createModifier("explosive", 26);
    playerIdle.createModifier("machineInjector", 38);
    const playerWalk = player.createAnimation("walking", [7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 5, 6], 1, true, 1);
    playerWalk.createModifier("injector", 0);
    playerWalk.createModifier("explosive", 26);
    playerWalk.createModifier("machineInjector", 38);
    player.createAnimation("projectileShoot", [0, 1, 2, 3], 0.2, false, 2);
    const explosiveThrow = player.createAnimation("explosiveThrow", [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29], 1, false, 2);
    explosiveThrow.addMarker("spawnExplosive", 17);
    player.createAnimation("machineShoot", [37, 38, 39, 40], 0.1, false, 2);

    const playerNeedle: SpriteSheet = new SpriteSheet("res/assets/PlayerNeedle.png", 1, 1, new Vector2(1, 1), 3);

    const playerExplosive: SpriteSheet = new SpriteSheet("res/assets/PlayerExplosive.png", 1, 1, new Vector2(4, 4), 3);
    playerExplosive.createAnimation("beeping", [0, 1, 2, 3, 4, 5], 2, true, 1);
    const explode = playerExplosive.createAnimation("explode", [6, 7, 8, 9, 10, 11, 12, 13], 0.3, false, 2);
    explode.addMarker("spawnHitbox", 2);
    explode.addMarker("despawn", 7);

    const projectileInjector: SpriteSheet = new SpriteSheet("res/assets/ProjectileInjectorItem.png", 1, 1, new Vector2(1, 1), 1);
    const machineInjector: SpriteSheet = new SpriteSheet("res/assets/MachineInjectorItem.png", 1, 1, new Vector2(1, 1), 1);

    const grunt: SpriteSheet = new SpriteSheet("res/assets/Grunt.png", 1, 1, new Vector2(5, 6), 1);
    grunt.createAnimation("idle", [3], 1, true, 0);
    grunt.createAnimation("walking", [3, 2, 1, 0, 1, 2, 3, 4, 5, 6, 5, 4], 1, true, 1);
    const gruntAttackAnim = grunt.createAnimation("attack", [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29], 0.5, false, 2);
    gruntAttackAnim.addMarker("spawnHitbox", 16);
    
    const kuranku: SpriteSheet = new SpriteSheet("res/assets/Kuranku.png", 1, 1, new Vector2(4, 4), 1);
    kuranku.createAnimation("idle", [2], 1, true, 0);
    kuranku.createAnimation("walking", [2, 1, 0, 1, 2, 3, 4, 3, 2], 1, true, 1);
    const kurankuThrowAnim = kuranku.createAnimation("throw", [5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 0.7, false, 2);
    kurankuThrowAnim.addMarker("spawnRock", 9);

    const kurankuRock: SpriteSheet = new SpriteSheet("res/assets/KurankuRock.png", 1, 1, new Vector2(1, 1), 3);

    const patrol: SpriteSheet = new SpriteSheet("res/assets/Patrol.png", 1, 1, new Vector2(5, 5), 1);
    patrol.createAnimation("idle", [3], 1, true, 0);
    patrol.createAnimation("walking", [3, 2, 1, 0, 1, 2, 3, 4, 5, 6, 5, 4, 3], 1, true, 1);
    const patrolCreateAnim = patrol.createAnimation("create", [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], 1.2, false, 2);
    patrolCreateAnim.addMarker("spawnWall", 10);

    const patrolWall: SpriteSheet = new SpriteSheet("res/assets/PatrolWall.png", 1, 1, new Vector2(3, 3), 1);
    patrolWall.createAnimation("solid", [0], 1, true, 0);
    patrolWall.createAnimation("appear", [7, 6, 5, 4, 3, 2, 1, 0], 0.5, false, 1);
    const disappear = patrolWall.createAnimation("disappear", [0, 1, 2, 3, 4, 5, 6, 7], 0.5, false, 2);
    disappear.addMarker("gone", 7);

    const necromancer: SpriteSheet = new SpriteSheet("res/assets/Necromancer.png", 1, 1, new Vector2(3, 3), 1);
    necromancer.createAnimation("idle", [0], 1, true, 0);
    necromancer.createAnimation("walking", [0], 1, true, 1);
    const necromancerSpawn = necromancer.createAnimation("spawn", [0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1], 0.6, false, 2);
    necromancerSpawn.addMarker("spawnBats", 6);

    const bat: SpriteSheet = new SpriteSheet("res/assets/Bat.png", 1, 1, new Vector2(2, 3), 1);
    bat.createAnimation("idle", [0], 1, true, 0);
    bat.createAnimation("walking", [0, 1, 2, 3, 4, 5], 1, true, 1);
    
    const floor: SpriteSheet = new SpriteSheet("res/assets/FloorTile.png", 1, 1, new Vector2(1, 1), -1);
    const wall: SpriteSheet = new SpriteSheet("res/assets/WallTile.png", 1, 1, new Vector2(1, 1), 0);

    this.sprites = {
      player: player,
      playerNeedle: playerNeedle,
      playerExplosive: playerExplosive,
      projectileInjector: projectileInjector,
      machineInjector: machineInjector,
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

  public create(name: SpriteName, size?: Vector2, tiling?: boolean): SpriteModel {
    const sprite = this.sprites[name];

    if (!sprite) throw new Error(`Sprite "${name}" does not exist.`);

    return new SpriteModel(sprite, size, tiling);
  }
}