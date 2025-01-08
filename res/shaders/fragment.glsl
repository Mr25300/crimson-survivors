precision mediump float;

uniform sampler2D texture;

uniform vec2 tileScale; // port this to vertex shader

uniform int debugMode;

uniform float gameTime;
uniform float highlightStart;
uniform vec3 highlightColor;

varying vec2 textureVertCoord;
varying vec2 spriteCellSize;
varying vec2 spriteCellStart;

void main() {
  if (debugMode == 1) {
    gl_FragColor = vec4(1, 0, 0, 1);

  } else {
    // vec2 centerOffset = (vec2(1) - tileScale) * 0.5;
    vec2 tiledPosition = textureVertCoord * tileScale;
    vec2 textureCoord = mod(tiledPosition, spriteCellSize) + spriteCellStart;
    vec4 textureColor = texture2D(texture, textureCoord);

    if (textureColor.a < 0.01) {
      discard;
    }

    float highlightDuration = 0.3;
    float highlightProgress = (gameTime - highlightStart) / highlightDuration;
    if (highlightProgress > 1.0) highlightProgress = 1.0;

    vec3 texturePureColor = vec3(textureColor.xyz);
    vec3 tintedColor = mix(texturePureColor, highlightColor, 1.0 - highlightProgress);
    vec4 finalColor = vec4(tintedColor, textureColor.a);

    gl_FragColor = finalColor;
  }
}