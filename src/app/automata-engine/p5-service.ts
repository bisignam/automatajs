import { Injectable } from '@angular/core';
import * as p5 from 'p5';
import { CellularAutomaton } from './cellularautomaton';
import { Color } from './color';
import { Grid } from './grid';
import { Pixel } from './pixel';


export class P5ServiceConfig {
  static automataSize: number = 10;
  static currentStep: number = 1;
  static maxStep: number = 2000;
  static cellularAutomaton: CellularAutomaton;
  static grid: Grid;
  static canvas: p5;
}

@Injectable({
  providedIn: 'root' // indicates a Singleton
})
export class P5Service {
  private automataSize: number = 10;
  private currentStep: number = 1;
  private maxStep: number = 2000;
  private cellularAutomaton: CellularAutomaton;
  private grid: Grid;
  private canvas: p5;

  constructor(initialConfiguration: Array<Pixel>, cellularAutomaton: CellularAutomaton, node: HTMLElement) {
    this.cellularAutomaton = cellularAutomaton;
    this.canvas = new p5((p: p5) => {
      p.setup = () => {
        p.colorMode(p.RGB)
        p.stroke(1);
        p.strokeWeight(1);
        p.createCanvas(2000, 1000);
        p.background(100, 100, 100, 255)
        this.grid = new Grid(2000, 1000, this.automataSize, new Color(100, 100, 100, 255), p)
        this.cellularAutomaton.setGrid(this.grid)
      };

      p.draw = () => {
        if (this.currentStep == 1) {
          for (const pixel of initialConfiguration) {
            this.activateCell(pixel);
          }
        }
        if (this.currentStep == this.maxStep) {
          return
        }
        this.grid.reset(new Color(100, 100, 100, 255))
        this.cellularAutomaton.advance()
        this.currentStep++
      };
    }, node);
  }

  getCanvas(): p5 {
    return this.canvas;
  }

  private activateCell(pixel: Pixel): void {
    this.grid.activate(this.cellularAutomaton, pixel.getX(), pixel.getY());
  }
}
