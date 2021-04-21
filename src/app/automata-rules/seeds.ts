import { CellularAutomaton } from '../automata-engine/cellularautomaton';

export class Seeds extends CellularAutomaton {
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
    u_copy_step: { value: false },
  };
  constructor() {
    super(
      `
      /**
     In each time step, a cell turns on or is "born" if it was off or "dead" but
     had exactly two neighbors that were on; all other cells turn off.
     **/
      int aliveNeighbors = aliveMooreNeighbors(coord);
      if (wasAlive(coord) == 0 && aliveNeighbors == 2) {
        gl_FragColor = u_alive_color;
      } else {
        gl_FragColor = u_dead_color;
      }
  `,
      []
    );
  }
}
