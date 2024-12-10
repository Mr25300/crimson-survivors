import { Structure } from "../objects/structure.js";
import { Canvas } from "../rendering/canvas.js";

class Simulation {
  private structures: Structure[] = [];

  constructor(
    private canvas: Canvas
  ) {

  }

  public update() {
    // read input
    // do melee attack hitboxes and create projectiles from attacks
    // simulate projectile physics and collisions
    // simulate entity physics
    // check structure collisions and reposition entities if colliding
  }
}