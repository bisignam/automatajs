uniform vec2 u_resolution;
uniform sampler2D u_texture;
uniform float u_automata_size; // The block size in pixels
uniform float u_grid_weigth;
uniform vec4 u_grid_color;
uniform bool u_grid_active;
uniform vec4 u_alive_color;
uniform vec4 u_dying_color;
uniform vec4 u_dead_color;

int wasAlive(vec2 coord) {
  vec4 px = texture2D(
      u_texture, mod(coord / u_resolution, 1.)); // mod for toroidal surface
  return equal(px, u_alive_color) == bvec4(true, true, true, true) ? 1 : 0;
}

int wasDying(vec2 coord) {
  vec4 px = texture2D(
      u_texture, mod(coord / u_resolution, 1.)); // mod for toroidal surface
  return equal(px, u_dying_color) == bvec4(true, true, true, true) ? 1 : 0;
}

vec2 getBlockCentre(const in vec2 vPos) {
  vec2 pos = floor((vPos - 0.5) / u_automata_size) * u_automata_size;
  pos.x = pos.x + u_automata_size / 2.0;
  pos.y = pos.y + u_automata_size / 2.0;
  return pos;
}

bool isGridPixel(const in vec2 vPos) {
  bvec2 comparisonResult = lessThanEqual(mod(vPos - 0.5, u_automata_size),
                                         vec2(u_grid_weigth, u_grid_weigth));
  return comparisonResult != bvec2(false, false);
}

int aliveMooreNeighbors(const in vec2 coord) {
  return wasAlive(coord + vec2(-u_automata_size, -u_automata_size)) +
         wasAlive(coord + vec2(-u_automata_size, 0.)) +
         wasAlive(coord + vec2(-u_automata_size, u_automata_size)) +
         wasAlive(coord + vec2(0., -u_automata_size)) +
         wasAlive(coord + vec2(0., u_automata_size)) +
         wasAlive(coord + vec2(u_automata_size, -u_automata_size)) +
         wasAlive(coord + vec2(u_automata_size, 0.)) +
         wasAlive(coord + vec2(u_automata_size, u_automata_size));
}

/**
    In each time step, a cell turns on if it was off but had exactly two
   neighbors that were on, just like the birth rule for Seeds. All cells that
   were "on" go into the "dying" state, which is not counted as an "on" cell in
   the neighbor count, and prevents any cell from being born there. Cells that
   were in the dying state go into the off state.
   **/
void main() {
  if (!isGridPixel(gl_FragCoord.xy) || !u_grid_active) {
    vec2 coord = getBlockCentre(gl_FragCoord.xy);
    int aliveNeighbors = aliveMooreNeighbors(coord);
    if (wasAlive(coord) == 0 && wasDying(coord) == 0 && aliveNeighbors == 2) {
      gl_FragColor = u_alive_color;
    } else if (wasAlive(coord) == 1) {
      gl_FragColor = u_dying_color;
    } else {
      gl_FragColor = u_dead_color;
    }
  } else {
    gl_FragColor = u_grid_color;
  }
}