import {Gameloop} from './gameloop.js';
import {Canvas} from '../rendering/canvas.js';

class Game extends Gameloop {
  private static _instance: Game;

  private canvas: Canvas;

  private constructor() {
    super();

    this.canvas = new Canvas();

    this.start();
  }

  public static get instance(): Game {
    if (!Game._instance) Game._instance = new Game();

    return Game._instance;
  }

  protected update(deltaTime: number): void {}

  protected render(): void {}
}

class Driver {
  constructor() {
    Game.instance;
  }
}

new Driver();
