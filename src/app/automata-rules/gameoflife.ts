import { CellularAutomaton } from '../automata-engine/cellularautomaton';
import { Color } from '../automata-engine/color';

export class GameOfLife extends CellularAutomaton {

    /** 
     Any live cell with fewer than two live neighbours dies, as if by underpopulation.
     Any live cell with two or three live neighbours lives on to the next generation.
     Any live cell with more than three live neighbours dies, as if by overpopulation.
     Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
     **/
    public applyRule(x: number, y: number) {
      let numberOfActiveNeighbors = this.mooreNeighbors(x, y);
      if (this.isActive(x, y) &&  numberOfActiveNeighbors < 2) {
        return this.grid.getPixels()[x][y].getOriginalColor();
      } else if (this.isActive(x, y) && numberOfActiveNeighbors > 3) {
        return this.grid.getPixels()[x][y].getOriginalColor();
      } else if (!this.isActive(x, y) && numberOfActiveNeighbors == 3) {
        return this.activationColor();
      }
      return this.grid.getPixels()[x][y].getColor();
    }
  
    public activationColor(): Color {
      return new Color(255, 255, 255, 255);
    }
  }