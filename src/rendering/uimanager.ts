import { Game } from "../core/game.js";

const TITLE_SCREEN = document.getElementById("title-screen") as HTMLDivElement;
const TITLE_SCREEN_START = document.getElementById("title-screen-start") as HTMLButtonElement;

const END_SCREEN = document.getElementById("end-screen") as HTMLDivElement;
const END_SCREEN_RESTART = document.getElementById("end-screen-restart") as HTMLButtonElement;

const HEALTH_BAR = document.getElementById("health-bar") as HTMLProgressElement;
const FPS_DISPLAY = document.getElementById("fps-display") as HTMLSpanElement;
const ENTITY_COUNT_DISPLAY = document.getElementById("entity-count-display") as HTMLSpanElement;

export class UIManager {
  constructor() {
    document.addEventListener("contextmenu", (event: MouseEvent) => {
      event.preventDefault();
    });
  }

  public displayTitleScreen(): void {
    TITLE_SCREEN.classList.add("show");

    TITLE_SCREEN_START.addEventListener("click", () => {
      TITLE_SCREEN.classList.remove("show");

      Game.instance.startGame();

    }, { once: true });
  }

  public displayGameInfo(): void {
    HEALTH_BAR.value = Game.instance.player.health;
    HEALTH_BAR.max = Game.instance.player.maxHealth;

    FPS_DISPLAY.innerText = Game.instance.fps.toFixed(1);
    ENTITY_COUNT_DISPLAY.innerText = Game.instance.entities.size.toString();
  }

  public displayEndScreen(): void {
    END_SCREEN.classList.add("show");

    END_SCREEN_RESTART.addEventListener("click", () => {
      END_SCREEN.classList.remove("show");

      Game.instance.startGame();

    }, { once: true });
  }
}