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
    this.nodeWidth = width;
    this.nodeHeight = height;
    this.recomputeSize();
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

  drawGrid(canvas: p5): void {
    canvas.push();
    canvas.stroke(
      this._gridColor.red,
      this._gridColor.green,
      this._gridColor.blue
    );
    let currentY = 0;
    while (currentY <= this.nodeHeight) {
      canvas.line(0, currentY, this.nodeWidth, currentY);
      currentY += this.pixelSize;
    }
    let currentX = 0;
    while (currentX <= this.nodeWidth) {
      canvas.line(currentX, 0, currentX, this.nodeHeight);
      currentX += this.pixelSize;
    }
    canvas.pop();
  }

  /**
   * Redraws the grid
   *
   * @param col the new Color
   */
  redrawPixels(canvas: p5, cellularAutomaton?: CellularAutomaton): void {
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
    cellularAutomaton?: CellularAutomaton
  ): void {
    if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
      const pixelSize = this._pixelSize;
      const automataColor = this.gridPixels[x][y].getColor();
      if (
        !this.gridPixels[x][y].colorBeforeRuleApplication ||
        !this.gridPixels[x][y]
          .getColor()
          .equals(this.gridPixels[x][y].colorBeforeRuleApplication)
      ) {
        canvas.push();
        if (cellularAutomaton) {
          const pixelAdditionalColor = this.getPixelAdditionalColor(
            x,
            y,
            cellularAutomaton
          );
          if (cellularAutomaton.isActive(x, y)) {
            canvas.fill(
              cellularAutomaton.activationColor.red,
              cellularAutomaton.activationColor.green,
              cellularAutomaton.activationColor.blue
            );
          } else if (pixelAdditionalColor) {
            canvas.fill(
              pixelAdditionalColor.red,
              pixelAdditionalColor.green,
              pixelAdditionalColor.blue
            );
          } else {
            canvas.fill(
              this._backgroundColor.red,
              this._backgroundColor.green,
              this._backgroundColor.blue
            );
          }
        } else {
          canvas.fill(
            automataColor.red,
            automataColor.green,
            automataColor.blue
          );
        }
        canvas.stroke(
          this._gridColor.red,
          this._gridColor.green,
          this._gridColor.blue
        );
        canvas.square(pixelSize * x, pixelSize * y, pixelSize);
        canvas.pop();
      }
    }
  }

  getPixelAdditionalColor(
    x: number,
    y: number,
    cellularAutomaton: CellularAutomaton
  ): Color {
    for (const colorType of cellularAutomaton.additionalColors) {
      if (this.gridPixels[x][y].getColor().equals(colorType.color)) {
        return colorType.color;
      }
    }
    return undefined;
  }

  applyCellularAutomatonRule(
    cellurarAutomaton: CellularAutomaton,
    stepsToCompute: number,
    canvas: p5
  ): void {
    for (let i = 0; i < stepsToCompute; i++) {
      for (let x = 0; x < this.gridWidth; x += 1) {
        for (let y = 0; y < this.gridHeight; y += 1) {
          this.gridPixels[x][y].setOriginalColor(
            this.gridPixels[x][y].getColor()
          );
          this.gridPixels[x][y].applyRule(cellurarAutomaton);
          this.drawPixel(x, y, canvas);
        }
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
    this.reset();
  }

  private recomputeSize() {
    this.gridWidth = Math.ceil(this.nodeWidth / this._pixelSize);
    this.gridHeight = Math.ceil(this.nodeHeight / this._pixelSize);
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
