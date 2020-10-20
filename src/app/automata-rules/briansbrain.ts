import {
  CellularAutomaton,
  AdditionalColorType,
} from "../automata-engine/cellularautomaton";
import { Color } from "../automata-engine/color";

export class BriansBrain extends CellularAutomaton {
  additionalColors: Array<AdditionalColorType> = [
    { name: "dyingColor", color: new Color(0, 60, 160, 100) },
  ];

  /** 
      In each time step, a cell turns on if it was off but had exactly two neighbors that were on, just like the birth rule for Seeds. 
      All cells that were "on" go into the "dying" state, which is not counted as an "on" cell in the neighbor count, 
      and prevents any cell from being born there. Cells that were in the dying state go into the off state.
     **/
  applyRule(x: number, y: number): Color {
    const numberOfActiveNeighbors = this.mooreNeighbors(x, y);
    if (
      !this.isActive(x, y) &&
      !this.isDying(x, y) &&
      numberOfActiveNeighbors == 2
    ) {
      return this.activationColor;
    } else if (this.isActive(x, y)) {
      return this.getAdditionalColor("dyingColor");
    }
    return this.grid.getPixels()[x][y].getOriginalColor();
  }

  isDying(x: number, y: number): boolean {
    return this.getAdditionalColor("dyingColor").equals(
      this.grid.getPixels()[x][y].getOriginalColor()
    );
  }
}
