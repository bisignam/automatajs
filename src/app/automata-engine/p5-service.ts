import { Injectable } from "@angular/core";
import * as p5 from "p5";
import { CellularAutomaton } from "./cellularautomaton";
import { Grid } from "./grid";
import { Pixel } from "./pixel";
import { BriansBrain } from "../automata-rules/briansbrain";
import { BehaviorSubject, Observable } from "rxjs";
import { DefaultSettings } from "./defaultSettings";
import { Utils } from "./utils";

@Injectable({
  providedIn: "root", //means singleton service
})
export class P5Service {
  private currentStep = 1;
  private maxStep = 1;
  private _cellularAutomaton: CellularAutomaton = new BriansBrain(); //TODO allow to initialize externally
  private _grid: Grid;
  private initialized = false;
  private visible = false;
  private node: HTMLElement;
  private canvas: p5;
  private _pixelSize = new BehaviorSubject<number>(DefaultSettings.pixelSize);

  createCanvas(node: HTMLElement): void {
    this.canvas = new p5((p: p5) => {
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
    if (width !== 0 && height !== 0) {
      p.colorMode(p.RGB, 255, 255, 255, 1);
      p.stroke(1);
      p.strokeWeight(1);
      p.createCanvas(width, height);
      const pixelSize = this.computeInitialPixelSize(width, height);
      this.updatePixelSize(pixelSize);
      this._grid = new Grid(width, height, pixelSize);
      p.background(
        this._grid.backgroundColor.red,
        this._grid.backgroundColor.green,
        this._grid.backgroundColor.blue
      );
      this.visible = true;
    }
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

    this._grid.resizeAndReset(width, height);
    p.resizeCanvas(width, height);
    this._grid.redraw(this.canvas, this._cellularAutomaton);
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
          Math.round(mouseEvent.offsetX / this._grid.pixelSize),
          Math.round(mouseEvent.offsetY / this._grid.pixelSize),
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
    this._grid.redraw(this.canvas, this._cellularAutomaton);
  }

  reDraw(): void {
    this.initialized = false;
  }

  resizePixelsAndRedraw(pixelSize: number): void {
    this._grid.pixelSize = pixelSize;
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
    this.currentStep = this.maxStep - 1;
    this._grid.reset();
    this.initialized = true;
  }

  private eventuallyActivateCell(pixel: Pixel): void {
    if (
      pixel.getX() >= 0 &&
      pixel.getX() < this._grid.getWidth() &&
      pixel.getY() >= 0 &&
      pixel.getY() < this._grid.getHeight()
    ) {
      this._grid.activate(
        this.canvas,
        this._cellularAutomaton,
        pixel.getX(),
        pixel.getY()
      );
    }
  }

  private draw(): void {
    if (this.visible) {
      if (!this.initialized) {
        if (this._cellularAutomaton && !this._cellularAutomaton.getGrid()) {
          this._cellularAutomaton.setGrid(this._grid); //we do it here because at this point we are sure the grid is already initialized
        }
        this._grid.redraw(this.canvas, this._cellularAutomaton);
        this.initialized = true;
      }
      if (this.currentStep == this.maxStep) {
        return;
      }
      this._grid.redraw(this.canvas, this._cellularAutomaton);
      this._cellularAutomaton.advance(this.canvas);
      this.currentStep++;
    }
  }

  get grid(): Grid {
    return this._grid;
  }

  get cellularAutomaton(): CellularAutomaton {
    return this._cellularAutomaton;
  }

  getPixelSize(): Observable<number> {
    return this._pixelSize.asObservable();
  }

  updatePixelSize(pixelSize: number): void {
    this._pixelSize.next(pixelSize);
  }

  computeInitialPixelSize(width: number, height: number): number {
    return (
      Utils.getBiggestCommonDivisor(Math.floor(width), Math.floor(height)) * 10
    );
  }
}
