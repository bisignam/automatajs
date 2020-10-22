import { Injectable } from "@angular/core";
import * as p5 from "p5";
import { CellularAutomaton } from "./cellularautomaton";
import { Grid } from "./grid";
import { Pixel } from "./pixel";
import { BriansBrain } from "../automata-rules/briansbrain";

@Injectable({
  providedIn: "root", //means singleton service
})
export class P5Service {
  private currentStep = 1;
  private maxStep = 1;
  private _cellularAutomaton: CellularAutomaton = new BriansBrain(); //TODO allow to initialize externally
  private _grid: Grid;
  private initialized = false;
  private node: HTMLElement;

  createCanvas(node: HTMLElement): void {
    new p5((p: p5) => {
      p.setup = () => {
        this.setup(node, p);
      };
      p.windowResized = () => {
        this.resize(node, p);
      };
      p.draw = () => {
        this.draw();
      };
      p.mouseDragged = (mouseEvent: MouseEvent) => {
        this.drawCell(mouseEvent);
      };
      p.mousePressed = (mouseEvent: MouseEvent) => {
        this.drawCell(mouseEvent);
      };
    }, node);
    this.node = node;
  }

  /**
   * Method called during p5 canvas setup
   * @param node the HTMLElement to attach the canvas to
   * @param p the p5 canvas
   * @param backGroundColor the background color
   */
  private setup(node: HTMLElement, p: p5) {
    const width = node.getBoundingClientRect().width;
    const height = node.getBoundingClientRect().height;
    p.colorMode(p.RGB, 255, 255, 255, 1);
    p.stroke(1);
    p.strokeWeight(1);
    p.createCanvas(width, height);
    this._grid = new Grid(width, height, p);
    p.background(
      this._grid.backgroundColor.red,
      this._grid.backgroundColor.green,
      this._grid.backgroundColor.blue,
      this._grid.backgroundColor.alpha
    );
  }

  /**
   * Method called during p5 canvas windowResized
   * @param node the HTMLElement to attach the canvas to
   * @param p the p5 canvas
   */
  private resize(node: HTMLElement, p: p5) {
    this.currentStep = 1;
    this.initialized = false;
    const width = node.getBoundingClientRect().width;
    const height = node.getBoundingClientRect().height;
    this._grid.setWidth(width);
    this._grid.setHeight(height);
    this._grid.resizeAndReset(width, height);
    p.resizeCanvas(width, height);
    this._grid.redraw(this._cellularAutomaton);
  }

  /**
   * Method called on p5 mouseDragged and mousePressed events
   *
   * @param mouseEvent the MouseEvent
   */
  private drawCell(mouseEvent: MouseEvent) {
    //if we are inside the canvas
    if (this.node.matches(":hover")) {
      this.eventuallyActivateCell(
        new Pixel(
          Math.round(mouseEvent.offsetX / this._grid.getPixelSize()),
          Math.round(mouseEvent.offsetY / this._grid.getPixelSize()),
          this._grid.backgroundColor,
          this._grid.backgroundColor
        )
      );
    }
  }

  /*
    Sets the automata rule and stops the current automata
  */
  setAutomataAndStopCurrent(cellularAutomaton: CellularAutomaton): void {
    this.currentStep = this.maxStep;
    this.initialized = true;
    cellularAutomaton.activationColor = this._cellularAutomaton.activationColor;
    cellularAutomaton.copyAdditionalColorsFromAutomata(this._cellularAutomaton);
    cellularAutomaton.setGrid(this._grid);
    this._cellularAutomaton = cellularAutomaton;
    this._grid.reset();
    this._grid.redraw(this._cellularAutomaton);
  }

  reDraw(): void {
    // this.grid.redraw(this.cellularAutomaton);
    this.initialized = false;
  }

  /**
   * Starts a new automata animation
   */
  public startAutomata(maxStep: number): void {
    if (!this._cellularAutomaton) {
      //TODO add logging
      return;
    }
    this.currentStep = 1; //reset the counter
    this.initialized = false;
    this.maxStep = maxStep;
  }

  /**
   * Stops the automata animation
   */
  public stopAutomata(): void {
    this.currentStep = this.maxStep;
    this.initialized = true;
  }

  clearGrid(): void {
    this.initialized = true;
    this._grid.reset();
    this._grid.redraw(this._cellularAutomaton); //?? Come fa a funzionare qua ? eppure va
  }

  private eventuallyActivateCell(pixel: Pixel): void {
    if (
      pixel.getX() >= 0 &&
      pixel.getX() < this._grid.getWidth() &&
      pixel.getY() >= 0 &&
      pixel.getY() < this._grid.getHeight()
    ) {
      this._grid.activate(this._cellularAutomaton, pixel.getX(), pixel.getY());
    }
  }

  private draw(): void {
    if (!this.initialized) {
      if (this._cellularAutomaton && !this._cellularAutomaton.getGrid()) {
        this._cellularAutomaton.setGrid(this._grid); //we do it here because at this point we are sure the grid is already initialized
      }
      this._grid.redraw(this._cellularAutomaton);
      this.initialized = true;
    }
    if (this.currentStep == this.maxStep) {
      return;
    }
    this._grid.redraw(this._cellularAutomaton);
    this._cellularAutomaton.advance();
    this.currentStep++;
  }

  get grid(): Grid {
    return this._grid;
  }

  get cellularAutomaton(): CellularAutomaton {
    return this._cellularAutomaton;
  }
}
