attribute vec2 vertexPos;
attribute vec2 textureCoord;

uniform mat4 screenProjection;
uniform mat4 spriteScale;

varying vec2 textureVertCoord;

void main() {
  gl_Position = screenProjection * spriteScale * vec4(vertexPos, 0.0, 1.0);

  textureVertCoord = textureCoord;
}