import { Game } from "../core/game.js";
import { Player } from "../objects/entities/player.js";

const TITLE_SCREEN = document.getElementById("title-screen") as HTMLDivElement;
const TITLE_SCREEN_START = document.getElementById("title-screen-start") as HTMLButtonElement;

const END_SCREEN = document.getElementById("end-screen") as HTMLDivElement;
const TIME_PLAYED = document.getElementById("time-played") as HTMLSpanElement;
const KILLED_BY = document.getElementById("killed-by") as HTMLSpanElement;
const VAMPIRE_SAVE_COUNT = document.getElementById("vampire-save-count") as HTMLSpanElement;
const END_SCREEN_RESTART = document.getElementById("end-screen-restart") as HTMLButtonElement;

const HEALTH_BAR = document.getElementById("health-bar") as HTMLProgressElement;
const TOOL_DISPLAY = document.getElementById("tool-display") as HTMLSpanElement;

const FPS_DISPLAY = document.getElementById("fps-display") as HTMLSpanElement;
const ENTITY_DISPLAY = document.getElementById("entity-display") as HTMLSpanElement;
const PROJECTILE_DISPLAY = document.getElementById("projectile-display") as HTMLSpanElement;

export class UIManager {
  constructor() {
    document.addEventListener("contextmenu", (event: MouseEvent) => {
      event.preventDefault();
    });
  }

  public displayTitleScreen(): void {
    TITLE_SCREEN.classList.remove("hide");

    TITLE_SCREEN_START.addEventListener("click", () => {
      TITLE_SCREEN.classList.add("hide");

      Game.instance.startGame();

    }, { once: true });
  }

  public displayGameInfo(): void {
    const player: Player = Game.instance.simulation.player;

    HEALTH_BAR.value = player.health;
    HEALTH_BAR.max = player.maxHealth;
    TOOL_DISPLAY.innerText = player.tool ? player.tool.name : "None";

    FPS_DISPLAY.innerText = Game.instance.fps.toFixed(1);
    ENTITY_DISPLAY.innerText = Game.instance.simulation.entityCount.toString();
    PROJECTILE_DISPLAY.innerText = Game.instance.simulation.projectileCount.toString();
  }

  public displayEndScreen(): void {
    TIME_PLAYED.innerText = Math.floor(Game.instance.elapsedTime).toString();
    VAMPIRE_SAVE_COUNT.innerText = Game.instance.simulation.player.kills.toString();

    END_SCREEN.classList.remove("hide");

    END_SCREEN_RESTART.addEventListener("click", () => {
      END_SCREEN.classList.add("hide");

      Game.instance.startGame();

    }, { once: true });
  }
}