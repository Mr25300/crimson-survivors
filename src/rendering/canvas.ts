import {Util} from "../util/util.js";
import {Matrix4} from "../util/matrix4.js";
import {ShaderProgram} from "./shaderprogram.js";
import {SpriteSheet} from "../sprites/spritesheet.js";
import {Vector2} from "../util/vector2.js";
import {Camera} from "./camera.js";
import { SpriteModel } from "../sprites/spritemodel.js";
import { Game } from "../core/game.js";

export class Canvas {
  private element: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private _shader: ShaderProgram;

  private screenUnitScale: number = 1 / 10;
  private height: number;
  private width: number;
  private aspectRatio: number;

  constructor() {
    this.element = document.getElementById("gameScreen") as HTMLCanvasElement;
    this.gl = this.element.getContext("webgl2") as WebGL2RenderingContext;

    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.gl.enable(this.gl.DEPTH_TEST);

    this.updateDimenstions();

    new ResizeObserver(() => {
      this.updateDimenstions();

    }).observe(this.element);
  }

  public async init(): Promise<void> {
    await Promise.all([
      Util.loadShaderFile("res/shaders/vertex.glsl"),
      Util.loadShaderFile("res/shaders/fragment.glsl")

    ]).then(([vertSource, fragSource]) => {
      this._shader = new ShaderProgram(this.gl, vertSource, fragSource);
      this._shader.use();
      this._shader.createAttrib("vertexPos");
      this._shader.createAttrib("textureCoord");
      this._shader.createUniform("screenProjection");
      this._shader.createUniform("spriteScale");
      this._shader.createUniform("modelTransform");

      this.createUniversalVertexBuffer();
    });
  }

  public get shader(): ShaderProgram {
    return this._shader;
  }

  /**
   * Creates the universal vertex buffer to be used by all sprites, being a square with width and height 1.
   */
  private createUniversalVertexBuffer(): void {
    const vertexBuffer = this.shader.createBuffer(
      new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5])
    );

    this.shader.setAttribBuffer("vertexPos", vertexBuffer, 2, 0, 0);
  }

  private updateDimenstions(): void {
    this.width = this.element.clientWidth;
    this.height = this.element.clientHeight;

    this.element.width = this.width;
    this.element.height = this.height;
    this.aspectRatio = this.width / this.height;

    this.gl.viewport(0, 0, this.width, this.height);
  }

  public pixelsToCoordinates(pixels: Vector2): Vector2 {
    const delta = new Vector2(pixels.x - this.width / 2, this.height / 2 - pixels.y);
    const scaledDelta = delta.divide(this.screenUnitScale * this.height);

    return Game.instance.camera.position.add(scaledDelta);
  }

  public update(deltaTime: number): void {
    Game.instance.spriteModels.forEach((models: SpriteModel[], sprite: SpriteSheet) => {
      for (const model of models) {
        model.update(deltaTime);
      }
    });
  }

  public render(): void {
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);

    const screenMatrix = Matrix4.fromScale((this.screenUnitScale * 2) / this.aspectRatio, this.screenUnitScale * 2);

    this.shader.setUniformMatrix4("screenProjection", screenMatrix.values);

    Game.instance.spriteModels.forEach((models: SpriteModel[], sprite: SpriteSheet) => {
      sprite.bind();

      for (const model of models) {
        model.bind();

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
      }
    });
  }
}