import { Game } from "../core/game.js";
import { Entity } from "./entity.js";

export class Team {
  private members: Set<Entity> = new Set();

  constructor(public readonly name: string) {}

  public addMember(entity: Entity): void {
    this.members.add(entity);
  }

  public removeMember(entity: Entity): void {
    this.members.delete(entity);
  }

  public removeAll(): void {
    this.members.clear();
  }

  public hasNoMembers(): boolean {
    return this.members.size === 0;
  }
}