import {Util} from '../util/util.js';
import {Matrix4} from '../util/matrix4.js';
import {ShaderProgram} from './shaderprogram.js';
import {SpriteSheet} from '../sprites/spritesheet.js';

export class Canvas {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private shader: ShaderProgram;

  private screenUnitScale: number = 1 / 10;
  private aspectRatio: number = 1;

  private sprites: SpriteSheet[] = [];

  constructor() {
    this.canvas = document.getElementById('gameScreen') as HTMLCanvasElement;
    this.gl = this.canvas.getContext('webgl2') as WebGL2RenderingContext;

    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.gl.enable(this.gl.DEPTH_TEST);

    new ResizeObserver(([canvasEntry]) => {
      const width = this.canvas.clientWidth;
      const height = this.canvas.clientHeight;

      this.canvas.width = width;
      this.canvas.height = height;
      this.aspectRatio = width / height;
      this.gl.viewport(0, 0, width, height);
    }).observe(this.canvas);
  }

  public async init(): Promise<void> {
    await Promise.all([
      Util.loadShaderFile('res/shaders/vertex.glsl'),
      Util.loadShaderFile('res/shaders/fragment.glsl')
    ]).then(([vertSource, fragSource]) => {
      this.shader = new ShaderProgram(this.gl, vertSource, fragSource);
      this.shader.use();
      this.shader.createAttrib('vertexPos');
      this.shader.createAttrib('textureCoord');
      this.shader.createUniform('screenProjection');
      this.shader.createUniform('spriteScale');
      this.shader.createUniform('modelTransform');

      this.createUniversalVertexBuffer();
    });
  }

  /**
   * Creates the universal vertex buffer to be used by all sprites, being a square with width and height 1.
   */
  private createUniversalVertexBuffer(): void {
    const vertexBuffer = this.shader.createBuffer(
      new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5])
    );

    this.shader.setAttribBuffer('vertexPos', vertexBuffer, 2, 0, 0);
  }

  public createSprite(
    width: number,
    height: number,
    spriteCount: number,
    columns: number,
    rows: number,
    imagePath: string
  ): SpriteSheet {
    const sprite = new SpriteSheet(
      this.shader,
      width,
      height,
      spriteCount,
      columns,
      rows,
      imagePath
    );

    this.sprites.push(sprite);

    return sprite;
  }

  public update(deltaTime: number): void {
    for (const sprite of this.sprites) {
      for (const model of sprite.models) {
        model.update(deltaTime);
      }
    }
  }

  public render(): void {
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(
      this.gl.COLOR_BUFFER_BIT |
        this.gl.DEPTH_BUFFER_BIT |
        this.gl.STENCIL_BUFFER_BIT
    );

    const screenMatrix = Matrix4.fromScale(
      (this.screenUnitScale * 2) / this.aspectRatio,
      this.screenUnitScale * 2
    );

    this.shader.setUniformMatrix4('screenProjection', screenMatrix.values);

    for (const sprite of this.sprites) {
      sprite.bind();

      for (const model of sprite.models) {
        model.bind();

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
      }
    }
  }
}
