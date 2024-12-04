// Vertex shader code
const vertexShaderSource = `
attribute vec4 a_position;
attribute vec2 a_texcoord;
varying vec2 v_texcoord;
uniform mat4 u_camera;

void main() {
    gl_Position = u_camera*a_position;
    v_texcoord = a_texcoord;
}
`;

// Fragment shader code
const fragmentShaderSource = `
precision mediump float;
uniform sampler2D u_texture;
varying vec2 v_texcoord;

void main() {
    gl_FragColor = texture2D(u_texture, v_texcoord);
}
`;

function getScalingMatrix(canvasWidth, canvasHeight) {
  const scaleY = 1 / 20; // 100 represents unit distance visible from center of screen to top of screen
  const scaleX = scaleY * (canvasHeight / canvasWidth);

  return new Float32Array([
    scaleX,
    0,
    0,
    0,
    0,
    scaleY,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1
  ]);
}

// Initialize WebGL context
const canvas = document.getElementById('gameScreen'); //document.createElement('canvas');
// document.body.appendChild(canvas);
const gl = canvas.getContext('webgl');

// Resize the canvas to fill the screen
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Compile shader
function compileShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// Create program
const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error(gl.getProgramInfoLog(program));
  // return;
}
gl.useProgram(program);

// Load a texture
const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

// Load an image and set it as the texture
const image = new Image();
image.src = 'res/assets/testsprite.png'; // Replace with your image URL
image.onload = () => {
  const textureRepeatX = 3;
  const windowRatio = canvas.width / canvas.height;
  const aspectRatio = image.width / image.height;
  const textureRepeatY = textureRepeatX / windowRatio / aspectRatio;

  // Fullscreen quad vertices and texture coordinates
  const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

  const textureCoords = new Float32Array([
    // 0, textureRepeatY,
    // textureRepeatX, textureRepeatY,
    // 0, 0,
    // textureRepeatX, 0
    0, 1, 1, 1, 0, 0, 1, 0
  ]);

  // Create and bind buffer
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Get attribute locations
  // Enable and set up attributes
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // Create and bind buffer
  const buffer2 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer2);
  gl.bufferData(gl.ARRAY_BUFFER, textureCoords, gl.STATIC_DRAW);

  // Get attribute locations
  // Enable and set up attributes
  const texcoordLocation = gl.getAttribLocation(program, 'a_texcoord');
  gl.enableVertexAttribArray(texcoordLocation);
  gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  // matrix
  const projectLoc = gl.getUniformLocation(program, 'u_camera');
  gl.uniformMatrix4fv(
    projectLoc,
    false,
    getScalingMatrix(canvas.width, canvas.height)
  );

  // Render
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};
