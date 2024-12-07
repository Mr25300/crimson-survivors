import { Vector2 } from '../util/vector2.js';

export class HitRay {
  constructor(
    private start: Vector2,
    private end: Vector2
  ) {}
}

export class HitRadius {
  
}

export class HitBox {
  private position: Vector2;
  private rotation: number;

  constructor(
    private width: number,
    private height: number
  ) {}

  public setCoordinates(position: Vector2, rotation: number): void {
    this.position = position;
    this.rotation = rotation;
  }

  public getRayCollision(ray: HitRay): HitRay {
    

    return ray;
  }

  public checkRadiusCollision(radius: HitRadius): boolean {
    return false;
  }

  public checkBoxCollision(box: HitBox): boolean {
    return false;
  }
}