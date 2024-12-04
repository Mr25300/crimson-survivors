import {Renderer} from './renderer.js';

const CANVAS = document.getElementById('gameScreen') as HTMLCanvasElement;

class Game {
  private static _instance: Game;

  private constructor() {
    new Renderer(CANVAS);
  }

  public static get instance() {
    if (!Game._instance) Game._instance = new Game();

    return Game._instance;
  }
}

class Driver {
  constructor() {
    Game.instance;
  }
}

new Driver();
