class Matrix3 {
  elements: Float32Array;

  constructor() {
    this.elements = new Float32Array([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ]);
  }

  static identity(): Matrix3 {
    return new Matrix3();
  }

  static translation(tx: number, ty: number): Matrix3 {
    const m = Matrix3.identity();
    m.elements.set([1, 0, tx, 0, 1, ty, 0, 0, 1]);
    return m;
  }

  static rotation(angle: number): Matrix3 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const m = Matrix3.identity();
    m.elements.set([c, -s, 0, s, c, 0, 0, 0, 1]);
    return m;
  }

  static scaling(sx: number, sy: number): Matrix3 {
    const m = Matrix3.identity();
    m.elements.set([sx, 0, 0, 0, sy, 0, 0, 0, 1]);
    return m;
  }

  multiply(other: Matrix3): Matrix3 {
    const a = this.elements;
    const b = other.elements;
    const result = new Float32Array(9);

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        result[row * 3 + col] =
          a[row * 3 + 0] * b[0 * 3 + col] +
          a[row * 3 + 1] * b[1 * 3 + col] +
          a[row * 3 + 2] * b[2 * 3 + col];
      }
    }

    this.elements.set(result);
    return this;
  }
}

class Model {
  private gl: WebGLRenderingContext;
  private texture: WebGLTexture;

  constructor(gl: WebGLRenderingContext, textureSrc: string) {
    this.gl = gl;
    this.texture = this.loadTexture(textureSrc);
  }

  private loadTexture(src: string): WebGLTexture {
    const gl = this.gl;
    const texture = gl.createTexture()!;
    const image = new Image();

    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };

    image.src = src;

    return texture;
  }

  public bind(): void {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }
}

async function fetchShader(gl: WebGLRenderingContext, type: number, url: string): Promise<WebGLShader> {
  const response = await fetch(url);
  const source = await response.text();
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(`Error compiling shader: ${gl.getShaderInfoLog(shader)}`);
    gl.deleteShader(shader);
    throw new Error(`Shader compilation failed: ${url}`);
  }

  return shader;
}

async function createProgram(gl: WebGLRenderingContext): Promise<WebGLProgram> {
  const vertexShader = await fetchShader(gl, gl.VERTEX_SHADER, './res/shaders/vertex.glsl');
  const fragmentShader = await fetchShader(gl, gl.FRAGMENT_SHADER, './res/shaders/fragment.glsl');
  const program = gl.createProgram()!;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(`Program link error: ${gl.getProgramInfoLog(program)}`);
    throw new Error('Program linking failed');
  }

  return program;
}

async function main() {
  const canvas = document.querySelector('canvas')!;
  const gl = canvas.getContext('webgl')!;

  if (!gl) {
    console.error('WebGL not supported');
    return;
  }

  const program = await createProgram(gl);
  gl.useProgram(program);

  const aPosition = gl.getAttribLocation(program, 'a_position');
  const aTexcoord = gl.getAttribLocation(program, 'a_texcoord');
  const uModel = gl.getUniformLocation(program, 'u_model');
  const uCamera = gl.getUniformLocation(program, 'u_camera');

  const model = new Model(gl, './res/assets/testsprite.png');

  // Vertices and texture coordinates for a square
  const vertices = new Float32Array([
    -0.5, -0.5,
    0.5, -0.5,
    -0.5, 0.5,
    0.5, 0.5
  ])

  // Indices for drawing the square as two triangles
  const indices = new Uint16Array([
    0, 1, 2,
    2, 1, 3
  ]);

  // Create buffers
  const vertexBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  // Configure vertex attributes
  const stride = 4 * Float32Array.BYTES_PER_ELEMENT; // Each vertex has 4 floats (x, y, u, v)
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, stride, 0); // x, y
  gl.enableVertexAttribArray(aPosition);

  gl.vertexAttribPointer(aTexcoord, 2, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT); // u, v
  gl.enableVertexAttribArray(aTexcoord);

  // Set transformation matrices
  const modelMatrix = Matrix3.identity()
    .multiply(Matrix3.translation(0.5, 0.5)) // Move to (0.5, 0.5)
    .multiply(Matrix3.rotation(Math.PI / 4)) // Rotate 45 degrees
    .multiply(Matrix3.scaling(0.5, 0.5));    // Scale down to half size

  const cameraMatrix = Matrix3.identity()
    .multiply(Matrix3.translation(-0.25, -0.25)) // Offset camera
    .multiply(Matrix3.rotation(-Math.PI / 8));   // Rotate camera

  gl.uniformMatrix3fv(uModel, false, modelMatrix.elements);
  gl.uniformMatrix3fv(uCamera, false, cameraMatrix.elements);

  // Set the clear color and prepare for drawing
  gl.clearColor(0.2, 0.3, 0.4, 1.0); // Dark blue-gray background
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Bind texture
  model.bind();

  // Draw the square using the element array buffer
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

main();