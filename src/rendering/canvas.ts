import { Util } from "../util/util.js";
import { ShaderProgram } from "./shaderprogram.js";

export class Canvas {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private shader: ShaderProgram;

  private screenUnitScale: number = 1/10;
  private aspectRatio: number = 1;

  constructor() {
    this.canvas = document.getElementById("gameScreen") as HTMLCanvasElement;

    this.gl = this.canvas.getContext("webgl2") as WebGL2RenderingContext;
    this.gl.enable(this.gl.DEPTH_TEST);

    this.init();

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

  private async init(): Promise<void> {
    await this.initShaderProgram();

    this.initUniversalVertexBuffer();
  }

  private async initShaderProgram(): Promise<void> {
    await Promise.all([
      Util.loadShaderFile("res/shaders/vertex.glsl"),
      Util.loadShaderFile("res/shaders/fragment.glsl"),

    ]).then(([vertSource, fragSource]) => {
      this.shader = new ShaderProgram(this.gl, vertSource, fragSource);
      this.shader.use();
      this.shader.createAttrib("vertexPos");
      this.shader.createAttrib("textureCoord");
      this.shader.createUniform("screenProjection");
      this.shader.createUniform("spriteScale");
      this.shader.createUniform("modelTransform");
    });
  }

  private initUniversalVertexBuffer(): void {
    this.shader.createBuffer(new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      1, 1
    ]));
  }

  private render(): void {
    this.shader.setUniformMatrix4("screenProjection",
      new Float32Array([
        this.screenUnitScale, 0, 0, 0,
        0, this.screenUnitScale * this.aspectRatio, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ])
    );

    this.gl.clearColor(0, 0, 0, 0);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }
}
