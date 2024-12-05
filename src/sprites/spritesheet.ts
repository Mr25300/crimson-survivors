import { ShaderProgram } from "../rendering/shaderprogram.js";
import { SpriteModel } from "./spritemodel.js";

export class Spritesheet {
  public static activeSprites: Spritesheet[];

  private texture: WebGLTexture;
  private coordBuffer: WebGLBuffer;

  private models: SpriteModel[];

  constructor(
    private shader: ShaderProgram,
    private width: number,
    private height: number,
    private spriteCount: number,
    private columns: number,
    private rows: number,
    imagePath: string
  ) {
    this.initBufferTexture(imagePath);
    
    Spritesheet.activeSprites.push(this);
  }

  public get buffer(): WebGLBuffer {
    return this.coordBuffer;
  }

  private initBufferTexture(path: string): void {
    const spriteCoords: number[] = [];

    for (let i: number = 0; i < this.spriteCount; i++) {
      const currentRow = Math.floor(i / this.columns);
      const startX = (i % this.columns) / this.columns;
      const endX = startX + 1 / this.columns;
      const startY = currentRow / this.rows;
      const endY = startY + 1 / this.rows;

      spriteCoords.push(
        startX, startY,
        endX, startY,
        startX, endY,
        endX, endY
      );
    }

    this.coordBuffer = this.shader.createBuffer(new Float32Array(spriteCoords));
    this.texture = this.shader.createTexture(path);
  }

  // public createModel() {
  //   return new Model(this);
  // }

  public bind() {
    this.shader.bindTexture(this.texture);

    this.shader.setUniformMatrix4("spriteScale",
      new Float32Array([
        this.width, 0, 0, 0,
        0, this.height, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ])
    );
  }
}

export class SpriteAnimation {
  private timePassed = 0;
  private fps = 12;

  constructor(
    private model: SpriteModel,
    private frames: number[]
  ) {}

  public update(delta: number) {
    this.timePassed = (this.timePassed + delta) % ((this.frames.length * 1) / this.fps);

    const frame = Math.floor(this.timePassed / (1 / this.fps)) % this.frames.length;

    this.model.setCurrentSprite(frame);
  }
}