import { Game } from "../core/game.js";
import { Matrix4 } from "../util/matrix4.js";
import {Util} from "../util/util.js";

export class ShaderProgram {
  private program: WebGLProgram;
  private vertShader: WebGLShader;
  private fragShader: WebGLShader;

  private attribLocations: Map<string, GLint> = new Map();
  private uniformLocations: Map<string, WebGLUniformLocation> = new Map();

  constructor(private gl: WebGL2RenderingContext) {
    const program = gl.createProgram();

    if (program == null) throw new Error("Failed to create program.");

    this.program = program;
  }

  public async initShaders(vertPath: string, fragPath: string) {
    const [vertSource, fragSource] = await Promise.all([
      Util.loadShaderFile(vertPath),
      Util.loadShaderFile(fragPath)
    ]);

    this.vertShader = this.createShader(this.gl.VERTEX_SHADER, vertSource);
    this.fragShader = this.createShader(this.gl.FRAGMENT_SHADER, fragSource);

    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.error("Failed to link shader program: " + this.gl.getProgramInfoLog(this.program));
    }

    this.gl.validateProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.VALIDATE_STATUS)) {
      console.error("Failed to validate shader program: " + this.gl.getProgramInfoLog(this.program));
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

  public createAttrib(name: string): void {
    const location = this.gl.getAttribLocation(this.program, name);

    if (location < 0) {
      throw new Error(`Attribute "${name}" not found.`);
    }

    this.attribLocations.set(name, location);
  }

  public setAttribBuffer(name: string, buffer: WebGLBuffer, size: GLint, stride: GLint, offset: GLint): void {
    const location = this.attribLocations.get(name);

    if (location === undefined) {
      throw new Error(`Attrib "${name}" does not exist.`);
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);

    this.gl.vertexAttribPointer(location, size, this.gl.FLOAT, false, stride, offset);
    this.gl.enableVertexAttribArray(location);
  }

  public createUniform(name: string): void {
    const location = this.gl.getUniformLocation(this.program, name);

    if (!location) {
      throw new Error(`Uniform "${name}" not found.`);
    }

    this.uniformLocations.set(name, location);
  }

  public getUniformLocation(name: string): WebGLUniformLocation {
    const location = this.uniformLocations.get(name);

    if (location === undefined) {
      throw new Error(`Uniform "${name}" does not exist.`);
    }

    return location;
  }

  public setUniformMatrix4(name: string, matrix: Matrix4): void { // make it take in matrix4 class
    this.gl.uniformMatrix4fv(this.getUniformLocation(name), false, matrix.glFormat());
  }

  public setUniformFloat(name: string, float: number): void {
    this.gl.uniform1f(this.getUniformLocation(name), float);
  }

  public setUniformBool(name: string, bool: boolean) {
    this.gl.uniform1i(this.getUniformLocation(name), bool ? 1 : 0);
  }

  public use(): void {
    this.gl.useProgram(this.program);
  }

  public destroy(): void {
    this.gl.deleteShader(this.vertShader);
    this.gl.deleteShader(this.fragShader);
    this.gl.deleteProgram(this.program);
  }
}
