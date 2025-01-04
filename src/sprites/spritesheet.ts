import { Game } from "../core/game.js";
import {ShaderProgram} from "../rendering/shaderprogram.js";
import { Vector2 } from "../util/vector2.js";
import {SpriteModel} from "./spritemodel.js";

export class SpriteSheet {
  private texture: WebGLTexture;

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

  public createAnimation(name: string, frames: number[], duration: number, looped: boolean, priority: number): AnimationInfo {
    const info = new AnimationInfo(frames, duration, looped, priority);
    this.animations.set(name, info);

    return info;
  }

  public getAnimation(name: string): AnimationInfo | undefined {
    return this.animations.get(name);
  }

  public bind(): void {
    Game.instance.canvas.bindTexture(this.texture);
    Game.instance.canvas.shader.setUniformVector("spriteSize", this.sheetSize);
    Game.instance.canvas.shader.setUniformFloat("zOrder", this.zOrder);
  }

  public destroy(): void {
    Game.instance.canvas.deleteTexture(this.texture);
  }
}

export class AnimationInfo {
  private markers: Map<string, number> = new Map();
  private modifiers: Map<string, number> = new Map();

  constructor(
    public readonly frames: number[],
    public readonly duration: number,
    public readonly looped: boolean,
    public readonly priority: number
  ) {}

  public addMarker(name: string, frame: number): void {
    if (frame >= this.frames.length) {
      console.error("Frame number out of range.");

      return;
    }

    this.markers.set(name, frame);
  }

  public getMarkers(): Map<string, number> {
    return this.markers;
  }

  public createModifier(name: string, modification: number): void {
    this.modifiers.set(name, modification);
  }

  public getModifier(name: string): number | undefined {
    return this.modifiers.get(name);
  }
}