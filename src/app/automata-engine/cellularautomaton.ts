import { Color } from "./color";
import { Grid } from "./grid";
import { Pixel } from "./pixel";

export interface AdditionalColorType {
  name: string;
  color: Color;
}

export abstract class CellularAutomaton {
  protected grid: Grid;
  backgroundColor: Color = new Color(255, 255, 255, 255);
  activationColor: Color = new Color(0, 0, 0, 255);
  additionalColors: Array<AdditionalColorType>;

  abstract applyRule(x: number, y: number): Color;

  mooreNeighbors(x: number, y: number): number {
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
      if (this.isActive(neighbor.getX(), neighbor.getY())) {
        activeNeighbors++;
      }
    }
    return activeNeighbors;
  }

  advance(): void {
    this.grid.applyCellularAutomatonRule(this, 1);
  }

  private yBeyondHeight(pixel: Pixel): Pixel {
    if (pixel.getY() > this.grid.getHeight() - 1) {
      return Pixel.XY(
        pixel.getX(),
        (this.grid.getCanvas().abs(pixel.getY()) %
          (this.grid.getHeight() - 1)) -
          1
      );
    }
    return pixel;
  }

  private yLessThanZero(pixel: Pixel): Pixel {
    if (pixel.getY() < 0) {
      return Pixel.XY(
        pixel.getX(),
        this.grid.getHeight() -
          (this.grid.getCanvas().abs(pixel.getY()) % this.grid.getHeight())
      );
    }
    return pixel;
  }

  private xBeyondWidth(pixel: Pixel): Pixel {
    if (pixel.getX() > this.grid.getWidth() - 1) {
      return Pixel.XY(
        (this.grid.getCanvas().abs(pixel.getX()) % (this.grid.getWidth() - 1)) -
          1,
        pixel.getY()
      );
    }
    return pixel;
  }

  private xLessThanZero(pixel: Pixel): Pixel {
    if (pixel.getX() < 0) {
      return Pixel.XY(
        this.grid.getWidth() -
          (this.grid.getCanvas().abs(pixel.getX()) % this.grid.getWidth()),
        pixel.getY()
      );
    }
    return pixel;
  }

  isActive(x: number, y: number): boolean {
    const activationColor = this.activationColor;
    const pixelColor = this.grid.getPixels()[x][y].getColor();
    return activationColor.equals(pixelColor);
  }

  setGrid(grid: Grid): void {
    this.grid = grid;
  }

  getGrid(): Grid {
    return this.grid;
  }

  getAdditionalColor(name: string): Color {
    return this.additionalColors.find((e) => e.name === name).color;
  }
}
