import { Pixel } from './pixel.js'

export class Grid {

    constructor(pixelsSize, col) {
        this.pixelsSize = pixelsSize;
        this.gridWidth = width / pixelsSize;
        this.gridHeight = height / pixelsSize;
        this.gridPixels = [...Array(this.gridWidth)].map(x => Array(this.gridHeight).fill(0));
        for (let i = 0; i < this.gridWidth; i += 1) {
            for (let j = 0; j < this.gridHeight; j += 1) {
                this.gridPixels[i][j] = Pixel.XYColor(i, j, col);
            }
        }
    }

    reset(col) {
        for (let i = 0; i < this.gridWidth; i += 1) {
            for (let j = 0; j < this.gridHeight; j += 1) {
                this.drawPixel(i, j, col);
            }
        }
    }

    activate(cellurarAutomaton, x, y) {
        this.gridPixels[x][y].color = cellurarAutomaton.activationColor();
        this.drawPixel(x, y);
    }

    drawPixel(x, y, col) {
        push();
        stroke(1);
        strokeWeight(1);
        if (col) {
            fill(red(col),
                green(col),
                blue(col),
                alpha(col));
        } else {
            let automataColor = this.gridPixels[x][y].color;
            fill(red(automataColor),
                green(automataColor),
                blue(automataColor),
                alpha(automataColor));
        }
        square(this.pixelsSize * x, this.pixelsSize * y, this.pixelsSize);
        pop();
    }

    applyCellularAutomatonRule(cellurarAutomaton, stepsToCompute) {
        let gridPixelsCopy = [...Array(this.gridWidth)].map(x => Array(this.gridHeight).fill(0));
        for (let i = 0; i < stepsToCompute; i++) {
            gridPixelsCopy = this.cloneGrid();
            for (let x = 0; x < this.gridWidth; x += 1) {
                for (let y = 0; y < this.gridHeight; y += 1) {
                    gridPixelsCopy[x][y].color = cellurarAutomaton.applyRule(x, y);
                }
            }
            this.setGrid(gridPixelsCopy);
        }
        for (let x = 0; x < this.gridWidth; x += 1) {
            for (let y = 0; y < this.gridHeight; y += 1) {
                this.drawPixel(x, y);
            }
        }
        return this;
    }

    cloneGrid() {
        let clonedGrid = [...Array(this.gridWidth)].map(x => Array(this.gridHeight).fill(0));
        for (let x = 0; x < this.gridWidth; x += 1) {
            for (let y = 0; y < this.gridHeight; y += 1) {
                clonedGrid[x][y] = Pixel.fromPixel(this.gridPixels[x][y]);
            }
        }
        return clonedGrid;
    }

    setGrid(newGrid) {
        for (let x = 0; x < this.gridWidth; x += 1) {
            for (let y = 0; y < this.gridHeight; y += 1) {
                this.gridPixels[x][y] = Pixel.fromPixel(newGrid[x][y]);
            }
        }
    }
}