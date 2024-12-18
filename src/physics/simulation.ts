import {Game, Assets} from '../core/game.js';
import {Grunt} from '../objects/enemy/grunt.js';
import {Entity} from '../objects/entity.js';
import {Player} from '../objects/player/player.js';
import {Structure} from '../objects/barrier.js';
import {Canvas} from '../rendering/canvas.js';
import {SpriteModel} from '../sprites/spritemodel.js';
import {Vector2} from '../util/vector2.js';

export class Simulation {
  private structures: Structure[] = [];
  private spawnProbability: number = 1;
  private vampireTypes: string[] = ['grunt', 'thrower', 'necro'];
  private necroCount: number = 0;
  private gruntList: Grunt[] = [];
  private spawnTimer: number = 0;
  private mandatorySpawnCount: number = 0;

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
    // const randomVampire: string = this.vampireTypes[randomIndex];
    let randomVampire = 'grunt';
    if (randomVampire === 'grunt') {
      const model: SpriteModel = Game.instance.assets
        .getSprite('grunt')
        .createModel();
      const grunt: Grunt = new Grunt(randomPositionVector, model);
      this.gruntList.push(grunt);

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
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= 1) {
      this.spawnTimer %= 1;

      // Increase the vampire spawn chance
      this.spawnProbability += 1;

      if (this.spawnProbability >= 100) {
        this.mandatorySpawnCount++;
      } 

      // Adjust probability to remain within 0-100 range
      this.spawnProbability %= 100;

      console.log(this.mandatorySpawnCount, this.spawnProbability);
      // Spawn mandatory vampires
      for (let i: number = 0; i < this.mandatorySpawnCount; i++) {
        this.spawnVampire();
      }

      // Handle additional vampire spawn based on remaining probability
      if (Math.random() < this.spawnProbability / 100) {
        this.spawnVampire();
      }
    }
    for (let i: number = 0; i < this.gruntList.length; i++) {
      const element: Grunt = this.gruntList[i];
      element.pathFind(Game.instance.player.position);
      element.update(deltaTime);
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
