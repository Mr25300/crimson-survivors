import { Matrix3 } from "../util/matrix3.js";
import { ShaderProgram } from "./shaderprogram.js";
import { SpriteSheet } from "../sprites/spritesheet.js";
import { Vector2 } from "../util/vector2.js";
import { SpriteModel } from "../sprites/spritemodel.js";
import { Game } from "../core/game.js";
import { CollisionObject } from "../physics/collisions.js";

/** Encapsulates the game"s screen and all relevant functionality. */
export class Canvas {
  private element: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;

  public readonly shader: ShaderProgram;

  /** The square vertex buffer used for all sprites. */
  private spriteVertexBuffer: WebGLBuffer;

  private height: number;
  private width: number;
  private aspectRatio: number;

  /** The height of the screen occupied by a single game unit. */
  private screenUnitScale: number = 1 / 10;

  constructor() {
    this.element = document.getElementById("game-screen") as HTMLCanvasElement;
    
    // Get gl2 or gl context
    this.gl = this.element.getContext("webgl2") as WebGL2RenderingContext;
    if (!this.gl) this.gl = this.element.getContext("webgl") as WebGL2RenderingContext;
    if (!this.gl) throw new Error("Failed to get GL context.");

    // Create the shader program
    this.shader = new ShaderProgram(this.gl);

    // Set webgl settings
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.updateDimensions();

    // Listen to canvas resizing to update dimensions
    new ResizeObserver(() => {
      this.updateDimensions();

    }).observe(this.element);
  }

  public async init(): Promise<void> {
    this.createUniversalSpriteVertexBuffer();

    // Wait for shader to load the vertex and fragment shaders
    await this.shader.initShaders("res/shaders/vertex.glsl", "res/shaders/fragment.glsl");

    this.shader.use();

    this.shader.createAttrib("vertexPos"); // Create the attrib buffer for vertices

    // Create all necessary uniforms for the vertex shader
    this.shader.createUniform("screenProjection");
    this.shader.createUniform("spriteSize");
    this.shader.createUniform("spriteCell");
    this.shader.createUniform("tileScale");
    this.shader.createUniform("modelTransform");
    this.shader.createUniform("zOrder");

    // Create all necessary uniforms for the fragment shader
    this.shader.createUniform("debugMode");
    this.shader.createUniform("gameTime");
    this.shader.createUniform("highlightColor");
    this.shader.createUniform("highlightStart");
  }

  /**
   * Creates a webgl buffer with relevant data.
   * @param data The `Float32Array` buffer data.
   * @returns A webgl buffer.
   */
  public createBuffer(data: Float32Array): WebGLBuffer {
    const buffer: WebGLBuffer | null = this.gl.createBuffer();
    if (!buffer) throw new Error("Failed to create buffer.");

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer); // ELEMENT_ARRAY_BUFFER for index buffer
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);

    return buffer;
  }

  /**
   * Deletes an existing webgl buffer.
   * @param buffer The buffer to be deleted.
   */
  public deleteBuffer(buffer: WebGLBuffer): void {
    this.gl.deleteBuffer(buffer);
  }

  /**
   * Creates a webgl texture from an image path.
   * @param imagePath The path to the image of the texture.
   * @returns The created texture.
   */
  public createTexture(imagePath: string): WebGLTexture {
    const image: HTMLImageElement = new Image();
    image.src = imagePath;

    const texture: WebGLTexture | null = this.gl.createTexture();
    if (!texture) throw new Error("Failed to create texture.");

    // Load texture data when image loads
    image.onload = () => {
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);

      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
    };

    // Log error when image fails to loda
    image.onerror = () => {
      console.error(`Failed to load image texture ${imagePath}.`);
    };

    return texture;
  }

  /**
   * Binds a texture for rendering.
   * @param texture The texture being binded.
   */
  public bindTexture(texture: WebGLTexture): void {
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
  }

  /**
   * Deletes a webgl texture.
   * @param texture The texture being deleted.
   */
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

  /**
   * Updates the canvas dimensions and webgl viewport based on its element"s properties.
   */
  private updateDimensions(): void {
    this.width = this.element.clientWidth;
    this.height = this.element.clientHeight;

    this.element.width = this.width;
    this.element.height = this.height;
    this.aspectRatio = this.width / this.height;

    this.gl.viewport(0, 0, this.width, this.height);
  }

  /**
   * Converts a position in pixel space to a position in game space.
   * @param pixels The pixel coordinates.
   * @returns The game coordinates.
   */
  public pixelsToCoordinates(pixels: Vector2): Vector2 {
    const delta = new Vector2(pixels.x - this.width / 2, this.height / 2 - pixels.y);
    const scaledDelta = delta.divide(this.screenUnitScale * this.height);

    return Game.instance.camera.position.add(scaledDelta);
  }

  /**
   * Gets the range in game units between the center and corner of the screen.
   * @returns The screen range.
   */
  public getScreenRange(): Vector2 {
    const range = 1 / this.screenUnitScale / 2;

    return new Vector2(range * this.aspectRatio, range);
  }

  /**
   * Draw all sprite models and collision objects to the canvas.
   */
  public render(): void {
    // Clear screen
    this.gl.clearColor(1, 1, 1, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);

    // The matrix for screen scaling and camera translation
    const projectionMatrix: Matrix3 = Matrix3.fromProjection(this.screenUnitScale * 2, this.aspectRatio, Game.instance.camera.position);

    // Set necessary attrib buffers and uniforms for sprite rendering
    this.shader.use();
    this.shader.setAttribBuffer("vertexPos", this.spriteVertexBuffer, 2, 0, 0);
    this.shader.setUniformMatrix("screenProjection", projectionMatrix);
    this.shader.setUniformBool("debugMode", false);
    this.shader.setUniformFloat("gameTime", Game.instance.elapsedTime);

    // Loop through all sprite models and draw them
    Game.instance.spriteModels.forEach((models: Set<SpriteModel>, sprite: SpriteSheet) => {
      sprite.bind();

      for (const model of models) {
        model.bind();

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
      }
    });

    // Prepare uniforms for collision object rendering
    this.shader.setUniformVector("spriteSize", new Vector2(1, 1));
    this.shader.setUniformFloat("spriteCell", 0);
    this.shader.setUniformFloat("zOrder", 20);
    this.shader.setUniformBool("debugMode", true);
    this.shader.setUniformFloat("highlightStart", -1);

    // Loop through all showing collision objects and draw them
    Game.instance.collisionObjects.forEach((object: CollisionObject) => {
      object.bind();
      
      this.gl.drawArrays(this.gl.LINE_LOOP, 0, object.vertexCount); // this.gl.TRIANGLE_FAN for filled in poly
    });
  }
}
