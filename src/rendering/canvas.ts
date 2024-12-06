import { Util } from "../util/util.js";
import { Matrix4 } from "../util/matrix4.js";
import { ShaderProgram } from "./shaderprogram.js";
import { SpriteSheet } from "../sprites/spritesheet.js";

export class Canvas {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private shader: ShaderProgram;

  private screenUnitScale: number = 1/10;
  private aspectRatio: number = 1;

  private sprites: SpriteSheet[] = [];

  constructor() {
    this.canvas = document.getElementById("gameScreen") as HTMLCanvasElement;
    this.gl = this.canvas.getContext("webgl2") as WebGL2RenderingContext;

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

    // Promise.all([
    //   Util.loadShaderFile("res/shaders/vertex.glsl"),
    //   Util.loadShaderFile("res/shaders/fragment.glsl"),

    // ]).then(([vertSource, fragSource]) => {
    //   this.shader = new ShaderProgram(this.gl, vertSource, fragSource);
    //   this.shader.use();
    //   this.shader.createAttrib("vertexPos");
    //   this.shader.createAttrib("textureCoord");
    //   this.shader.createUniform("screenProjection");

    //   // gl.enable(gl.DEPTH_TEST); // give z values to change priority order of sprites (i.e. gun underneath player)

    //   // const vertexBuffer = shader.createBuffer(
    //   //   new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    //   // );

    //   // shader.setAttribBuffer("vertexPos", vertexBuffer, 2, 0, 0);

    //   // const screenScale = 1/5;
    //   // shader.setUniformMatrix4("screenProjection",
    //   //   new Float32Array([
    //   //     screenScale, 0, 0, 0,
    //   //     0, screenScale * (canvas.width / canvas.height), 0, 0,
    //   //     0, 0, 1, 0,
    //   //     0, 0, 0, 1
    //   //   ])
    //   // );

    //   // // const texture = shader.createTexture("res/assets/testanimsprite.png");
    //   // // gl.bindTexture(gl.TEXTURE_2D, texture);

    //   // // const textureCoords = new Float32Array([
    //   // //   0, 1,
    //   // //   1, 1,
    //   // //   0, 0,
    //   // //   1, 0
    //   // // ]);

    //   // // const textureBuffer = shader.createBuffer(textureCoords);

    //   // // shader.setAttribBuffer("textureCoord", textureBuffer, 2, 0, 0);

    //   // // gl.bindTexture(gl.TEXTURE_2D, texture);

    //   // const sprite = new Spritesheet(shader, 1, 1, 5, 2, 10, "res/assets/testanimsprite.png");
    //   // const anim = new SpriteAnimation(sprite, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    //   // const frame = () => {
    //   //   anim.update(1/60);
    //   //   sprite.bind();

    //   //   gl.clearColor(0, 0, 0, 0);
    //   //   gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    //   //   requestAnimationFrame(frame);
    //   // }

    //   // frame();

    //   // // drawing

    //   // // const image = new Image();
    //   // // image.src = "./res/assets/testsprite.png";

    //   // // const texture = gl.createTexture();
    //   // // gl.bindTexture(gl.TEXTURE_2D, texture);
    //   // // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

    //   // // image.onload = function () {
    //   // //   gl.bindTexture(gl.TEXTURE_2D, texture);
    //   // //   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    //   // //   if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
    //   // //     gl.generateMipmap(gl.TEXTURE_2D);

    //   // //   } else {
    //   // //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //   // //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    //   // //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //   // //   }
    //   // // };

    //   // // const positionBuffer = gl.createBuffer();
    //   // // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    //   // // const positions = [
    //   // //   1.0, 1.0,
    //   // //   -1.0, 1.0,
    //   // //   1.0, -1.0,
    //   // //   -1.0, -1.0,
    //   // // ];

    //   // // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    //   // // const textureCoordBuffer = gl.createBuffer();
    //   // // gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    //   // // const textureCoordinates = [
    //   // //   1.0, 1.0,
    //   // //   0.0, 1.0,
    //   // //   1.0, 0.0,
    //   // //   0.0, 0.0,
    //   // // ];

    //   // // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
    // });
  }

  public async init(): Promise<void> {
    await Promise.all([
      Util.loadShaderFile("res/shaders/vertex.glsl"),
      Util.loadShaderFile("res/shaders/fragment.glsl")

    ]).then(([vertSource, fragSource]) => {
      this.shader = new ShaderProgram(this.gl, vertSource, fragSource);
      this.shader.use();
      this.shader.createAttrib("vertexPos");
      this.shader.createAttrib("textureCoord");
      this.shader.createUniform("screenProjection");
      this.shader.createUniform("spriteScale");
      this.shader.createUniform("modelTransform");

      this.createUniversalVertexBuffer();
    });
  }

  /**
   * Creates the universal vertex buffer to be used by all sprites, being a square with width and height 1.
   */
  private createUniversalVertexBuffer(): void {
    const vertexBuffer = this.shader.createBuffer(new Float32Array([
      -0.5, -0.5,
      0.5, -0.5,
      -0.5, 0.5,
      0.5, 0.5
    ]));

    this.shader.setAttribBuffer("vertexPos", vertexBuffer, 2, 0, 0);
  }

  public createSprite(width: number, height: number, spriteCount: number, columns: number, rows: number, imagePath: string): SpriteSheet {
    const sprite = new SpriteSheet(this.shader, width, height, spriteCount, columns, rows, imagePath);

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
    this.gl.clearColor(1, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);

    const screenMatrix = Matrix4.fromScale(this.screenUnitScale*2 / this.aspectRatio, this.screenUnitScale*2);
    
    this.shader.setUniformMatrix4("screenProjection", screenMatrix);

    for (const sprite of this.sprites) {
      sprite.bind();

      for (const model of sprite.models) {
        model.bind();

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
      }
    }
  }
}