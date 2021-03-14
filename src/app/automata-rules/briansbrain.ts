import { CellularAutomaton } from '../automata-engine/cellularautomaton';

export class BriansBrain extends CellularAutomaton {
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
        In each time step, a cell turns on if it was off but had exactly two
      neighbors that were on, just like the birth rule for Seeds. All cells that
      were "on" go into the "dying" state, which is not counted as an "on" cell in
      the neighbor count, and prevents any cell from being born there. Cells that
      were in the dying state go into the off state.
      **/
      int aliveNeighbors = aliveMooreNeighbors(coord);
      if (wasAlive(coord) == 0 && wasDying(coord) == 0 && aliveNeighbors == 2) {
        gl_FragColor = u_alive_color;
      } else if (wasAlive(coord) == 1) {
        gl_FragColor = u_dying_color;
      } else {
        gl_FragColor = u_dead_color;
      }
  `);
  }
}
