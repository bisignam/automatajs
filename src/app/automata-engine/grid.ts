import * as p5 from 'p5';
import { CellularAutomaton } from './cellularautomaton';
import { Color } from './color';
import { Pixel } from './pixel'

export class Grid {

    private gridHeight: number;
    private gridWidth: number;
    private pixelsSize: number;
    private gridPixels: Array<Array<Pixel>>;
    private canvas: p5;

    constructor(width: number, height: number, pixelsSize: number, col: Color, canvas: p5) {
        this.pixelsSize = pixelsSize;
        this.gridWidth = width / pixelsSize;
        this.gridHeight = height / pixelsSize;
        this.canvas = canvas;
        this.gridPixels = new Array(this.gridWidth);
        for (let i = 0; i < this.gridWidth; i += 1) {
            this.gridPixels[i] = new Array(this.gridHeight);
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

    activate(cellurarAutomaton: CellularAutomaton, x: number, y: number) {
        this.gridPixels[x][y].setColor(cellurarAutomaton.activationColor());
        this.drawPixel(x, y);
    }

    drawPixel(x: number, y: number, col?: Color) {
        this.canvas.push();
        if (col) {
            this.canvas.fill(
                col.red,
                col.green,
                col.blue,
                col.alpha
            );
        } else {
            let automataColor = this.gridPixels[Number(x)][Number(y)].getColor();
            this.canvas.fill(automataColor.red,
                automataColor.green,
                automataColor.blue,
                automataColor.alpha);
        }
        this.canvas.square(this.pixelsSize * x, this.pixelsSize * y, this.pixelsSize);
        this.canvas.pop();
    }

    applyCellularAutomatonRule(cellurarAutomaton, stepsToCompute) {
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
        return this;
    }

    cloneGrid() {
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

    setGrid(newGrid) {
        for (let x = 0; x < this.gridWidth; x += 1) {
            for (let y = 0; y < this.gridHeight; y += 1) {
                this.gridPixels[x][y] = Pixel.fromPixel(newGrid[x][y]);
            }
        }
    }

    getHeight(): number {
        return this.gridHeight;
    }

    getWidth(): number {
        return this.gridWidth;
    }

    getCanvas(): p5 {
        return this.canvas;
    }

    getPixels(): Array<Array<Pixel>> {
        return this.gridPixels;
    }
}