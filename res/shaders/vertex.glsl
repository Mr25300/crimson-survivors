attribute vec2 vertexPos;

uniform mat3 screenProjection;
uniform vec2 spriteSize;
uniform float spriteCell;
uniform mat3 modelTransform;
uniform float zOrder;

varying vec2 textureVertCoord;

// change z priority based on distance from center of screen (closer enemies appear ontop)
// dm = root(2)
// z = d/dm * 2 - 1 (normalize to 1, -1)

float tanh(float x) {
  return (exp(x) - exp(-x)) / (exp(x) + exp(-x));
}

float modI(float a, float b) {
  float m = a - floor((a + 0.5) / b) * b;
  
  return floor(m + 0.5);
}

void main() {
  float zPosition = -tanh(zOrder);
  
  vec3 transformedPosition = screenProjection * modelTransform * vec3(vertexPos, 1);
  gl_Position = vec4(transformedPosition.xy, zPosition, 1);

  vec2 baseCoord = vertexPos + vec2(0.5); // map [-0.5, 0.5] to [0, 1]
  vec2 cellSize = vec2(1) / spriteSize;
  float column = modI(spriteCell, spriteSize.x);
  float row = floor(spriteCell / spriteSize.x);

  textureVertCoord = baseCoord * cellSize + cellSize * vec2(column, row);
}