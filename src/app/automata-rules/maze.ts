import { CellularAutomaton } from '../automata-engine/cellularautomaton';

export class Maze extends CellularAutomaton {
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
    super(`
      /**
      cells survive from one generation to the next if they have at least 1 and at
      most 5 neighbours. Cells are born if they have exactly 3 neighbours
     **/
      int aliveNeighbors = aliveMooreNeighbors(coord);
      if (wasAlive(coord) == 1 && aliveNeighbors == 3) {
        gl_FragColor = u_alive_color;
      } else if (wasAlive(coord) == 0 &&
                 (aliveNeighbors > 1 && aliveNeighbors <= 5)) {
        gl_FragColor = u_alive_color;
      } else {
        gl_FragColor = u_dead_color;
      }
  `);
  }
}
