precision mediump float;

uniform sampler2D texture;
uniform int debugMode;

varying vec2 textureVertCoord;

void main() {
  if (debugMode == 1) {
    gl_FragColor = vec4(1, 0, 0, 1);

  } else {
    vec4 textureColor = texture2D(texture, textureVertCoord);

    if (textureColor.a < 0.01) {
      discard;
    }

    gl_FragColor = textureColor;
  }
}