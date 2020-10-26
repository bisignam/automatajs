// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import * as p5 from "p5";
import { CellularAutomaton } from "./cellularautomaton";
import { Color } from "./color";
import { Pixel } from "./pixel";

export class Grid {
  private gridHeight: number;
  private gridWidth: number;
  private nodeWidth: number;
  private nodeHeight: number;
  private _pixelSize: number;
  private gridPixels: Array<Array<Pixel>>;
  private _backgroundColor: Color = new Color(0, 0, 0);
  private _gridColor: Color = new Color(255, 255, 255);

  constructor(width: number, height: number, pixelSize: number) {
    this._pixelSize = pixelSize;
    this.nodeWidth = width;
    this.nodeHeight = height;
    this.recomputeSize();
    this.gridPixels = new Array(this.gridWidth);
    for (let i = 0; i < this.gridWidth; i += 1) {
      this.gridPixels[i] = new Array(this.gridHeight);
      for (let j = 0; j < this.gridHeight; j += 1) {
        this.gridPixels[i][j] = new Pixel(
          i,
          j,
          this._backgroundColor,
          this._backgroundColor
        );
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
  resizeAndReset(width: number, height: number): void {
    this.gridWidth = Math.floor(width / this._pixelSize);
    this.gridHeight = Math.floor(height / this._pixelSize);
    this.reset();
  }

  /**
   * Resets each pixel in the grind to its initial state
   *
   * @param col the new Color
   */
  public reset(): void {
    for (let i = 0; i < this.gridWidth; i += 1) {
      this.gridPixels[i] = new Array(this.gridHeight);
      for (let j = 0; j < this.gridHeight; j += 1) {
        this.gridPixels[i][j] = new Pixel(
          i,
          j,
          this._backgroundColor,
          this._backgroundColor
        );
      }
    }
  }

  /**
   * Redraws the grid
   *
   * @param col the new Color
   */
  redraw(canvas: p5, cellularAutomaton?: CellularAutomaton): void {
    for (let i = 0; i < this.gridWidth; i += 1) {
      for (let j = 0; j < this.gridHeight; j += 1) {
        this.drawPixel(i, j, canvas, cellularAutomaton);
      }
    }
  }

  activate(
    canvas: p5,
    cellurarAutomaton: CellularAutomaton,
    x: number,
    y: number
  ): void {
    this.gridPixels[x][y].setColor(cellurarAutomaton.activationColor);
    this.drawPixel(x, y, canvas);
  }

  drawPixel(
    x: number,
    y: number,
    canvas: p5,
    cellurarAutomaton?: CellularAutomaton
  ): void {
    canvas.push();
    const automataColor = this.gridPixels[Number(x)][Number(y)].getColor();
    if (cellurarAutomaton) {
      if (cellurarAutomaton.isActive(x, y)) {
        canvas.fill(
          cellurarAutomaton.activationColor.red,
          cellurarAutomaton.activationColor.green,
          cellurarAutomaton.activationColor.blue
        );
      } else {
        canvas.fill(
          this._backgroundColor.red,
          this._backgroundColor.green,
          this._backgroundColor.blue
        );
      }
    } else {
      canvas.fill(automataColor.red, automataColor.green, automataColor.blue);
    }
    canvas.stroke(
      this._gridColor.red,
      this._gridColor.green,
      this._gridColor.blue
    );
    const pixelSize = this._pixelSize;
    canvas.square(pixelSize * x, pixelSize * y, pixelSize);
    canvas.pop();
  }

  applyCellularAutomatonRule(
    cellurarAutomaton: CellularAutomaton,
    stepsToCompute: number,
    canvas: p5
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
        this.drawPixel(x, y, canvas);
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

  getPixels(): Array<Array<Pixel>> {
    return this.gridPixels;
  }

  get pixelSize(): number {
    return this._pixelSize;
  }

  set pixelSize(pixelSize: number) {
    this._pixelSize = pixelSize;
    this.recomputeSize();
  }

  private recomputeSize() {
    this.gridWidth = Math.round(this.nodeWidth / this._pixelSize);
    this.gridHeight = Math.round(this.nodeHeight / this._pixelSize);
  }

  get backgroundColor(): Color {
    return this._backgroundColor;
  }

  set backgroundColor(backgroundColor: Color) {
    this._backgroundColor = backgroundColor;
  }

  get gridColor(): Color {
    return this._gridColor;
  }

  set gridColor(gridColor: Color) {
    this._gridColor = gridColor;
  }
}
