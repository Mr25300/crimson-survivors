attribute vec2 a_position;
attribute vec2 a_texcoord;

uniform mat3 u_model;
uniform mat3 u_camera;

varying vec2 v_texcoord;

void main() {
  vec3 position = u_camera * u_model * vec3(a_position, 1.0);
  gl_Position = vec4(position.xy, 0.0, 1.0);
  v_texcoord = a_texcoord;
}