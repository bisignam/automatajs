uniform sampler2D texture;
uniform vec2 u_resolution;

void main(void) {
  vec2 coord = vec2(gl_FragCoord) / u_resolution;
  gl_FragColor = texture2D(texture, coord);
}