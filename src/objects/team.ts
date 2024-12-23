import { Game } from "../core/game";

export class Team {
  constructor(
    private name: string
  ) {
    Game.instance.teams.set(name, this);
  }
}