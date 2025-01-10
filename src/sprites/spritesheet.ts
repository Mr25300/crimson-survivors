import { Game } from "../core/game.js";
import { Vector2 } from "../util/vector2.js";

/** Represents a sprite sheet and its animations. */
export class SpriteSheet {
  private texture: WebGLTexture;

  /** The sprite sheet"s animation info map. */
  private animations: Map<string, AnimationInfo> = new Map();

  constructor(
    imagePath: string,
    public readonly width: number,
    public readonly height: number,
    private sheetSize: Vector2,
    private zOrder: number
  ) {
    this.texture = Game.instance.canvas.createTexture(imagePath);
  }

  /**
   * Creates an animation for the sprite sheet based on the given parameters.
   * @param name The name of the animation.
   * @param frames The animation frames.
   * @param duration The duration of the animation.
   * @param looped Whether or not the animation is looped.
   * @param priority The priority of the animation.
   * @returns The animation info of the object created.
   */
  public createAnimation(name: string, frames: number[], duration: number, looped: boolean, priority: number): AnimationInfo {
    const info: AnimationInfo = new AnimationInfo(frames, duration, looped, priority);
    this.animations.set(name, info);

    return info;
  }

  /**
   * Gets the animation info for an animation name.
   * @param name The name of the animation.
   * @returns The animation info associated with the name if existant.
   */
  public getAnimation(name: string): AnimationInfo | undefined {
    return this.animations.get(name);
  }

  /**
   * Bind the sprite sheet"s texture and uniforms in preparation for rendering.
   */
  public bind(): void {
    Game.instance.canvas.bindTexture(this.texture);
    Game.instance.canvas.shader.setUniformVector("spriteSize", this.sheetSize);
    Game.instance.canvas.shader.setUniformFloat("zOrder", this.zOrder);
  }

  /**
   * Destroy the sprite sheet and it"s texture.
   */
  public destroy(): void {
    Game.instance.canvas.deleteTexture(this.texture);
  }
}

export class AnimationInfo {
  /** A map of the animation marker events. */
  private markers: Map<string, number> = new Map();
  /** A map of the animation frame modifiers. */
  private modifiers: Map<string, number> = new Map();

  constructor(
    public readonly frames: number[],
    public readonly duration: number,
    public readonly looped: boolean,
    public readonly priority: number
  ) {}

  /**
   * Creates a marker for the animation for a given frame.
   * @param name The name of the marker.
   * @param frame The frame of the marker event.
   */
  public addMarker(name: string, frame: number): void {
    if (frame >= this.frames.length) {
      console.error("Frame number out of range.");

      return;
    }

    this.markers.set(name, frame);
  }

  /**
   * Gets the markers of the animation.
   * @returns The marker map.
   */
  public getMarkers(): Map<string, number> {
    return this.markers;
  }

  /**
   * Creates a modifier for the animation.
   * @param name The name of the modifier.
   * @param modification The modification amount.
   */
  public createModifier(name: string, modification: number): void {
    this.modifiers.set(name, modification);
  }

  /**
   * Gets the modification of a modifier.
   * @param name The name of the modifier.
   * @returns The modification value.
   */
  public getModifier(name: string): number | undefined {
    return this.modifiers.get(name);
  }
}