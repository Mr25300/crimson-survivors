attribute vec2 vertexPos;
attribute vec2 textureCoord;

uniform mat4 screenProjection;
uniform mat4 spriteScale;
uniform mat4 modelTransform;
uniform float zOrder;

varying vec2 textureVertCoord;

// change z priority based on distance from center of screen (closer enemies appear ontop)
// dm = root(2)
// z = d/dm * 2 - 1 (normalize to 1, -1)

float tanh(float x) {
  return (exp(x) - exp(-x)) / (exp(x) + exp(-x));
}

void main() {
  float zPosition = -tanh(zOrder);

  gl_Position = screenProjection * modelTransform * spriteScale * vec4(vertexPos, zPosition, 1);

  textureVertCoord = textureCoord;
}