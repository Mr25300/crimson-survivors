precision mediump float;

uniform sampler2D texture;

varying vec2 textureVertCoord;

void main() {
  vec4 textureColor = texture2D(texture, textureVertCoord);

  if (textureColor.a < 0.01) {
    // discard;
    textureColor = vec4(1, 0, 0, 1);
  }

  gl_FragColor = textureColor;
}