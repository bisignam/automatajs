// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import * as p5 from "p5";
import { CellularAutomaton } from "./cellularautomaton";
import { Color } from "./color";
import { Pixel } from "./pixel";
import { Utils } from "./utils";

export class Grid {
  private gridHeight: number;
  private gridWidth: number;
  private pixelsSize: number;
  private gridPixels: Array<Array<Pixel>>;
  private canvas: p5;

  constructor(width: number, height: number, col: Color, canvas: p5) {
    this.pixelsSize =
      Utils.getBiggestCommonDivisor(Math.floor(width), Math.floor(height)) * 10;
    this.gridWidth = Math.round(width / this.pixelsSize);
    this.gridHeight = Math.round(height / this.pixelsSize);
    this.canvas = canvas;
    this.gridPixels = new Array(this.gridWidth);
    for (let i = 0; i < this.gridWidth; i += 1) {
      this.gridPixels[i] = new Array(this.gridHeight);
      for (let j = 0; j < this.gridHeight; j += 1) {
        this.gridPixels[i][j] = Pixel.XYColor(i, j, col);
      }
    }
  }

  /**
   * Resets and resizes the grid
   *
   * @param width the new width of the grid
   * @param height the new height of the grid
   * @param col the new pixel colors
   */
  resizeAndReset(width: number, height: number, col: Color): void {
    this.pixelsSize =
      Utils.getBiggestCommonDivisor(Math.floor(width), Math.floor(height)) * 10;
    this.gridWidth = Math.floor(width / this.pixelsSize);
    this.gridHeight = Math.floor(height / this.pixelsSize);
    this.reset(col);
  }

  /**
   * Resets each pixel in the grind to its initial state
   *
   * @param col the new Color
   */
  public reset(col: Color): void {
    for (let i = 0; i < this.gridWidth; i += 1) {
      this.gridPixels[i] = new Array(this.gridHeight);
      for (let j = 0; j < this.gridHeight; j += 1) {
        this.gridPixels[i][j] = Pixel.XYColor(i, j, col);
      }
    }
  }

  /**
   * Redraws the grid by using the given color
   *
   * @param col the new Color
   */
  redraw(col: Color): void {
    for (let i = 0; i < this.gridWidth; i += 1) {
      for (let j = 0; j < this.gridHeight; j += 1) {
        this.drawPixel(i, j, col);
      }
    }
  }

  activate(cellurarAutomaton: CellularAutomaton, x: number, y: number): void {
    this.gridPixels[x][y].setColor(cellurarAutomaton.activationColor());
    this.drawPixel(x, y);
  }

  drawPixel(x: number, y: number, col?: Color): void {
    this.canvas.push();
    if (col) {
      this.canvas.fill(col.red, col.green, col.blue, col.alpha);
    } else {
      const automataColor = this.gridPixels[Number(x)][Number(y)].getColor();
      this.canvas.fill(
        automataColor.red,
        automataColor.green,
        automataColor.blue,
        automataColor.alpha
      );
    }
    this.canvas.square(
      this.pixelsSize * x,
      this.pixelsSize * y,
      this.pixelsSize
    );
    this.canvas.pop();
  }

  applyCellularAutomatonRule(
    cellurarAutomaton: CellularAutomaton,
    stepsToCompute: number
  ): void {
    let gridPixelsCopy = new Array<Array<Pixel>>();
    for (let i = 0; i < stepsToCompute; i++) {
      gridPixelsCopy = this.cloneGrid();
      for (let x = 0; x < this.gridWidth; x += 1) {
        for (let y = 0; y < this.gridHeight; y += 1) {
          gridPixelsCopy[x][y].setColor(cellurarAutomaton.applyRule(x, y));
        }
      }
      this.setGrid(gridPixelsCopy);
    }
    for (let x = 0; x < this.gridWidth; x += 1) {
      for (let y = 0; y < this.gridHeight; y += 1) {
        this.drawPixel(x, y);
      }
    }
  }

  cloneGrid(): Array<Array<Pixel>> {
    let clonedGrid = new Array<Array<Pixel>>();
    clonedGrid = new Array(this.gridWidth);
    for (let i = 0; i < this.gridWidth; i += 1) {
      clonedGrid[i] = new Array(this.gridHeight);
      for (let j = 0; j < this.gridHeight; j += 1) {
        clonedGrid[i][j] = Pixel.fromPixel(this.gridPixels[i][j]);
      }
    }
    return clonedGrid;
  }

  setGrid(newGrid: Array<Array<Pixel>>): void {
    for (let x = 0; x < this.gridWidth; x += 1) {
      for (let y = 0; y < this.gridHeight; y += 1) {
        this.gridPixels[x][y] = Pixel.fromPixel(newGrid[x][y]);
      }
    }
  }

  getHeight(): number {
    return this.gridHeight;
  }

  setHeight(height: number): void {
    this.gridHeight = height;
  }

  getWidth(): number {
    return this.gridWidth;
  }

  setWidth(width: number): void {
    this.gridWidth = width;
  }

  getCanvas(): p5 {
    return this.canvas;
  }

  getPixels(): Array<Array<Pixel>> {
    return this.gridPixels;
  }

  getPixelSize(): number {
    return this.pixelsSize;
  }
}
