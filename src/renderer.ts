import { text } from "stream/consumers";

class Shader {
  private program: WebGLProgram;
  private vertShader: WebGLShader;
  private fragShader: WebGLShader;

  private attribLocations: { [key: string]: GLint } = {};
  private uniformLocations: { [key: string]: WebGLUniformLocation } = {};

  constructor(private gl: WebGL2RenderingContext, vertSource: string, fragSource: string) {
    const program = gl.createProgram();

    if (program == null) throw new Error("Failed to create program.");

    this.program = program;
    this.vertShader = this.createShader(gl.VERTEX_SHADER, vertSource);
    this.fragShader = this.createShader(gl.FRAGMENT_SHADER, fragSource);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Failed to link shader program: " + gl.getProgramInfoLog(program));
    }

    gl.validateProgram(program);

    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
      console.error("Failed to validate shader program: " + gl.getProgramInfoLog(program));
    }
  }

  private createShader(type: GLenum, source: string): WebGLShader {
    const shader = this.gl.createShader(type);

    if (shader == null) throw new Error("Failed to create shader.");

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      this.gl.deleteShader(shader);

      throw new Error(`Error compiling ${type == this.gl.VERTEX_SHADER ? "vertex" : "fragment"} shader: ` + this.gl.getShaderInfoLog(shader));
    }

    this.gl.attachShader(this.program, shader);

    return shader;
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

      const wrapMode = (image.width & (image.width - 1)) === 0 && (image.height & (image.height - 1)) === 0; // if image is power of 2

      const wrapMode = isPowerOfTwo(image.width) && isPowerOfTwo(image.height) 
                        ? this.gl.REPEAT 
                        : this.gl.CLAMP_TO_EDGE;

      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    }

    image.onerror = () => {
      console.error(`Failed to load image texture ${imagePath}.`);
    }

    return texture;
  }

  public deleteTexture(texture: WebGLTexture): void {
    this.gl.deleteTexture(texture);
  }

  public createAttrib(name: string) {
    const location = this.gl.getAttribLocation(this.program, name);

    if (location < 0) {
      console.error(`Attribute "${name}" not found.`);

      return;
    }

    this.attribLocations[name] = location;
  }

  public setAttribBuffer(name: string, buffer: WebGLBuffer | null, size: GLint) {
    const location = this.attribLocations[name];

    if (location === undefined) throw new Error(`Attrib "${name}" does not exist.`);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);

    this.gl.vertexAttribPointer(location, size, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(location);
  }

  public createUniform(name: string) {
    const location = this.gl.getUniformLocation(this.program, name);

    if (!location) {
      console.error(`Uniform "${name}" not found.`);

      return;
    }

    this.uniformLocations[name] = location;
  }

  public setUniformMatrix4(name: string, value: Float32Array) {
    const location = this.uniformLocations[name];

    if (location === undefined) throw new Error(`Uniform "${name}" does not exist.`);

    this.gl.uniformMatrix4fv(location, false, value);
  }

  public use() {
    this.gl.useProgram(this.program);
  }

  public draw(model: Model) {
    this.setAttribBuffer("position", model.vertexBuffer, 3);
    this.setAttribBuffer("color", model.colorBuffer, 3);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);

    this.gl.drawElements(this.gl.LINES, model.indexCount, this.gl.UNSIGNED_SHORT, 0);
  }

  public destroy() {
    this.gl.deleteShader(this.vertShader);
    this.gl.deleteShader(this.fragShader);
    this.gl.deleteProgram(this.program);
  }
}

class Model {
  private _vertexBuffer: WebGLBuffer;
  private _colorBuffer: WebGLBuffer;
  private _indexBuffer: WebGLBuffer;
  private _indexCount: GLsizei;

  public get vertexBuffer() {
    return this._vertexBuffer;
  }

  public get colorBuffer() {
    return this._colorBuffer;
  }

  public get indexBuffer() {
    return this._indexBuffer;
  }

  public get indexCount() {
    return this._indexCount;
  }

  constructor(private gl: WebGL2RenderingContext, vertices: number[], colors: number[], indices: number[], public dimensions: number) {
    this._vertexBuffer = this.createBuffer(vertices, false);
    this._colorBuffer = this.createBuffer(colors, false);
    this._indexBuffer = this.createBuffer(indices, true);
    this._indexCount = indices.length;
  }

  private createBuffer(data: number[], element: boolean): WebGLBuffer {
    const type = element ? this.gl.ELEMENT_ARRAY_BUFFER : this.gl.ARRAY_BUFFER;
    const bufferData = element ? new Uint16Array(data) : new Float32Array(data);

    const buffer = this.gl.createBuffer();

    if (buffer == null) {
      throw new Error("Failed to create buffer.");
    }

    this.gl.bindBuffer(type, buffer);
    this.gl.bufferData(type, bufferData, this.gl.STATIC_DRAW);

    return buffer;
  }

  public destroy() {
    this.gl.deleteBuffer(this._vertexBuffer);
    this.gl.deleteBuffer(this.colorBuffer);
    this.gl.deleteBuffer(this.indexBuffer);
  }
}

function loadShaderFile(url: string): Promise<string> {
  return fetch(url).then(response => {
    if (!response.ok) throw new Error(`Failed to load shader file: ${url}`);

    return response.text();
  });
}

function isPowerOf2(value: number) {
  return (value & (value - 1)) == 0;
}

class Renderer {
  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2") as WebGL2RenderingContext;

    Promise.all([
      loadShaderFile("res/shaders/vertex.glsl"),
      loadShaderFile("res/shaders/fragment.glsl")

    ]).then(([vertSource, fragSource]) => {
      const shader = new Shader(gl, vertSource, fragSource);
      shader.use();
      shader.createAttrib("vertexPos");
      shader.createAttrib("textureCoord");
      shader.createUniform("screenProjection");
      // shader.createUniform("modelTransform");

      gl.enable(gl.DEPTH_TEST); // give z values to change priority order of sprites (i.e. gun underneath player)

      const vertexBuffer = shader.createBuffer(new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        1, 1
      ]));

      shader.setAttribBuffer("vertexPos", vertexBuffer, 2);

      shader.setUniformMatrix4("screenProjection", new Float32Array([
        1/20, 0, 0, 0,
        0, 1/20 * (canvas.width/canvas.height), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]));

      let sprite = new Sprite(gl, 2, 3, 1, 1, 1, "res/assets/testsprite.png");
      sprite.bind();
      
      gl.clearColor(0, 0, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // drawing

      // const image = new Image();
      // image.src = "./res/assets/testsprite.png";

      // const texture = gl.createTexture();
      // gl.bindTexture(gl.TEXTURE_2D, texture);
      // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

      // image.onload = function () {
      //   gl.bindTexture(gl.TEXTURE_2D, texture);
      //   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      //   if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      //     gl.generateMipmap(gl.TEXTURE_2D);

      //   } else {
      //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      //   }
      // };

      // const positionBuffer = gl.createBuffer();
      // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      // const positions = [
      //   1.0, 1.0,
      //   -1.0, 1.0,
      //   1.0, -1.0,
      //   -1.0, -1.0,
      // ];

      // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

      // const textureCoordBuffer = gl.createBuffer();
      // gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

      // const textureCoordinates = [
      //   1.0, 1.0,
      //   0.0, 1.0,
      //   1.0, 0.0,
      //   0.0, 0.0,
      // ];

      // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
    });
  }
}

export { Renderer, Shader };