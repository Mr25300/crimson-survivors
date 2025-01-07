import { Matrix3 } from "../util/matrix3.js";
import { ShaderProgram } from "./shaderprogram.js";
import { SpriteSheet } from "../sprites/spritesheet.js";
import { Vector2 } from "../util/vector2.js";
import { SpriteModel } from "../sprites/spritemodel.js";
import { Game } from "../core/game.js";
import { CollisionObject } from "../physics/collisions.js";

export class Canvas {
  private element: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;

  public readonly shader: ShaderProgram;

  private spriteVertexBuffer: WebGLBuffer;

  private screenUnitScale: number = 1 / 10;
  private height: number;
  private width: number;
  private aspectRatio: number;

  constructor() {
    this.element = document.getElementById("game-screen") as HTMLCanvasElement;
    
    this.gl = this.element.getContext("webgl2") as WebGL2RenderingContext;
    if (!this.gl) this.gl = this.element.getContext("webgl") as WebGL2RenderingContext;
    if (!this.gl) throw new Error("Failed to get GL context.");

    this.shader = new ShaderProgram(this.gl);

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.updateDimensions();

    new ResizeObserver(() => {
      this.updateDimensions();

    }).observe(this.element);
  }

  public async init(): Promise<void> {
    this.createUniversalSpriteVertexBuffer();

    await this.shader.initShaders("res/shaders/vertex.glsl", "res/shaders/fragment.glsl");

    this.shader.use();

    this.shader.createAttrib("vertexPos");

    this.shader.createUniform("screenProjection");
    this.shader.createUniform("spriteSize");
    this.shader.createUniform("spriteCell");
    this.shader.createUniform("tileScale");
    this.shader.createUniform("modelTransform");
    this.shader.createUniform("zOrder");

    this.shader.createUniform("debugMode");

    this.shader.createUniform("gameTime");
    this.shader.createUniform("highlightColor");
    this.shader.createUniform("highlightStart");
  }

  public createBuffer(data: Float32Array): WebGLBuffer {
    const buffer = this.gl.createBuffer();

    if (buffer == null) {
      throw new Error("Failed to create buffer.");
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer); // ELEMENT_ARRAY_BUFFER for index buffer
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);

    return buffer;
  }

  public deleteBuffer(buffer: WebGLBuffer): void {
    this.gl.deleteBuffer(buffer);
  }

  public createTexture(imagePath: string): WebGLTexture {
    const image = new Image();
    image.src = imagePath;

    const texture = this.gl.createTexture();

    if (texture == null) {
      throw new Error("Failed to create texture.");
    }

    image.onload = () => {
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);

      // let wrapMode: GLint = this.gl.CLAMP_TO_EDGE;

      // if (Util.isPowerOf2(image.width) && Util.isPowerOf2(image.height)) {
      //   wrapMode = this.gl.REPEAT;
      // }

      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);

      // this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, wrapMode);
      // this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, wrapMode);
      // this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
      // this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    };

    image.onerror = () => {
      // this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));

      console.error(`Failed to load image texture ${imagePath}.`);
    };

    return texture;
  }

  public bindTexture(texture: WebGLTexture): void {
    // fix texture binding and activeTexture thingamajig

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
  }

  public deleteTexture(texture: WebGLTexture): void {
    this.gl.deleteTexture(texture);
  }

  /**
   * Creates the universal vertex buffer to be used by all sprites, being a square with width and height 1.
   */
  private createUniversalSpriteVertexBuffer(): void {
    this.spriteVertexBuffer = this.createBuffer(new Float32Array([
      -0.5, -0.5,
      0.5, -0.5,
      -0.5, 0.5,
      0.5, 0.5
    ]));
  }

  private updateDimensions(): void {
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

  public getScreenRange(): Vector2 {
    const range = 1 / this.screenUnitScale / 2;

    return new Vector2(range * this.aspectRatio, range);
  }

  public render(): void {
    this.gl.clearColor(1, 1, 1, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);

    const projectionMatrix: Matrix3 = Matrix3.fromProjection(this.screenUnitScale * 2, this.aspectRatio, Game.instance.camera.position);

    this.shader.use();
    this.shader.setAttribBuffer("vertexPos", this.spriteVertexBuffer, 2, 0, 0);
    this.shader.setUniformMatrix("screenProjection", projectionMatrix);
    this.shader.setUniformBool("debugMode", false);
    this.shader.setUniformFloat("gameTime", Game.instance.elapsedTime);

    Game.instance.spriteModels.forEach((models: Set<SpriteModel>, sprite: SpriteSheet) => {
      sprite.bind();

      for (const model of models) {
        model.bind();

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
      }
    });

    this.shader.setUniformVector("spriteSize", new Vector2(1, 1));
    this.shader.setUniformFloat("spriteCell", 0);
    this.shader.setUniformFloat("zOrder", 20);
    this.shader.setUniformBool("debugMode", true);
    this.shader.setUniformFloat("highlightStart", -1);

    Game.instance.collisionObjects.forEach((object: CollisionObject) => {
      object.bind();
      
      this.gl.drawArrays(this.gl.LINE_LOOP, 0, object.vertexCount); // this.gl.TRIANGLE_FAN for filled in poly
    });
  }
}
