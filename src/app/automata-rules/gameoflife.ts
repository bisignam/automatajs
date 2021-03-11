import { CellularAutomaton } from '../automata-engine/cellularautomaton';

export class GameOfLife extends CellularAutomaton {
  fragmentShader = `
    uniform vec2 u_resolution;
    uniform sampler2D u_texture;
    uniform float u_automata_size; // The block size in pixels
    uniform float u_grid_weigth;
    uniform vec4 u_grid_color;
    uniform bool u_grid_active;
    uniform vec4 u_alive_color;
    uniform vec4 u_dead_color;
    
    int wasAlive(vec2 coord) {
      vec4 px = texture2D(
          u_texture, mod(coord / u_resolution, 1.)); // mod for toroidal surface
      return equal(px, u_alive_color) == bvec4(true, true, true, true) ? 1 : 0;
    }
    
    vec2 getBlockCenter(const in vec2 vPos) {
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
    
    void main() {
      if (!isGridPixel(gl_FragCoord.xy) || !u_grid_active) {
        vec2 coord = getBlockCenter(gl_FragCoord.xy);
        int aliveNeighbors =
            wasAlive(coord + vec2(-u_automata_size, -u_automata_size)) +
            wasAlive(coord + vec2(-u_automata_size, 0.)) +
            wasAlive(coord + vec2(-u_automata_size, u_automata_size)) +
            wasAlive(coord + vec2(0., -u_automata_size)) +
            wasAlive(coord + vec2(0., u_automata_size)) +
            wasAlive(coord + vec2(u_automata_size, -u_automata_size)) +
            wasAlive(coord + vec2(u_automata_size, 0.)) +
            wasAlive(coord + vec2(u_automata_size, u_automata_size));
        bool nowAlive =
            (wasAlive(coord) == 1 ? 2 <= aliveNeighbors && aliveNeighbors <= 3
                                  : 3 == aliveNeighbors);
        gl_FragColor = nowAlive ? u_alive_color : u_dead_color;
      } else {
        gl_FragColor = u_grid_color;
      }
    }
  `;
  vertexShader = '';
  uniforms = {
    u_texture: { value: null },
    u_resolution: { value: null },
    u_automata_size: { value: null },
    u_grid_weigth: { value: null },
    u_grid_color: { value: null },
    u_grid_active: { value: null },
    u_alive_color: { value: null },
    u_dying_color: { value: null },
    u_dead_color: { value: null },
  };
}
