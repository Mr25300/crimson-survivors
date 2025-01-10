import { Entity } from "./entity.js";

/** Handles entity grouping for whitelisting. */
export class Team {
  private members: Set<Entity> = new Set();

  constructor(public readonly name: string) {}

  /**
   * Add an entity to the team.
   * @param entity The member being added.
   */
  public addMember(entity: Entity): void {
    this.members.add(entity);
  }

  /**
   * Remove an entity from the team.
   * @param entity The member being removed.
   */
  public removeMember(entity: Entity): void {
    this.members.delete(entity);
  }

  /**
   * Check if the team is empty.
   * @returns True if empty, false otherwise.
   */
  public hasNoMembers(): boolean {
    return this.members.size === 0;
  }
}