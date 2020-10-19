import { Injectable } from "@angular/core";
import * as p5 from "p5";
import { GameOfLife } from "../automata-rules/gameoflife";
import { CellularAutomaton } from "./cellularautomaton";
import { Color } from "./color";
import { Grid } from "./grid";
import { Pixel } from "./pixel";
import { BehaviorSubject } from 'rxjs';
import { BriansBrain } from '../automata-rules/briansbrain';

@Injectable({
  providedIn: "root", //means singleton service
})
export class P5Service {
  private currentStep = 1;
  private maxStep = 1;
  cellularAutomaton: CellularAutomaton = new BriansBrain();
  private backGroundColor: Color;
  private grid: Grid;
  private initialized: boolean = false;
  private node: HTMLElement;

  createCanvas(backGroundColor: Color, node: HTMLElement): void {
    this.backGroundColor = backGroundColor;
    new p5((p: p5) => {
      p.setup = () => {
        this.setup(node, p, backGroundColor);
      };
      p.windowResized = () => {
        this.resize(node, p);
      };
      p.draw = () => {
        this.draw();
      };
      p.mouseDragged = (mouseEvent: MouseEvent) => {
        this.drawCell(mouseEvent);
        // prevent default
        // return false;
      };
      p.mousePressed = (mouseEvent: MouseEvent) => {
        this.drawCell(mouseEvent);
        // prevent default
        // return false;
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
  private setup(node: HTMLElement, p: p5, backGroundColor: Color) {
    const width = node.getBoundingClientRect().width;
    const height = node.getBoundingClientRect().height;
    p.colorMode(p.RGB);
    p.stroke(1);
    p.strokeWeight(1);
    p.createCanvas(width, height);
    p.background(
      backGroundColor.red,
      backGroundColor.green,
      backGroundColor.blue,
      backGroundColor.alpha
    );
    this.grid = new Grid(width, height, backGroundColor, p);
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
    this.grid.setWidth(width);
    this.grid.setHeight(height);
    this.grid.resizeAndReset(width, height, this.backGroundColor);
    p.resizeCanvas(width, height);
    this.grid.redraw(this.cellularAutomaton);
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
          Math.round(mouseEvent.offsetX / this.grid.getPixelSize()),
          Math.round(mouseEvent.offsetY / this.grid.getPixelSize()),
          this.backGroundColor,
          this.backGroundColor
        )
      );
    }
  }

  /*
    Sets the automata rule and stops the current automata
  */
  setAutomataAndStopCurrent(cellularAutomaton: CellularAutomaton): void {
    this.initialized = true;
    this.cellularAutomaton = cellularAutomaton;
    this.grid.reset(this.backGroundColor);
    this.grid.redraw(this.cellularAutomaton);
  }

  reDraw(): void {
   // this.grid.redraw(this.cellularAutomaton);
    this.initialized = false;
  }

  /**
   * Starts a new automata animation
   */
  public startAutomata(maxStep: number): void {
    if (!this.cellularAutomaton) {
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
    this.grid.reset(this.backGroundColor);
    this.grid.redraw(this.cellularAutomaton); //?? Come fa a funzionare qua ? eppure va
  }

  private eventuallyActivateCell(pixel: Pixel): void {
    if (
      pixel.getX() >= 0 &&
      pixel.getX() < this.grid.getWidth() &&
      pixel.getY() >= 0 &&
      pixel.getY() < this.grid.getHeight()
    ) {
      this.grid.activate(this.cellularAutomaton, pixel.getX(), pixel.getY());
    }
  }

  private draw(): void {
    if (!this.initialized) {
      if (this.cellularAutomaton && !this.cellularAutomaton.getGrid()) {
        this.cellularAutomaton.setGrid(this.grid); //we do it here because at this point we are sure the grid is already initialized
      }
      this.grid.redraw(this.cellularAutomaton);
      this.initialized = true;
    }
    if (this.currentStep == this.maxStep) {
      return;
    }
    this.grid.redraw(this.cellularAutomaton);
    this.cellularAutomaton.advance();
    this.currentStep++;
  }

}
