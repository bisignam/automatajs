import { CellularAutomaton } from './cellularautomaton.js'

export class BriansBrain extends CellularAutomaton {

    /** 
      In each time step, a cell turns on if it was off but had exactly two neighbors that were on, just like the birth rule for Seeds. 
      All cells that were "on" go into the "dying" state, which is not counted as an "on" cell in the neighbor count, 
      and prevents any cell from being born there. Cells that were in the dying state go into the off state.
     **/
    applyRule(x, y) {
        let numberOfActiveNeighbors = this.mooreNeighbors(x, y);
        if (!this.isActive(x, y) && !this.isDying(x, y) && numberOfActiveNeighbors == 2) {
            console.log("cell activated")
            return this.activationColor();
        } else if (this.isActive(x, y)) {
            console.log("cell dying")
            return this.dyingColor();
        }
        return this.grid.gridPixels[x][y].originalColor;
    }

    activationColor() {
        return color(255, 255, 255, 255);
    }

    dyingColor() {
        return color(0, 0, 255, 255);
    }

    isDying(x, y) {
        return this.dyingColor() == this.grid.gridPixels[x][y].color;
    }

}