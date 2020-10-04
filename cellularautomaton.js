import { Pixel } from './pixel.js'

export class CellularAutomaton {

    applyRule(x, y) {
        //do nothing
        //specialzed by subclasses
    }

    activationColor() {
        return color(255, 255, 255, 255)
    }

    mooreNeighbors(x, y) {
        let activeNeighbors = 0;
        let neighbors = [];
        neighbors.push(this.xBeyondWidth(Pixel.XY(x + 1, y)));
        neighbors.push(this.xLessThanZero(Pixel.XY(x - 1, y)));
        neighbors.push(this.yBeyondHeight(Pixel.XY(x, y + 1)));
        neighbors.push(this.yLessThanZero(Pixel.XY(x, y - 1)));
        neighbors.push(this.xLessThanZero(this.yLessThanZero(Pixel.XY(x - 1, y - 1))));
        neighbors.push(this.xLessThanZero(this.yBeyondHeight(Pixel.XY(x - 1, y + 1))));
        neighbors.push(this.xBeyondWidth(this.yLessThanZero(Pixel.XY(x + 1, y - 1))));
        neighbors.push(this.xBeyondWidth(this.yBeyondHeight(Pixel.XY(x + 1, y + 1))));
        for (const neighbor of neighbors) {
            if (this.isActive(neighbor.x, neighbor.y)) {
                activeNeighbors++;
            }
        }
        return activeNeighbors;
    }

    advance() {
        this.grid.applyCellularAutomatonRule(this, 1);
    }

    yBeyondHeight(pixel) {
        if (pixel.y > this.grid.gridHeight - 1) {
            return Pixel.XY(pixel.x, (abs(pixel.y) % (this.grid.gridHeight - 1) - 1));
        }
        return pixel;
    }

    yLessThanZero(pixel) {
        if (pixel.y < 0) {
            return Pixel.XY(pixel.x, this.grid.gridHeight - (abs(pixel.y) % this.grid.gridHeight));
        }
        return pixel;
    }

    xBeyondWidth(pixel) {
        if (pixel.x > this.grid.gridWidth - 1) {
            return Pixel.XY((abs(pixel.x) % (this.grid.gridWidth - 1) - 1), pixel.y);
        }
        return pixel;
    }

    xLessThanZero(pixel) {
        if (pixel.x < 0) {
            return Pixel.XY(this.grid.gridWidth - (abs(pixel.x) % this.grid.gridWidth), pixel.y);
        }
        return pixel;
    }

    isActive(x, y) {
        //console.log(x +" "+ y + " "+this.grid.gridPixels.length + " "+this.grid.gridPixels[0].length)
        let activationColor = this.activationColor();
        let pixelColor = this.grid.gridPixels[x][y].color;
        return activationColor == pixelColor;
    }
}