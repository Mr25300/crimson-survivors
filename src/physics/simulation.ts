import {Game, Assets} from '../core/game.js';
import {Grunt} from '../objects/enemy/grunt.js';
import {Entity} from '../objects/entity.js';
import {Player} from '../objects/player/player.js';
import {Structure} from '../objects/structure.js';
import {Canvas} from '../rendering/canvas.js';
import {SpriteModel} from '../sprites/spritemodel.js';
import {Vector2} from '../util/vector2.js';

export class Simulation {
  private structures: Structure[] = [];
  private spawnProbability: number = 1;
  private vampireTypes: string[] = ['grunt', 'thrower', 'necro'];
  private necroCount: number = 0;
  private gruntList: Grunt[] = [];

  constructor(private gameBound: Vector2) {
    for (let i: number = 0; i < 20; i++) {
      this.spawnVampire;
    }
  }

  private spawnVampire(): void {
    const randomPositionVector: Vector2 = new Vector2(
      Math.random() * this.gameBound.x - this.gameBound.x / 2,
      Math.random() * this.gameBound.y - this.gameBound.y / 2
    );

    const randomIndex: number = Math.floor(
      Math.random() * this.vampireTypes.length
    );
    const randomVampire: string = this.vampireTypes[randomIndex];
    if (randomVampire === 'grunt') {
      const model: SpriteModel = Game.instance.assets
        .getSprite('grunt')
        .createModel();
      const grunt: Grunt = new Grunt(randomPositionVector, model);
      // // spawn grunt
      // } else if (randomVampire === 'thrower') {
      // // spawn thrower
      // } else if (randomVampire === 'necro') {
      // if (this.necroCount < 2) {
      //   // spawn
      //   this.necroCount++;
      // }
      // }
      // all the other guys
    }
  }

  public update(deltaTime: number): void {
    // increase the vampire spawn chance
    this.spawnProbability += 1;
    // spawn the ones that are mandatory
    const mandatorySpawnCount: number = Math.floor(this.spawnProbability / 100);
    this.spawnProbability = (this.spawnProbability % 100) / 100;
    for (let i: number = 0; i < mandatorySpawnCount; i++) {
      this.spawnVampire();
    }
    if (Math.random() < this.spawnProbability) {
      this.spawnVampire();
    }
    for (let i: number = 0; i < this.gruntList.length; i++) {
      const element: Grunt = this.gruntList[i];
      element.pathFind(Game.instance.player.position);
    }

    Game.instance.player.input();
    Game.instance.player.update(deltaTime);
    // do collision for user

    // do melee attack hitboxes and create projectiles from attacks

    // simulate projectile physics and collisions
    // simulate entity physics
    // check structure collisions and reposition entities if colliding
  }
}
