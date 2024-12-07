import {Util} from '../util/util.js';

export class ShaderProgram {
  private program: WebGLProgram;
  private vertShader: WebGLShader;
  private fragShader: WebGLShader;

  private attribLocations: Map<string, GLint> = new Map();
  private uniformLocations: Map<string, WebGLUniformLocation> = new Map();

  constructor(
    private gl: WebGL2RenderingContext,
    vertSource: string,
    fragSource: string
  ) {
    const program = gl.createProgram();

    if (program == null) throw new Error('Failed to create program.');

    this.program = program;
    this.vertShader = this.createShader(gl.VERTEX_SHADER, vertSource);
    this.fragShader = this.createShader(gl.FRAGMENT_SHADER, fragSource);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(
        'Failed to link shader program: ' + gl.getProgramInfoLog(program)
      );
    }

    gl.validateProgram(program);

    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
      console.error(
        'Failed to validate shader program: ' + gl.getProgramInfoLog(program)
      );
    }
  }

  private createShader(type: GLenum, source: string): WebGLShader {
    const shader = this.gl.createShader(type);

    if (shader == null) throw new Error('Failed to create shader.');

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      this.gl.deleteShader(shader);

      throw new Error(
        `Error compiling ${type == this.gl.VERTEX_SHADER ? 'vertex' : 'fragment'} shader: ` +
          this.gl.getShaderInfoLog(shader)
      );
    }

    this.gl.attachShader(this.program, shader);

    return shader;
  }

  public createBuffer(data: Float32Array): WebGLBuffer {
    const buffer = this.gl.createBuffer();

    if (buffer == null) {
      throw new Error('Failed to create buffer.');
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
      throw new Error('Failed to create texture.');
    }

    image.onload = () => {
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        image
      );

      let wrapMode: GLint = this.gl.CLAMP_TO_EDGE;

      if (Util.isPowerOf2(image.width) && Util.isPowerOf2(image.height)) {
        wrapMode = this.gl.REPEAT;
      }

      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_MIN_FILTER,
        this.gl.NEAREST
      );
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_MAG_FILTER,
        this.gl.NEAREST
      );

      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_S,
        this.gl.CLAMP_TO_EDGE
      );
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_T,
        this.gl.CLAMP_TO_EDGE
      );

      // this.gl.texParameteri(
      //   this.gl.TEXTURE_2D,
      //   this.gl.TEXTURE_WRAP_S,
      //   wrapMode
      // );
      // this.gl.texParameteri(
      //   this.gl.TEXTURE_2D,
      //   this.gl.TEXTURE_WRAP_T,
      //   wrapMode
      // );
      // this.gl.texParameteri(
      //   this.gl.TEXTURE_2D,
      //   this.gl.TEXTURE_MIN_FILTER,
      //   this.gl.LINEAR
      // );
      // this.gl.texParameteri(
      //   this.gl.TEXTURE_2D,
      //   this.gl.TEXTURE_MAG_FILTER,
      //   this.gl.LINEAR
      // );
    };

    image.onerror = () => {
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        1,
        1,
        0,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 0, 255])
      );

      console.error(`Failed to load image texture ${imagePath}.`);
    };

    return texture;
  }

  public bindTexture(texture: WebGLTexture): void {
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
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

    this.attribLocations.set(name, location);
  }

  public setAttribBuffer(
    name: string,
    buffer: WebGLBuffer,
    size: GLint,
    stride: GLint,
    offset: GLint
  ): void {
    const location = this.attribLocations.get(name);

    if (location === undefined) {
      throw new Error(`Attrib "${name}" does not exist.`);
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);

    this.gl.vertexAttribPointer(
      location,
      size,
      this.gl.FLOAT,
      false,
      stride,
      offset
    );
    this.gl.enableVertexAttribArray(location);
  }

  public createUniform(name: string) {
    const location = this.gl.getUniformLocation(this.program, name);

    if (!location) {
      console.error(`Uniform "${name}" not found.`);

      return;
    }

    this.uniformLocations.set(name, location);
  }

  public setUniformMatrix4(name: string, value: Float32Array) {
    const location = this.uniformLocations.get(name);

    if (location === undefined) {
      throw new Error(`Uniform "${name}" does not exist.`);
    }

    this.gl.uniformMatrix4fv(location, false, value);
  }

  public use() {
    this.gl.useProgram(this.program);
  }

  public destroy() {
    this.gl.deleteShader(this.vertShader);
    this.gl.deleteShader(this.fragShader);
    this.gl.deleteProgram(this.program);
  }
}
