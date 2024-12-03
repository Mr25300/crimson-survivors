import { Renderer } from "./renderer";

const CANVAS = document.getElementById("gameScreen") as HTMLCanvasElement;

class Game {
  private static _instance: Game;

  private constructor() {
    new Renderer(CANVAS);
  }

  public get instance() {
    if (!Game._instance) Game._instance = new Game();

    return Game._instance;
  }
}