precision mediump float;

uniform sampler2D texture;

varying vec2 textureVertCoord;

void main() {
  vec4 textureColor = texture2D(texture, textureVertCoord);

  if (textureColor.a < 0.1) {
    discard;
  }

  gl_FragColor = textureColor;
}