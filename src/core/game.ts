import { Gameloop } from "./gameloop.js";
import { Canvas } from "../rendering/canvas.js";

class Game extends Gameloop {
  private static _instance: Game;

  private canvas: Canvas;

  private constructor() {
    super();

    this.canvas = new Canvas();

    this.canvas.init().then(() => {
      const sprite = this.canvas.createSprite(1, 1, 10, 5, 2, "res/assets/testanimsprite.png");

      sprite.createAnimation("walking", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

      for (let i = 0; i < 100; i++) {
        const angle = Math.PI*2 * i/100;
        const model = sprite.createModel();

        model.setTransformation(Math.sin(angle)*4, Math.cos(angle)*4, angle);
        model.playAnimation("walking", 1, Math.random());
      }

      this.start();
    });    
  }

  public static get instance(): Game {
    if (!Game._instance) Game._instance = new Game();

    return Game._instance;
  }

  protected update(deltaTime: number): void {
    this.canvas.update(deltaTime);
  }

  protected render(): void {
    this.canvas.render();
  }
}

class Driver {
  constructor() {
    Game.instance;
  }
}

new Driver();
