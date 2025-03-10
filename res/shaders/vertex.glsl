precision mediump float;

attribute vec2 vertexPos;

uniform mat3 screenProjection;
uniform vec2 spriteSize;
uniform float spriteCell;
uniform mat3 modelTransform;
uniform float zOrder;

varying vec2 textureVertCoord;
varying vec2 spriteCellSize;
varying vec2 spriteCellStart;

float tanh(float x) {
  return (exp(x) - exp(-x)) / (exp(x) + exp(-x));
}

void main() {
  float zPosition = -tanh(zOrder);
  
  vec3 transformedPosition = screenProjection * modelTransform * vec3(vertexPos, 1);
  gl_Position = vec4(transformedPosition.xy, zPosition, 1);

  vec2 baseCoord = vertexPos + vec2(0.5); // map [-0.5, 0.5] to [0, 1]
  vec2 formattedCoord = vec2(baseCoord.x, 1.0 - baseCoord.y);
  vec2 cellSize = vec2(1) / spriteSize;
  float column = mod(spriteCell, spriteSize.x);
  float row = floor(spriteCell / spriteSize.x);
  vec2 cellStart = cellSize * vec2(column, row);

  textureVertCoord = formattedCoord * cellSize + cellStart;
  spriteCellSize = cellSize;
  spriteCellStart = cellStart;
}