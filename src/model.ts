import { Shader } from "./renderer";

class Spritesheet {
  private currentSprite = 4;

  private texture: WebGLTexture;
  private coordBuffer: WebGLBuffer;

  constructor(
    private shader: Shader,
    private width: number,
    private height: number,
    private columns: number,
    private rows: number,
    private count: number,
    private imagePath: string,
  ) {
    const spriteCoords: number[] = [];

    for (let i: number = 0; i < count; i++) {
      const currentRow = Math.floor(i / columns);
      const startX = (i % columns) / columns;
      const endX = startX + 1 / columns;
      const startY = currentRow / rows;
      const endY = startY + 1 / rows;

      spriteCoords.push(
        startX, endY,
        endX, endY,
        startX, startY,
        endX, startY
      );
    }

    const vertices = new Float32Array([
      -width / 2, -height / 2,
      width / 2, -height / 2,
      -width / 2, height / 2,
      width / 2, height / 2
    ]);

    this.coordBuffer = shader.createBuffer(new Float32Array(spriteCoords));
    this.texture = shader.createTexture(imagePath);
  }

  public createModel() {
    return new Model(this);
  }

  public bind() {
    this.shader.setAttribBuffer("textureCoord", this.coordBuffer, 2, 0, this.currentSprite * 2 * 4 * Float32Array.BYTES_PER_ELEMENT);
    this.shader.bindTexture(this.texture);
  }

  public setCurrentSprite(n: number) {
    this.currentSprite = n;
  }
}

class Model {
  private x: number = 0;
  private y: number = 0;
  private rot: number = 0;

  constructor(private sprite: Spritesheet) { }

  public bind() { }
}

class SpriteAnimation {
  private timePassed = 0;
  private fps = 12;

  constructor(
    private sprite: Spritesheet,
    private frames: number[]
  ) { }

  public update(delta: number) {
    this.timePassed = (this.timePassed + delta) % ((this.frames.length * 1) / this.fps);

    const frame = Math.floor(this.timePassed / (1 / this.fps)) % this.frames.length;

    this.sprite.setCurrentSprite(frame);
  }
}

export { Model, Spritesheet, SpriteAnimation };