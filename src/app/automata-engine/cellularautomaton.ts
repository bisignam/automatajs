import { Color } from './color'
import { Grid } from './grid'
import { Pixel } from './pixel'

export abstract class CellularAutomaton {
  protected grid: Grid

  abstract applyRule(x, y)

  activationColor(): Color {
    return new Color(255, 255, 255, 255)
  }

  defaultColor(): Color {
    return new Color(100, 100, 100, 0)
  }

  mooreNeighbors(x, y) {
    let activeNeighbors = 0
    let neighbors = []
    neighbors.push(this.xBeyondWidth(Pixel.XY(x + 1, y)))
    neighbors.push(this.xLessThanZero(Pixel.XY(x - 1, y)))
    neighbors.push(this.yBeyondHeight(Pixel.XY(x, y + 1)))
    neighbors.push(this.yLessThanZero(Pixel.XY(x, y - 1)))
    neighbors.push(
      this.xLessThanZero(this.yLessThanZero(Pixel.XY(x - 1, y - 1)))
    )
    neighbors.push(
      this.xLessThanZero(this.yBeyondHeight(Pixel.XY(x - 1, y + 1)))
    )
    neighbors.push(
      this.xBeyondWidth(this.yLessThanZero(Pixel.XY(x + 1, y - 1)))
    )
    neighbors.push(
      this.xBeyondWidth(this.yBeyondHeight(Pixel.XY(x + 1, y + 1)))
    )
    for (const neighbor of neighbors) {
      if (this.isActive(neighbor.x, neighbor.y)) {
        activeNeighbors++
      }
    }
    return activeNeighbors
  }

  advance() {
    this.grid.applyCellularAutomatonRule(this, 1)
  }

  private yBeyondHeight(pixel: Pixel) {
    if (pixel.getY() > this.grid.getHeight() - 1) {
      return Pixel.XY(
        pixel.getX(),
        (this.grid.getCanvas().abs(pixel.getY()) %
          (this.grid.getHeight() - 1)) -
          1
      )
    }
    return pixel
  }

  private yLessThanZero(pixel: Pixel) {
    if (pixel.getY() < 0) {
      return Pixel.XY(
        pixel.getX(),
        this.grid.getHeight() -
          (this.grid.getCanvas().abs(pixel.getY()) % this.grid.getHeight())
      )
    }
    return pixel
  }

  private xBeyondWidth(pixel: Pixel) {
    if (pixel.getX() > this.grid.getWidth() - 1) {
      return Pixel.XY(
        (this.grid.getCanvas().abs(pixel.getX()) % (this.grid.getWidth() - 1)) -
          1,
        pixel.getY()
      )
    }
    return pixel
  }

  private xLessThanZero(pixel: Pixel) {
    if (pixel.getX() < 0) {
      return Pixel.XY(
        this.grid.getWidth() -
          (this.grid.getCanvas().abs(pixel.getX()) % this.grid.getWidth()),
        pixel.getY()
      )
    }
    return pixel
  }

  isActive(x, y) {
    let activationColor = this.activationColor()
    let pixelColor = this.grid.getPixels()[x][y].getColor()
    return activationColor.equals(pixelColor)
  }

  setGrid(grid: Grid): void {
    this.grid = grid
  }
}
