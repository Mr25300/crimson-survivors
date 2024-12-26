import { Game } from "../core/game.js";
import {ShaderProgram} from "../rendering/shaderprogram.js";
import {Matrix4} from "../util/matrix4.js";
import {SpriteModel} from "./spritemodel.js";

export class SpriteSheet {
  private texture: WebGLTexture;
  private coordBuffer: WebGLBuffer;

  private animations: Map<string, AnimationInfo> = new Map();

  constructor(
    imagePath: string,
    private width: number,
    private height: number,
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

  public bindCoordBuffer(cellNumber: number): void {
    Game.instance.canvas.shader.setAttribBuffer("textureCoord", this.coordBuffer, 2, 0, cellNumber * 2 * 4 * Float32Array.BYTES_PER_ELEMENT);
  }

  public createModel(): SpriteModel {
    const model = new SpriteModel(this);

    return model;
  }

  public createAnimation(name: string, frames: number[], duration: number, looped: boolean, priority: number): void {
    this.animations.set(name, new AnimationInfo(frames, duration, looped, priority));
  }

  public getAnimation(name: string): AnimationInfo | undefined {
    return this.animations.get(name);
  }

  public bind(): void {
    Game.instance.canvas.bindTexture(this.texture);
    Game.instance.canvas.shader.setUniformMatrix4("spriteScale", Matrix4.fromScale(this.width, this.height));
    Game.instance.canvas.shader.setUniformFloat("zOrder", this.zOrder);
  }

  public destroy(): void {
    Game.instance.canvas.deleteTexture(this.texture);
    Game.instance.canvas.deleteBuffer(this.coordBuffer);
  }
}

export class AnimationInfo {
  constructor(
    private _frames: number[],
    private _duration: number,
    private _looped: boolean,
    private _priority: number
  ) {}

  public get frames(): number[] {
    return this._frames;
  }

  public get duration(): number {
    return this._duration;
  }

  public get looped(): boolean {
    return this._looped;
  }

  public get priority(): number {
    return this._priority;
  }
}