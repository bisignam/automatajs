import { CellularAutomaton } from '../automata-engine/cellularautomaton';

export class DayAndNight extends CellularAutomaton {
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
     dead cell becomes live (is born) if it has 3, 6, 7, or 8 live neighbors, and a
     live cell remains alive (survives) if it has 3, 4, 6, 7, or 8 live neighbors,
      **/
        int aliveNeighbors = aliveMooreNeighbors(coord);
        if (wasAlive(coord) == 1 &&
            (aliveNeighbors == 3 || aliveNeighbors == 4 || aliveNeighbors == 6 ||
            aliveNeighbors == 7 || aliveNeighbors == 8)) {
          gl_FragColor = u_alive_color;
        } else if (wasAlive(coord) == 0 &&
                  (aliveNeighbors == 3 || aliveNeighbors == 6 ||
                    aliveNeighbors == 7 || aliveNeighbors == 8)) {
          gl_FragColor = u_alive_color;
        } else {
          gl_FragColor = u_dead_color;
        }
  `,
      []
    );
  }
}
