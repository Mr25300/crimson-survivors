import { Game } from "../core/game.js";
import {ShaderProgram} from "../rendering/shaderprogram.js";
import {Matrix4} from "../util/matrix4.js";
import {SpriteModel} from "./spritemodel.js";

export class SpriteSheet {
  private texture: WebGLTexture;
  private coordBuffer: WebGLBuffer;

  public models: SpriteModel[] = [];
  private animations: Map<string, AnimationInfo> = new Map();

  constructor( // ADD Z-LEVEL TO SPRITESHEET
    private width: number,
    private height: number,
    private spriteCount: number,
    private columns: number,
    private rows: number,
    imagePath: string
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

    this.texture = Game.instance.canvas.shader.createTexture(imagePath);
    this.coordBuffer = Game.instance.canvas.shader.createBuffer(new Float32Array(spriteCoords));
  }

  public get buffer(): WebGLBuffer {
    return this.coordBuffer;
  }

  // public createModel() {
  //   return new Model(this);
  // }

  public createAnimation(name: string, frames: number[], duration: number, looped: boolean, priority: number): void {
    this.animations.set(name, new AnimationInfo(frames, duration, looped, priority));
  }

  public getAnimation(name: string): AnimationInfo | undefined {
    return this.animations.get(name);
  }

  public createModel(): SpriteModel {
    const model = new SpriteModel(this);

    this.models.push(model);

    return model;
  }

  public bind(): void {
    Game.instance.canvas.shader.bindTexture(this.texture);
    Game.instance.canvas.shader.setUniformMatrix4("spriteScale", Matrix4.fromScale(this.width, this.height).values);
  }

  public destroy(): void {
    Game.instance.canvas.shader.deleteTexture(this.texture);
    Game.instance.canvas.shader.deleteBuffer(this.coordBuffer);
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