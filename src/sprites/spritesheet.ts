import { Game } from "../core/game.js";
import {ShaderProgram} from "../rendering/shaderprogram.js";
import {Matrix4} from "../util/matrix4.js";
import { Vector2 } from "../util/vector2.js";
import {SpriteModel} from "./spritemodel.js";

export class SpriteSheet {
  private texture: WebGLTexture;
  public readonly coordBuffer: WebGLBuffer;

  private animations: Map<string, AnimationInfo> = new Map();

  constructor(
    imagePath: string,
    public readonly width: number,
    public readonly height: number,
    private spriteCount: number,
    private columns: number,
    private rows: number,
    private zOrder: number
  ) {
    const spriteCoords: number[] = [];

    for (let i: number = 0; i < this.spriteCount; i++) {
      const currentRow = Math.floor(i / this.columns);
      const startX = (i % this.columns) / this.columns;
      const endX = startX + 1 / this.columns;
      const startY = currentRow / this.rows;
      const endY = startY + 1 / this.rows;

      spriteCoords.push(startX, endY, endX, endY, startX, startY, endX, startY);
    }

    this.texture = Game.instance.canvas.createTexture(imagePath);
    this.coordBuffer = Game.instance.canvas.createBuffer(new Float32Array(spriteCoords));
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
    Game.instance.canvas.shader.setUniformFloat("zOrder", this.zOrder);
  }

  public destroy(): void {
    Game.instance.canvas.deleteTexture(this.texture);
    Game.instance.canvas.deleteBuffer(this.coordBuffer);
  }
}

export class AnimationInfo {
  private markers: Map<string, number> = new Map();

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

  public getMarker(name: string): number | undefined {
    return this.markers.get(name);
  }
}