// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import * as p5 from "p5";
import { Color } from "./color";
import { Grid } from "./grid";
import { Pixel } from "./pixel";

export interface AdditionalColorType {
  name: string;
  color: Color;
}

export abstract class CellularAutomaton {
  protected grid: Grid;
  protected _activationColor: Color = new Color(0, 0, 0);
  protected _additionalColors: Array<AdditionalColorType> = new Array<
    AdditionalColorType
  >();

  abstract applyRule(x: number, y: number): Color;

  protected mooreNeighbors(x: number, y: number): number {
    let activeNeighbors = 0;
    const neighbors = new Array<Pixel>();
    neighbors.push(this.xBeyondWidth(Pixel.XY(x + 1, y)));
    neighbors.push(this.xLessThanZero(Pixel.XY(x - 1, y)));
    neighbors.push(this.yBeyondHeight(Pixel.XY(x, y + 1)));
    neighbors.push(this.yLessThanZero(Pixel.XY(x, y - 1)));
    neighbors.push(
      this.xLessThanZero(this.yLessThanZero(Pixel.XY(x - 1, y - 1)))
    );
    neighbors.push(
      this.xLessThanZero(this.yBeyondHeight(Pixel.XY(x - 1, y + 1)))
    );
    neighbors.push(
      this.xBeyondWidth(this.yLessThanZero(Pixel.XY(x + 1, y - 1)))
    );
    neighbors.push(
      this.xBeyondWidth(this.yBeyondHeight(Pixel.XY(x + 1, y + 1)))
    );
    for (const neighbor of neighbors) {
      if (
        this.grid
          .getPixels()
          [neighbor.getX()][neighbor.getY()].getOriginalColor()
          .equals(this.activationColor)
      ) {
        activeNeighbors++;
      }
    }
    return activeNeighbors;
  }

  advance(canvas: p5): void {
    this.grid.applyCellularAutomatonRule(this, 1, canvas);
  }

  private yBeyondHeight(pixel: Pixel): Pixel {
    if (pixel.getY() > this.grid.getHeight() - 1) {
      return Pixel.XY(
        pixel.getX(),
        (Math.abs(pixel.getY()) % (this.grid.getHeight() - 1)) - 1
      );
    }
    return pixel;
  }

  private yLessThanZero(pixel: Pixel): Pixel {
    if (pixel.getY() < 0) {
      return Pixel.XY(
        pixel.getX(),
        this.grid.getHeight() - (Math.abs(pixel.getY()) % this.grid.getHeight())
      );
    }
    return pixel;
  }

  private xBeyondWidth(pixel: Pixel): Pixel {
    if (pixel.getX() > this.grid.getWidth() - 1) {
      return Pixel.XY(
        (Math.abs(pixel.getX()) % (this.grid.getWidth() - 1)) - 1,
        pixel.getY()
      );
    }
    return pixel;
  }

  private xLessThanZero(pixel: Pixel): Pixel {
    if (pixel.getX() < 0) {
      return Pixel.XY(
        this.grid.getWidth() - (Math.abs(pixel.getX()) % this.grid.getWidth()),
        pixel.getY()
      );
    }
    return pixel;
  }

  isActive(x: number, y: number): boolean {
    const activationColor = this._activationColor;
    const pixelColor = this.grid.getPixels()[x][y].getColor();
    return activationColor.equals(pixelColor);
  }

  isActiveForRule(x: number, y: number): boolean {
    const activationColor = this._activationColor;
    const pixelColor = this.grid.getPixels()[x][y].getOriginalColor();
    return activationColor.equals(pixelColor);
  }

  setGrid(grid: Grid): void {
    this.grid = grid;
  }

  getGrid(): Grid {
    return this.grid;
  }

  private getAdditionalColorType(name: string): AdditionalColorType {
    return this._additionalColors.find((e) => e.name === name);
  }

  getAdditionalColor(name: string): Color {
    const colorType = this.getAdditionalColorType(name);
    return colorType ? colorType.color : undefined;
  }

  setAdditionalColor(name: string, color: Color): void {
    this.getAdditionalColorType(name).color = color;
  }

  get additionalColors(): Array<AdditionalColorType> {
    return this._additionalColors;
  }

  set additionalColors(additionalColors: Array<AdditionalColorType>) {
    this._additionalColors = additionalColors;
  }

  copyAdditionalColorsFromAutomata(cellularAutomaton: CellularAutomaton): void {
    for (const additionalColor of cellularAutomaton.additionalColors) {
      const thisColor = this.getAdditionalColor(additionalColor.name);
      if (thisColor) {
        this.setAdditionalColor(
          additionalColor.name,
          cellularAutomaton.getAdditionalColor(additionalColor.name)
        );
      }
    }
  }

  get activationColor(): Color {
    return this._activationColor;
  }

  set activationColor(activationColor: Color) {
    this._activationColor = activationColor;
  }
}
