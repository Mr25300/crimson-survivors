precision mediump float;

uniform sampler2D texture;

uniform vec2 spriteSize;
uniform vec2 tileScale; // port this to vertex shader

uniform int debugMode;

uniform vec3 tintColor;
uniform float tintOpacity;

varying vec2 textureVertCoord;
varying vec2 spriteCellSize;
varying vec2 spriteCellStart;

void main() {
  if (debugMode == 1) {
    gl_FragColor = vec4(1, 0, 0, 1);

  } else {
    vec2 centerOffset = (vec2(1) - tileScale) * 0.5;
    vec2 tiledPosition = textureVertCoord * tileScale + centerOffset;
    vec2 textureCoord = mod(tiledPosition, spriteCellSize) + spriteCellStart;// + centerOffset; // !!!! FIX THIS BAFFOOON !!!!
    vec4 textureColor = texture2D(texture, textureCoord);

    if (textureColor.a < 0.01) {
      discard;
    }

    vec3 texturePureColor = vec3(textureColor.xyz);
    vec3 tintedColor = mix(texturePureColor, tintColor, tintOpacity);
    vec4 finalColor = vec4(tintedColor, textureColor.a);

    gl_FragColor = finalColor;
  }
}