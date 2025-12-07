import { CellularAutomaton } from '../automata-engine/cellularautomaton';

export class LifeWithoutDeath extends CellularAutomaton {
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
      int aliveNeighbors = aliveMooreNeighbors(coord);
      bool nowAlive =
        (wasAlive(coord) == 1 ? true : aliveNeighbors == 3);
      gl_FragColor = nowAlive ? u_alive_color : u_dead_color;
  `,
      []
    );
  }
}
