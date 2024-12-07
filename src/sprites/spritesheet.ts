import { ShaderProgram } from "../rendering/shaderprogram.js";
import { Matrix4 } from "../util/matrix4.js";
import { SpriteModel } from "./spritemodel.js";

export class SpriteSheet {
  private texture: WebGLTexture;
  private coordBuffer: WebGLBuffer;

  public models: SpriteModel[] = [];
  public animationFrames: Map<string, number[]> = new Map();

  constructor(
    private shader: ShaderProgram,
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

    this.coordBuffer = this.shader.createBuffer(new Float32Array(spriteCoords));
    this.texture = this.shader.createTexture(imagePath);
  }

  public getBuffer(): WebGLBuffer {
    return this.coordBuffer;
  }

  // public createModel() {
  //   return new Model(this);
  // }

  public createAnimation(name: string, frames: number[]): void {
    this.animationFrames.set(name, frames);
  }

  public getAnimationFrames(name: string): number[] | undefined {
    return this.animationFrames.get(name);
  }

  public createModel(): SpriteModel {
    const model = new SpriteModel(this.shader, this);

    this.models.push(model);

    return model;
  }

  public bind(): void {
    this.shader.bindTexture(this.texture);
    this.shader.setUniformMatrix4("spriteScale", Matrix4.fromScale(this.width, this.height).values);
  }
}
