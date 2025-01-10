import { Game } from "../core/game.js";
import { Bat } from "../objects/entities/bat.js";
import { Grunt } from "../objects/entities/grunt.js";
import { Kuranku } from "../objects/entities/kuranku.js";
import { Necromancer } from "../objects/entities/necromancer.js";
import { Patrol } from "../objects/entities/patrol.js";
import { Player } from "../objects/entities/player.js";
import { Entity } from "../objects/entity.js";
import { Util } from "../util/util.js";

// Define all HTML elements
const TITLE_SCREEN: HTMLDivElement = document.getElementById("title-screen") as HTMLDivElement;
const TITLE_SCREEN_START: HTMLButtonElement = document.getElementById("title-screen-start") as HTMLButtonElement;

const END_SCREEN: HTMLDivElement = document.getElementById("end-screen") as HTMLDivElement;
const TIME_SURVIVED: HTMLSpanElement = document.getElementById("time-survived") as HTMLSpanElement;
const KILLED_BY: HTMLSpanElement = document.getElementById("killed-by") as HTMLSpanElement;
const VAMPIRE_SAVE_COUNT: HTMLSpanElement = document.getElementById("vampire-save-count") as HTMLSpanElement;
const END_SCREEN_RESTART: HTMLButtonElement = document.getElementById("end-screen-restart") as HTMLButtonElement;

const HEALTH_BAR: HTMLProgressElement = document.getElementById("health-bar") as HTMLProgressElement;
const TOOL_DISPLAY: HTMLSpanElement = document.getElementById("tool-display") as HTMLSpanElement;

const FPS_DISPLAY: HTMLSpanElement = document.getElementById("fps-display") as HTMLSpanElement;
const ENTITY_DISPLAY: HTMLSpanElement = document.getElementById("entity-display") as HTMLSpanElement;
const PROJECTILE_DISPLAY: HTMLSpanElement = document.getElementById("projectile-display") as HTMLSpanElement;
const STRUCTURE_DISPLAY: HTMLSpanElement = document.getElementById("structure-display") as HTMLSpanElement;

/** Manages all UI actions and functionalities. */
export class UIManager {
  constructor() {
    // Remove right click context menu from elements
    document.addEventListener("contextmenu", (event: MouseEvent) => {
      event.preventDefault();
    });
  }

  /**
   * Display game screen (title or end) and add event listener to button to play/replay.
   * @param screen The div screen element.
   * @param button The button for starting/restarting.
   */
  private displayGameScreen(screen: HTMLDivElement, button: HTMLButtonElement): void {
    screen.classList.remove("hide");

    button.addEventListener("click", () => {
      screen.classList.add("hide");

      Game.instance.startGame();

    }, { once: true });
  }

  /** Display the game title screen and prompt the user to play. */
  public displayTitleScreen(): void {
    this.displayGameScreen(TITLE_SCREEN, TITLE_SCREEN_START);
  }

  /** Display all relevant info during the game. */
  public displayGameInfo(): void {
    const player: Player = Game.instance.simulation.player;

    HEALTH_BAR.value = player.health;
    HEALTH_BAR.max = player.maxHealth;
    TOOL_DISPLAY.innerText = player.tool ? player.tool.name : "None";

    FPS_DISPLAY.innerText = Game.instance.fps.toFixed(1);
    ENTITY_DISPLAY.innerText = Game.instance.simulation.entities.size.toString();
    PROJECTILE_DISPLAY.innerText = Game.instance.simulation.projectiles.size.toString();
    STRUCTURE_DISPLAY.innerText = Game.instance.simulation.structures.size.toString();
  }

  /** Display the end screen with the game stats and prompt the user to continue. */
  public displayEndScreen(): void {
    const player: Player = Game.instance.simulation.player;

    // Get and format time played
    const [seconds, minutes, hours] = Util.getTimeComponents(Game.instance.elapsedTime);
    const secondsStr: string = Util.padStart(seconds.toString(), "0", 2);
    const minutesStr: string = Util.padStart(minutes.toString(), "0", 2);
    const hoursStr: string = Util.padStart(hours.toString(), "0", 2);

    // Determine killer based on player"s last attacker
    const lastAttacker: Entity | undefined = player.lastAttacker;
    let killer: string = "???";

    if (lastAttacker) {
      if (lastAttacker instanceof Grunt) killer = "Grunt";
      else if (lastAttacker instanceof Kuranku) killer = "Kuranku";
      else if (lastAttacker instanceof Patrol) killer = "Patrol";
      else if (lastAttacker instanceof Necromancer) killer = "Necromancer";
      else if (lastAttacker instanceof Bat) killer = "Bat";
    }

    TIME_SURVIVED.innerText = `${hoursStr}:${minutesStr}:${secondsStr}`;
    KILLED_BY.innerText = killer;
    VAMPIRE_SAVE_COUNT.innerText = player.kills.toString();

    this.displayGameScreen(END_SCREEN, END_SCREEN_RESTART);
  }
}