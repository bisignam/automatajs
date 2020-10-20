import { CellularAutomaton } from "../automata-engine/cellularautomaton";
import { Color } from "../automata-engine/color";

export class Seeds extends CellularAutomaton {
  /** 
     In each time step, a cell turns on or is "born" if it was off or "dead" but 
     had exactly two neighbors that were on; all other cells turn off.
     **/
  public applyRule(x: number, y: number): Color {
    const numberOfActiveNeighbors = this.mooreNeighbors(x, y);
    if (!this.isActive(x, y) && numberOfActiveNeighbors == 2) {
      return this.activationColor;
    }
    return this.grid.getPixels()[x][y].getOriginalColor();
  }
}
