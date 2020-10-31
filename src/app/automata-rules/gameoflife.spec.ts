import { GameOfLife } from "./gameoflife";
import { Color } from "../automata-engine/color";
import { Grid } from "../automata-engine/grid";
import { Pixel } from "../automata-engine/pixel";

describe("GameOfLife", () => {
  let gameOfLife: GameOfLife;
  let grid: Grid;
  const backgroundColor = new Color(0, 0, 0);
  const gridColor = new Color(10, 10, 10);
  const activationColor = new Color(1, 1, 1);
  let canvas;

  const customColorEquality = (first, second) => {
    if (first instanceof Color && second instanceof Color) {
      return first.equals(second);
    }
    return undefined; //fallback to jasmine equality
  };

  beforeAll(() => {
    jasmine.addCustomEqualityTester(customColorEquality);
  });

  beforeEach(() => {
    gameOfLife = new GameOfLife();
    gameOfLife.activationColor = activationColor;
    grid = new Grid(10, 10, 1);
    grid.backgroundColor = backgroundColor;
    grid.gridColor = gridColor;
    gameOfLife.setGrid(grid);
    canvas = jasmine.createSpyObj("canvas", [
      "push",
      "pop",
      "fill",
      "stroke",
      "square",
    ]);
  });

  it("a single cell dies at first turn", () => {
    grid.activate(canvas, gameOfLife, 5, 5);
    gameOfLife.advance(canvas);
    expect(canvas.push.calls.count()).toBe(2);
    expect(canvas.fill).toHaveBeenCalledWith(0, 0, 0);
    expect(canvas.fill.calls.count()).toBe(2);
    expect(canvas.stroke).toHaveBeenCalledWith(10, 10, 10);
    expect(canvas.stroke.calls.count()).toBe(2);
    expect(canvas.square).toHaveBeenCalledWith(5, 5, 1);
    expect(canvas.square.calls.count()).toBe(2);
    expect(canvas.pop.calls.count()).toBe(2);
    checkCellStatus([], grid.getPixels());
  });

  const checkCellStatus = (
    expectedActiveCells: Array<Pixel>,
    currentCells: Array<Array<Pixel>>
  ) => {
    for (let i = 0; i < currentCells.length; i++) {
      for (let j = 0; j < currentCells[i].length; j++) {
        const expectedActiveCell = expectedActiveCells.find(
          (p) => p.getX() === i && p.getY() === j
        );
        if (expectedActiveCell) {
          expect(currentCells[i][j].getColor())
            .withContext(`Expected cell ${i} ${j} to be active`)
            .toEqual(activationColor);
        } else {
          expect(currentCells[i][j].getColor())
            .withContext(`Expected cell ${i} ${j} to be inactive`)
            .toEqual(backgroundColor);
        }
      }
    }
  };
});
