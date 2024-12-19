attribute vec2 vertexPos;
attribute vec2 textureCoord;

uniform mat4 screenProjection;
uniform mat4 spriteScale;
uniform mat4 modelTransform;

varying vec2 textureVertCoord;

void main() {
  gl_Position = screenProjection * modelTransform * spriteScale * vec4(vertexPos, 0, 1);

  textureVertCoord = textureCoord;
}